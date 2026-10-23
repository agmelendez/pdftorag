"""Text processing, cryptographic hashing, and serialization utilities."""

import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Union

try:
    from langdetect import detect
except Exception:
    detect = lambda x: "unknown"

try:
    import pytesseract
except Exception:
    pytesseract = None


def utc_now() -> str:
    """Return current ISO 8601 UTC timestamp."""
    return datetime.now(timezone.utc).isoformat()


def normalize_unicode(text: Optional[str]) -> str:
    """Normalize text with NFKC, remove soft hyphens and normalize non-breaking spaces."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\u00ad", "")  # soft hyphen
    text = text.replace("\xa0", " ")    # non-breaking space
    return text


def normalize_text(text: Optional[str]) -> str:
    """Full text normalization: collapse multiple spaces and empty lines."""
    if not text:
        return ""
    text = normalize_unicode(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines).strip()


def single_line(text: Optional[str]) -> str:
    """Collapse all whitespace sequences in a string into a single space."""
    return re.sub(r"\s+", " ", normalize_unicode(text or "")).strip()


def clean_title(text: Optional[str]) -> str:
    """Remove control characters, box drawing, and decorative symbols from titles (V5.5+)."""
    if not text:
        return ""
    text = normalize_unicode(text)
    # Remove box-drawing, bullet, and decorative characters
    text = re.sub(r"[▒■□▪▫●○◆◇★☆►▶◀◄→←↑↓·\x00-\x1f\x7f]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Collapse repeated punctuation
    text = re.sub(r"([.:;])\1+", r"\1", text)
    return text


def word_count(text: Optional[str]) -> int:
    """Count words supporting Latin and accented Unicode characters."""
    return len(re.findall(r"\b[\wÀ-ÿ]+\b", text or "", flags=re.UNICODE))


def sha256_file(path: Union[str, Path]) -> str:
    """Calculate the cryptographic SHA-256 checksum of a file in 1MB chunks."""
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            sha.update(chunk)
    return sha.hexdigest()


def sha256_text(text: Optional[str]) -> str:
    """Calculate SHA-256 hexadecimal hash of lowercase UTF-8 text."""
    return hashlib.sha256((text or "").encode("utf-8", errors="ignore")).hexdigest()


def stable_id(prefix: str, value: str) -> str:
    """Generate a deterministic 16-character hexadecimal identifier."""
    digest = hashlib.sha256(value.encode("utf-8", errors="ignore")).hexdigest()[:16]
    return f"{prefix}_{digest}"


def detect_language(text: Optional[str]) -> str:
    """Detect language ISO code (e.g. 'es', 'en') or 'unknown' for short/empty texts."""
    text = (text or "").strip()
    if len(text) < 80:
        return "unknown"
    try:
        return detect(text[:5000])
    except Exception:
        return "unknown"


def write_json(path: Union[str, Path], data: Any) -> None:
    """Write Python data structure as formatted UTF-8 JSON."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def write_jsonl(path: Union[str, Path], rows: Iterable[Dict[str, Any]]) -> None:
    """Write an iterable of dictionaries as JSON Lines (.jsonl)."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, default=str) + "\n")


def flatten_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize nested dicts, lists and tuples to JSON strings for Parquet compatibility."""
    result = {}
    for key, value in row.items():
        if isinstance(value, (dict, list, tuple)):
            result[key] = json.dumps(value, ensure_ascii=False, default=str)
        else:
            result[key] = value
    return result


def normalize_pattern(line: Optional[str]) -> str:
    """Normalize line for edge pattern detection: convert to lowercase and replace digits with '#'."""
    return re.sub(r"\d+", "#", single_line(line).lower())


def library_versions() -> Dict[str, Optional[str]]:
    """Inspect and return runtime versions of dependencies and Tesseract engine."""
    from importlib import metadata
    out: Dict[str, Optional[str]] = {"python": sys.version.split()[0]}
    for dist in [
        "pymupdf", "pdfplumber", "pypdf", "pandas", "numpy", "pyarrow",
        "duckdb", "pytesseract", "langdetect", "scikit-learn",
        "sentence-transformers", "faiss-cpu", "pillow"
    ]:
        try:
            out[dist] = metadata.version(dist)
        except Exception:
            out[dist] = None
    if pytesseract:
        try:
            out["tesseract"] = str(pytesseract.get_tesseract_version())
        except Exception:
            out["tesseract"] = None
    else:
        out["tesseract"] = None
    return out
