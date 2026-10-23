# Documentación Técnica — CIOdD-UCR PDF Intelligence Pipeline V5.5
## Research & RAG Edition · Optimizado para Google Colab

**Versión:** 5.5.0  
**Fecha:** Octubre 2026  
**Institución:** Centro de Investigación Observatorio del Desarrollo (CIOdD) — Universidad de Costa Rica  
**Formato de entrega:** Notebook Jupyter (`.ipynb`) para Google Colab

---

## 1. Propósito

El pipeline transforma colecciones heterogéneas de PDFs en un corpus estructurado, auditable y de cero pérdida de texto, listo para RAG y análisis con LLMs.

**Principios mantenidos:**
- Cero pérdida de texto (`chunk_coverage ≥ 0.995`, objetivo exacto 1.0)
- Trazabilidad de páginas y secciones
- Control de falsos positivos estructurales (tablas y headings)
- Auditoría de integridad e IDs únicos
- Ejecución estable en Google Colab (checkpointing, embeddings desactivados por defecto)

**Novedades de V5.5 (respecto a V5.4):**
- Detección de headings más estricta (menos párrafos tratados como títulos)
- Fusión de títulos menos agresiva (evita concatenar título + subtítulo)
- Limpieza automática de caracteres especiales en títulos (▒, ■, etc.)
- Filtro de tablas residuales por área mínima (`page_area_share < 0.03`)
- Descarte de chunks extremadamente cortos (< 20 palabras únicas)
- Mantiene las correcciones de V5.4 (cobertura exacta y rechazo de páginas completas como tablas)

---

## 2. Evolución reciente

| Versión | Problema principal | Solución |
|---------|--------------------|----------|
| V5.3 | Cobertura > 1.0; tablas de página completa aceptadas como prosa | Identificado en auditoría |
| V5.4 | Mismo corpus | Cobertura fijada a 1.0; rechazo de páginas completas con prosa |
| **V5.5** | Títulos ruidosos, headings falsos, tablas residuales minúsculas, chunks de portada | Filtros de headings, limpieza de títulos, área mínima de tablas, descarte de chunks cortos |

---

## 3. Arquitectura (resumen)

El flujo de fases se mantiene:

1. Perfilado del PDF  
2. Extracción nativa (PyMuPDF)  
3. OCR condicional (Tesseract, spa+eng)  
4. Limpieza de headers/footers repetidos  
5. Detección de headings y construcción de secciones  
6. Extracción adaptativa de tablas (pdfplumber)  
7. Chunking con solapamiento y garantía de cobertura  
8. Consolidación (JSONL + Parquet + DuckDB)  
9. Índice TF-IDF (opcional)  
10. Reportes de calidad e integridad  

**Cambios relevantes en V5.5:**

| Fase | Cambio |
|------|--------|
| Headings | Umbral más estricto (máx. 16 palabras); rechazo de bloques con apariencia de oración |
| Secciones | Fusión de títulos solo cuando ambos son cortos y adyacentes |
| Tablas | Nuevo rechazo por área demasiado pequeña |
| Chunks | Descarte de chunks con < 20 palabras únicas |
| Títulos | Función `clean_title()` elimina caracteres especiales |

---

## 4. Configuración (`PipelineConfig`)

Parámetros nuevos o ajustados en V5.5:

```python
config = PipelineConfig(
    pipeline_version="5.5",
    # ... parámetros previos de V5.4 ...
    table_min_area=0.03,              # rechazo de tablas residuales
    heading_max_words=16,             # límite más estricto
    min_chunk_words_discard=20,       # descarte de chunks de portada
)
```

Parámetros clave heredados:

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| `chunk_target_words` | 550 | Tamaño objetivo del chunk |
| `chunk_max_words` | 800 | Máximo antes de partir |
| `chunk_overlap_words` | 80 | Solapamiento |
| `chunk_coverage_min` | 0.995 | Umbral de integridad |
| `table_lines_max_area` | 0.85 | Rechazo de páginas completas (V5.4) |
| `table_lines_max_avg_words` | 15.0 | Complemento del filtro anterior |
| `generate_embeddings` | False | Recomendado en Colab |
| `ocr_enabled` | True | OCR cuando el texto nativo es insuficiente |

---

## 5. Mejoras detalladas de V5.5

### 5.1 Detección de headings más estricta

- Máximo de palabras reducido de 20 a **16**.
- Longitud máxima de texto reducida a 180 caracteres.
- Nuevo rechazo: si el bloque tiene más de 10 palabras **y** contiene un punto interno (apariencia de oración) y no es numerado ni estándar → no se considera heading.

**Efecto esperado:** menos párrafos de cuerpo convertidos en títulos de sección (caso observado en el informe del Paris Peace Forum).

### 5.2 Fusión de títulos controlada

Antes, títulos adyacentes sin párrafos intermedios se concatenaban fácilmente.  
En V5.5 solo se fusionan si:
- Son adyacentes (distancia vertical < 18 puntos), **y**
- El título actual tiene ≤ 8 palabras, **y**
- El nuevo título tiene ≤ 6 palabras.

