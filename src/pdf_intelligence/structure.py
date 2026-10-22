"""Document structural decomposition into hierarchical sections and zero-loss semantic chunks."""

import re
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np

from .config import PipelineConfig
from .utils import detect_language, normalize_text, sha256_text, single_line, word_count


class SectionBuilder:
    """Builds hierarchical document sections respecting reading order without dropping any paragraphs."""

    def build(self, document_id: str, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Construct section objects by clustering blocks under detected headings or initial content."""
        sections: List[Dict[str, Any]] = []
        state: Dict[str, Any] = {
            "current": None,
            "counter": 0,
            "last_bottom": None,
            "last_page": None,
        }

        def start(
            title: str,
            page_number: int,
            source: str,
            conf: float = 0.0,
            level: Optional[int] = None,
        ) -> Dict[str, Any]:
            state["counter"] += 1
            return {
                "section_id": f"{document_id}_S{state['counter']:04d}",
                "document_id": document_id,
                "title": title,
                "title_source": source,
                "heading_confidence": conf,
                "heading_level": level,
                "page_start": page_number,
                "page_end": page_number,
                "paragraphs": [],
            }

        def close() -> None:
            cur = state["current"]
            if cur and cur["paragraphs"]:
                sections.append(cur)
            state["current"] = None

        for page in pages:
            pn = page["page_number"]
            blocks = page.get("blocks", []) or []

            # If page was OCR processed or lacks layout blocks, use clean_text directly
            if not blocks or page.get("extraction_source") == "ocr":
                text = page.get("clean_text", "")
                if not text:
                    continue
                if state["current"] is None:
                    state["current"] = start("Contenido inicial", pn, "none")
                state["current"]["paragraphs"].append({
                    "page_number": pn,
                    "text": text,
                    "block_id": None,
                })
                state["current"]["page_end"] = pn
                state["last_bottom"] = None
                continue

            for block in blocks:
                text = normalize_text(block.get("text", ""))
                if not text:
                    continue
                bbox = block.get("bbox") or [0, 0, 0, 0]

                if block.get("is_heading"):
                    title = single_line(text)
                    conf = float(block.get("heading_confidence", 0) or 0)
                    level = block.get("heading_level")
                    cur = state["current"]

                    if cur is not None and not cur["paragraphs"]:
                        # Consecutive headings without body text: merge as multiline or hierarchy path
                        adjacent = (
                            state["last_page"] == pn
                            and state["last_bottom"] is not None
                            and (bbox[1] - state["last_bottom"]) < 24
                        )
                        cur["title"] = (cur["title"] + (" " if adjacent else " › ") + title)[:300]
                        cur["heading_confidence"] = max(cur["heading_confidence"], conf)
                    else:
                        close()
                        state["current"] = start(title[:300], pn, "detected", conf, level)
                    state["last_bottom"], state["last_page"] = bbox[3], pn
                else:
                    if state["current"] is None:
                        state["current"] = start("Contenido inicial", pn, "none")
                    state["current"]["paragraphs"].append({
                        "page_number": pn,
                        "text": text,
                        "block_id": block.get("block_id"),
                    })
                    state["current"]["page_end"] = pn
                    state["last_bottom"] = None

        close()
        for section in sections:
            section["section_title"] = section["title"]
            section["text"] = normalize_text("\n\n".join(p["text"] for p in section["paragraphs"]))
            section["word_count"] = word_count(section["text"])
            section["paragraph_count"] = len(section["paragraphs"])
            section["language"] = detect_language(section["text"])

        return sections


SECTION_BUILDER = SectionBuilder()


def split_long_paragraph(text: str, max_words: int) -> List[str]:
    """Split a paragraph exceeding max_words along sentence boundaries without discarding text."""
    if word_count(text) <= max_words:
        return [text]

    sentences = re.split(r"(?<=[\.\?\!;:])\s+(?=[A-ZÁÉÍÓÚÑ¿¡0-9\"“(])", text)
    parts: List[str] = []
    cur: List[str] = []
    n = 0

    for sentence in sentences:
        w = word_count(sentence)
        if w > max_words:
            if cur:
                parts.append(" ".join(cur))
                cur, n = [], 0
            tokens = sentence.split()
            for i in range(0, len(tokens), max_words):
                parts.append(" ".join(tokens[i : i + max_words]))
            continue

        if cur and n + w > max_words:
            parts.append(" ".join(cur))
            cur, n = [], 0

        cur.append(sentence)
        n += w

    if cur:
        parts.append(" ".join(cur))

    return parts


class ChunkBuilder:
    """Zero-loss chunking with intra-section lexical overlap and exact page bounds attribution."""

    def __init__(self, config: Optional[PipelineConfig] = None):
        self.config = config or PipelineConfig()

    def build(
        self,
        document_id: str,
        filename: str,
        sections: List[Dict[str, Any]],
        tables_by_page: Dict[int, List[str]],
        quality_by_page: Dict[int, float],
        label_by_page: Dict[int, str],
    ) -> List[Dict[str, Any]]:
        """Segment document sections into chunks with precise traceability."""
        chunks: List[Dict[str, Any]] = []
        state = {"n": 0}

        chunk_target_words = self.config.chunk_target_words
        chunk_max_words = self.config.chunk_max_words
        chunk_min_words = self.config.chunk_min_words
        chunk_overlap_words = self.config.chunk_overlap_words

        def pages_info(page_set: Set[int]) -> Tuple[List[str], float]:
            tables = sorted({t for p in page_set for t in tables_by_page.get(p, [])})
            qs = [quality_by_page[p] for p in page_set if p in quality_by_page]
            return tables, round(float(np.mean(qs)) if qs else 0.0, 4)

        def refresh(chunk: Dict[str, Any]) -> None:
            chunk["text"] = normalize_text(chunk["text"])
            chunk["word_count"] = word_count(chunk["text"])
            chunk["text_sha256"] = sha256_text(chunk["text"].lower())
            pages = chunk["_pages"]
            chunk["page_start"], chunk["page_end"] = min(pages), max(pages)
            chunk["page_label_start"] = label_by_page.get(chunk["page_start"], "")
            chunk["page_label_end"] = label_by_page.get(chunk["page_end"], "")
            chunk["related_table_ids"], chunk["quality_score"] = pages_info(pages)

        def emit(
            section: Dict[str, Any],
            items: List[Dict[str, Any]],
            overlap_words: int,
        ) -> Optional[Dict[str, Any]]:
            new_items = [i for i in items if not i.get("overlap")]
            if not new_items:
                return None
            state["n"] += 1
            chunk: Dict[str, Any] = {
                "chunk_id": f"{document_id}_C{state['n']:05d}",
                "document_id": document_id,
                "filename": filename,
                "section_id": section["section_id"],
                "section_title": section["title"],
                "section_title_source": section.get("title_source", "none"),
                "section_title_reliable": bool(
                    section.get("title_source") == "detected"
                    and float(section.get("heading_confidence", 0) or 0) >= 0.6
                ),
                "merged_section_ids": [],
                "merged_section_titles": [],
                "short_section": False,
                "text": "\n\n".join(i["text"] for i in items),
                "overlap_words": overlap_words,
                "unique_words": sum(word_count(i["text"]) for i in new_items if not i.get("is_title")),
                "language": detect_language("\n".join(i["text"] for i in items)),
                "_pages": {i["page"] for i in new_items},
            }
            refresh(chunk)
            chunks.append(chunk)
            return chunk

        def absorb(
            chunk: Dict[str, Any],
            new_items: List[Dict[str, Any]],
            extra_section_id: Optional[str] = None,
            extra_section_title: Optional[str] = None,
        ) -> None:
            chunk["text"] = chunk["text"] + "\n\n" + "\n\n".join(i["text"] for i in new_items)
            chunk["unique_words"] += sum(word_count(i["text"]) for i in new_items if not i.get("is_title"))
            chunk["_pages"] |= {i["page"] for i in new_items}
            if extra_section_id:
                chunk["merged_section_ids"].append(extra_section_id)
            if extra_section_title and extra_section_title not in chunk["merged_section_titles"]:
                chunk["merged_section_titles"].append(extra_section_title)
            refresh(chunk)

        for section in sections:
            paragraphs: List[Dict[str, Any]] = []
            for p in section.get("paragraphs", []):
                text = normalize_text(p.get("text", ""))
                if text:
                    for part in split_long_paragraph(text, chunk_max_words):
                        paragraphs.append({"text": part, "page": p["page_number"]})

            if not paragraphs:
                continue

            section_words = sum(word_count(p["text"]) for p in paragraphs)

            # ---- Short section (< CHUNK_MIN_WORDS): merge with previous chunk, never discard ----
            if section_words < chunk_min_words:
                lead = (
                    [{"text": section["title"], "page": paragraphs[0]["page"], "is_title": True}]
                    if section.get("title_source") == "detected"
                    else []
                )
                items = lead + paragraphs
                add_words = sum(word_count(i["text"]) for i in items)

                if chunks and chunks[-1]["word_count"] + add_words <= chunk_max_words:
                    absorb(
                        chunks[-1],
                        items,
                        extra_section_id=section["section_id"],
                        extra_section_title=section["title"],
                    )
                else:
                    c = emit(section, items, 0)
                    if c is not None:
                        c["short_section"] = True
                continue

            # ---- Standard section ----
            items: List[Dict[str, Any]] = []
            new_count, cur_words = 0, 0

            def flush_and_overlap(next_page: int) -> None:
                nonlocal items, new_count, cur_words
                c = emit(section, items, sum(word_count(i["text"]) for i in items if i.get("overlap")))
                items, new_count, cur_words = [], 0, 0
                if c is not None and chunk_overlap_words:
                    tail = c["text"].split()[-chunk_overlap_words:]
                    if tail:
                        items = [{"text": " ".join(tail), "page": next_page, "overlap": True}]
                        cur_words = len(tail)

            for para in paragraphs:
                w = word_count(para["text"])
                if new_count and cur_words + w > chunk_max_words:
                    flush_and_overlap(para["page"])
                items.append(para)
                new_count += 1
                cur_words += w
                if cur_words >= chunk_target_words:
                    flush_and_overlap(para["page"])

            if new_count:
                tail_words = sum(word_count(i["text"]) for i in items if not i.get("overlap"))
                last = chunks[-1] if chunks else None
                new_only = [i for i in items if not i.get("overlap")]
                if (
                    tail_words < chunk_min_words
                    and last is not None
                    and last["section_id"] == section["section_id"]
                    and last["unique_words"] + tail_words <= chunk_max_words * 1.25
                ):
                    absorb(last, new_only)
                else:
                    emit(section, items, sum(word_count(i["text"]) for i in items if i.get("overlap")))

        for chunk in chunks:
            chunk.pop("_pages", None)

        return chunks


CHUNK_BUILDER = ChunkBuilder()
