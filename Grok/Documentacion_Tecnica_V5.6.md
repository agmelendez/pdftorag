# Documentación Técnica — CIOdD-UCR PDF Intelligence Pipeline V5.6

**Fecha:** 2026-10-22  
**Versión:** 5.6  
**Formato:** Google Colab (.ipynb)

---

## 1. Resumen de la versión

V5.6 es una corrección crítica sobre V5.5.  
El único cambio funcional es la reparación de un bug de orden de asignación en `HeadingDetector.detect` que provocaba fallo en la extracción de páginas y pérdida masiva de texto.

---

## 2. Bug corregido

**Error:**
```
cannot access local variable 'is_numbered' where it is not associated with a value
```

**Causa:**  
En V5.5 se añadió una validación de bloques tipo oración que usaba `is_numbered` e `is_standard` **antes** de que se asignaran.

**Impacto observado (auditoría V5.5 con bug):**

| Documento | Palabras V5.4 | Palabras V5.5 (bug) | Pérdida |
|-----------|---------------|---------------------|---------|
| Paris Peace Forum | ~8 349 | 995 | ~88 % |
| Anthropic | ~6 750 | 5 218 | ~23 % |
| AISM | ~5 693 | 4 844 | ~15 % |
| La era de la IA | ~64 586 | 64 304 | ~0,4 % |

**Corrección:**  
Se movió la asignación de `is_standard` e `is_numbered` **antes** del chequeo.

---

## 3. Mejoras acumuladas (desde V5.4)

| Mejora | Descripción |
|--------|-------------|
| Headings más estrictos | Máximo 16 palabras; rechazo de bloques con puntos internos (salvo numerados). |
| Fusión controlada | Máximo 2 títulos consecutivos se fusionan. |
| Limpieza de títulos | `clean_title()` elimina ▒ y caracteres de control. |
| Filtro de tablas residuales | `table_min_area = 0.03` descarta fragmentos pequeños. |
| Descarte de chunks cortos | Chunks con menos de 20 palabras se descartan. |
| Búsqueda de PDFs | Insensible a mayúsculas (`.pdf` / `.PDF`). |
| Subida automática | Si `/content/PDFs` está vacío, se abre el diálogo de subida. |

---

## 4. Configuración relevante (PipelineConfig)

```python
heading_max_words: int = 16
table_min_area: float = 0.03
min_chunk_words_discard: int = 20
chunk_target_words: int = 550
chunk_max_words: int = 800
chunk_min_words: int = 60
chunk_overlap_words: int = 80
chunk_coverage_min: float = 0.995
```

---

## 5. Uso en Colab

1. Subir el notebook `ciodd_ucr_pdf_intelligence_pipeline_v5_6.ipynb`.
2. Ejecutar la celda de instalación.
3. Si aparece conflicto de Pillow, reiniciar el runtime.
4. En la celda de ejecución:
   - Si no hay PDFs, se pedirá subirlos.
   - Para reprocesar, descomentar `checkpoint.unlink()`.
5. Descargar el ZIP al final.

---

## 6. Salidas esperadas

- `documents.jsonl` / `.parquet`
- `pages.jsonl` / `.parquet`
- `sections.jsonl` / `.parquet`
- `chunks.jsonl` / `.parquet`
- `tables.jsonl` / `.parquet`
- `tables_rejected.jsonl`
- `integrity_report.json`
- `quality_report.json`
- `manifest.json`
- `corpus.duckdb`
- `tfidf_matrix.joblib` / `tfidf_vectorizer.joblib`
- `errors.jsonl` (debe estar vacío o casi vacío)
- `processing_log.jsonl`

---

## 7. Verificación recomendada tras ejecutar V5.6

1. `errors.jsonl` sin el error de `is_numbered`.
2. Conteo de palabras del informe Paris Peace Forum cercano a ~8 000.
3. Cobertura de chunks ≥ 0.995 en todos los documentos.
4. Títulos sin carácter ▒.
5. Tablas residuales de área < 0.03 rechazadas.
