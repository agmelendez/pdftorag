"""Unit tests for the CIOdD-UCR PDF Intelligence Pipeline modules."""

import unittest
from pdf_intelligence.utils import (
    normalize_text,
    word_count,
    stable_id,
    normalize_pattern,
)
from pdf_intelligence.quality import QualityAssessor, is_repeated_line, remove_repeated_lines
from pdf_intelligence.structure import split_long_paragraph
from pdf_intelligence.tables import bbox_iou


class TestPDFIntelligencePipeline(unittest.TestCase):

    def test_text_normalization(self):
        raw = "  Este  es   un   texto   con\n\n\n\nmúltiples   saltos   "
        clean = normalize_text(raw)
        self.assertEqual(clean, "Este es un texto con\nmúltiples saltos")
        self.assertEqual(word_count(clean), 7)

    def test_stable_id(self):
        id1 = stable_id("doc", "content_hash_12345")
        id2 = stable_id("doc", "content_hash_12345")
        id3 = stable_id("doc", "different_content")
        self.assertEqual(id1, id2)
        self.assertNotEqual(id1, id3)
        self.assertTrue(id1.startswith("doc_"))
        self.assertEqual(len(id1), 20)  # doc_ + 16 hex chars

    def test_quality_assessor_metrics(self):
        qa = QualityAssessor()
        text = "El Observatorio del Desarrollo de la Universidad de Costa Rica presenta este informe técnico."
        metrics = qa.text_quality(text)
        self.assertIn("density_score", metrics)
        self.assertIn("encoding_score", metrics)
        self.assertIn("legibility_score", metrics)
        self.assertIn("token_structure_score", metrics)
        self.assertIn("text_quality_score", metrics)
        self.assertTrue(0.0 <= metrics["text_quality_score"] <= 1.0)

    def test_repeated_lines_removal(self):
        patterns = {normalize_pattern("Informe Anual 2026 - Página #")}
        text = "Informe Anual 2026 - Página 12\nPrimer párrafo de contenido legítimo.\nSegundo párrafo de análisis."
        cleaned, removed = remove_repeated_lines(text, patterns, edge_lines=1)
        self.assertNotIn("Informe Anual", cleaned)
        self.assertEqual(len(removed), 1)
        self.assertIn("Primer párrafo", cleaned)

    def test_split_long_paragraph(self):
        para = "Esta es la primera oración. Esta es la segunda oración. Esta es la tercera oración."
        parts = split_long_paragraph(para, max_words=6)
        self.assertGreaterEqual(len(parts), 2)
        rejoined = " ".join(parts)
        self.assertIn("primera oración", rejoined)
        self.assertIn("tercera oración", rejoined)

    def test_bbox_iou(self):
        box1 = [10.0, 10.0, 50.0, 50.0]
        box2 = [10.0, 10.0, 50.0, 50.0]
        box3 = [100.0, 100.0, 150.0, 150.0]
        self.assertAlmostEqual(bbox_iou(box1, box2), 1.0)
        self.assertEqual(bbox_iou(box1, box3), 0.0)


if __name__ == "__main__":
    unittest.main()

