"""Configuration settings and constants for the CIOdD-UCR PDF Intelligence Pipeline."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class PipelineConfig:
    """Centralized configuration for PDF Intelligence Pipeline V5.6."""

    # Versions
    pipeline_version: str = "5.6"
    schema_version: str = "5.6.0"

    # Paths
    pdf_directory: Path = field(default_factory=lambda: Path("./data/pdfs"))
    output_directory: Path = field(default_factory=lambda: Path("./data/pdf_intelligence"))

    # Batch execution
    max_documents: Optional[int] = None  # None processes all documents
    max_pages: Optional[int] = None      # None processes all pages per document
    dry_run: bool = False                # Profile only without writing full corpus

    # OCR Settings
    ocr_enabled: bool = True
    ocr_language: str = "spa+eng"
    ocr_dpi: int = 200
    ocr_min_chars: int = 80
    ocr_min_words: int = 20
    ocr_min_native_quality: float = 0.35

    # Structure & Typography Settings
    heading_font_ratio: float = 1.18        # font size / page median font size
    heading_min_score: float = 2.0          # minimum cumulative score to accept heading
    heading_max_words: int = 16             # stricter heading length limit (V5.5+)
    heading_repeat_min_pages: int = 4       # repeated heading across >= N pages...
    heading_repeat_min_share: float = 0.08  # ...and >= 8% of document is demoted (running header)
    header_footer_threshold: float = 0.35   # page share where edge pattern is treated as header/footer
    header_footer_edge_lines: int = 3       # number of top/bottom edge lines inspected

    # Chunking & Evidence Settings
    chunk_target_words: int = 550           # target word count per chunk
    chunk_max_words: int = 800              # hard maximum word limit per chunk
    chunk_min_words: int = 60               # short section threshold: merged, never discarded
    chunk_overlap_words: int = 80           # intra-section overlap window
    chunk_coverage_min: float = 0.995       # minimum word recovery threshold for integrity audit
    min_chunk_words_discard: int = 20       # discard isolated residual chunks under 20 words (V5.5+)

    # Table Extraction & Filtering Settings
    table_min_area: float = 0.03            # discard residual table fragments < 3% page area (V5.5+)
    table_lines_min_filled: float = 0.25
    table_lines_max_fragment: float = 0.50
    table_lines_max_area: float = 0.85      # reject full-page prose tables (V5.4+)
    table_lines_max_avg_words: float = 15.0 # prose avg words threshold (V5.4+)
    table_text_min_filled: float = 0.50
    table_text_max_fragment: float = 0.20
    table_text_max_lower_start: float = 0.25 # ratio of lowercase cell starts (prose detector)
    table_text_max_rows: int = 25
    table_text_max_cols: int = 8
    table_text_max_area: float = 0.70       # page area fraction; full-page table is prose

    # Indices & Search Settings
    build_tfidf: bool = True
    generate_embeddings: bool = False       # disabled by default for memory efficiency in batch/Colab
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    embedding_batch_size: int = 32

    def ensure_directories(self) -> None:
        """Create output directories if they do not exist."""
        self.output_directory.mkdir(parents=True, exist_ok=True)
