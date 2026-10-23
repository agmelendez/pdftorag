"""Regression and feature validation tests for Pipeline V5.6 enhancements."""

import unittest
from pdf_intelligence.config import PipelineConfig
from pdf_intelligence.utils import clean_title, word_count
from pdf_intelligence.heading import HeadingDetector
from pdf_intelligence.tables import AdaptiveTableExtractor
from pdf_intelligence.structure import ChunkBuilder, SectionBuilder


class TestV56RegressionAndFeatures(unittest.TestCase):

    def setUp(self):
        self.config = PipelineConfig()
        self.heading_detector = HeadingDetector()
        self.table_extractor = AdaptiveTableExtractor()

    def test_clean_title(self):
        raw = "1 ▒ Introducing Safe AI Foundation’s AISM ■"
        cleaned = clean_title(raw)
        self.assertEqual(cleaned, "1 Introducing Safe AI Foundation’s AISM")
        self.assertNotIn("▒", cleaned)
        self.assertNotIn("■", cleaned)

        # Repeated punctuation collapse
        self.assertEqual(clean_title("Sección 1..."), "Sección 1.")

    def test_heading_detector_no_unbound_local_regression(self):
        """Verify the V5.5 bug regression (UnboundLocalError: is_numbered) is completely eliminated."""
        block = {
            "text": "This is a long sentence that should not be a heading. It contains multiple periods.",
            "spans": [{"text": "This is a long sentence", "font_size": 12.0, "font": "Arial"}],
            "bbox": [50.0, 100.0, 500.0, 120.0],
        }
        # In V5.5, this crashed with UnboundLocalError: cannot access local variable 'is_numbered'
        res = self.heading_detector.detect(block, median_font=10.0, page_height=800.0, page_number=2)
        self.assertIsInstance(res, dict)
        self.assertFalse(res["is_heading"])

    def test_heading_detector_max_words_limit(self):
        """Headings longer than 16 words should be disqualified."""
        words_17 = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen"
        block = {
            "text": words_17,
            "spans": [{"text": words_17, "font_size": 16.0, "font": "Arial-Bold"}],
            "bbox": [50.0, 100.0, 500.0, 120.0],
        }
        res = self.heading_detector.detect(block, median_font=10.0, page_height=800.0, page_number=2)
        self.assertFalse(res["is_heading"])

    def test_heading_detector_numbered_with_period_accepted(self):
        """Numbered headings (e.g. '1.1 Background') should not be rejected by sentence filter."""
        block = {
            "text": "1.1 Background and Objectives",
            "spans": [{"text": "1.1 Background and Objectives", "font_size": 14.0, "font": "Arial-Bold"}],
            "bbox": [50.0, 100.0, 400.0, 120.0],
        }
        res = self.heading_detector.detect(block, median_font=10.0, page_height=800.0, page_number=2)
        self.assertTrue(res["is_heading"])
        self.assertIn("numbered", res["heading_signals"])

    def test_table_residual_area_rejection(self):
        """Tables with area < 0.03 should be rejected as residual fragments."""
        matrix = [["Header 1", "Header 2"], ["Val 1", "Val 2"]]
        feats = {
            "filled_ratio": 1.0,
            "fragment_ratio": 0.0,
            "lower_start_ratio": 0.0,
            "avg_words_per_cell": 1.5,
            "page_area_share": 0.015,  # < 0.03
        }
        ok, reason = self.table_extractor.judge("lines", matrix, feats, self.config)
        self.assertFalse(ok)
        self.assertEqual(reason, "área demasiado pequeña (residuo)")

    def test_table_full_page_prose_rejection(self):
        """Full page lines tables with high average words should be rejected as prose."""
        matrix = [["Text paragraph 1", "Text paragraph 2"], ["Text paragraph 3", "Text paragraph 4"]]
        feats = {
            "filled_ratio": 1.0,
            "fragment_ratio": 0.0,
            "lower_start_ratio": 0.1,
            "avg_words_per_cell": 22.0,  # > 15.0
            "page_area_share": 0.90,     # >= 0.85
        }
        ok, reason = self.table_extractor.judge("lines", matrix, feats, self.config)
        self.assertFalse(ok)
        self.assertEqual(reason, "página completa con prosa (falso positivo)")

    def test_chunk_builder_discard_short_residuals(self):
        """Chunks with unique words < 20 should be discarded when multiple chunks exist."""
        cb = ChunkBuilder(self.config)
        sections = [
            {
                "section_id": "doc_S0001",
                "title": "Short Cover",
                "title_source": "detected",
                "heading_confidence": 0.9,
                "paragraphs": [{"page_number": 1, "text": "Report Title Only"}],  # 3 words
            },
            {
                "section_id": "doc_S0002",
                "title": "Full Content Section",
                "title_source": "detected",
                "heading_confidence": 0.9,
                "paragraphs": [
                    {
                        "page_number": 2,
                        "text": " ".join(["palabra"] * 120),  # 120 words
                    }
                ],
            },
        ]
        chunks = cb.build(
            document_id="doc_test",
            filename="test.pdf",
            sections=sections,
            tables_by_page={},
            quality_by_page={1: 1.0, 2: 1.0},
            label_by_page={1: "1", 2: "2"},
        )
        for c in chunks:
            self.assertGreaterEqual(c.get("unique_words", c.get("word_count", 0)), 20)


if __name__ == "__main__":
    unittest.main()
