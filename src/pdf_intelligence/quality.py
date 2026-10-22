"""Quality assessment and edge-line (header/footer) pattern analysis."""

import math
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Set, Tuple

from .config import PipelineConfig
from .utils import normalize_pattern, normalize_text, single_line, word_count


class QualityAssessor:
    """Calculates granular quality metrics for extracted text, pages, and layout."""

    @staticmethod
    def alphanumeric_ratio(text: Optional[str]) -> float:
        """Ratio of alphanumeric and standard punctuation characters to non-whitespace characters."""
        if not text:
            return 0.0
        chars = [c for c in text if not c.isspace()]
        if not chars:
            return 0.0
        valid = sum(
            c.isalnum() or c in ".,;:!?¿¡()[]{}%$€₡+-/='\""
            for c in chars
        )
        return valid / len(chars)

    @staticmethod
    def replacement_ratio(text: Optional[str]) -> float:
        """Ratio of Unicode replacement characters (\ufffd) indicating encoding corruption."""
        if not text:
            return 0.0
        return text.count("\ufffd") / max(len(text), 1)

    def text_quality(self, text: Optional[str]) -> Dict[str, float]:
        """Evaluate text density, encoding, legibility, and token structure."""
        wc = word_count(text)

        # Density score (log scale up to 350 words)
        density = min(1.0, math.log1p(wc) / math.log1p(350)) if wc else 0.0

        # Encoding score
        encoding = max(0.0, 1.0 - min(1.0, self.replacement_ratio(text) * 50))

        # Legibility score
        ratio = self.alphanumeric_ratio(text)
        legibility = max(0.0, min(1.0, (ratio - 0.40) / 0.45))

        # Token structure (penalize extreme tokens > 40 chars)
        tokens = re.findall(r"\S+", text or "")
        if tokens:
            extreme = sum(len(token) > 40 for token in tokens) / len(tokens)
            token_structure = max(0.0, 1.0 - extreme * 4)
        else:
            token_structure = 0.0

        score = (
            0.35 * density
            + 0.25 * encoding
            + 0.25 * legibility
            + 0.15 * token_structure
        )

        return {
            "density_score": round(density, 4),
            "encoding_score": round(encoding, 4),
            "legibility_score": round(legibility, 4),
            "token_structure_score": round(token_structure, 4),
            "text_quality_score": round(score, 4),
        }

    def page_quality(
        self,
        text_metrics: Dict[str, float],
        source: str,
        ocr_confidence: Optional[float],
        block_count: int,
        table_count: int,
        heading_count: int,
    ) -> Dict[str, float]:
        """Calculate overall quality and component scores for a single document page."""
        text_score = text_metrics["text_quality_score"]
        layout_score = min(1.0, block_count / 8) if block_count else 0.0
        ocr_score = float(ocr_confidence or 0.0) if source == "ocr" else 1.0

        structure_score = 0.50
        if block_count:
            structure_score += 0.25
        if heading_count:
            structure_score += 0.15
        if table_count:
            structure_score += 0.10
        structure_score = min(1.0, structure_score)

        table_score = 1.0 if table_count else 0.70

        total = (
            0.45 * text_score
            + 0.20 * ocr_score
            + 0.15 * layout_score
            + 0.10 * structure_score
            + 0.10 * table_score
        )

        # Extraction quality score: decoupled technical reliability of the text
        extraction_quality = (
            0.50 * text_score
            + 0.30 * ocr_score
            + 0.20 * text_metrics["encoding_score"]
        )

        return {
            "layout_score": round(layout_score, 4),
            "ocr_score": round(ocr_score, 4),
            "structure_score": round(structure_score, 4),
            "table_score": round(table_score, 4),
            "overall_quality_score": round(total, 4),
            "extraction_quality_score": round(extraction_quality, 4),
        }


QUALITY = QualityAssessor()


def infer_repeated_lines(
    pages: List[Dict[str, Any]],
    threshold: float = 0.35,
    edge_lines: int = 3,
) -> Set[str]:
    """Detect recurring running headers/footers with normalized digit patterns ('#' substitutions).

    Supports inspecting native_text or OCR clean_text to prevent missing headers on scanned PDFs.
    """
    if len(pages) < 3:
        return set()

    counter = Counter()
    k = edge_lines
    for page in pages:
        # Check native_text first; if empty or OCR, fallback to clean_text / ocr_text
        raw = page.get("native_text") or page.get("ocr_text") or page.get("clean_text") or ""
        lines = [single_line(x) for x in raw.splitlines() if single_line(x)]
        edge = lines[:k] + lines[-k:]
        for pattern in {normalize_pattern(x) for x in edge if 1 <= len(x) <= 140}:
            counter[pattern] += 1

    minimum = max(3, math.ceil(len(pages) * threshold))
    return {p for p, c in counter.items() if c >= minimum and p.strip()}


def is_repeated_line(line: Optional[str], patterns: Set[str]) -> bool:
    """Check if a line matches any detected header/footer pattern."""
    if not line or not patterns:
        return False
    norm = normalize_pattern(line)
    if norm in patterns:
        return True
    tokens = single_line(line).split()
    return bool(tokens) and all(normalize_pattern(t) in patterns for t in tokens)


def remove_repeated_lines(
    text: Optional[str],
    patterns: Set[str],
    edge_lines: int = 3,
) -> Tuple[str, List[str]]:
    """Remove repeated lines ONLY at the top/bottom edges of the page, recording removed lines."""
    if not patterns or not text:
        return normalize_text(text), []
    lines = text.splitlines()
    k = edge_lines
    keep, removed = [], []
    last = len(lines) - 1
    for i, line in enumerate(lines):
        at_edge = i < k or i > last - k
        if at_edge and single_line(line) and is_repeated_line(line, patterns):
            removed.append(single_line(line))
        else:
            keep.append(line)
    return normalize_text("\n".join(keep)), removed


def clean_blocks(
    blocks: List[Dict[str, Any]],
    patterns: Set[str],
    page_height: Optional[float],
) -> List[Dict[str, Any]]:
    """Prune header/footer lines from layout blocks based on pattern and vertical edge bbox."""
    if not patterns or not blocks:
        return blocks
    cleaned = []
    for block in blocks:
        bbox = block.get("bbox") or []
        in_edge = bool(
            page_height
            and len(bbox) == 4
            and (bbox[3] < 0.12 * page_height or bbox[1] > 0.88 * page_height)
        )
        if in_edge and is_repeated_line(" ".join(block.get("text", "").split()), patterns):
            continue  # full block is header or footer
        if in_edge:
            kept = [ln for ln in block.get("text", "").splitlines() if not is_repeated_line(ln, patterns)]
            if not kept:
                continue
            block = dict(block)
            block["text"] = "\n".join(kept)
        cleaned.append(block)
    return cleaned
