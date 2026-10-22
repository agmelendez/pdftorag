"""Local search engine combining TF-IDF lexical matching and dense vector similarity."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import joblib
except ImportError:
    joblib = None

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None

from .config import PipelineConfig


class LocalSearch:
    """High-speed local search using pre-calculated TF-IDF or FAISS indices without cloud APIs."""

    def __init__(self, output_dir: Union[str, Path]):
        self.output_dir = Path(output_dir)
        self.chunks_df: Optional[Any] = None
        self.vectorizer: Optional[Any] = None
        self.tfidf_matrix: Optional[Any] = None

    def load_tfidf(self) -> bool:
        """Load chunks and TF-IDF matrices from output directory."""
        if not pd or not joblib:
            return False

        chunks_path = self.output_dir / "chunks.parquet"
        vec_path = self.output_dir / "tfidf_vectorizer.joblib"
        mat_path = self.output_dir / "tfidf_matrix.joblib"

        if not (chunks_path.exists() and vec_path.exists() and mat_path.exists()):
            return False

        self.chunks_df = pd.read_parquet(chunks_path)
        self.vectorizer = joblib.load(vec_path)
        self.tfidf_matrix = joblib.load(mat_path)
        return True

    def search_tfidf(
        self,
        query: str,
        top_k: int = 10,
        min_quality: Optional[float] = None,
        filename: Optional[str] = None,
        section: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Perform lexical cosine similarity search over chunks."""
        if self.chunks_df is None or self.vectorizer is None or self.tfidf_matrix is None:
            if not self.load_tfidf():
                raise RuntimeError("TF-IDF indices not found in directory.")

        if not cosine_similarity:
            raise RuntimeError("scikit-learn not available.")

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        df = self.chunks_df.copy()
        df["search_score"] = scores

        if min_quality is not None:
            quality = pd.to_numeric(df["quality_score"], errors="coerce").fillna(0.0)
            df = df[quality >= min_quality]

        if filename:
            df = df[df["filename"].fillna("").str.contains(filename, case=False, regex=False)]

        if section:
            df = df[df["section_title"].fillna("").str.contains(section, case=False, regex=False)]

        df = df.sort_values("search_score", ascending=False).head(top_k)

        cols = [
            "chunk_id",
            "document_id",
            "filename",
            "section_title",
            "page_start",
            "page_end",
            "page_label_start",
            "page_label_end",
            "quality_score",
            "search_score",
            "text",
            "related_table_ids",
        ]
        available_cols = [c for c in cols if c in df.columns]
        return df[available_cols].to_dict(orient="records")
