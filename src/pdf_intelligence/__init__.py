"""CIOdD-UCR PDF Intelligence Pipeline V5.6 (Research & RAG Edition).

A robust, zero-loss, auditable document processing pipeline transforming heterogeneous
PDFs into structured JSONL, Parquet, DuckDB, and vector search indices for LLMs.
"""

from .config import PipelineConfig
from .corpus import CorpusBuilder, DATA_DICTIONARY
from .document import DocumentExtractor, infer_document_metadata
from .heading import HeadingDetector, demote_repeated_headings
from .layout import LayoutExtractor
from .ocr import OCRExtractor
from .profiler import PDFProfiler
from .quality import QualityAssessor, infer_repeated_lines, remove_repeated_lines
from .search import LocalSearch
from .structure import ChunkBuilder, SectionBuilder
from .tables import AdaptiveTableExtractor
from .utils import clean_title

__version__ = "5.6.0"
__author__ = "Centro de Investigación Observatorio del Desarrollo (CIOdD) — UCR"
__all__ = [
    "PipelineConfig",
    "PDFProfiler",
    "LayoutExtractor",
    "HeadingDetector",
    "OCRExtractor",
    "AdaptiveTableExtractor",
    "QualityAssessor",
    "SectionBuilder",
    "ChunkBuilder",
    "DocumentExtractor",
    "CorpusBuilder",
    "LocalSearch",
    "DATA_DICTIONARY",
    "clean_title",
    "demote_repeated_headings",
    "infer_repeated_lines",
    "remove_repeated_lines",
    "infer_document_metadata",
]
