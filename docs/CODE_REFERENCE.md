# Referencia de Código y API: `pdf_intelligence`

Este documento detalla cada módulo, clase, método y función que componen el paquete `pdf_intelligence`.

---

## 1. Módulo `pdf_intelligence.config`

### `class PipelineConfig`
Dataclass que centraliza todos los hiperparámetros y rutas del pipeline.

| Parámetro | Tipo | Valor por Defecto | Descripción |
|---|---|---|---|
| `pipeline_version` | `str` | `"5.2"` | Versión de la lógica de procesamiento. |
| `schema_version` | `str` | `"5.2.0"` | Versión de los esquemas de datos JSONL/Parquet. |
| `pdf_directory` | `Path` | `Path("./data/pdfs")` | Carpeta raíz que contiene los archivos PDF. |
| `output_directory` | `Path` | `Path("./data/pdf_intelligence")` | Directorio donde se escriben los artefactos. |
| `max_documents` | `Optional[int]` | `None` | Límite máximo de PDFs a procesar (None = todos). |
| `ocr_enabled` | `bool` | `True` | Habilita el motor Tesseract OCR. |
| `ocr_language` | `str` | `"spa+eng"` | Idiomas cargados en Tesseract. |
| `ocr_dpi` | `int` | `200` | Resolución de renderizado de página para OCR. |
| `ocr_min_chars` | `int` | `80` | Caracteres mínimos para no disparar OCR. |
| `ocr_min_words` | `int` | `20` | Palabras mínimas para no disparar OCR. |
| `ocr_min_native_quality` | `float` | `0.35` | Puntaje de calidad mínimo para no disparar OCR. |
| `heading_font_ratio` | `float` | `1.18` | Razón entre tamaño de fuente y mediana de página. |
| `heading_min_score` | `float` | `2.0` | Puntaje acumulado mínimo para aceptar encabezado. |
| `heading_repeat_min_pages`| `int` | `4` | Páginas mínimas para degradar encabezado repetido. |
| `heading_repeat_min_share`| `float` | `0.08` | Proporción del PDF para degradar encabezado repetido. |
| `header_footer_threshold`| `float` | `0.35` | Proporción de páginas para considerar un patrón como cabecera/pie. |
| `chunk_target_words` | `int` | `550` | Palabras objetivo por fragmento. |
| `chunk_max_words` | `int` | `800` | Límite máximo duro de palabras por chunk. |
| `chunk_min_words` | `int` | `60` | Umbral para fusionar secciones cortas. |
| `chunk_overlap_words` | `int` | `80` | Ventana de solapamiento entre chunks de la misma sección. |
| `chunk_coverage_min` | `float` | `0.995` | Tasa mínima de cobertura auditada. |

---

## 2. Módulo `pdf_intelligence.utils`

Funciones puras de utilidad para normalización de texto, hashing y serialización:

