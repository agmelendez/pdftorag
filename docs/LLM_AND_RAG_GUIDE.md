# Guía de Uso del Corpus para LLMs, Agentes RAG y Sistemas de Citación

Este manual establece las directrices operativas que un Modelo de Lenguaje (LLM), agente autónomo o sistema de Generación Aumentada por Recuperación (RAG) debe seguir para consultar, razonar y citar la información extraída por el pipeline CIOdD-UCR PDF Intelligence V5.6.

---

## 1. El Principio Fundamental de Evidencia
> **"El índice ayuda a encontrar evidencia; la evidencia debe validarse contra el contenido estructurado y su trazabilidad documental."**

Un LLM no debe asumir que porque un término coincide en un índice TF-IDF o vectorial, la afirmación es científicamente válida. Debe seguir esta jerarquía de autoridad:

### Jerarquía de Fuentes
1. **Nivel 1 — Evidencia Primaria (`pages.parquet`, `tables.parquet`)**:
   La representación más fiel y granular del documento original. Obligatoria para verificar cifras numéricas, citas directas o tablas complejas.
2. **Nivel 2 — Evidencia Estructurada (`chunks.parquet`, `sections.parquet`)**:
   Unidades semánticas preparadas para RAG. Conservan el contexto discursivo y permiten citar sección y página.
3. **Nivel 3 — Metadatos Documentales (`documents.parquet`)**:
   Identificación del PDF, calidad promedio y tipo de documento.
4. **Nivel 4 — Calidad y Auditoría (`quality_report.json`, `integrity_report.json`)**:
   Indican si una página requiere cautela o inspección visual previa.
5. **Nivel 5 — Índices de Recuperación (`tfidf_*.joblib`, `faiss.index`)**:
   Mecanismos de aceleración; **nunca constituyen evidencia por sí mismos**.

---

## 2. Flujo de Trabajo Obligatorio para un Agente LLM

```text
1. Pregunta del usuario
       ↓
2. Búsqueda de candidatos (TF-IDF / FAISS / DuckDB SQL)
       ↓
3. Filtrado por calidad (quality_score >= 0.40)
       ↓
4. Inyección de tablas asociadas (si related_table_ids no está vacío)
       ↓
5. Ensamblaje del contexto con trazabilidad dual
       ↓
6. Razonamiento y formulación de respuesta
       ↓
7. Citación estricta [Documento, Sección, Pág. PDF, Pág. Impresa]
```

---

## 3. Plantilla Recomendada de Inyección de Evidencia en el Prompt

Al construir la ventana de contexto para el LLM, ensambla cada fragmento recuperado con este formato estandarizado:

```text
[BLOQUE DE EVIDENCIA #{index}]
ID de Fragmento: {chunk_id}
Documento: {filename} ({document_id})
Título de Sección: {section_title} (Confiabilidad del título: {section_title_reliable})
Páginas PDF: {page_start} a {page_end}
Página Impresa: {page_label_start}
Puntuación de Calidad Técnica: {quality_score}

TEXTO DEL FRAGMENTO:
{text}

{SI related_table_ids TIENE ELEMENTOS}:
TABLAS ASOCIADAS A ESTE FRAGMENTO:
{markdown_de_la_tabla}
[FIN DE BLOQUE DE EVIDENCIA #{index}]
```

---

## 4. Reglas de Citación Científica para el LLM

Cuando el LLM responda una pregunta del usuario basada en el corpus, debe aplicar estas reglas sin excepción:

1. **Cita Explícita**: Toda afirmación fáctica relevante debe incluir su cita al final de la oración o párrafo:
   > *"El 68% de los docentes consultados afirma utilizar herramientas basadas en LLMs para la planificación pedagógica `[Informe_IA_Educacion_Ninez_CIOdD_2026.pdf, Sec. '1. Resumen Ejecutivo', Pág. PDF 2, Pág. Impresa ii]`."*
2. **Cita Tabular Específica**: Si una cifra proviene de una tabla, debe citarse el ID de la tabla o su leyenda:
   > *"La región Central Occidental presentó la mayor tasa de adopción docente con un 74.2% `[Tabla 1, Pág. PDF 2, ID: tbl_08f91a2bc41029aa]`."*
3. **Manejo de Secciones Fusionadas**: Si el chunk tiene `merged_section_titles`, el LLM puede atribuir el texto a cualquiera de los títulos listados en dicha lista.
4. **Declaración de Incertidumbre**: Si el chunk proviene de una página con `flags` como `"ocr_low_confidence"` o `quality_score < 0.40`, el LLM debe anteponer una nota de advertencia:
   > *"Nota: la siguiente información fue extraída mediante OCR asistido con calidad media y debe verificarse contra el documento original..."*

---

## 5. Prevención de Alucinaciones en Cifras y Estadísticas

- **Cero Extrapolación de Metadatos**: El campo `year_candidates` representa años mencionados con frecuencia en las portadas, pero **NO prueba la fecha oficial de publicación**. El LLM debe referirse a ellos como "años referenciados en el texto" a menos que la portada lo declare explícitamente.
- **Volumen Léxico Real**: Para responder preguntas como *"¿cuántas palabras tiene este informe?"*, el sistema debe sumar `SUM(unique_words)`, **nunca** `word_count` (ya que este último incluye las palabras de solapamiento duplicadas entre chunks).
