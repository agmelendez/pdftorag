"""Heading detection by multi-signal scoring and repeated heading demotion."""

import math
import re
from collections import defaultdict
from typing import Any, Dict, List, Optional

from .config import PipelineConfig
from .utils import single_line


class HeadingDetector:
    """Multi-criteria heading detector with strict false-positive disqualifiers."""

    standard = re.compile(
        r"^(resumen( ejecutivo)?|abstract|executive summary|summary|key (messages|findings)|"
        r"introducci[oó]n|introduction|antecedentes|background|marco te[oó]rico|"
        r"metodolog[ií]a|methodology|m[eé]todos?|methods?|resultados|results?|"
        r"discusi[oó]n|discussion|conclusiones|conclusions?|recomendaciones|recommendations|"
        r"referencias|references|bibliograf[ií]a|bibliography|anexos?|annex(es)?|appendix|appendices|"
        r"glosario|glossary|prefacio|preface|foreword|acknowledg(e)?ments?|agradecimientos|"
        r"[ií]ndice|contents|table of contents)$",
        re.I,
    )
    prefixed = re.compile(
        r"^(annex|appendix|chapter|part|section|anexo|ap[eé]ndice|cap[ií]tulo|parte|secci[oó]n)"
        r"\s+[A-Z0-9IVXivx]{1,4}\b",
        re.I,
    )
    numbered = re.compile(
        r"^\s*(?:(\d{1,2}(?:\.\d{1,2}){0,3})[\.\)]?|([IVXLC]{1,6})[\.\)])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])"
    )
    footnote = re.compile(
        r"^\s*\d{1,3}\s*(see|ibid|source|sources|note|available|cf\.|op\.|http|www|v[eé]ase|ver\b|fuente)",
        re.I,
    )
    bullet = re.compile(r"^\s*[•▪■◦●·*\-–—]\s+")
    caption = re.compile(
        r"^\s*(figure|fig\.|table|tabla|figura|cuadro|chart|gr[aá]fico|source|fuente|note|nota)\s*\d",
        re.I,
    )
    bare_int = re.compile(r"^\s*\d{1,3}\s+\S")

    @staticmethod
    def is_bold(span: Dict[str, Any]) -> bool:
        """Check if font description contains bold/black/heavy keywords."""
        font = (span.get("font", "") or "").lower()
        return any(k in font for k in ["bold", "black", "semibold", "demi", "heavy"])

    @staticmethod
    def _main_font_size(spans: List[Dict[str, Any]]) -> float:
        """Find the font size of the span containing the most characters."""
        if not spans:
            return 0.0
        best = max(spans, key=lambda s: len(s.get("text", "") or ""))
        return float(best.get("font_size", 0) or 0.0)

    def detect(
        self,
        block: Dict[str, Any],
        median_font: float,
        page_width: Optional[float] = None,
        page_height: Optional[float] = None,
        page_number: int = 1,
        font_ratio_threshold: float = 1.18,
        min_score: float = 2.0,
    ) -> Dict[str, Any]:
        """Evaluate a text block and determine whether it represents a structural heading."""
        result: Dict[str, Any] = {
            "is_heading": False,
            "heading_confidence": 0.0,
            "heading_level": None,
            "heading_signals": [],
        }

        text = single_line(block.get("text", ""))
        words = text.split()
        n = len(words)

        if not text or n > 20 or len(text) > 200:
            return result

        alnum = [c for c in text if c.isalnum()]
        if len(alnum) < 3:
            return result

        # Disqualify digit-dominated text (e.g. chart axis coordinates)
        if sum(c.isdigit() for c in alnum) / len(alnum) > 0.35:
            return result

        # Disqualify bullets, footnotes, figure captions
        if self.bullet.match(text) or self.footnote.match(text) or self.caption.match(text):
            return result

        # Disqualify unbalanced closing parenthesis (fragmented footnote remnant)
        if text.count(")") > text.count("("):
            return result

        if self.bare_int.match(text) and "," in text:
            return result

        if text[-1] in ",;" or (text[-1] == "." and n > 6):
            return result

        is_standard = bool(self.standard.match(text.strip(" .:-"))) or bool(self.prefixed.match(text))
        is_numbered = bool(self.numbered.match(text)) and n <= 16

        if words[0][:1].islower() and not is_numbered:
            return result

        if len(text) < 5 and not is_standard:
            return result

        spans = block.get("spans", []) or []
        main_size = self._main_font_size(spans)
        ratio = (main_size / median_font) if median_font else 1.0

        if median_font and ratio < 0.92 and not is_standard:
            return result

        # Edge position filter
        bbox = block.get("bbox") or []
        if page_height and len(bbox) == 4 and page_number > 1 and n <= 14 and not is_standard:
            center = (bbox[1] + bbox[3]) / 2.0
            if center < 0.05 * page_height or center > 0.93 * page_height:
                return result

        bold_ratio = (sum(self.is_bold(s) for s in spans) / len(spans)) if spans else 0.0
        is_upper = text.isupper() and 2 <= n <= 14 and len(text) >= 6
        title_case = 2 <= n <= 12 and sum(w[:1].isupper() for w in words) >= max(2, int(n * 0.6))
        lines = len((block.get("text", "") or "").splitlines())

        score, signals = 0.0, []
        if is_standard:
            score += 3.0
            signals.append("standard")
        if is_numbered:
            score += 2.0
            signals.append("numbered")
        if ratio >= 1.30:
            score += 2.5
            signals.append("font>=1.30")
        elif ratio >= font_ratio_threshold:
            score += 1.5
            signals.append(f"font>={font_ratio_threshold}")
        if bold_ratio >= 0.70:
            score += 1.0
            signals.append("bold")
        if is_upper:
            score += 1.0
            signals.append("upper")
        if title_case:
            score += 0.5
            signals.append("title_case")
        if lines and lines <= 2:
            score += 0.3
            signals.append("short_block")
        if text[-1] not in ".:":
            score += 0.3
            signals.append("no_terminal_period")

        if score < min_score:
            return result

        depth = None
        if is_numbered:
            m = self.numbered.match(text)
            if m and m.group(1):
                depth = m.group(1).count(".") + 1
        level = depth or (1 if ratio >= 1.6 else 2 if ratio >= 1.30 else 3)

        result.update({
            "is_heading": True,
            "heading_confidence": round(min(1.0, score / 4.0), 3),
            "heading_level": int(level),
            "heading_signals": signals,
        })
        return result


def demote_repeated_headings(
    pages: List[Dict[str, Any]],
    min_pages: int = 4,
    min_share: float = 0.08,
) -> int:
    """Demote repeated headings (running headers, repeated chapter titles) across pages."""
    n_pages = len(pages)
    if n_pages < 8:
        return 0

    seen = defaultdict(set)
    for page in pages:
        for block in page.get("blocks", []):
            if block.get("is_heading"):
                seen[single_line(block.get("text", "")).lower()].add(page["page_number"])

    threshold = max(min_pages, math.ceil(n_pages * min_share))
    repeated = {k for k, v in seen.items() if len(v) >= threshold}
    demoted = 0

    for page in pages:
        for block in page.get("blocks", []):
            if block.get("is_heading") and single_line(block.get("text", "")).lower() in repeated:
                block["is_heading"] = False
                block["heading_confidence"] = 0.0
                block["heading_demoted"] = "repeated_on_many_pages"
                demoted += 1
        page["heading_count"] = sum(bool(b.get("is_heading")) for b in page.get("blocks", []))

    return demoted


HEADING = HeadingDetector()