**Efecto esperado:** títulos más limpios (ej. “Pillar 1” separado de su subtítulo largo).

### 5.3 Limpieza de títulos (`clean_title`)

Elimina caracteres de caja y símbolos decorativos (▒ ■ □ ▪ etc.) y normaliza espacios múltiples.  
Se aplica al construir el título de cada sección.

### 5.4 Filtro de tablas por área mínima

En `AdaptiveTableExtractor.judge()`:

```python
if feats.get("page_area_share", 1.0) < self.config.table_min_area:
    return False, "área demasiado pequeña (residuo)"
```

**Efecto esperado:** eliminación de las tablas residuales de área ~0.01 observadas en la página de acknowledgments del informe INTAiC.

### 5.5 Descarte de chunks muy cortos

Al final de la construcción de chunks se filtran aquellos con menos de `min_chunk_words_discard` (por defecto 20) palabras únicas.  
Esto elimina chunks de portada aislados (ej. “The SAFE AI Foundation’s AI Safety Model… Technical Report”).

---

## 6. Resultados de la auditoría que motivó V5.5

Corpus de prueba (4 documentos, ~257 páginas):

| Documento | Cobertura V5.4 | Tablas V5.4 | Observaciones |
|-----------|----------------|-------------|---------------|
| AI Safety Model (AISM) | 1.0000 | 0 / 21 rechazadas | Títulos con ▒ y fusión “2 + 2.1” |
| Anthropic Public Benefit Report | 1.0000 | 0 / 20 rechazadas | Títulos concatenados (Pillar + subtítulo) |
| La era de la IA… | 1.0000 | 0 / 189 rechazadas | OCR mínimo (3 páginas); secciones correctas |
| INTAiC / Paris Peace Forum | 1.0000 | 4 / 34 rechazadas | 3 de las 4 tablas eran residuales; headings de párrafos |

Integridad: **PASS** en ambas versiones (IDs únicos + cobertura ≥ 0.995).

---

## 7. Uso en Google Colab

1. Abrir el notebook `ciodd_ucr_pdf_intelligence_pipeline_v5_5.ipynb`.
2. Ejecutar la celda de instalación.  
   Si aparece conflicto de Pillow con Gradio, reiniciar el runtime.
3. Subir los PDFs a `/content/PDFs` (o activar `use_drive=True`).
4. Ejecutar la celda de configuración y procesamiento.
5. (Opcional) Descargar el ZIP de resultados desde la última celda.
6. Si Colab se desconecta, reejecutar: el checkpoint evita reprocesar documentos ya terminados.

**Dependencias principales:**  
PyMuPDF, pdfplumber, pypdf, pandas, DuckDB, pytesseract, scikit-learn, joblib, langdetect, Pillow (pin `<12`).

---

## 8. Artefactos generados

| Archivo | Contenido |
|---------|-----------|
| `documents.jsonl` / `.parquet` | Metadatos por documento |
| `pages.jsonl` / `.parquet` | Texto y bloques por página |
| `sections.jsonl` / `.parquet` | Secciones con títulos limpiados |
| `chunks.jsonl` / `.parquet` | Chunks para RAG |
| `tables.jsonl` / `.parquet` | Tablas aceptadas |
| `tables_rejected.jsonl` | Candidatos rechazados + motivo |
| `corpus.duckdb` | Base relacional del corpus |
| `tfidf_vectorizer.joblib` + `tfidf_matrix.joblib` | Índice TF-IDF |
| `integrity_report.json` | Checks de integridad |
| `quality_report.json` | Resumen agregado |
| `checkpoint.json` | Progreso para reanudación |
| `manifest.json` | Configuración usada |
| `processing_log.jsonl` | Tiempos y estado por documento |

---

## 9. Limitaciones conocidas

- Las tablas con layout de varias columnas complejas (ej. página 17 del informe INTAiC) pueden seguir siendo rechazadas por “rejilla de texto demasiado grande”. Recuperarlas requeriría una estrategia específica de multi-columna (fuera del alcance de esta iteración).
- El detector de headings sigue siendo heurístico; documentos con tipografía muy homogénea pueden generar títulos imperfectos.
- El descarte de chunks cortos es agresivo por diseño; si se necesita conservar portadas o títulos aislados, subir `min_chunk_words_discard` o desactivarlo.

---

## 10. Próximos pasos sugeridos (fuera de V5.5)

- Estrategia específica para tablas multi-columna de layout (no solo líneas).
- Mejora de la confiabilidad de títulos en documentos con tipografía uniforme.
- Evaluación de embeddings multilingües en un entorno con más recursos (fuera de Colab gratuito).
- Métricas automáticas de calidad de títulos (longitud, presencia de caracteres especiales, solapamiento con el primer párrafo).

---

**Documento generado para la versión 5.5 del pipeline CIOdD-UCR.**  
Entrega principal: `ciodd_ucr_pdf_intelligence_pipeline_v5_5.ipynb`