- `utc_now() -> str`: Retorna marca de tiempo ISO 8601 en formato UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- `normalize_unicode(text: Optional[str]) -> str`: Aplica normalización NFKC, remueve guiones suaves (`\u00ad`) y espacios duros (`\xa0`).
- `normalize_text(text: Optional[str]) -> str`: Colapsa saltos de línea repetidos y espacios múltiples sin alterar el contenido léxico.
- `single_line(text: Optional[str]) -> str`: Colapsa cualquier secuencia de espacios y saltos en un único espacio en blanco.
- `word_count(text: Optional[str]) -> int`: Conteo de palabras mediante la expresión regular `\b[\wÀ-ÿ]+\b` compatible con caracteres latinos y acentos.
- `sha256_file(path: Union[str, Path]) -> str`: Calcula el hash criptográfico SHA-256 en bloques de 1 MB.
- `sha256_text(text: Optional[str]) -> str`: Retorna el hash hexadecimal SHA-256 del texto en minúsculas codificado en UTF-8.
- `stable_id(prefix: str, value: str) -> str`: Genera un identificador determinista de 16 caracteres hexadecimales precedido por el prefijo (ej. `doc_8f3a91b2c4e57d01`).
- `detect_language(text: Optional[str]) -> str`: Utiliza `langdetect` para inferir el código ISO del idioma (retorna `"unknown"` si el texto tiene menos de 80 caracteres).
- `write_json(path, data)` / `write_jsonl(path, rows)`: Serializadores robustos con codificación UTF-8 sin escapar caracteres no ASCII (`ensure_ascii=False`).
- `flatten_row(row: dict) -> dict`: Convierte estructuras anidadas (diccionarios y listas) en cadenas JSON válidas para asegurar compatibilidad con Apache Arrow / Parquet.
- `normalize_pattern(line: Optional[str]) -> str`: Reemplaza cualquier secuencia de dígitos por `#` y convierte a minúsculas para comparar patrones de cabeceras/pies.
- `library_versions() -> dict`: Inspecciona las versiones activas de Python, PyMuPDF, pdfplumber, pypdf, pandas, DuckDB, scikit-learn, SentenceTransformers y Tesseract.

---

## 3. Módulo `pdf_intelligence.profiler`

### `class PDFProfiler`
- `classify(document) -> str`: Clasifica el PDF como `"digital"`, `"scanned"`, `"hybrid"` o `"empty"` mediante muestreo de hasta 7 páginas distribuidas uniformemente.
- `profile(pdf_path: Path) -> dict`: Extrae tamaño en bytes, huella SHA-256, metadatos internos (`title`, `author`, `creation_date`) con `pypdf`, total de páginas y estado de cifrado.

---

## 4. Módulo `pdf_intelligence.layout`

### `class LayoutExtractor`
- `extract(page: fitz.Page) -> dict`: Analiza el diccionario jerárquico de la página ordenado por lectura (`sort=True`).
  - Retorna `blocks`: lista de bloques de texto con sus `spans` tipográficos individuales (`font`, `font_size`, `flags`, `bbox`).
  - Retorna `median_font_size`: mediana matemática de los tamaños tipográficos de la página.
  - Retorna `images`: metadatos geométricos y delimitadores de imágenes incrustadas (`type=1`).

---

## 5. Módulo `pdf_intelligence.heading`

### `class HeadingDetector`
- `detect(block, median_font, page_width, page_height, page_number) -> dict`:
  Evalúa el bloque contra reglas de exclusión (números de eje, notas al pie, viñetas, pies de figura) y calcula el puntaje acumulado.
  - Retorna `is_heading`: booleano (`score >= 2.0`).
  - Retorna `heading_confidence`: confianza normalizada de 0.0 a 1.0.
  - Retorna `heading_level`: nivel jerárquico 1, 2 o 3.
  - Retorna `heading_signals`: lista de señales activadas (ej. `["standard", "bold", "font>=1.30"]`).

### `def demote_repeated_headings(pages, min_pages=4, min_share=0.08) -> int`
Recorre todas las páginas del documento y desclasifica los encabezados que se repitan en $\ge 4$ páginas o en $\ge 8\%$ del total del informe, asignando `heading_demoted = "repeated_on_many_pages"`.

---

## 6. Módulo `pdf_intelligence.ocr`

### `class OCRExtractor`
- `needs_ocr(text: str, quality: float) -> bool`: Evalúa si se disparan los umbrales de escasez léxica o baja calidad de codificación.
- `extract(page: fitz.Page) -> dict`: Renderiza la página a 200 DPI y ejecuta `pytesseract.image_to_data` agrupando por bloques y párrafos. Retorna `text` y `confidence` promedio de 0.0 a 1.0.

---

## 7. Módulo `pdf_intelligence.tables`

