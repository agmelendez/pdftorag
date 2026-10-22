# Especificación de Salidas y Diccionario de Datos: V5.2

El pipeline genera dos familias complementarias de archivos en la carpeta de destino:
1. **Vistas Tabulares y de Streaming**: Archivos `.jsonl` (un registro por línea, ideal para streaming y LLMs) y sus espejos tabulares optimizados `.parquet` (donde los diccionarios y listas internas se aplanan como cadenas JSON mediante `flatten_row`).
2. **Archivos de Control e Índices**: Base de datos relacional `corpus.duckdb`, índices `tfidf_*.joblib`, `faiss.index`, y reportes de auditoría en formato JSON (`manifest.json`, `integrity_report.json`, `quality_report.json`, `data_dictionary.json`).

---

## 1. `chunks.jsonl` / `chunks.parquet` (Unidad Primaria para LLMs y RAG)

Es el artefacto principal para alimentar ventanas de contexto de modelos de lenguaje o bases vectoriales.

| Campo | Tipo | Descripción | Regla para LLMs / RAG |
|---|---|---|---|
| `chunk_id` | `string` | ID determinista (`doc_<16hex>_C00001`). | Llave primaria obligatoria de citación en las respuestas. |
| `document_id` | `string` | ID del PDF padre (`doc_<16hex>`). | Permite vincular el fragmento al catálogo general de documentos. |
| `filename` | `string` | Nombre del archivo PDF original. | Usar siempre en la cita bibliográfica visible para el usuario. |
| `section_id` | `string` | ID de la sección contenedora (`doc_<16hex>_S0001`). | Permite reconstruir la sección documental completa. |
| `section_title` | `string` | Título detectado o `"Contenido inicial"`. | Título de la sección para dar contexto temático al LLM. |
| `section_title_source`| `string` | `"detected"` o `"none"`. | Indica si el título proviene de un encabezado real de layout. |
| `section_title_reliable`| `bool` | `true` si confianza $\ge 0.6$ y fuente `"detected"`. | Si es `true`, es seguro anteponer el título al texto al buscar. |
| `merged_section_ids` | `list[str]` | IDs de secciones cortas ($< 60$ palabras) absorbidas. | Indica que el fragmento contiene más de una sección temática. |
| `merged_section_titles` | `list[str]` | Títulos de las secciones absorbidas. | Permite buscar por el título de la sección corta absorbida. |
| `short_section` | `bool` | `true` si el fragmento es una sección corta aislada. | Advertencia de brevedad o contenido tipo nota al pie. |
| `text` | `string` | Texto limpio y normalizado del fragmento. | Contenido principal a inyectar en el prompt. |
| `word_count` | `int` | Total de palabras en `text`. | Tamaño total del bloque (incluye el solapamiento). |
| `overlap_words` | `int` | Palabras iniciales repetidas del chunk anterior. | No deben considerarse como información nueva. |
| `unique_words` | `int` | Palabras propias aportadas por este fragmento. | **Sumar esta columna para métricas de volumen, nunca `word_count`.** |
| `page_start` / `page_end` | `int` | Rango de páginas del PDF (1-based). | Cubre **únicamente** las palabras propias (`unique_words`). |
| `page_label_start` / `end` | `string` | Numeración impresa de la página (ej. `"iv"`, `"28"`). | Permite citar tanto la página PDF como la página del libro/informe. |
| `related_table_ids` | `list[str]` | Lista de IDs de tablas válidas en las páginas del chunk. | Permite consultar `tables.jsonl` e inyectar la tabla en el prompt. |
| `quality_score` | `float` | Promedio de calidad técnica de las páginas (0.0 a 1.0). | Si es $< 0.40$, el LLM debe advertir incertidumbre al usuario. |
| `language` | `string` | Código de idioma detectado (`"es"`, `"en"`, etc.). | Útil para seleccionar el idioma de respuesta del LLM. |
| `text_sha256` | `string` | Hash SHA-256 del texto en minúsculas. | Detección de párrafos duplicados entre distintos documentos. |

---

## 2. `tables.jsonl` y `tables_rejected.jsonl` (Evidencia Tabular)

### `tables.jsonl` (Tablas Aceptadas)
- `table_id`: ID único determinista (`tbl_<16hex>`).
- `document_id`: PDF padre.
- `page_number`: Página física (1-based).
- `strategy`: Estrategia con la que fue detectada (`"lines"` o `"text"`).
- `bbox`: Coordenadas `[x0, y0, x1, y1]` en puntos tipográficos.
- `rows` / `columns`: Dimensiones de la rejilla de datos.
- `table_confidence`: `"high"` (estrategia lines con $\ge 50\%$ de celdas llenas), `"medium"` (pasa los filtros heurísticos) o `"low"`.
- `caption`: Título detectado en la franja de 45 puntos sobre la tabla (ej. `"Tabla 4. Coeficientes de regresión"`).
- `markdown`: Representación tabular en formato Markdown lista para inyectar en el prompt de un LLM.
- `headers`: Lista de nombres normalizados de columnas.
- `records`: Lista de diccionarios `{columna: valor}` ideal para análisis en Pandas o SQL.
- `matrix`: Matriz cruda como lista de listas de cadenas.

