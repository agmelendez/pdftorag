"""Document-level extraction orchestrating the 10 sequential processing phases."""

from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import re

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import pymupdf
except ImportError:
    pymupdf = None

from .config import PipelineConfig
from .heading import HEADING, demote_repeated_headings
from .layout import LAYOUT
from .ocr import OCR
from .profiler import PDFProfiler
from .quality import (
    QUALITY,
    clean_blocks,
    infer_repeated_lines,
    remove_repeated_lines,
)
from .tables import TABLE_EXTRACTOR
from .utils import (
    detect_language,
    normalize_text,
    single_line,
    stable_id,
    utc_now,
    word_count,
)


def extraction_quality(
    text_metrics: Dict[str, float],
    source: str,
    ocr_confidence: Optional[float],
) -> float:
    """Calculate intrinsic technical text quality without rewarding or penalizing document formatting."""
    base = (
        0.30 * text_metrics["encoding_score"]
        + 0.40 * text_metrics["legibility_score"]
        + 0.30 * text_metrics["token_structure_score"]
    )
    if source == "ocr":
        base *= max(0.0, min(1.0, float(ocr_confidence or 0.0)))
    return round(base, 4)


_GENERIC_TITLE = re.compile(
    r"^(summary|executive summary|contents|table of contents|about this report|"
    r"foreword|preface|acknowledg\w+|abstract|resumen|[ií]ndice|disclaimer|copyright)\b",
    re.I,
)
_BAD_TITLE = re.compile(
    r"(^untitled$|^microsoft word|\.(pdf|docx?|indd|pptx?)$|^slide \d|^document\d*$)",
    re.I,
)


