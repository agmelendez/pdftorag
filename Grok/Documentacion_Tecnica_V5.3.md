# Documentación Técnica — CIOdD-UCR PDF Intelligence Pipeline V5.3
## Research & RAG Edition · Optimizado para Google Colab

**Versión:** 5.3.0  
**Fecha:** Octubre 2026  
**Institución:** Centro de Investigación Observatorio del Desarrollo (CIOdD) — Universidad de Costa Rica

---

## 1. Propósito

El pipeline transforma colecciones heterogéneas de PDFs en un corpus estructurado, auditable y de cero pérdida de texto listo para RAG y análisis con LLMs.

**Principios mantenidos de V5.2:**
- Cero pérdida de texto (`chunk_coverage ≥ 0.995`)
- Trazabilidad exacta de páginas (propias vs. solapamiento)
- Control de falsos positivos estructurales
- Auditoría criptográfica e integridad

**Novedades de V5.3:**
- Configuración centralizada (`PipelineConfig`)
- Checkpointing por documento (recuperación ante desconexión de Colab)
- Montaje opcional de Google Drive
- Campo `merged_section_titles` al fusionar secciones cortas
- Mejor manejo de estrategias de tablas (evita cortocircuito prematuro)
- Marcador `blocks_source` en páginas OCR
- Embeddings desactivados por defecto (ahorro de recursos en Colab)
- Logging estructurado

---

## 2. Arquitectura (10 fases + consolidación)

El flujo de 10 fases se mantiene. Los cambios principales están en:

| Fase | Cambio en V5.3 |
|------|----------------|
| 6. Calidad y limpieza de bordes | `infer_repeated_lines` ahora considera `native_text` **o** `ocr_text` |
| 5. Tablas | Se elimina el `break` prematuro; se usa IoU para evitar duplicados entre estrategias |
| 9. Chunks | Se añade `merged_section_titles` cuando se absorbe una sección corta con título detectado |
| 10. Consolidación | Checkpointing + configuración centralizada + logging |

---

## 3. Configuración (`PipelineConfig`)

```python
config = PipelineConfig(
    max_documents=None,           # None = todos
    max_pages_per_doc=None,       # límite por documento
    generate_embeddings=False,    # recomendado en Colab
    use_drive=False,              # True para persistir en Drive
    checkpoint_every=1,
    ocr_enabled=True,
)
```

---

## 4. Cambios en el esquema de datos

### Nuevo campo en `chunks.jsonl`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `merged_section_titles` | list[str] | Títulos de las secciones cortas absorbidas (solo si `title_source == "detected"`) |

### Nuevo campo en `pages.jsonl`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `blocks_source` | string | `"native"` o `"ocr_text_only"` — indica el origen del layout usado |

---

## 5. Uso en Google Colab

1. Ejecutar celda de instalación (una vez por runtime).
2. Subir PDFs a `/content/PDFs` o activar `use_drive=True`.
3. Instanciar `PipelineConfig` y `CorpusBuilder`.
4. Llamar a `builder.process()`.
5. Si Colab se desconecta, volver a ejecutar: el checkpoint evita reprocesar documentos ya terminados.

---

## 6. Hallazgos de V5.2 corregidos en V5.3

| # | Problema (V5.2) | Corrección (V5.3) |
|---|-----------------|-------------------|
| 1 | Limpieza de headers/footers después de headings y débil en OCR | `infer_repeated_lines` usa native **o** ocr text |
| 2 | Asimetría en `chunk_coverage` por títulos de secciones cortas | Se documenta el comportamiento; se añade trazabilidad con `merged_section_titles` |
| 3 | Falta de título de sección absorbida | Campo `merged_section_titles` |
| 4 | Cortocircuito de estrategias de tablas | Se elimina el `break` y se usa IoU |
| 5 | Consumo de memoria en Colab | Embeddings off por defecto + checkpointing |
| 6 | Dependencias no usadas / código duplicado | Limpieza en instalación y reutilización de lógica |

---

## 7. Artefactos generados

Mismos que V5.2, más:
- `checkpoint.json` (progreso incremental)
- Campos nuevos en `chunks` y `pages`

---

## 8. Recomendaciones de uso

- En Colab: dejar `generate_embeddings=False` salvo que se necesiten vectores densos.
- Para corpus grandes: usar `use_drive=True` y `max_pages_per_doc` si es necesario.
- Revisar siempre `integrity_report.json` y las páginas marcadas en `review_pages` antes de citar.

---

**Autoría:** Agustín Gómez — CIOdD-UCR  
**Licencia:** No comercial con atribución obligatoria (ver LICENSE del repositorio)
