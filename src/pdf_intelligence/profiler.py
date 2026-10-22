"""PDF technical profiling, metadata extraction, and pre-classification."""

import os
from pathlib import Path
from typing import Any, Dict, List, Union

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import pymupdf
except ImportError:
    pymupdf = None

from .utils import normalize_text, sha256_file, word_count


class PDFProfiler:
    """Extracts technical file properties and internal PDF metadata."""

    @staticmethod
    def classify(document: Any) -> str:
        """Classify PDF as 'empty', 'digital', 'scanned', or 'hybrid' by sampling up to 7 pages."""
        n_pages = len(document)
        if n_pages == 0:
            return "empty"

        sample = (
            sorted({int(round(i * (n_pages - 1) / 6)) for i in range(7)})
            if n_pages > 7
            else list(range(n_pages))
        )
        with_text = 0
        for idx in sample:
            text = normalize_text(document[idx].get_text("text", sort=True))
            if word_count(text) >= 20:
                with_text += 1

        if with_text == len(sample):
            return "digital"
        if with_text == 0:
            return "scanned"
        return "hybrid"

    def profile(self, pdf_path: Union[str, Path]) -> Dict[str, Any]:
        """Profile PDF file metadata, page count, and encryption status."""
        pdf_path = Path(pdf_path)
        result: Dict[str, Any] = {
            "filename": pdf_path.name,
            "file_size_bytes": os.path.getsize(pdf_path),
            "sha256": sha256_file(pdf_path),
            "title": "",
            "author": "",
            "subject": "",
            "creator": "",
            "producer": "",
            "pdf_creation_date": "",
            "page_count": 0,
            "encrypted": False,
            "profile_type": "unknown",
        }

        if pypdf:
            try:
                reader = pypdf.PdfReader(str(pdf_path))
                result["page_count"] = len(reader.pages)
                result["encrypted"] = bool(reader.is_encrypted)
                metadata = reader.metadata or {}
                mapping = {
                    "title": "/Title",
                    "author": "/Author",
                    "subject": "/Subject",
                    "creator": "/Creator",
                    "producer": "/Producer",
                    "pdf_creation_date": "/CreationDate",
                }
                for target, source in mapping.items():
                    result[target] = str(metadata.get(source, "") or "")
            except Exception as e:
                result["metadata_error"] = str(e)

        if pymupdf:
            try:
                doc = pymupdf.open(str(pdf_path))
                if not result["page_count"]:
                    result["page_count"] = len(doc)
                result["profile_type"] = self.classify(doc)
                doc.close()
            except Exception as e:
                result["profile_error"] = str(e)

        return result
