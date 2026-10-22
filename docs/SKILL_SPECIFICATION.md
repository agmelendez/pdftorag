# Especificación de la Skill de Uso para Agentes LLM: `pdf-intelligence-rag`

Esta especificación detalla el diseño, la estructura y las directrices de la **Skill de Uso** diseñada para que Modelos de Lenguaje Grande (LLMs) y sistemas RAG interactúen con el corpus generado por el **CIOdD-UCR PDF Intelligence Pipeline V5.2**.

El archivo formal de la Skill se encuentra en:
[`skills/pdf-intelligence-rag/SKILL.md`](file:///Users/agustingomez/Downloads/0.%20FROM%20PDF%20to%20RAG/skills/pdf-intelligence-rag/SKILL.md)

---

## 1. ¿Por Qué es Necesaria una Skill de Uso?

Los sistemas RAG tradicionales fallan comúnmente al recuperar información porque tratan todos los fragmentos textuales como equivalentes y carecen de un protocolo de validación metodológica. Una frase coincidente puede provenir de:
- Un encabezado decorativo o cabecera de página.
- Una sección descartada o absorbida.
- Una página escaneada con bajo reconocimiento OCR.
- Una cuadrícula numérica mal clasificada.

La **Skill de Uso** dota al agente de un **marco de decisión epistemológico** que le indica qué fuentes consultar primero, cuándo verificar una cifra contra la página primaria y cómo estructurar una citación bibliográfica inatacable.

---

## 2. Las Tres Leyes Operativas del Agente

1. **Ley de Verificación Primaria**: Ninguna afirmación cuantitativa o estadística debe emitirse basándose únicamente en el campo `text` de un chunk si existe una tabla vinculada (`related_table_ids`) o si la página primaria (`pages.parquet`) puede ser consultada.
2. **Ley de No-Contaminación de Paginación**: Las palabras iniciales repetidas en el solapamiento (`overlap_words`) pertenecen al chunk previo. La referencia de páginas (`page_start` a `page_end`) cubre exclusivamente las palabras propias (`unique_words`).
3. **Ley de Transparencia de Incertidumbre**: Si un dato proviene de una página con `extraction_quality_score < 0.40` o banderas de auditoría (`page_flags` con `ocr_low_confidence`), el agente debe declarar explícitamente el nivel de cautela al usuario.

---

## 3. Matriz de Decisión según la Calidad Técnica de la Página

| Puntuación de Calidad (`quality_score`) | Clasificación | Directriz para el Agente LLM |
|---|---|---|
| **$\ge 0.80$** | Excelente | Alta fidelidad. El contenido puede citarse directamente sin verificación intermedia. |
| **$0.60 - 0.79$** | Buena | Aceptable. Contrastar con el título de la sección y verificar si existen tablas vinculadas. |
| **$0.40 - 0.59$** | Regular | Calidad media. Obligatorio verificar contra `clean_text` en `pages.parquet` antes de responder. |
| **$&lt; 0.40$** | Crítica / Dudosa | Posible ruido OCR o página degradada. El agente **debe incluir una advertencia de incertidumbre**. |

---

## 4. Estándar de Citación Científica Dual

El agente debe emitir citas que combinen la ubicación física en el archivo PDF con la numeración impresa formal del documento original:

```text
Formato Canónico:
[{filename}, Sec. "{section_title}", Pág. PDF {page_start}, Pág. Impresa {page_label_start}]
```

### Ejemplos Válidos:
- *"El 58% de las familias encuestadas cuenta con acceso a internet de banda ancha `[Informe_Desarrollo_Social_2026.pdf, Sec. '4. Brecha Digital Territorial', Pág. PDF 14, Pág. Impresa 8]`."*
- *"La estimación econométrica se realizó mediante mínimos cuadrados ordinarios ponderados `[Metodologia_Estimacion_UCR.pdf, Sec. '2. Modelo Estadístico', Pág. PDF 5, Pág. Impresa iv]`."*

---

## 5. Recetas de Consulta Canónicas en DuckDB para Agentes

El agente autónomo debe consultar `corpus.duckdb` utilizando sentencias SQL optimizadas:

```sql
-- Recuperación contextual con evidencia primaria y tablas
SELECT 
    c.chunk_id,
    c.filename,
    c.section_title,
    c.page_start,
    c.page_label_start,
    c.quality_score,
    c.text,
    t.markdown AS tabla_markdown
FROM chunks c
LEFT JOIN tables t 
    ON c.document_id = t.document_id 
    AND t.page_number BETWEEN c.page_start AND c.page_end
WHERE c.quality_score >= 0.60
  AND (c.text ILIKE '%gobernanza%' OR c.section_title ILIKE '%gobernanza%')
ORDER BY c.quality_score DESC
LIMIT 5;
```
