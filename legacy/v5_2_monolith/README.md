> **AVISO**: Este archivo es una versión monolítica histórica (octubre 2026, V5.2).  
> La fuente de verdad actual es el paquete modular en `src/pdf_intelligence/` (V5.6).  
> No se recomienda modificar este monolito.

# Legacy Monolithic Notebook Script: `ciodd_ucr_pdf_intelligence_pipeline_v5_2.py`

Esta carpeta contiene el archivo monolítico exportado directamente del notebook de Google Colab al 21 de octubre de 2026:
[`ciodd_ucr_pdf_intelligence_pipeline_v5_2.py`](file:///Users/agustingomez/Downloads/0.%20FROM%20PDF%20to%20RAG/legacy/v5_2_monolith/ciodd_ucr_pdf_intelligence_pipeline_v5_2.py).

## Características del Monolito (2,773 líneas)
- Contiene todas las celdas preparadas para ejecución continua en Google Colab con `!pip install` y comandos de shell.
- Implementa las 10 clases de procesamiento secuencial (`PDFProfiler`, `LayoutExtractor`, `HeadingDetector`, `OCRExtractor`, `AdaptiveTableExtractor`, `QualityAssessor`, `SectionBuilder`, `ChunkBuilder`, `DocumentExtractor`, `CorpusBuilder`).
- Incluye la exportación final a `.parquet`, `.jsonl`, `.duckdb`, `.joblib` y compresión en `.zip`.

## Estado en el Repositorio Moderno
Para desarrollo en producción, pruebas unitarias y empaquetado, este código monolítico ha sido completamente refactorizado en módulos limpios y tipados dentro del paquete `src/pdf_intelligence/`.

Ambas versiones son 100% compatibles a nivel de esquemas de datos JSONL y Parquet.
