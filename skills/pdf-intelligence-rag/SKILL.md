---
name: pdf-intelligence-rag
description: Protocolo metodológico y reglas operativas para que modelos de lenguaje (LLMs), agentes autónomos y sistemas RAG consulten, validen, recuperen y citen evidencia del corpus estructurado generado por el CIOdD-UCR PDF Intelligence Pipeline V5.6.
---

# Agent Skill: CIOdD-UCR PDF Intelligence & RAG Retrieval Protocol

Esta habilidad define cómo un modelo de lenguaje (LLM), agente autónomo o sistema de Generación Aumentada por Recuperación (RAG) debe interactuar con el corpus documental generado por el **CIOdD-UCR PDF Intelligence Pipeline V5.6**.

## 1. Principio Rector de Operación
> **"El índice sirve exclusivamente para localizar candidatos; la evidencia debe validarse siempre contra el contenido estructurado y su trazabilidad documental primaria."**

Un agente **nunca** debe emitir una conclusión fáctica basándose únicamente en la coincidencia léxica o vectorial de un fragmento. Debe verificar la cadena de custodia documental y citar la página física e impresa.

---

## 2. Jerarquía de Evidencia y Niveles de Autoridad

Cuando el agente resuelva una consulta basada en el corpus, debe respetar esta jerarquía estricta:

```
[Nivel 1 — Evidencia Primaria]
  ├── pages.parquet / pages.jsonl
  └── tables.parquet / tables.jsonl
        ↓  (Verificación fáctica y numérica obligatoria)
[Nivel 2 — Evidencia Estructurada]
  ├── sections.parquet / sections.jsonl
  └── chunks.parquet / chunks.jsonl
        ↓  (Recuperación de contexto para el prompt)
[Nivel 3 — Metadatos Documentales]
  └── documents.parquet / documents.jsonl
        ↓  (Identificación, calidad promedio, perfil de digitalización)
[Nivel 4 — Calidad y Auditoría]
  ├── quality_report.json
  ├── integrity_report.json
  └── manifest.json
        ↓  (Detección de incertidumbre y revisión humana)
[Nivel 5 — Índices de Aceleración]
  ├── tfidf_vectorizer.joblib / tfidf_matrix.joblib
  ├── corpus.duckdb
  └── embeddings.npy / faiss.index
        (Mecanismos de búsqueda; NUNCA constituyen evidencia por sí mismos)
```

---

## 3. Flujo de Razonamiento del Agente (Pipeline de 7 Pasos)

1. **Interpretación de la Intención**: Determinar si el usuario busca un dato numérico, un marco conceptual, una metodología o una política pública.
2. **Localización de Candidatos**: Ejecutar búsqueda en DuckDB, TF-IDF o FAISS sobre la tabla `chunks`.
3. **Control de Calidad Técnica**:
   - Si `quality_score >= 0.80`: Evidencia técnica de alta fidelidad.
   - Si `0.60 <= quality_score < 0.80`: Calidad aceptable; verificar contra `pages` si el dato es crítico.
   - Si `0.40 <= quality_score < 0.60`: Calidad media; obligatorio contrastar con `clean_text` en `pages.parquet`.
   - Si `quality_score < 0.40`: Evidencia degradada; el agente debe advertir incertidumbre al usuario.
4. **Inspección de Banderas de Auditoría**:
   - Verificar si la página física aparece en `integrity_report.json -> review_pages` o si contiene banderas como `"ocr_low_confidence"`, `"low_text"` o `"empty"`.
5. **Inyección de Tablas Vinculadas**:
   - Si `chunk.related_table_ids` contiene identificadores, consultar `tables.parquet` (o DuckDB) por `table_id` e inyectar la representación `markdown` junto con su `caption`.
6. **Manejo de Secciones Absorbidas**:
   - Si `merged_section_ids` no está vacío, el agente reconoce que el chunk absorbió una sección corta ($< 60$ palabras) para evitar pérdida de texto, y puede atribuir la afirmación a cualquiera de los `merged_section_titles`.
