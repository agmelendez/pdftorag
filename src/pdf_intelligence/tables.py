"""Adaptive table extraction, multi-criteria validation, and rejected table auditing."""

import hashlib
import json
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from .config import PipelineConfig
from .utils import single_line, stable_id


def bbox_iou(box1: List[float], box2: List[float]) -> float:
    """Calculate Intersection over Union (IoU) between two bounding boxes [x0, y0, x1, y1]."""
    if not box1 or not box2 or len(box1) != 4 or len(box2) != 4:
        return 0.0
    x_left = max(box1[0], box2[0])
    y_top = max(box1[1], box2[1])
    x_right = min(box1[2], box2[2])
    y_bottom = min(box1[3], box2[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = box1_area + box2_area - intersection_area

    return intersection_area / union_area if union_area > 0 else 0.0


class AdaptiveTableExtractor:
    """Extracts tables with pdfplumber using dual strategies and rigorous heuristics to avoid false positives."""

    strategies = [
        (
            "lines",
            {
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 3,
                "join_tolerance": 3,
                "intersection_tolerance": 3,
            },
        ),
        (
            "text",
            {
                "vertical_strategy": "text",
                "horizontal_strategy": "text",
                "min_words_vertical": 3,
                "min_words_horizontal": 1,
                "text_x_tolerance": 3,
                "text_y_tolerance": 3,
            },
        ),
    ]

    caption_re = re.compile(
        r"^(table|tabla|cuadro|figure|figura|chart|gr[aá]fico|annex|anexo)\s*[\dA-Z]",
        re.I,
    )

    @staticmethod
    def clean_matrix(table: Any) -> List[List[str]]:
        """Normalize table matrix rows and strip None values."""
        out = []
        for row in table or []:
            clean = [single_line("" if c is None else str(c)) for c in row]
            if any(clean):
                out.append(clean)
        return out

    @staticmethod
    def features(
        matrix: List[List[str]],
        bbox: List[float],
        page_area: float,
    ) -> Dict[str, float]:
        """Compute density, fragmentation, and layout features of candidate table grid."""
        cells = [c for r in matrix for c in r]
        filled = [c for c in cells if c.strip()]
        nf = max(1, len(filled))
        area = 0.0
        if bbox and len(bbox) == 4 and page_area:
            area = max(0.0, (bbox[2] - bbox[0])) * max(0.0, (bbox[3] - bbox[1])) / page_area

        return {
            "filled_ratio": round(len(filled) / max(1, len(cells)), 3),
            "fragment_ratio": round(sum(len(c.strip()) <= 2 for c in filled) / nf, 3),
            "lower_start_ratio": round(sum(c.strip()[:1].islower() for c in filled) / nf, 3),
            "avg_words_per_cell": round(sum(len(c.split()) for c in filled) / nf, 2),
            "page_area_share": round(area, 3),
        }

    def judge(
        self,
        strategy: str,
        matrix: List[List[str]],
        feats: Dict[str, float],
        cfg: Optional[PipelineConfig] = None,
    ) -> Tuple[bool, str]:
        """Classify if the table grid is genuine or fragmented prose."""
        lines_min_filled = cfg.table_lines_min_filled if cfg else 0.25
        lines_max_fragment = cfg.table_lines_max_fragment if cfg else 0.50
        text_min_filled = cfg.table_text_min_filled if cfg else 0.50
        text_max_fragment = cfg.table_text_max_fragment if cfg else 0.20
        text_max_lower_start = cfg.table_text_max_lower_start if cfg else 0.25
        text_max_rows = cfg.table_text_max_rows if cfg else 25
        text_max_cols = cfg.table_text_max_cols if cfg else 8
        text_max_area = cfg.table_text_max_area if cfg else 0.70

        rows, cols = len(matrix), max(len(r) for r in matrix)
        if rows < 2 or cols < 2:
            return False, "menos de 2 filas o 2 columnas"

        # Discard tiny residual fragments (V5.5+)
        min_area = getattr(cfg, "table_min_area", 0.03) if cfg else 0.03
        if feats.get("page_area_share", 1.0) < min_area:
            return False, "área demasiado pequeña (residuo)"

        if strategy == "lines":
            lines_max_area = getattr(cfg, "table_lines_max_area", 0.85) if cfg else 0.85
            lines_max_avg_words = getattr(cfg, "table_lines_max_avg_words", 15.0) if cfg else 15.0
            if feats["page_area_share"] >= lines_max_area and feats["avg_words_per_cell"] > lines_max_avg_words:
                return False, "página completa con prosa (falso positivo)"
            if feats["filled_ratio"] < lines_min_filled:
                return False, "celdas mayormente vacías"
            if feats["fragment_ratio"] >= lines_max_fragment:
                return False, "celdas fragmentadas (<=2 caracteres)"
            if feats["lower_start_ratio"] >= 0.5:
                return False, "celdas inician en minúscula (fragmento de texto, no tabla)"
            return True, "ok"

        # Strategy 'text'
        if rows > text_max_rows or cols > text_max_cols:
            return False, "rejilla de texto demasiado grande (prosa en columnas)"
        if feats["lower_start_ratio"] >= text_max_lower_start:
            return False, "celdas inician en minúscula (prosa fragmentada)"
        if feats["fragment_ratio"] >= text_max_fragment:
            return False, "celdas fragmentadas (<=2 caracteres)"
        if feats["filled_ratio"] < text_min_filled:
            return False, "celdas mayormente vacías"
        if feats["page_area_share"] >= text_max_area:
            return False, "ocupa casi toda la página (prosa)"
        return True, "ok"

    @staticmethod
    def to_markdown(matrix: List[List[str]], max_rows: int = 40) -> str:
        """Render matrix as Markdown table representation for LLM prompt injection."""
        def esc(c: str) -> str:
            return (c or "").replace("|", "\\|").replace("\n", " ")

        if not matrix:
            return ""

        width = max(len(r) for r in matrix)
        rows = [r + [""] * (width - len(r)) for r in matrix[:max_rows]]
        lines = [
            "| " + " | ".join(esc(c) for c in rows[0]) + " |",
            "|" + "|".join(["---"] * width) + "|",
        ]
        lines += ["| " + " | ".join(esc(c) for c in r) + " |" for r in rows[1:]]
        if len(matrix) > max_rows:
            lines.append(f"| … ({len(matrix) - max_rows} filas más) |" + " |" * (width - 1))
        return "\n".join(lines)

    def find_caption(self, page: Any, bbox: List[float]) -> str:
        """Scan a 45pt strip above the table bbox for caption labels (Table/Tabla/Cuadro...)."""
        try:
            y0 = max(0.0, bbox[1] - 45.0)
            if bbox[1] - y0 < 8:
                return ""
            text = page.crop((0, y0, page.width, bbox[1])).extract_text() or ""
            for line in reversed([single_line(x) for x in text.splitlines() if single_line(x)]):
                if self.caption_re.match(line):
                    return line[:300]
        except Exception:
            pass
        return ""

    def extract(
        self,
        page: Any,
        document_id: str,
        page_number: int,
        config: Optional[PipelineConfig] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Extract and classify tables from a pdfplumber page using lines and text strategies."""
        accepted: List[Dict[str, Any]] = []
        rejected: List[Dict[str, Any]] = []
        seen: Set[str] = set()
        accepted_bboxes: List[List[float]] = []

        try:
            page_area = float(page.width) * float(page.height)
        except Exception:
            page_area = 0.0

        for strategy_name, settings in self.strategies:
            try:
                found = page.find_tables(table_settings=settings)
            except Exception:
                found = []

            for table_object in found:
                try:
                    matrix = self.clean_matrix(table_object.extract())
                except Exception:
                    continue

                if not matrix:
                    continue

                try:
                    bbox = [round(float(v), 2) for v in table_object.bbox]
                except Exception:
                    bbox = []

                # If text strategy, discard if high IoU with an already accepted lines table
                if strategy_name == "text" and any(bbox_iou(bbox, b) > 0.4 for b in accepted_bboxes):
                    continue

                fingerprint = hashlib.sha256(
                    json.dumps(matrix, ensure_ascii=False).encode("utf-8")
                ).hexdigest()
                if fingerprint in seen:
                    continue
                seen.add(fingerprint)

                n_cols = max(len(r) for r in matrix)
                matrix = [r + [""] * (n_cols - len(r)) for r in matrix]

                feats = self.features(matrix, bbox, page_area)
                ok, reason = self.judge(strategy_name, matrix, feats, config)

                headers_raw = matrix[0]
                counter: Dict[str, int] = {}
                headers = []
                for i, h in enumerate(headers_raw):
                    base = h if h else f"column_{i + 1}"
                    counter[base] = counter.get(base, 0) + 1
                    headers.append(base if counter[base] == 1 else f"{base}_{counter[base]}")

                record: Dict[str, Any] = {
                    "table_id": stable_id(
                        "tbl",
                        f"{document_id}|{page_number}|{strategy_name}|{bbox}|{matrix[:3]}",
                    ),
                    "document_id": document_id,
                    "page_number": page_number,
                    "strategy": strategy_name,
                    "bbox": bbox,
                    "rows": len(matrix) - 1,
                    "columns": n_cols,
                    "table_confidence": (
                        "high"
                        if strategy_name == "lines" and feats["filled_ratio"] >= 0.5
                        else "medium"
                        if ok
                        else "low"
                    ),
                    "quality_features": feats,
                    "caption": self.find_caption(page, bbox) if bbox else "",
                    "headers": headers,
                    "records": [dict(zip(headers, r)) for r in matrix[1:]],
                    "matrix": matrix,
                }

                if ok:
                    record["markdown"] = self.to_markdown(matrix)
                    accepted.append(record)
                    if bbox:
                        accepted_bboxes.append(bbox)
                else:
                    record["reject_reason"] = reason
                    record.pop("records", None)
                    rejected.append(record)

        return {"accepted": accepted, "rejected": rejected}


TABLE_EXTRACTOR = AdaptiveTableExtractor()
