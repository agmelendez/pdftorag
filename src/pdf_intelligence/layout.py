"""Layout extraction, typographic spans, bounding boxes, and images metadata."""

import statistics
from typing import Any, Dict, List

from .utils import single_line


class LayoutExtractor:
    """Extracts structured blocks, typographic spans, and image metadata from a PyMuPDF page."""

    def extract(self, page: Any) -> Dict[str, Any]:
        """Parse page dictionary layout with sort=True and extract spans and median font size."""
        data = page.get_text("dict", sort=True)
        blocks: List[Dict[str, Any]] = []
        images: List[Dict[str, Any]] = []
        font_sizes: List[float] = []

        for block_index, block in enumerate(data.get("blocks", [])):
            block_type = block.get("type", 0)

            # Image block
            if block_type == 1:
                images.append({
                    "block_id": block_index,
                    "bbox": list(block.get("bbox", [])),
                    "width": block.get("width"),
                    "height": block.get("height"),
                })
                continue

            if block_type != 0:
                continue

            spans: List[Dict[str, Any]] = []
            lines_out: List[str] = []

            for line in block.get("lines", []):
                line_parts: List[str] = []
                for span in line.get("spans", []):
                    text = single_line(span.get("text", ""))
                    if not text:
                        continue
                    font_size = float(span.get("size", 0) or 0)
                    font_sizes.append(font_size)
                    spans.append({
                        "text": text,
                        "font": str(span.get("font", "")),
                        "font_size": font_size,
                        "flags": int(span.get("flags", 0) or 0),
                        "bbox": list(span.get("bbox", [])),
                    })
                    line_parts.append(text)

                line_text = single_line(" ".join(line_parts))
                if line_text:
                    lines_out.append(line_text)

            block_text = "\n".join(lines_out).strip()
            if block_text:
                blocks.append({
                    "block_id": block_index,
                    "bbox": list(block.get("bbox", [])),
                    "text": block_text,
                    "spans": spans,
                })

        median_font = statistics.median(font_sizes) if font_sizes else 0.0

        return {
            "blocks": blocks,
            "median_font_size": median_font,
            "images": images,
        }


LAYOUT = LayoutExtractor()