### `tables_rejected.jsonl` (Rejillas Descartadas)
Contiene las rejillas que fueron descartadas por parecer prosa en columnas o estar vacías:
- Contiene los mismos campos de ubicación geométrica y métricas.
- `reject_reason`: Motivo explícito de descarte (ej. `"celdas inician en minúscula (prosa fragmentada)"`, `"ocupa casi toda la página (prosa)"`).
- Permite auditar si el clasificador fue demasiado estricto con algún documento específico.

---

## 3. `sections.jsonl` / `sections.parquet` (Estructura Documental Jerárquica)

Preserva las unidades temáticas completas antes de ser divididas en chunks:
- `section_id`: Identificador `{doc_id}_S0001`.
- `title` / `section_title`: Título de la sección.
- `title_source`: `"detected"` o `"none"`.
- `heading_confidence` / `heading_level`: Confianza (0.0 a 1.0) y nivel jerárquico H1, H2 o H3.
- `page_start` / `page_end`: Rango de páginas abarcado.
- `paragraphs`: Lista de objetos `{"page_number": int, "text": str, "block_id": int | null}` que conserva la procedencia exacta por bloque de layout.
- `text`: Texto completo unificado de la sección.
- `word_count`: Conteo total de palabras de la sección.

---

## 4. `pages.jsonl` / `pages.parquet` (Auditoría Página por Página)

Contiene la evidencia física cruda y procesada:
- `page_id`: Identificador `{doc_id}_P00001`.
- `page_number` / `page_label`: Índice base 1 y etiqueta impresa.
- `native_text`: Texto bruto extraído por PyMuPDF.
- `ocr_text`: Texto obtenido por Tesseract OCR si se disparó la extracción asistida.
- `clean_text`: Texto final normalizado tras retirar cabeceras y pies repetitivos.
- `extraction_source`: `"native"` u `"ocr"`.
- `removed_edge_lines`: Lista exacta de las líneas eliminadas de los bordes.
- `page_flags`: Banderas de auditoría (`"ocr"`, `"ocr_low_confidence"`, `"empty"`, `"low_text"`, `"image_page"`, `"no_layout_blocks"`).
- `extraction_quality_score`: Puntuación de fiabilidad técnica intrínseca del texto (0.0 a 1.0).
- `overall_quality_score`: Métrica compuesta que incluye estructura y tablas.

---

## 5. `documents.jsonl` / `documents.parquet` (Catálogo Documental)

Resumen bibliográfico y estadísticas por documento PDF:
- `document_id`: Llave primaria determinista.
- `filename`, `file_size_bytes`, `sha256`, `page_count`, `extracted_pages`.
- `inferred_title`: Título inferido automáticamente.
- `title_source`: Procedencia del título (`"pdf_metadata"`, `"largest_font_cover"`, `"largest_font_pages_2_3"`, `"filename"`).
- `year_candidates`: Años más frecuentes en páginas 1–2 (candidatos, no fecha de publicación).
- `document_language`: Idioma predominante del documento.
- `total_words`, `total_tables`, `tables_rejected`, `total_sections`, `total_chunks`.
- `chunk_coverage`: Razón entre palabras únicas en chunks y palabras en secciones ($\ge 0.995$).
- `average_extraction_quality`: Promedio de fiabilidad del texto del documento.

---

## 6. Archivos JSON de Control e Integridad

- `integrity_report.json`: Resultado de los 9 controles automáticos de consistencia relacional. Emite estado global `PASS`, `PASS_WITH_WARNINGS` o `FAIL`, e incluye la lista `review_pages` con las páginas que requieren inspección visual antes de ser citadas.
- `quality_report.json`: Distribución estadística de calidad del corpus (`excellent_0.80_plus`, `good_0.60_0.80`, `fair_0.40_0.60`, `poor_below_0.40`).
- `manifest.json`: Registra versiones de dependencias (PyMuPDF, Tesseract, Pandas, DuckDB), hiperparámetros de configuración, huellas SHA-256 de todas las entradas y de todos los artefactos de salida generados.
- `data_dictionary.json`: Diccionario semántico que documenta el propósito analítico de cada columna.
