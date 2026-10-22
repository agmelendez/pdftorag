# Cookbook DuckDB: Consultas SQL para Análisis y RAG

La base relacional `corpus.duckdb` permite realizar consultas analíticas de alto rendimiento directamente sobre los archivos Parquet sin cargar gigabytes de texto en memoria RAM.

---

## 1. Conexión Rápida en Python

```python
import duckdb

con = duckdb.connect("data/pdf_intelligence/corpus.duckdb")
# Ver tablas disponibles
print(con.execute("SHOW TABLES;").fetchall())
```

---

## 2. Recetas de Consulta Esenciales

### Receta 1: Conteo del Volumen Léxico Real por Documento
> **Importante**: Sumar `unique_words` para evitar contar palabras duplicadas en el solapamiento.

```sql
SELECT 
    document_id,
    filename,
    inferred_title,
    page_count,
    total_chunks,
    SUM(unique_words) AS true_word_count,
    ROUND(chunk_coverage * 100, 2) AS coverage_pct
FROM chunks
JOIN documents USING (document_id)
GROUP BY document_id, filename, inferred_title, page_count, total_chunks, chunk_coverage
ORDER BY true_word_count DESC;
```

---

### Receta 2: Recuperación de Chunks de Alta Calidad con Tablas Vinculadas

```sql
SELECT 
    c.chunk_id,
    c.filename,
    c.section_title,
    c.page_start,
    c.page_label_start,
    c.quality_score,
    t.table_id,
    t.caption,
    t.markdown
FROM chunks c
LEFT JOIN tables t 
    ON c.document_id = t.document_id 
    AND t.page_number BETWEEN c.page_start AND c.page_end
WHERE c.quality_score >= 0.85
  AND c.text ILIKE '%inteligencia artificial%'
ORDER BY c.quality_score DESC
LIMIT 10;
```

---

### Receta 3: Auditar Secciones Cortas Absorbidas

```sql
SELECT 
    chunk_id,
    filename,
    section_title AS main_title,
    merged_section_ids,
    merged_section_titles,
    unique_words,
    word_count
FROM chunks
WHERE array_length(merged_section_ids) > 0
LIMIT 20;
```

---

### Receta 4: Identificar Páginas con Advertencias de Extracción para Revisión Humana

```sql
SELECT 
    filename,
    page_number,
    page_label,
    extraction_source,
    ocr_confidence,
    page_flags,
    extraction_quality_score
FROM pages
WHERE array_contains(page_flags, 'ocr_low_confidence')
   OR array_contains(page_flags, 'low_text')
   OR extraction_quality_score < 0.40
ORDER BY extraction_quality_score ASC;
```

---

### Receta 5: Comparativa de Tablas Aceptadas vs. Rechazadas

```sql
SELECT 
    strategy,
    table_confidence,
    COUNT(*) AS total_tables,
    ROUND(AVG(quality_features.filled_ratio), 3) AS avg_filled,
    ROUND(AVG(quality_features.lower_start_ratio), 3) AS avg_lower_start
FROM tables
GROUP BY strategy, table_confidence;
```