7. **Formulación de Respuesta con Citación Estricta**:
   - Citar obligatoriamente el nombre del archivo, la sección, la página PDF y la etiqueta de página impresa.

---

## 4. Consultas Relacionales Canónicas en DuckDB (`corpus.duckdb`)

El agente debe priorizar consultas SQL directas sobre `corpus.duckdb` para cruces relacionales complejos:

### Consulta A: Búsqueda Semántica con Tablas Vinculadas
```sql
SELECT 
    c.chunk_id,
    c.filename,
    c.section_title,
    c.page_start,
    c.page_label_start,
    c.quality_score,
    c.text,
    t.caption AS table_caption,
    t.markdown AS table_markdown
FROM chunks c
LEFT JOIN tables t 
    ON c.document_id = t.document_id 
    AND t.page_number BETWEEN c.page_start AND c.page_end
WHERE c.quality_score >= 0.60
  AND c.text ILIKE '%termino_clave%'
ORDER BY c.quality_score DESC
LIMIT 5;
```

### Consulta B: Verificación del Volumen Léxico Real (Anti-Duplicados)
```sql
-- REGLA: Sumar unique_words, NUNCA word_count (que incluye el solapamiento de 80 palabras)
SELECT 
    document_id,
    filename,
    inferred_title,
    SUM(unique_words) AS total_real_words,
    ROUND(chunk_coverage * 100, 2) AS coverage_percentage
FROM chunks
JOIN documents USING (document_id)
WHERE document_id = 'doc_<16hex>'
GROUP BY document_id, filename, inferred_title, chunk_coverage;
```

---

## 5. Reglas de Citación Científica Obligatorias

El agente debe estructurar sus respuestas siguiendo este estándar de citación:

### Citación Textual Estándar:
> *"El estudio identificó una correlación significativa entre el uso docente de herramientas generativas y la innovación didáctica `[Informe_IA_Educacion_Ninez_CIOdD_2026.pdf, Sec. '1. Resumen Ejecutivo', Pág. PDF 2, Pág. Impresa ii]`."*

### Citación de Evidencia Tabular:
> *"En la región Central Occidental, el 74.2% del profesorado encuestado reportó utilizar modelos de lenguaje `[Tabla 1: 'Distribución porcentual de uso de herramientas LLM', Pág. PDF 2, ID: tbl_08f91a2bc41029aa]`."*

---

## 6. Anti-Patrones Prohibidos para el Agente

1. ❌ **PROHIBIDO citar páginas basadas en el texto de solapamiento**: Las palabras iniciales repetidas (`overlap_words`) provienen del chunk anterior; la referencia de página (`page_start`/`page_end`) corresponde exclusivamente a `unique_words`.
2. ❌ **PROHIBIDO asumir que `year_candidates` es la fecha de publicación**: Los años inferidos son candidatos estadísticos hallados en las portadas (que pueden referirse a metas como "Visión 2030"). El agente debe indicar: *"año referenciado en el documento"*.
3. ❌ **PROHIBIDO omitir tablas rechazadas**: Si una consulta pregunta por qué una tabla no aparece en el análisis, el agente debe consultar `tables_rejected.jsonl` y reportar el `reject_reason` (ej. *"rejilla clasificada como prosa en dos columnas"*).
4. ❌ **PROHIBIDO interpretar `average_quality` como mérito científico**: Una calidad de 0.98 indica únicamente fidelidad de extracción tipográfica, no validez científica de las conclusiones del autor original.

---

## 7. Licencia de Uso y Atribución de la Skill

Esta especificación de habilidad (*Agent Skill*) está protegida bajo la licencia **[Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)**.

- **Autor:** Agustín Gómez (Centro de Investigación Observatorio del Desarrollo — Universidad de Costa Rica).
- **Uso Autorizado:** Libre integración en agentes de IA académicos, docentes o de investigación pública.
- **Restricción:** Prohibida su comercialización directa como producto cerrado o de pago sin autorización previa. Requiere atribución obligatoria en forks y redistribuciones.
