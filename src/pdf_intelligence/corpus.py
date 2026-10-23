"""Consolidates document artifacts into JSONL, Parquet, DuckDB, and TF-IDF / FAISS search indices."""

import time
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import numpy as np

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import duckdb
except ImportError:
    duckdb = None

from .config import PipelineConfig
from .document import DOCUMENT_EXTRACTOR, DocumentExtractor
from .structure import CHUNK_BUILDER, ChunkBuilder, SECTION_BUILDER, SectionBuilder
from .utils import (
    flatten_row,
    library_versions,
    sha256_file,
    utc_now,
    word_count,
    write_json,
    write_jsonl,
)

DATA_DICTIONARY: Dict[str, Any] = {
    "_nota": (
        "Diccionario de datos del corpus V5.6. 'page_number' es el índice 1-based del PDF; "
        "'page_label' es la etiqueta impresa (puede diferir). Citar siempre documento + página."
    ),
    "documents": {
        "document_id": "Llave primaria (hash del archivo). No es el nombre del archivo.",
        "filename": "Nombre original del PDF.",
        "sha256": "Huella del archivo; dos documentos con el mismo sha256 son el mismo archivo.",
        "title/author/...": "Metadatos internos del PDF. NO prueban autoría ni fecha.",
        "inferred_title / title_source": "Título inferido (pdf_metadata | largest_font_cover | largest_font_pages_2_3 | filename). Verificar contra la portada.",
        "year_candidates": "Años mencionados en las 2 primeras páginas, por frecuencia. Son candidatos, NO la fecha de publicación.",
        "document_language": "Idioma dominante por páginas.",
        "profile_type": "Muestreo previo: digital | scanned | hybrid | empty | unknown.",
        "profile_type_observed": "Tras extraer: digital (sin OCR), scanned (>=80% OCR), hybrid.",
        "average_quality": "Promedio de overall_quality_score (calidad TÉCNICA; mezcla texto, OCR, estructura y tablas).",
        "average_extraction_quality": "Promedio de extraction_quality_score (solo fiabilidad del texto extraído).",
        "section_words / chunk_unique_words / chunk_coverage": "Control de pérdida: palabras de secciones vs palabras únicas en chunks.",
        "low_text_pages / ocr_pages": "Páginas con <20 palabras / recuperadas por OCR.",
    },
    "pages": {
        "page_number / page_label": "Índice PDF (1-based) y etiqueta impresa.",
        "native_text / ocr_text / clean_text": "Texto nativo, texto OCR y texto final sin cabeceras/pies corridos.",
        "extraction_source": "native | ocr.",
        "page_flags": "ocr, ocr_low_confidence, empty, low_text, no_layout_blocks, image_page, page_error.",
        "removed_edge_lines": "Líneas de cabecera/pie eliminadas de clean_text (trazabilidad).",
        "extraction_quality_score": "Fiabilidad técnica del texto (0-1). Preferir sobre overall_quality_score.",
        "overall_quality_score": "Compatibilidad con V5.1: incluye componentes de estructura y tablas.",
        "blocks": "Bloques de layout con bbox, spans, is_heading, heading_confidence, heading_level, heading_signals.",
    },
    "sections": {
        "title / section_title": "Título de la sección (alias).",
        "title_source": "detected (encabezado detectado) | none (texto sin encabezado: 'Contenido inicial').",
        "heading_confidence / heading_level": "Confianza (0-1) y nivel estimado del encabezado.",
        "paragraphs": "Párrafos con page_number y block_id.",
    },
    "chunks": {
        "page_start / page_end": "Páginas del texto PROPIO del chunk (excluye el solapamiento).",
        "page_label_start / page_label_end": "Etiquetas impresas equivalentes.",
        "overlap_words": "Palabras iniciales repetidas del chunk previo de la misma sección.",
        "unique_words": "Palabras propias (sin solapamiento). Sumar esta columna, no word_count.",
        "merged_section_ids": "Secciones cortas fusionadas en este chunk (no se descarta texto).",
        "merged_section_titles": "Títulos de secciones cortas absorbidas en este chunk.",
        "short_section": "True si el chunk es una sección corta que no pudo fusionarse.",
        "section_title_reliable": "True si el título proviene de un encabezado con confianza >= 0.6.",
        "text_sha256": "Huella del texto normalizado para detectar duplicados entre documentos.",
        "related_table_ids": "Tablas aceptadas en las páginas del chunk.",
    },
    "tables": {
        "table_confidence": "high | medium | low.",
        "quality_features": "filled_ratio, fragment_ratio, lower_start_ratio, avg_words_per_cell, page_area_share.",
        "caption": "Título 'Tabla/Figura N' inmediatamente sobre la tabla, si se encontró.",
        "markdown": "Tabla en Markdown lista para un LLM.",
    },
    "tables_rejected": "Rejillas descartadas (con reject_reason). Solo JSONL; útiles para auditar el filtro.",
}