def infer_document_metadata(
    profile: Dict[str, Any],
    pages: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Infer document title, publication year candidates, and predominant language."""
    meta: Dict[str, Any] = {}
    title = single_line(profile.get("title", ""))

    if len(title) >= 8 and not _BAD_TITLE.search(title):
        meta["inferred_title"], meta["title_source"] = title, "pdf_metadata"
    else:
        # Search cover page first (page 1), then pages 2-3
        found_title = False
        for scope, label in [
            (pages[:1], "largest_font_cover"),
            (pages[1:3], "largest_font_pages_2_3"),
        ]:
            cands = []
            for p in scope:
                for b in p.get("blocks", []):
                    spans = b.get("spans") or []
                    t = single_line(b.get("text", ""))
                    if (
                        spans
                        and 2 <= len(t.split()) <= 25
                        and not re.fullmatch(r"[\W\d_]+", t)
                        and not _GENERIC_TITLE.search(t)
                        and not re.search(r"\.{4,}|…{2,}", t)
                    ):
                        cands.append((
                            max(s["font_size"] for s in spans),
                            p["page_number"],
                            (b.get("bbox") or [0, 0, 0, 0])[1],
                            t,
                        ))
            if cands:
                top = max(c[0] for c in cands)
                best = sorted(
                    [
                        c
                        for c in cands
                        if c[0] >= top - 0.5
                        and c[1] == min(x[1] for x in cands if x[0] >= top - 0.5)
                    ],
                    key=lambda c: c[2],
                )
                meta["inferred_title"] = " ".join(c[3] for c in best)[:300]
                meta["title_source"] = label
                found_title = True
                break

        if not found_title:
            meta["inferred_title"] = Path(profile.get("filename", "")).stem
            meta["title_source"] = "filename"

    years = Counter()
    for p in pages[:2]:
        years.update(re.findall(r"\b(19[89]\d|20[0-3]\d)\b", p.get("clean_text", "") or ""))
    meta["year_candidates"] = [y for y, _ in years.most_common(3)]

    langs = Counter(
        p.get("language") for p in pages if p.get("language") not in (None, "unknown")
    )
    meta["document_language"] = langs.most_common(1)[0][0] if langs else "unknown"
    meta["metadata_note"] = (
        "Título, año e idioma son inferencias automáticas; verificar contra la portada. "
        "Los metadatos internos del PDF no prueban autoría ni fecha."
    )
    return meta


class DocumentExtractor:
    """Executes the per-document 10 extraction and refinement phases."""

    def __init__(self, config: Optional[PipelineConfig] = None):
        self.config = config or PipelineConfig()
        self.profiler = PDFProfiler()

    def extract(self, pdf_path: Union[str, Path]) -> Dict[str, Any]:
        """Extract pages, blocks, tables, and document metadata from a single PDF."""
        pdf_path = Path(pdf_path)
        profile = self.profiler.profile(pdf_path)
        document_id = stable_id("doc", profile["sha256"])
        document: Dict[str, Any] = {
            "document_id": document_id,
            **profile,
            "processed_at": utc_now(),
        }

        pages: List[Dict[str, Any]] = []
        tables: List[Dict[str, Any]] = []
        rejected: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []

        if not pymupdf:
            errors.append({"document_id": document_id, "error": "PyMuPDF not available"})
            return {
                "document": document,
                "pages": pages,
                "tables": tables,
                "tables_rejected": rejected,
                "errors": errors,
                "repeated_lines": [],
                "headings_demoted": 0,
            }

        pdf = pymupdf.open(str(pdf_path))
        plumber_pdf = None

        try:
            if pdfplumber:
                try:
                    plumber_pdf = pdfplumber.open(str(pdf_path))
                except Exception as e:
                    errors.append({
                        "document_id": document_id,
                        "stage": "pdfplumber_open",
                        "error": str(e),
                    })

            total_pages = len(pdf)
            page_limit = (
                min(total_pages, self.config.max_pages)
                if self.config.max_pages is not None and self.config.max_pages > 0
                else total_pages
            )

            for page_index in range(page_limit):
                page_number = page_index + 1
                page = pdf[page_index]
                try:
                    native_text = normalize_text(page.get_text("text", sort=True))
                    native_metrics = QUALITY.text_quality(native_text)

                    layout = LAYOUT.extract(page)
                    blocks, median_font = layout["blocks"], layout["median_font_size"]
                    heading_count = 0
                    for block in blocks:
                        info = HEADING.detect(
                            block,
                            median_font,
                            float(page.rect.width),
                            float(page.rect.height),
                            page_number,
                            font_ratio_threshold=self.config.heading_font_ratio,
                            min_score=self.config.heading_min_score,
                        )
                        block.update(info)
                        heading_count += int(info["is_heading"])

                    final_text, extraction_source = native_text, "native"
                    ocr_applied, ocr_text, ocr_confidence = False, "", None

                    if self.config.ocr_enabled and OCR.needs_ocr(
                        native_text, native_metrics["text_quality_score"]
                    ):
                        ocr_result = OCR.extract(page)
                        ocr_applied = True
                        ocr_text, ocr_confidence = ocr_result.get("text", ""), ocr_result.get("confidence")
                        if (
                            word_count(ocr_text) > max(1, word_count(native_text)) * 1.20
                            or word_count(native_text) < self.config.ocr_min_words
                        ):
                            final_text, extraction_source = ocr_text, "ocr"

                    page_tables: List[Dict[str, Any]] = []
                    if plumber_pdf is not None and page_index < len(plumber_pdf.pages):
                        try:
                            found = TABLE_EXTRACTOR.extract(
                                plumber_pdf.pages[page_index],
                                document_id,
                                page_number,
                                self.config,
                            )
                            page_tables = found["accepted"]
                            rejected.extend(found["rejected"])
                        except Exception as e:
                            errors.append({
                                "document_id": document_id,
                                "page_number": page_number,
                                "stage": "tables",
                                "error": str(e),
                            })
                    tables.extend(page_tables)

                    final_metrics = QUALITY.text_quality(final_text)
                    page_quality = QUALITY.page_quality(
                        final_metrics,
                        extraction_source,
                        ocr_confidence,
                        len(blocks),
                        len(page_tables),
                        heading_count,
                    )
                    words = word_count(final_text)

                    flags = []
                    if extraction_source == "ocr":
                        flags.append("ocr")
                        if (ocr_confidence or 0.0) < 0.60:
                            flags.append("ocr_low_confidence")
                    if words == 0:
                        flags.append("empty")
                    elif words < 20:
                        flags.append("low_text")
                    if not blocks:
                        flags.append("no_layout_blocks")
                    if layout["images"] and words < 30:
                        flags.append("image_page")

                    try:
                        label = page.get_label() or ""
                    except Exception:
                        label = ""

                    pages.append({
                        "page_id": f"{document_id}_P{page_number:05d}",
                        "document_id": document_id,
                        "filename": profile["filename"],
                        "page_number": page_number,
                        "page_label": label,
                        "width": float(page.rect.width),
                        "height": float(page.rect.height),
                        "native_text": native_text,
                        "ocr_text": ocr_text,
                        "clean_text": normalize_text(final_text),
                        "extraction_source": extraction_source,
                        "ocr_applied": ocr_applied,
                        "ocr_confidence": ocr_confidence,
                        "word_count": words,
                        "language": detect_language(final_text),
                        "block_count": len(blocks),
                        "heading_count": heading_count,
                        "image_count": len(layout["images"]),
                        "table_count": len(page_tables),
                        "page_flags": flags,
                        "extraction_quality_score": extraction_quality(
                            final_metrics, extraction_source, ocr_confidence
                        ),
                        "blocks": blocks,
                        "images_metadata": layout["images"],
                        **final_metrics,
                        **page_quality,
                    })
                except Exception as e:
                    errors.append({
                        "document_id": document_id,
                        "page_number": page_number,
                        "stage": "page",
                        "error": str(e),
                    })
                    pages.append({
                        "page_id": f"{document_id}_P{page_number:05d}",
                        "document_id": document_id,
                        "filename": profile["filename"],
                        "page_number": page_number,
                        "page_label": "",
                        "clean_text": "",
                        "word_count": 0,
                        "overall_quality_score": 0.0,
                        "extraction_quality_score": 0.0,
                        "blocks": [],
                        "page_flags": ["page_error"],
                        "error": str(e),
                    })
        finally:
            pdf.close()
            if plumber_pdf:
                plumber_pdf.close()

        # Clean edge headers/footers
        repeated = infer_repeated_lines(
            pages,
            threshold=self.config.header_footer_threshold,
            edge_lines=self.config.header_footer_edge_lines,
        )
        for page in pages:
            height = page.get("height")
            page["clean_text"], removed = remove_repeated_lines(
                page.get("clean_text", ""),
                repeated,
                edge_lines=self.config.header_footer_edge_lines,
            )
            page["removed_edge_lines"] = sorted(set(removed))
            page["word_count"] = word_count(page["clean_text"])
            page["blocks"] = clean_blocks(page.get("blocks", []), repeated, height)

        demoted = demote_repeated_headings(
            pages,
            min_pages=self.config.heading_repeat_min_pages,
            min_share=self.config.heading_repeat_min_share,
        )
        document.update(infer_document_metadata(profile, pages))

        return {
            "document": document,
            "pages": pages,
            "tables": tables,
            "tables_rejected": rejected,
            "errors": errors,
            "repeated_lines": sorted(repeated),
            "headings_demoted": demoted,
        }


DOCUMENT_EXTRACTOR = DocumentExtractor()
