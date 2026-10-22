"""Adaptive OCR extraction with dual triggers, Tesseract OCR integration, and confidence scoring."""

import io
from typing import Any, Dict, Optional

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import pymupdf
except ImportError:
    pymupdf = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

from .utils import normalize_text, single_line, word_count


class OCRExtractor:
    """Adaptive OCR extractor executed when native text quality or volume falls below thresholds."""

    def __init__(
        self,
        language: str = "spa+eng",
        dpi: int = 200,
        min_chars: int = 80,
        min_words: int = 20,
        min_native_quality: float = 0.35,
    ):
        self.language = language
        self.dpi = dpi
        self.min_chars = min_chars
        self.min_words = min_words
        self.min_native_quality = min_native_quality

    def needs_ocr(self, text: Optional[str], quality: float) -> bool:
        """Evaluate if the page should trigger OCR based on length, word count, or quality."""
        clean = (text or "").strip()
        return (
            len(clean) < self.min_chars
            or word_count(clean) < self.min_words
            or quality < self.min_native_quality
        )

    def extract(self, page: Any) -> Dict[str, Any]:
        """Render page at specified DPI and extract text and confidence using Tesseract."""
        if not pymupdf or not pytesseract or not Image or not pd:
            return {"text": "", "confidence": 0.0, "error": "Dependencies missing"}

        zoom = self.dpi / 72.0
        pixmap = page.get_pixmap(
            matrix=pymupdf.Matrix(zoom, zoom),
            alpha=False,
        )
        image = Image.open(io.BytesIO(pixmap.tobytes("png")))

        try:
            dataframe = pytesseract.image_to_data(
                image,
                lang=self.language,
                output_type=pytesseract.Output.DATAFRAME,
            )
        except Exception:
            try:
                dataframe = pytesseract.image_to_data(
                    image,
                    lang="eng",
                    output_type=pytesseract.Output.DATAFRAME,
                )
            except Exception as e:
                return {"text": "", "confidence": 0.0, "error": str(e)}

        dataframe = dataframe[dataframe["text"].notna()].copy()
        dataframe["text"] = dataframe["text"].astype(str).map(single_line)
        dataframe = dataframe[dataframe["text"] != ""]

        if dataframe.empty:
            return {"text": "", "confidence": 0.0}

        confidence = pd.to_numeric(dataframe["conf"], errors="coerce")
        valid_confidence = confidence[confidence >= 0]

        grouping = ["block_num", "par_num", "line_num"]
        lines = (
            dataframe.groupby(grouping, sort=False)["text"]
            .apply(lambda series: " ".join(series))
            .tolist()
        )

        text = normalize_text("\n".join(lines))
        mean_confidence = (
            float(valid_confidence.mean()) / 100.0 if len(valid_confidence) else 0.0
        )

        return {
            "text": text,
            "confidence": round(mean_confidence, 4),
        }


OCR = OCRExtractor()