### `class AdaptiveTableExtractor`
- `judge(strategy, matrix, feats) -> tuple[bool, str]`: Aplica criterios heurísticos sobre la cuadrícula:
  - `filled_ratio`: proporción de celdas no vacías.
  - `fragment_ratio`: celdas con $\le 2$ caracteres.
  - `lower_start_ratio`: celdas que inician en minúscula (prosa partida).
  - `page_area_share`: porcentaje del área de la página ocupada.
- `to_markdown(matrix, max_rows=40) -> str`: Convierte la matriz en una tabla Markdown con caracteres `|` escapados.
- `find_caption(page, bbox) -> str`: Escanea la franja vertical de 45 puntos inmediatamente superior al delimitador de la tabla para extraer el título (ej. "Tabla 1. Distribución...").
- `extract(page, document_id, page_number) -> dict`: Retorna listas de tablas `accepted` (con Markdown y records tabulares) y `rejected` (con motivo de descarte).

---

## 8. Módulo `pdf_intelligence.quality`

### `class QualityAssessor`
- `text_quality(text: str) -> dict`: Calcula `density_score`, `encoding_score`, `legibility_score`, `token_structure_score` y `text_quality_score`.
- `page_quality(text_metrics, source, ocr_confidence, block_count, table_count, heading_count) -> dict`: Calcula `layout_score`, `ocr_score`, `structure_score`, `table_score`, `overall_quality_score` y `extraction_quality_score`.

### `def infer_repeated_lines(pages) -> set[str]`
Detecta patrones recurrentes en las 3 primeras y 3 últimas líneas de las páginas (reemplazando números por `#`), con presencia en $\ge 35\%$ de las páginas.

### `def remove_repeated_lines(text, patterns, edge_lines=3) -> tuple[str, list[str]]`
Elimina los patrones detectados **únicamente en los bordes** superior e inferior del texto de la página y devuelve las líneas eliminadas para trazabilidad.

---

## 9. Módulo `pdf_intelligence.structure`

### `class SectionBuilder`
- `build(document_id, pages) -> list[dict]`: Ensambla bloques en secciones lógicas `{doc_id}_S0001`.
  - Concatena títulos multilínea adyacentes o jerárquicos (`" › "`).
  - Asigna `paragraphs` con indicación de página y bloque de procedencia.

### `class ChunkBuilder`
- `build(document_id, filename, sections, tables_by_page, quality_by_page, label_by_page) -> list[dict]`:
  Segmenta párrafos con `split_long_paragraph` y construye fragmentos `{doc_id}_C00001`.
  - Aplica solapamiento de 80 palabras intrasección.
  - Fusiona secciones de $< 60$ palabras con el chunk anterior (`merged_section_ids` y `merged_section_titles`).
  - Garantiza `chunk_coverage >= 0.995`.
  - Paginación estricta (`page_start`/`page_end`) sobre palabras propias (`unique_words`).

---

## 10. Módulo `pdf_intelligence.corpus`

### `class CorpusBuilder`
Orquesta el procesamiento global, persistencia y validación:
- `process()`: Ejecuta el bucle de procesamiento, exporta JSONL/Parquet, crea `corpus.duckdb`, genera índices y ejecuta auditoría.
- `build_duckdb()`: Crea base relacional con índices en `document_id`.
- `build_tfidf()`: Entrena matriz TF-IDF de n-gramas (1, 2) con `scikit-learn`.
- `build_embeddings()`: Codifica representaciones densas con `paraphrase-multilingual-MiniLM-L12-v2` y crea índice `IndexFlatIP` en FAISS.
- `check_integrity()`: Evalúa 9 controles relacionales y emite `integrity_report.json`.

---

## 11. Módulo `pdf_intelligence.search`

### `class LocalSearch`
- `search_tfidf(query, top_k=10, min_quality=None, filename=None, section=None) -> list[dict]`:
  Ejecuta búsqueda rápida por similitud coseno local sin requerir APIs externas ni consumo de tokens.