class CorpusBuilder:
    """Builds the unified corpus, Parquet mirrors, DuckDB database, and search indices."""

    def __init__(self, config: Optional[PipelineConfig] = None):
        self.config = config or PipelineConfig()
        self.extractor = DocumentExtractor(self.config)
        self.section_builder = SECTION_BUILDER
        self.chunk_builder = ChunkBuilder(self.config)

        self.documents: List[Dict[str, Any]] = []
        self.pages: List[Dict[str, Any]] = []
        self.sections: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []
        self.tables: List[Dict[str, Any]] = []
        self.tables_rejected: List[Dict[str, Any]] = []
        self.errors: List[Dict[str, Any]] = []
        self.log: List[Dict[str, Any]] = []
        self.inputs: List[Dict[str, Any]] = []
        self.integrity: Dict[str, Any] = {}

    def discover(self) -> List[Path]:
        """Locate all PDF files within the input directory."""
        if not self.config.pdf_directory.exists():
            raise FileNotFoundError(f"Input directory does not exist: {self.config.pdf_directory}")
        pdfs = sorted(
            p
            for p in self.config.pdf_directory.rglob("*")
            if p.is_file() and p.suffix.lower() == ".pdf"
        )
        if self.config.max_documents is not None:
            return pdfs[: self.config.max_documents]
        return pdfs

    def process(self) -> None:
        """Run batch extraction, export base datasets, DuckDB, search indices, and audit reports."""
        self.config.ensure_directories()
        pdfs = self.discover()

        print("=" * 80)
        print(f"CIOdD-UCR PDF INTELLIGENCE PIPELINE V{self.config.pipeline_version} (Research & RAG Edition)")
        print("=" * 80)
        print(f"Found PDFs:  {len(pdfs)}")
        print(f"Input path:  {self.config.pdf_directory}")
        print(f"Output path: {self.config.output_directory}\n")

        for pdf_path in pdfs:
            start_time = time.time()
            try:
                result = self.extractor.extract(pdf_path)
                document, pages = result["document"], result["pages"]
                document_id = document["document_id"]
                sections = self.section_builder.build(document_id, pages)

                tables_by_page: Dict[int, List[str]] = defaultdict(list)
                for t in result["tables"]:
                    tables_by_page[t["page_number"]].append(t["table_id"])

                quality_by_page = {
                    p["page_number"]: float(p.get("overall_quality_score", 0) or 0) for p in pages
                }
                label_by_page = {p["page_number"]: p.get("page_label", "") for p in pages}

                chunks = self.chunk_builder.build(
                    document_id,
                    document["filename"],
                    sections,
                    tables_by_page,
                    quality_by_page,
                    label_by_page,
                )

                section_words = sum(
                    word_count(p["text"]) for s in sections for p in s["paragraphs"]
                )
                chunk_unique = sum(c["unique_words"] for c in chunks)
                n_pages = max(1, len(pages))
                ocr_pages = sum(p.get("extraction_source") == "ocr" for p in pages)
                low_text = sum(
                    "low_text" in p.get("page_flags", []) or "empty" in p.get("page_flags", [])
                    for p in pages
                )

                chunk_coverage = (
                    round(chunk_unique / section_words, 4) if section_words else 1.0
                )

                document.update({
                    "extracted_pages": len(pages),
                    "total_words": sum(p.get("word_count", 0) for p in pages),
                    "total_tables": len(result["tables"]),
                    "tables_rejected": len(result["tables_rejected"]),
                    "total_sections": len(sections),
                    "sections_with_detected_title": sum(
                        s.get("title_source") == "detected" for s in sections
                    ),
                    "total_chunks": len(chunks),
                    "ocr_pages": ocr_pages,
                    "low_text_pages": low_text,
                    "headings_demoted": result["headings_demoted"],
                    "section_words": section_words,
                    "chunk_unique_words": chunk_unique,
                    "chunk_coverage": chunk_coverage,
                    "average_quality": (
                        round(float(np.mean([float(p.get("overall_quality_score", 0) or 0) for p in pages])), 4)
                        if pages
                        else 0.0
                    ),
                    "average_extraction_quality": (
                        round(float(np.mean([float(p.get("extraction_quality_score", 0) or 0) for p in pages])), 4)
                        if pages
                        else 0.0
                    ),
                    "profile_type_observed": (
                        "scanned"
                        if ocr_pages / n_pages >= 0.8
                        else "digital"
                        if ocr_pages == 0 and low_text / n_pages < 0.05
                        else "hybrid"
                    ),
                    "repeated_header_footer_patterns": result["repeated_lines"],
                })

                self.documents.append(document)
                self.pages.extend(pages)
                self.sections.extend(sections)
                self.chunks.extend(chunks)
                self.tables.extend(result["tables"])
                self.tables_rejected.extend(result["tables_rejected"])
                self.errors.extend(result["errors"])
                self.inputs.append({
                    "filename": document["filename"],
                    "sha256": document["sha256"],
                    "size_bytes": document["file_size_bytes"],
                })
                self.log.append({
                    "document_id": document_id,
                    "filename": document["filename"],
                    "status": "ok",
                    "seconds": round(time.time() - start_time, 3),
                    "pages": len(pages),
                    "words": document["total_words"],
                    "tables": len(result["tables"]),
                    "tables_rejected": len(result["tables_rejected"]),
                    "sections": len(sections),
                    "chunks": len(chunks),
                    "ocr_pages": ocr_pages,
                    "chunk_coverage": document["chunk_coverage"],
                    "quality": document["average_quality"],
                })
                print(f"✓ Processed {document['filename']} ({len(pages)} pages, {len(chunks)} chunks, coverage {chunk_coverage:.3f})")
            except Exception as e:
                self.errors.append({
                    "filename": pdf_path.name,
                    "stage": "document",
                    "error": str(e),
                    "timestamp": utc_now(),
                })
                self.log.append({
                    "filename": pdf_path.name,
                    "status": "failed",
                    "error": str(e),
                })
                print(f"✗ Failed {pdf_path.name}: {e}")

        print("\nSaving structured datasets...")
        self.export_base()

        if duckdb and pd:
            try:
                print("Building DuckDB database...")
                self.build_duckdb()
                print("✓ DuckDB created.")
            except Exception as e:
                print(f"⚠️ DuckDB warning: {e}")
                self.errors.append({"stage": "duckdb", "error": str(e), "timestamp": utc_now()})

        if self.config.build_tfidf and self.chunks:
            try:
                print("Building TF-IDF lexical index...")
                self.build_tfidf()
                print("✓ TF-IDF created.")
            except Exception as e:
                print(f"⚠️ TF-IDF warning: {e}")
                self.errors.append({"stage": "tfidf", "error": str(e), "timestamp": utc_now()})

        if self.config.generate_embeddings and self.chunks:
            try:
                print("Generating dense embeddings and FAISS index...")
                self.build_embeddings()
                print("✓ Embeddings and FAISS created.")
            except Exception as e:
                print(f"⚠️ Embeddings warning: {e}")
                self.errors.append({"stage": "embeddings", "error": str(e), "timestamp": utc_now()})

        self.check_integrity()
        write_json(self.config.output_directory / "data_dictionary.json", DATA_DICTIONARY)
        self.write_quality_report()
        self.write_logs()
        self.write_manifest()
        self.summary()

    def export_dataset(self, name: str, rows: List[Dict[str, Any]], parquet: bool = True) -> None:
        """Export dataset as JSONL and Parquet."""
        out_dir = self.config.output_directory
        write_jsonl(out_dir / f"{name}.jsonl", rows)
        if rows and parquet and pd:
            # Memory optimization: exclude spans from Parquet pages
            if name == "pages":
                cleaned_rows = []
                for r in rows:
                    row_copy = dict(r)
                    if "blocks" in row_copy and isinstance(row_copy["blocks"], list):
                        row_copy["blocks"] = [
                            {k: v for k, v in b.items() if k != "spans"} for b in row_copy["blocks"]
                        ]
                    cleaned_rows.append(flatten_row(row_copy))
                pd.DataFrame(cleaned_rows).to_parquet(out_dir / f"{name}.parquet", index=False)
            else:
                pd.DataFrame([flatten_row(r) for r in rows]).to_parquet(
                    out_dir / f"{name}.parquet", index=False
                )

    def export_base(self) -> None:
        """Export core corpus datasets."""
        for name, rows in [
            ("documents", self.documents),
            ("pages", self.pages),
            ("sections", self.sections),
            ("chunks", self.chunks),
            ("tables", self.tables),
        ]:
            self.export_dataset(name, rows)
        self.export_dataset("tables_rejected", self.tables_rejected, parquet=False)
        self.write_logs()

    def write_logs(self) -> None:
        """Save processing logs and error audit trail."""
        write_jsonl(self.config.output_directory / "processing_log.jsonl", self.log)
        write_jsonl(self.config.output_directory / "errors.jsonl", self.errors)

    def build_duckdb(self) -> None:
        """Create relational tables and query indices in corpus.duckdb."""
        path = self.config.output_directory / "corpus.duckdb"
        if path.exists():
            path.unlink()
        con = duckdb.connect(str(path))
        try:
            for name in ["documents", "pages", "sections", "chunks", "tables"]:
                parquet = self.config.output_directory / f"{name}.parquet"
                if parquet.exists():
                    safe = str(parquet).replace("'", "''")
                    con.execute(f"CREATE TABLE {name} AS SELECT * FROM read_parquet('{safe}')")
            for stmt in [
                "CREATE INDEX idx_chunks_document ON chunks(document_id)",
                "CREATE INDEX idx_pages_document ON pages(document_id, page_number)",
            ]:
                try:
                    con.execute(stmt)
                except Exception:
                    pass
        finally:
            con.close()

    @staticmethod
    def retrieval_text(chunk: Dict[str, Any]) -> str:
        """Prepare retrieval text: prefix section title only if identified reliably."""
        title = chunk.get("section_title", "") if chunk.get("section_title_reliable") else ""
        return (title + "\n" + chunk.get("text", "")).strip()

    def build_tfidf(self) -> None:
        """Train and persist scikit-learn TF-IDF matrix for fast local lexical search."""
        import joblib
        from sklearn.feature_extraction.text import TfidfVectorizer

        texts = [self.retrieval_text(c) for c in self.chunks]
        vectorizer = TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            ngram_range=(1, 2),
            max_df=0.95,
            min_df=1,
            max_features=100_000,
            sublinear_tf=True,
            norm="l2",
        )
        matrix = vectorizer.fit_transform(texts)
        joblib.dump(vectorizer, self.config.output_directory / "tfidf_vectorizer.joblib")
        joblib.dump(matrix, self.config.output_directory / "tfidf_matrix.joblib")

    def build_embeddings(self) -> None:
        """Compute multilingual dense embeddings and persist FAISS index."""
        from sentence_transformers import SentenceTransformer
        import faiss

        model = SentenceTransformer(self.config.embedding_model)
        texts = [self.retrieval_text(c) for c in self.chunks]
        embeddings = np.asarray(
            model.encode(
                texts,
                batch_size=self.config.embedding_batch_size,
                show_progress_bar=True,
                normalize_embeddings=True,
            ),
            dtype="float32",
        )
        np.save(self.config.output_directory / "embeddings.npy", embeddings)

        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)
        faiss.write_index(index, str(self.config.output_directory / "faiss.index"))

        write_jsonl(
            self.config.output_directory / "faiss_mapping.jsonl",
            [
                {
                    "faiss_row": i,
                    "chunk_id": c["chunk_id"],
                    "document_id": c["document_id"],
                    "filename": c["filename"],
                    "section_title": c["section_title"],
                    "page_start": c["page_start"],
                    "page_end": c["page_end"],
                }
                for i, c in enumerate(self.chunks)
            ],
        )

    def check_integrity(self) -> None:
        """Perform automated 9-point consistency and traceability audit."""
        checks = []

        def add(name: str, ok: bool, detail: str = "", severity: str = "FAIL") -> None:
            checks.append({"check": name, "status": "PASS" if ok else severity, "detail": detail})

        def unique(rows: List[Dict[str, Any]], key: str) -> bool:
            vals = [r.get(key) for r in rows]
            return len(vals) == len(set(vals))

        add(
            "ids únicos (documents/pages/sections/chunks/tables)",
            all([
                unique(self.documents, "document_id"),
                unique(self.pages, "page_id"),
                unique(self.sections, "section_id"),
                unique(self.chunks, "chunk_id"),
                unique(self.tables, "table_id"),
            ]),
        )

        docs = {d["document_id"]: d for d in self.documents}
        add(
            "páginas extraídas == page_count del PDF",
            all(d["extracted_pages"] == d["page_count"] for d in self.documents),
            str([d["filename"] for d in self.documents if d["extracted_pages"] != d["page_count"]]),
        )

        bad_rng = [
            c["chunk_id"]
            for c in self.chunks
            if not (1 <= c["page_start"] <= c["page_end"] <= docs[c["document_id"]]["page_count"])
        ]
        add("rango de páginas de chunks válido", not bad_rng, str(bad_rng[:5]))

        sec_ids = {s["section_id"] for s in self.sections}
        add("chunks apuntan a secciones existentes", all(c["section_id"] in sec_ids for c in self.chunks))
        add(
            "todo documento tiene chunks",
            all(d["total_chunks"] > 0 for d in self.documents),
            str([d["filename"] for d in self.documents if d["total_chunks"] == 0]),
        )

        low_cov = [
            (d["filename"], d["chunk_coverage"])
            for d in self.documents
            if d["chunk_coverage"] < self.config.chunk_coverage_min
        ]
        add(
            f"cobertura de texto en chunks >= {self.config.chunk_coverage_min}",
            not low_cov,
            str(low_cov),
        )

        covered: Dict[str, Set[int]] = defaultdict(set)
        for c in self.chunks:
            for p in range(c["page_start"], c["page_end"] + 1):
                covered[c["document_id"]].add(p)

        uncovered = [
            (p["filename"], p["page_number"], p["word_count"])
            for p in self.pages
            if p.get("word_count", 0) >= 20 and p["page_number"] not in covered[p["document_id"]]
        ]
        add("páginas con texto sin ningún chunk", not uncovered, str(uncovered[:10]), "WARNING")

        groups: Dict[str, Set[str]] = defaultdict(set)
        for c in self.chunks:
            groups[c["text_sha256"]].add(c["document_id"])
        dup = sum(len(v) > 1 for v in groups.values())
        add("chunks idénticos entre documentos distintos", dup == 0, f"{dup} grupos", "WARNING")

        flagged = [
            (p["filename"], p["page_number"], p["page_flags"])
            for p in self.pages
            if {"empty", "low_text", "ocr_low_confidence", "page_error"} & set(p.get("page_flags", []))
        ]
        add(
            "páginas con texto escaso/OCR dudoso (revisar visualmente antes de citar)",
            not flagged,
            f"{len(flagged)} páginas; ver quality_report.review_pages",
            "WARNING",
        )

        status = (
            "FAIL"
            if any(c["status"] == "FAIL" for c in checks)
            else "PASS_WITH_WARNINGS"
            if any(c["status"] == "WARNING" for c in checks)
            else "PASS"
        )

        self.integrity = {
            "generated_at": utc_now(),
            "status": status,
            "checks": checks,
            "review_pages": [
                {"filename": f, "page_number": n, "flags": fl} for f, n, fl in flagged
            ],
        }
        write_json(self.config.output_directory / "integrity_report.json", self.integrity)

    def write_quality_report(self) -> None:
        """Write summary quality distribution and document-level diagnostics."""
        q = [float(p.get("overall_quality_score", 0) or 0) for p in self.pages]
        xq = [float(p.get("extraction_quality_score", 0) or 0) for p in self.pages]

        report = {
            "generated_at": utc_now(),
            "pipeline_version": self.config.pipeline_version,
            "schema_version": self.config.schema_version,
            "integrity_status": self.integrity.get("status"),
            "documents": len(self.documents),
            "pages": len(self.pages),
            "sections": len(self.sections),
            "chunks": len(self.chunks),
            "tables": len(self.tables),
            "tables_rejected": len(self.tables_rejected),
            "errors": len(self.errors),
            "total_words": sum(p.get("word_count", 0) for p in self.pages),
            "ocr_pages": sum(p.get("extraction_source") == "ocr" for p in self.pages),
            "average_page_quality": round(float(np.mean(q)), 4) if q else 0.0,
            "median_page_quality": round(float(np.median(q)), 4) if q else 0.0,
            "average_extraction_quality": round(float(np.mean(xq)), 4) if xq else 0.0,
            "quality_distribution": {
                "excellent_0.80_plus": sum(x >= 0.80 for x in q),
                "good_0.60_0.80": sum(0.60 <= x < 0.80 for x in q),
                "fair_0.40_0.60": sum(0.40 <= x < 0.60 for x in q),
                "poor_below_0.40": sum(x < 0.40 for x in q),
            },
            "note": (
                "Las puntuaciones miden calidad TÉCNICA de extracción, no calidad científica "
                "ni fiabilidad de los resultados del documento."
            ),
            "documents_detail": [
                {
                    k: d.get(k)
                    for k in [
                        "document_id",
                        "filename",
                        "inferred_title",
                        "title_source",
                        "year_candidates",
                        "document_language",
                        "profile_type",
                        "profile_type_observed",
                        "page_count",
                        "total_words",
                        "total_tables",
                        "tables_rejected",
                        "total_sections",
                        "sections_with_detected_title",
                        "total_chunks",
                        "ocr_pages",
                        "low_text_pages",
                        "chunk_coverage",
                        "average_quality",
                        "average_extraction_quality",
                    ]
                }
                for d in self.documents
            ],
        }
        write_json(self.config.output_directory / "quality_report.json", report)

    def write_manifest(self) -> None:
        """Record input files, generated outputs, runtime library versions, and SHA-256 hashes."""
        outputs = []
        for f in sorted(self.config.output_directory.glob("*")):
            if f.is_file() and f.name != "manifest.json":
                outputs.append({
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "sha256": sha256_file(f),
                })

        config_dict = {
            k: getattr(self.config, k)
            for k in [
                "max_documents", "ocr_enabled", "ocr_language", "ocr_dpi",
                "ocr_min_chars", "ocr_min_words", "ocr_min_native_quality",
                "heading_font_ratio", "heading_min_score", "heading_repeat_min_pages",
                "heading_repeat_min_share", "header_footer_threshold", "chunk_target_words",
                "chunk_max_words", "chunk_min_words", "chunk_overlap_words",
                "build_tfidf", "generate_embeddings", "embedding_model",
            ]
        }

        manifest_data = {
            "pipeline": "CIOdD-UCR PDF Intelligence Pipeline",
            "version": self.config.pipeline_version,
            "schema_version": self.config.schema_version,
            "edition": "Research & RAG",
            "generated_at": utc_now(),
            "libraries": library_versions(),
            "configuration": config_dict,
            "counts": {
                "documents": len(self.documents),
                "pages": len(self.pages),
                "sections": len(self.sections),
                "chunks": len(self.chunks),
                "tables": len(self.tables),
                "tables_rejected": len(self.tables_rejected),
                "errors": len(self.errors),
            },
            "integrity_status": self.integrity.get("status"),
            "inputs": self.inputs,
            "outputs": outputs,
        }
        write_json(self.config.output_directory / "manifest.json", manifest_data)

    def summary(self) -> None:
        """Display console execution summary and integrity audit results."""
        print("\n" + "=" * 80)
        print(f"PIPELINE COMPLETED — Integrity Status: {self.integrity.get('status')}")
        print("=" * 80)
        for label, val in [
            ("Documents", len(self.documents)),
            ("Pages", len(self.pages)),
            ("Sections", len(self.sections)),
            ("Chunks", len(self.chunks)),
            ("Tables", len(self.tables)),
            ("Rejected Tables", len(self.tables_rejected)),
            ("Errors", len(self.errors)),
        ]:
            print(f"{label:<22}: {val}")

        print("\nIntegrity Checks:")
        for c in self.integrity.get("checks", []):
            detail = f" — {c['detail']}" if c["status"] != "PASS" and c["detail"] else ""
            print(f"  [{c['status']:<7}] {c['check']}{detail}")

        print(f"\nArtifacts Directory: {self.config.output_directory}")
        for f in sorted(self.config.output_directory.glob("*")):
            print(f"  ✓ {f.name:<32} {f.stat().st_size / 1024 / 1024:8.2f} MB")
