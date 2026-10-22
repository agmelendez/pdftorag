# Legacy Version 1.0 / 4.0: `pdf_to_rac_json.py`

Esta carpeta preserva la implementación original del proyecto desarrollada hace más de 1 año (Abril 2026), denominada inicialmente *Sistema Integral de Procesamiento PDF → JSON para LLMs*.

## Resumen del Script Original
El archivo [`pdf_to_rac_json.py`](file:///Users/agustingomez/Downloads/0.%20FROM%20PDF%20to%20RAG/legacy/v1_original/pdf_to_rac_json.py) utilizaba una arquitectura monolítica elemental compuesta únicamente por 3 clases:
1. `TextNormalizer`: Normalización básica de saltos de línea múltiples y espacios.
2. `FastPDFExtractor`: Extracción rápida de texto con `pypdf` y `pdfplumber` sin conocimiento de layout, tipografía ni bboxes.
3. `CorpusBuilder`: Generación de 4 archivos JSON básicos (`corpus_final.json`, `corpus_indices_completos.json`, `corpus_calidad_final.json`, `corpus_log_procesamiento.jsonl`).

## Limitaciones Detectadas que Motivaron V5.2
1. **Pérdida Silenciosa de Texto**: Cualquier sección con menos de 60 palabras era eliminada sin fusionar, provocando la pérdida de cientos de notas metodológicas y conclusiones.
2. **Alucinación de Tablas Falsas**: Casi cualquier texto justificado o rejilla sin líneas era clasificado como tabla, generando cientos de "tablas" que en realidad eran prosa cortada.
3. **Pérdida de Trazabilidad**: No se separaban las palabras propias del solapamiento (`overlap`), contaminando las citas de páginas hacia párrafos posteriores.
4. **Falsos Encabezados**: Se confundían cabeceras corridas, números de gráficos y notas al pie con secciones del documento.
5. **Sin Auditoría Criptográfica**: No existía verificación de SHA-256 ni matriz de integridad relacional.

Para ver la comparativa técnica completa y la evolución arquitectónica, consulta [`docs/EVOLUTION_V1_TO_V5.md`](file:///Users/agustingomez/Downloads/0.%20FROM%20PDF%20to%20RAG/docs/EVOLUTION_V1_TO_V5.md).
