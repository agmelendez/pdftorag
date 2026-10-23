/**
 * CIOdD-UCR PDF Intelligence Pipeline V5.6
 * Manual Técnico de Alto Nivel y Portal Metodológico Interactivo
 * 
 * Nota: Los datos de muestra están embebidos directamente para garantizar funcionamiento
 * 100% offline y compatible con el protocolo file:/// sin bloqueos de CORS.
 */

// Corpus de Demostración Embebido Directamente (Zero CORS Dependencies)
const SAMPLE_CORPUS = {
  "summary": {
    "pipeline_version": "5.6",
    "schema_version": "5.6.0",
    "total_documents": 4,
    "total_pages": 257,
    "total_words": 85378,
    "total_sections": 102,
    "total_chunks": 200,
    "total_tables": 2,
    "total_tables_rejected": 266,
    "average_quality": 0.948,
    "integrity_status": "PASS"
  },
  "documents": [
    {
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "sha256": "f6b1a8c086f568816725974dfe88bce7839fc6898cca62c6132eae5c8a20c94f",
      "inferred_title": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) ",
      "title_source": "filename",
      "year_candidates": [
        "2026"
      ],
      "document_language": "en",
      "profile_type": "digital",
      "profile_type_observed": "digital",
      "page_count": 22,
      "extracted_pages": 22,
      "total_words": 5693,
      "total_tables": 0,
      "tables_rejected": 21,
      "total_sections": 9,
      "total_chunks": 18,
      "ocr_pages": 0,
      "chunk_coverage": 1.0,
      "average_quality": 0.962
    },
    {
      "document_id": "doc_8eb0dff067e7b615",
      "filename": "Anthropic 2026  Public Benefit Report Taking stock of our progress  toward our charter.pdf",
      "sha256": "1b3f5b38489a2f4245a584b62f3be8b05c04545acda0e23a87f73c611ac1ab8c",
      "inferred_title": "Anthropic 2026  Public Benefit Report Taking stock of our progress  toward our charter",
      "title_source": "filename",
      "year_candidates": [
        "2026"
      ],
      "document_language": "en",
      "profile_type": "digital",
      "profile_type_observed": "digital",
      "page_count": 20,
      "extracted_pages": 20,
      "total_words": 6750,
      "total_tables": 0,
      "tables_rejected": 20,
      "total_sections": 12,
      "total_chunks": 16,
      "ocr_pages": 0,
      "chunk_coverage": 1.0,
      "average_quality": 0.954
    },
    {
      "document_id": "doc_dab7ef33ba3406ff",
      "filename": "La era de la IA y nuestro futuro.pdf",
      "sha256": "630e163c7dfa65ae8b22e7b0a99e28d41ba143ce4c90b5505f06873d8daeceba",
      "inferred_title": "La era de la IA y nuestro futuro",
      "title_source": "filename",
      "year_candidates": [
        "2026"
      ],
      "document_language": "es",
      "profile_type": "hybrid",
      "profile_type_observed": "hybrid",
      "page_count": 194,
      "extracted_pages": 194,
      "total_words": 64586,
      "total_tables": 0,
      "tables_rejected": 189,
      "total_sections": 52,
      "total_chunks": 137,
      "ocr_pages": 3,
      "chunk_coverage": 1.0,
      "average_quality": 0.938
    },
    {
      "document_id": "doc_3170e3515ee0b6cb",
      "filename": "file_33C69A65-A12A-41A9-B48C-DB4B9EBA2561.pdf",
      "sha256": "574f6562bc1ca9067e25e603ca1d8f81e9c9dfe637a273dbea3204a9a2816002",
      "inferred_title": "file_33C69A65-A12A-41A9-B48C-DB4B9EBA2561",
      "title_source": "filename",
      "year_candidates": [
        "2026"
      ],
      "document_language": "en",
      "profile_type": "digital",
      "profile_type_observed": "digital",
      "page_count": 21,
      "extracted_pages": 21,
      "total_words": 8349,
      "total_tables": 2,
      "tables_rejected": 36,
      "total_sections": 29,
      "total_chunks": 29,
      "ocr_pages": 0,
      "chunk_coverage": 1.0,
      "average_quality": 0.941
    }
  ],
  "version_comparison": {
    "versions": [
      "V5.3",
      "V5.4",
      "V5.5 (Bug is_numbered)",
      "V5.6 (Estable)"
    ],
    "documents": [
      {
        "name": "Paris Peace Forum / INTAiC",
        "filename": "file_33C69A65-A12A-41A9-B48C-DB4B9EBA2561.pdf",
        "pages": 21,
        "metrics": {
          "V5.3": {
            "words": 8349,
            "chunks": 200,
            "tables_acc": 4,
            "tables_rej": 30,
            "status": "PASS",
            "notes": "Falsas tablas por prosa"
          },
          "V5.4": {
            "words": 8349,
            "chunks": 200,
            "tables_acc": 4,
            "tables_rej": 34,
            "status": "PASS",
            "notes": "Filtro table_lines_max_area"
          },
          "V5.5": {
            "words": 995,
            "chunks": 171,
            "tables_acc": 1,
            "tables_rej": 25,
            "status": "FAIL (88% texto perdido)",
            "notes": "UnboundLocalError en HeadingDetector"
          },
          "V5.6": {
            "words": 8349,
            "chunks": 200,
            "tables_acc": 2,
            "tables_rej": 36,
            "status": "PASS (100% recuperado)",
            "notes": "table_min_area=0.03 descarta 2 microtablas"
          }
        }
      },
      {
        "name": "Anthropic Public Benefit Report",
        "filename": "Anthropic 2026 Public Benefit Report.pdf",
        "pages": 20,
        "metrics": {
          "V5.3": {
            "words": 6750,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 20,
            "status": "PASS",
            "notes": "Fusión agresiva de títulos"
          },
          "V5.4": {
            "words": 6750,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 20,
            "status": "PASS",
            "notes": "Títulos concatenados (Pillar + subtítulo)"
          },
          "V5.5": {
            "words": 5218,
            "chunks": 171,
            "tables_acc": 0,
            "tables_rej": 18,
            "status": "FAIL (23% texto perdido)",
            "notes": "Afectado por bug en páginas con headings"
          },
          "V5.6": {
            "words": 6750,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 20,
            "status": "PASS (100% recuperado)",
            "notes": "Fusión controlada (máx 2 títulos cortos)"
          }
        }
      },
      {
        "name": "SAFE AI Foundation (AISM)",
        "filename": "AI Safety Model Elaborated (AISM).pdf",
        "pages": 22,
        "metrics": {
          "V5.3": {
            "words": 5693,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 21,
            "status": "PASS",
            "notes": "Caracteres de bloque ▒ en títulos"
          },
          "V5.4": {
            "words": 5693,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 21,
            "status": "PASS",
            "notes": "1 ▒ Introducing... preservado con ruido"
          },
          "V5.5": {
            "words": 4844,
            "chunks": 171,
            "tables_acc": 0,
            "tables_rej": 19,
            "status": "FAIL (15% texto perdido)",
            "notes": "Pérdida parcial por fallo de bloque"
          },
          "V5.6": {
            "words": 5693,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 21,
            "status": "PASS (100% recuperado)",
            "notes": "clean_title() remueve ▒ y ■"
          }
        }
      },
      {
        "name": "La era de la IA y nuestro futuro",
        "filename": "La era de la IA y nuestro futuro.pdf",
        "pages": 194,
        "metrics": {
          "V5.3": {
            "words": 64586,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 189,
            "status": "PASS",
            "notes": "3 páginas OCR"
          },
          "V5.4": {
            "words": 64586,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 189,
            "status": "PASS",
            "notes": "Sin cambios en tablas"
          },
          "V5.5": {
            "words": 64304,
            "chunks": 171,
            "tables_acc": 0,
            "tables_rej": 188,
            "status": "FAIL (0.4% texto perdido)",
            "notes": "Afectación leve en headings"
          },
          "V5.6": {
            "words": 64586,
            "chunks": 200,
            "tables_acc": 0,
            "tables_rej": 189,
            "status": "PASS (100% recuperado)",
            "notes": "194 páginas integradas"
          }
        }
      }
    ]
  },
  "sections": [
    {
      "section_id": "doc_469e2c31d8cd93f1_S0001",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "AI Safety Model Elaborated:",
      "section_title": "AI Safety Model Elaborated:",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 1,
      "page_start": 1,
      "page_end": 1,
      "word_count": 11,
      "paragraph_count": 2,
      "language": "unknown"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0002",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "SAFE AI Foundation USA",
      "section_title": "SAFE AI Foundation USA",
      "title_source": "detected",
      "heading_confidence": 0.9,
      "heading_level": 3,
      "page_start": 1,
      "page_end": 2,
      "word_count": 140,
      "paragraph_count": 3,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0003",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "1 Introducing Safe AI Foundation’s AISM",
      "section_title": "1 Introducing Safe AI Foundation’s AISM",
      "title_source": "detected",
      "heading_confidence": 0.9,
      "heading_level": 1,
      "page_start": 2,
      "page_end": 3,
      "word_count": 241,
      "paragraph_count": 4,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0004",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "2 AISM Pillar 1: Input Safety 2.1 Definition and purpose",
      "section_title": "2 AISM Pillar 1: Input Safety 2.1 Definition and purpose",
      "title_source": "detected",
      "heading_confidence": 0.9,
      "heading_level": 1,
      "page_start": 3,
      "page_end": 5,
      "word_count": 614,
      "paragraph_count": 9,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0005",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3 AISM Pillar 2: Model Safety",
      "section_title": "3 AISM Pillar 2: Model Safety",
      "title_source": "detected",
      "heading_confidence": 0.9,
      "heading_level": 1,
      "page_start": 5,
      "page_end": 6,
      "word_count": 221,
      "paragraph_count": 4,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0006",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.1 Training Period Checks and Filters",
      "section_title": "3.1 Training Period Checks and Filters",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 6,
      "page_end": 6,
      "word_count": 204,
      "paragraph_count": 2,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0007",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.2 Model Self-Checks",
      "section_title": "3.2 Model Self-Checks",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 6,
      "page_end": 7,
      "word_count": 132,
      "paragraph_count": 3,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0008",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.3 Safety Throttles and Guardrails",
      "section_title": "3.3 Safety Throttles and Guardrails",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 7,
      "page_end": 7,
      "word_count": 333,
      "paragraph_count": 7,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0009",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.4 Robustness, Monitoring, and Auditability",
      "section_title": "3.4 Robustness, Monitoring, and Auditability",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 8,
      "page_end": 8,
      "word_count": 174,
      "paragraph_count": 4,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0010",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.5 Continuous Evaluation and Improvement",
      "section_title": "3.5 Continuous Evaluation and Improvement",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 8,
      "page_end": 8,
      "word_count": 82,
      "paragraph_count": 1,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0011",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.6 Interacting with the Compliance Layer",
      "section_title": "3.6 Interacting with the Compliance Layer",
      "title_source": "detected",
      "heading_confidence": 1.0,
      "heading_level": 2,
      "page_start": 8,
      "page_end": 9,
      "word_count": 112,
      "paragraph_count": 2,
      "language": "en"
    },
    {
      "section_id": "doc_469e2c31d8cd93f1_S0012",
      "document_id": "doc_469e2c31d8cd93f1",
      "title": "3.7 Interacting with upper layer SAIOP",
      "section_title": "3.7 Interacting with upper layer SAIOP",
      "title_source": "detected",
      "heading_confidence": 0.9,
      "heading_level": 2,
      "page_start": 9,
      "page_end": 10,
      "word_count": 447,
      "paragraph_count": 4,
      "language": "en"
    }
  ],
  "pages": [
    {
      "page_id": "doc_469e2c31d8cd93f1_P00001",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 1,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 22,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 1 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "AI Safety Model Elaborated:\nThe SAFE AI Foundation’s AI Safety Model (AISM)\nTechnical Report\nSAFE AI Foundation USA\n20 OCTOBER 2026"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00002",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 2,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 246,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 2 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "Abstract\nOn 15 April 2025, the SAFE AI Foundation USA very briefly introduced the AI Safety Model\n(AISM), which has 4 components of safety: (i) input, (ii) model, (iii) output, and (iv)\ncompliance. At that time, no organization has viewed AI safety in this way. Other\norganizations were deeply investigating specific issues and problems, but solving input or\nmodel safety alone does not solve the end"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00003",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 3,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 381,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 3 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "development. Each component must be able to communicate with the compliance layer via\ncontrol signals. Control modules are present to ensure each aspect of safety are supported.\nCollectively, they ensure that comprehensive safety can be achieved.\nUnlike other existing work where researchers address each safety aspect in silos, i.e., some\naggressively work on input safety, while others look deeply "
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00004",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 4,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 309,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 4 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "Fig 2: Internal components of the AI Input Safety layer.\nA key input threat is prompt injection, in which malicious instructions are embedded in a\nuser prompt, document, website, email, or tool response to influence the AI to disregard its\nintended instructions or perform unauthorized actions. Other threats (see Fig 2) include data\npoisoning, malicious files, identity spoofing, sensitive-data expo"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00005",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 5,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 227,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 5 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "Hence, input safety work is no small feat. A comprehensive IS solution can remove most of\nthe harm at an early stage, which is desirable for a good AI system design. Because no input\nfilter can guarantee detection of every bad intention, the AI system must be capable of also\nlimiting the privileges and potential impact of any malicious input that reaches subsequent\nprocessing stages, such as the m"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00006",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 6,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 396,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 6 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "information from the Input Safety layer, applies safeguards during both model training and\nruntime inference, and passes its resulting response to the Output Safety layer for further\nverification. Its objective is to prevent harmful behavior, limit unintended capabilities and\nautonomy, improve factual reliability, and maintain appropriate ethical and operational\nconstraints. Model Safety is not a "
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00007",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 7,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 364,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 7 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "implemented controls, external evaluation, and monitoring. The purpose is to create\nmultiple opportunities to detect and prevent unsafe behavior before it progresses through\nthe system.\n3.3 Safety Throttles and Guardrails\nThe central part of the diagram contains five specialized safety throttles. Each throttle\naddresses a distinct category of model risk, and their combined operation helps constrai"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00008",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 8,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 336,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 8 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "3.4 Robustness, Monitoring, and Auditability\nThe diagram also includes three supporting components that help ensure safety controls\nremain effective under real-world conditions.\n● Robustness and Adversarial Defense: This evaluates how the model responds to hostile\nprompts, jailbreak attempts, unusual inputs, distribution shifts, and other challenging\nconditions. Red-team exercises, adversarial tes"
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00009",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 9,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 418,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 9 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "Compliance Safety does not replace the technical controls within Model Safety. Instead, it\nestablishes the obligations those controls must satisfy and the evidence needed to\ndemonstrate their effectiveness. For example, privacy requirements may influence training\ndata filtering and log retention, while applicable cybersecurity rules may determine access\nrestrictions and monitoring requirements.\n3."
    },
    {
      "page_id": "doc_469e2c31d8cd93f1_P00010",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "page_number": 10,
      "page_label": "",
      "width": 612.0,
      "height": 792.0,
      "extraction_source": "native",
      "ocr_applied": false,
      "word_count": 203,
      "page_flags": [],
      "removed_edge_lines": [
        "All Copyrights © Reserved OCT’ 2026 Pg 10 / 22",
        "SAFE AI Foundation USA AI Safety Model (AISM) Elaborated"
      ],
      "extraction_quality_score": 0.95,
      "overall_quality_score": 0.95,
      "clean_text": "In summary, Model Safety is presented as a layered defense architecture: training-time\nchecks reduce risks before deployment; self-checks and safety throttles constrain runtime\nbehavior; robustness testing, monitoring, and audit trails detect weaknesses and support\naccountability; and continuous improvement strengthens the safeguards over time.\nCompliance Safety provides the overarching governance"
    }
  ],
  "integrity_report": {
    "generated_at": "2026-10-23T13:41:53.616057Z",
    "status": "PASS",
    "pipeline_version": "5.6",
    "checks": [
      {
        "check": "ids únicos (documents/pages/sections/chunks/tables)",
        "status": "PASS",
        "detail": "0 duplicados detectados en los 4 documentos"
      },
      {
        "check": "páginas extraídas == page_count del PDF",
        "status": "PASS",
        "detail": "257 de 257 páginas físicas extraídas (100%)"
      },
      {
        "check": "rango de páginas de chunks válido",
        "status": "PASS",
        "detail": "Todos los rangos contenidos en [1, page_count]"
      },
      {
        "check": "chunks apuntan a secciones existentes",
        "status": "PASS",
        "detail": "Integridad referencial completa en 200 chunks"
      },
      {
        "check": "todo documento tiene chunks",
        "status": "PASS",
        "detail": "Los 4 documentos poseen chunks generados"
      },
      {
        "check": "cobertura de texto en chunks >= 0.995",
        "status": "PASS",
        "detail": "chunk_coverage promedio: 1.0000 (100% de palabras recuperadas)"
      },
      {
        "check": "páginas con texto sin ningún chunk",
        "status": "PASS",
        "detail": "0 páginas huérfanas con texto"
      },
      {
        "check": "blindaje contra regresión is_numbered (V5.6 fix)",
        "status": "PASS",
        "detail": "Paris Peace Forum recuperó sus 8.349 palabras sin errores"
      },
      {
        "check": "filtrado de microtablas y tablas de prosa",
        "status": "PASS",
        "detail": "2 tablas aceptadas, 266 rechazadas justificadamente"
      }
    ]
  },
  "chunks": [
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00002",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0002",
      "section_title": "SAFE AI Foundation USA",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "20 OCTOBER 2026\nA bstract\nOn 15 April 2025, the SAFE AI Foundation USA very briefly introduced the AI Safety Model\n(AISM), which has 4 components of safety: (i) input, (ii) model, (iii) output, and (iv)\ncompliance. At that time, no organization has viewed AI safety in this way. Other\norganizations were deeply investigating specific issues and problems, but solving input or\nmodel safety alone does not solve the end-to-end system AI safety issues. This is why we\nintroduced AISM. Benchmarking and measurements alone are not solutions to AI safety\nissues. They are measurements, not solutions. In this report, we present AISM from an\nengineering and systems perspective, so that industries can effectively implement workable\nend-to-end solutions to achieve comprehensive AI safety for AI systems. This report goes\ninto greater depth the technical details of AISM.",
      "overlap_words": 0,
      "unique_words": 140,
      "language": "en",
      "word_count": 140,
      "text_sha256": "f883bdaafc2e97200e2956bdec91b78cbca13848dda68333c8248d4e80006abe",
      "page_start": 1,
      "page_end": 2,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 0.9266
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00003",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0003",
      "section_title": "1 Introducing Safe AI Foundation’s AISM",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "Fig 1: The 4 Pillar I-M-O-C AI Safety Model introduced by the SAFE AI Foundation USA\nIntroduced on 15 April 2025, the foundation AI Safety Model provides the full end-to-end\nsafety protection and functions for the AI pipeline, governing all the interactions and events\nhappening at input, model and output. This allows policies, laws, regulations, etc., to be\napplied to each section of the AI pipeline and nothing goes unmonitored or ungoverned.\nHumans, therefore, can remain in full control of the process and ensure compliance with\nexisting requirements. While comprehensive in design, AISM requires stringent efforts in its\ndevelopment. Each component must be able to communicate with the compliance layer via\ncontrol signals. Control modules are present to ensure each aspect of safety are supported.\nCollectively, they ensure that comprehensive safety can be achieved.\nUnlike other existing work where researchers address each safety aspect in silos, i.e., some\naggressively work on input safety, while others look deeply only on model safety or output\nsafety. Few, if not none, have looked at the whole spectrum of AI system safety requirements.\nThis is where SAFE AI Foundation USA makes its landmark in this space. We are convinced\nthat an end-to-end holistic architecture is needed to achieve full comprehensive AI safety.\nCurrent approach of saving fires on one end does not stop ranging fires on the other end.\nThat is the logic behind our AISM design.",
      "overlap_words": 0,
      "unique_words": 241,
      "language": "en",
      "word_count": 241,
      "text_sha256": "4a187997611f7d00ac8fdbe69248419553007523f3d2299af7fd3a8072c7645d",
      "page_start": 2,
      "page_end": 3,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 0.9915
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00004",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0004",
      "section_title": "2 AISM Pillar 1: Input Safety 2.1 Definition and purpose",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "Input Safety (IS) is the first line of defense in an AI system. It encompasses the policies,\ncontrols, and technical mechanisms used to inspect, validate, authenticate, classify, filter,\nremove, and safely process information (data) entering into the AI system.\nInputs may include user prompts, uploaded files, images, audio, video, retrieved\ndocuments, external databases, API responses, and messages received from other AI\nagents. Because an AI system's subsequent behavior depends heavily on the information\nand instructions it receives, unsafe or untrusted inputs can undermine the otherwise\neffective AI LLM model safety mechanisms.\nThe primary objective of Input Safety is to ensure that incoming information is valid,\nappropriately checked and authorized, sufficiently trustworthy, non-malicious, and handled\naccording to its sensitivity and risk. This does not mean that all inputs must be trusted or\nthat every malicious input can be identified with certainty. Rather, the system should\ndistinguish trusted instructions from untrusted data, identify suspicious or potentially\nharmful content, and limit the consequences of inputs that evade detection.\nThe IS control module is to protect the system from any harmful data that may harm the\nmodel or trick the model into misbehaving. In addition to filtering each token, it must also\nlook at multiple tokens, and also the subsequent context. Out-of-band processing and\nbuffering are needed. With parallel computation architectures, all these can be done quickly,\nwithout users noticing the difference.\nFig 2: Internal components of the AI Input Safety layer.\nA key input threat is prompt injection , in which malicious instructions are embedded in a\nuser prompt, document, website, email, or tool response to influence the AI to disregard its\nintended instructions or perform unauthorized actions. Other threats (see Fig 2) include data\npoisoning, malicious files, identity spoofing, sensitive-data exposure, oversized inputs\nintended to exhaust resources, and manipulated information from external sources. Input\nSafety should therefore operate as a layered defense rather than relying solely on a language\nmodel to recognize malicious content.\nInput Safety also establishes the boundary between receiving information and granting it\nauthority. A document may contain useful facts without having permission to change the\nsystem's governing instructions. A user may submit a request without having authorization\nto access every database. An external tool may return data without being entitled to direct\nthe agent's next action. Separating content from authority is essential for secure AI agents,\nparticularly those with access to tools, credentials, private data, or external systems.\nIf input DATA is “for information” or “training”, it will be handled differently. Information\ndescribing how to cheat, corrupt, manipulate, and other bad behaviors can poison the AI\nmodel itself. The model “learns” from the inputs of previously processed data. When\npursuing a goal, that misbehavior or trick will be “pulled out” and used. It is this aspect that\none observes an AI model “misbehaving”. The model itself is innocent. The things that it has\nlearnt are not! If input DATA are instructions, then it will be checked differently and the AI\nmodel may not adhere to the instructions fully, depending if the instructions are maliciously\ninclined or not. As shown in Fig 2, the input safety block requires the implementation of 10\nsub components. Each block is an entity to be implemented in software.\nHence, input safety work is no small feat. A comprehensive IS solution can remove most of\nthe harm at an early stage , which is desirable for a good AI system design. Because no input\nfilter can guarantee detection of every bad intention, the AI system must be capable of also\nlimiting the privileges and potential impact of any malicious input that reaches subsequent\nprocessing stages, such as the model and output processing blocks.",
      "overlap_words": 0,
      "unique_words": 614,
      "language": "en",
      "word_count": 614,
      "text_sha256": "e55c63c97f72ea5abe414610f9fdac36d0e3aa9ef0d463bda6628e19353c37de",
      "page_start": 3,
      "page_end": 5,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 0.9914
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00005",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0005",
      "section_title": "3 AISM Pillar 2: Model Safety",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "Model Safety (MS) concerns the ability of an AI LLM model and its surrounding execution\nenvironment to operate reliably, resist manipulation, remain within authorized capability and\nautonomy boundaries, and avoid causing unacceptable harm. While Input Safety (IS)\nexamines the information entering an AI system, Model Safety (MS) focuses on how the\nsystem processes that information, produces decisions, follows instructions, uses tools,\naccess resources, and exercises autonomy. It encompasses the model itself, including its\ncapabilities, behavioral tendencies, limitations, and configuration, as well as the runtime\ncontrols that govern its safe operation, as shown in Fig 3 below.\nFig 3: Internal components of AI Model Safety (MS).\nThe Model Safety (MS) component of SAFE AI Foundation’s AI Safety Model is designed to\nensure that an AI model behaves safely, reliably, and within defined boundaries throughout\nits operational lifecycle. As illustrated in Fig. 3, Model Safety receives filtered and validated\ninformation from the Input Safety layer, applies safeguards during both model training and\nruntime inference, and passes its resulting response to the Output Safety layer for further\nverification. Its objective is to prevent harmful behavior, limit unintended capabilities and\nautonomy, improve factual reliability, and maintain appropriate ethical and operational\nconstraints. Model Safety is not a single mechanism; it is a coordinated collection of\npreventive controls, runtime guardrails, monitoring mechanisms, and continuous\nimprovement processes.",
      "overlap_words": 0,
      "unique_words": 221,
      "language": "en",
      "word_count": 221,
      "text_sha256": "a768a196bbb6d885a2117ad321dd97666475b7781cdb383bf84b8a80d5aa1c4f",
      "page_start": 5,
      "page_end": 6,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 0.9892
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00006",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0006",
      "section_title": "3.1 Training Period Checks and Filters",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "The first major component addresses safety before an AI model is deployed. Training Data\nSafety examines the quality and suitability of training data, including harmful content, toxic\nmaterial, bias, personally identifiable information (PII), and potentially poisoned or\nmanipulated data. Appropriate filtering, data provenance checks, privacy protections, and\ndataset quality assessments help reduce the risk of embedding unsafe behaviors into the\nmodel. Diversity and fairness evaluations can also identify potential imbalances that might\nlead to discriminatory outcomes. These measures must be appropriate to the model’s\nintended use and applicable requirements, since indiscriminate data removal can also\nreduce model quality or introduce new biases.\nThe Training Process Checks block focuses on the integrity and reliability of the training\npipeline itself. It validates training configurations, monitors for anomalies, verifies model\nversions, and supports reproducibility through appropriate records and controls. Additional\nsafeguards can include checking the integrity of training code and dependencies, controlling\naccess to model weights and training infrastructure, evaluating changes between model\nversions, and testing for unexpected behavior introduced by fine-tuning. Together, training\ndata safeguards and process checks help establish a safer foundation before a model enters\nproduction. However, training-time checks cannot anticipate every possible failure, which is\nwhy runtime safeguards remain essential.",
      "overlap_words": 0,
      "unique_words": 204,
      "language": "en",
      "word_count": 204,
      "text_sha256": "c06b46b832a63e97d61bbe153e0b48621d0ebd6e52880fd92471c644b491358e",
      "page_start": 6,
      "page_end": 6,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 1.0
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00007",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0007",
      "section_title": "3.2 Model Self-Checks",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "During runtime inference, the Model Self-Checks component evaluates whether the model’s\nbehavior is consistent with its intended role and established safety boundaries. It can\nincorporate safety classifiers, policy checks, consistency tests, uncertainty estimation, and\ndetection of suspicious instructions or attempted jailbreaks. For systems capable of\nreasoning or using tools, additional checks may examine proposed actions, tool calls, and\ndeviations from authorized operating procedures.\nModel self-checks should not be treated as a guarantee of safety. An AI model can fail to\nrecognize its own errors, misjudge the risks of a response, or be manipulated into bypassing\nsafeguards. Therefore, self-assessment should be combined with independently\nimplemented controls, external evaluation, and monitoring. The purpose is to create\nmultiple opportunities to detect and prevent unsafe behavior before it progresses through\nthe system.",
      "overlap_words": 0,
      "unique_words": 132,
      "language": "en",
      "word_count": 132,
      "text_sha256": "d12e38cdc3fa1a2e5d9901dc1470106e3c5cb59b4732128091d8bbd698362cd6",
      "page_start": 6,
      "page_end": 7,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 1.0
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00008",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0008",
      "section_title": "3.3 Safety Throttles and Guardrails",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "The central part of the diagram contains five specialized safety throttles. Each throttle\naddresses a distinct category of model risk, and their combined operation helps constrain\nbehavior that cannot be controlled adequately by a single safeguard.\n● Malicious Outcome Throttle: Detects and blocks outputs, plans, or actions that could\nfacilitate harm, illegal activity, or dangerous misuse. Depending on the application, it may\nrefuse a request, restrict a proposed action, or escalate the case for human review.\n● Capability Throttle: Limits access to sensitive capabilities according to the model’s role,\npermissions, and assessed risk. Controls may restrict sensitive tool use, execution\nprivileges, access to protected resources, or high-risk functions. The goal is to ensure that\navailable capabilities do not exceed what is necessary and authorized for the task.\n● Autonomy Throttle: Controls how independently an AI system can operate. It can limit\naction sequences, constrain agent loops, impose execution budgets, require approval\nbefore consequential actions, and provide interruption or shutdown mechanisms. Higher-\nrisk activities should generally require stronger authorization and oversight.\n● Hallucinations Throttle: Reduces unsupported or fabricated claims through retrieval and\ngrounding, factual verification, consistency checks, calibrated uncertainty, and appropriate\nabstention when reliable evidence is unavailable. Since hallucinations cannot be eliminated\ncompletely, high-impact claims may require independent verification or human review.\n● Ethics Throttle: Addresses risks involving unfair discrimination, harmful treatment of\naffected groups, violations of human dignity, and conflicts with established ethical\nprinciples. It can incorporate fairness testing, bias detection, policy-based restrictions,\nimpact assessments, and escalation procedures. Ethical safeguards should be evaluated in\ncontext rather than relying solely on a model’s own judgment of what is ethical.\nThese throttles are complementary rather than interchangeable. A response can be factually\ncorrect but malicious, ethically questionable but legal, or harmless in isolation yet\ndangerous when an autonomous agent executes it repeatedly. The controls must therefore\nevaluate different risk dimensions and coordinate their interventions. Their implementation\nmay combine model-level techniques, external policy engines, permission systems,\ndeterministic rules, and human oversight, depending on the application.",
      "overlap_words": 0,
      "unique_words": 333,
      "language": "en",
      "word_count": 333,
      "text_sha256": "7cf56e437915f70bd82e3f211342c8462eac8813213f11d364d3f7ba47e71c2b",
      "page_start": 7,
      "page_end": 7,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 1.0
    },
    {
      "chunk_id": "doc_469e2c31d8cd93f1_C00009",
      "document_id": "doc_469e2c31d8cd93f1",
      "filename": "AI Safety Model Elaborated-  The SAFE AI Foundation’s AI Safety Model (AISM) .pdf",
      "section_id": "doc_469e2c31d8cd93f1_S0009",
      "section_title": "3.4 Robustness, Monitoring, and Auditability",
      "section_title_source": "detected",
      "section_title_reliable": true,
      "merged_section_ids": [],
      "merged_section_titles": [],
      "short_section": false,
      "text": "The diagram also includes three supporting components that help ensure safety controls\nremain effective under real-world conditions.\n● Robustness and Adversarial Defense: This evaluates how the model responds to hostile\nprompts, jailbreak attempts, unusual inputs, distribution shifts, and other challenging\nconditions. Red-team exercises, adversarial testing, regression testing, and robustness\nevaluations help expose weaknesses that ordinary testing might miss.\n● Monitoring and Anomaly Detection: This observes runtime behavior for unusual\npatterns, policy violations, unexpected tool usage, performance degradation, or signs that\nthe model is behaving outside its intended boundaries. When an anomaly is detected, the\nsystem can trigger an alert, restrict a capability, pause an operation, or initiate human review.\nMonitoring should be designed to protect sensitive information and minimize unnecessary\ncollection of user data.\n● Logging and Audit Trail: This records relevant model versions, safety decisions,\ninterventions, tool actions, and incidents. Appropriate records make it possible to\ninvestigate failures, determine whether safeguards operated as intended, demonstrate\naccountability, and support compliance assessments. Logging must itself be governed by\nsuitable access controls, retention policies, and privacy protections.",
      "overlap_words": 0,
      "unique_words": 174,
      "language": "en",
      "word_count": 174,
      "text_sha256": "d0b9955064920a04a39ff514b8da420c8154edb0d4fb4349ccacdfb37ca7dbbf",
      "page_start": 8,
      "page_end": 8,
      "page_label_start": "",
      "page_label_end": "",
      "related_table_ids": [],
      "quality_score": 1.0
    }
  ],
  "tables": [
    {
      "table_id": "tbl_cfec2772aaf28f7e",
      "document_id": "doc_3170e3515ee0b6cb",
      "page_number": 1,
      "strategy": "text",
      "bbox": [
        48.19,
        248.25,
        544.48,
        796.5
      ],
      "rows": 5,
      "columns": 2,
      "table_confidence": "medium",
      "quality_features": {
        "filled_ratio": 0.75,
        "fragment_ratio": 0.0,
        "lower_start_ratio": 0.111,
        "avg_words_per_cell": 2.89,
        "page_area_share": 0.543
      },
      "caption": "",
      "headers": [
        "Bridging the Evidence",
        "Gap"
      ],
      "records": [
        {
          "Bridging the Evidence": "on AI Misuse in",
          "Gap": ""
        },
        {
          "Bridging the Evidence": "Cyberspace",
          "Gap": ""
        },
        {
          "Bridging the Evidence": "Discerning signal from noise on AI-enabled cyber threats",
          "Gap": ""
        },
        {
          "Bridging the Evidence": "INFORME",
          "Gap": "D RESPONSE ↑"
        },
        {
          "Bridging the Evidence": "INAUGURAL WHITE PAPER",
          "Gap": "JULY 2026"
        }
      ],
      "matrix": [
        [
          "Bridging the Evidence",
          "Gap"
        ],
        [
          "on AI Misuse in",
          ""
        ],
        [
          "Cyberspace",
          ""
        ],
        [
          "Discerning signal from noise on AI-enabled cyber threats",
          ""
        ],
        [
          "INFORME",
          "D RESPONSE ↑"
        ],
        [
          "INAUGURAL WHITE PAPER",
          "JULY 2026"
        ]
      ],
      "markdown": "| Bridging the Evidence | Gap |\n|---|---|\n| on AI Misuse in |  |\n| Cyberspace |  |\n| Discerning signal from noise on AI-enabled cyber threats |  |\n| INFORME | D RESPONSE ↑ |\n| INAUGURAL WHITE PAPER | JULY 2026 |"
    },
    {
      "table_id": "tbl_cc3644eaead18a60",
      "document_id": "doc_3170e3515ee0b6cb",
      "page_number": 13,
      "strategy": "lines",
      "bbox": [
        35.8,
        93.07,
        561.83,
        214.74
      ],
      "rows": 1,
      "columns": 3,
      "table_confidence": "high",
      "quality_features": {
        "filled_ratio": 0.833,
        "fragment_ratio": 0.0,
        "lower_start_ratio": 0.2,
        "avg_words_per_cell": 13.4,
        "page_area_share": 0.128
      },
      "caption": "",
      "headers": [
        "OBSERVES direct interaction with the model: jailbreak attempts, malicious prompts, signatures of automated abuse Ai Ai Ai",
        "OBSERVES traffic at perimeter, cloud and inter-segment level: command-and-control, payload staging, lateral movement",
        "OBSERVES processes, files and behaviour on the user's device: how the intrusion executes, what data is touched Ai?"
      ],
      "records": [
        {
          "OBSERVES direct interaction with the model: jailbreak attempts, malicious prompts, signatures of automated abuse Ai Ai Ai": "Ai for open-weight models, this window fades once weights are released Ai Ai",
          "OBSERVES traffic at perimeter, cloud and inter-segment level: command-and-control, payload staging, lateral movement": "attribution is shed at the seam",
          "OBSERVES processes, files and behaviour on the user's device: how the intrusion executes, what data is touched Ai?": ""
        }
      ],
      "matrix": [
        [
          "OBSERVES direct interaction with the model: jailbreak attempts, malicious prompts, signatures of automated abuse Ai Ai Ai",
          "OBSERVES traffic at perimeter, cloud and inter-segment level: command-and-control, payload staging, lateral movement",
          "OBSERVES processes, files and behaviour on the user's device: how the intrusion executes, what data is touched Ai?"
        ],
        [
          "Ai for open-weight models, this window fades once weights are released Ai Ai",
          "attribution is shed at the seam",
          ""
        ]
      ],
      "markdown": "| OBSERVES direct interaction with the model: jailbreak attempts, malicious prompts, signatures of automated abuse Ai Ai Ai | OBSERVES traffic at perimeter, cloud and inter-segment level: command-and-control, payload staging, lateral movement | OBSERVES processes, files and behaviour on the user's device: how the intrusion executes, what data is touched Ai? |\n|---|---|---|\n| Ai for open-weight models, this window fades once weights are released Ai Ai | attribution is shed at the seam |  |"
    }
  ],
  "tables_rejected": [
    {
      "table_id": "tbl_69a61119e0135fbe",
      "document_id": "doc_469e2c31d8cd93f1",
      "page_number": 1,
      "strategy": "text",
      "bbox": [
        247.47,
        320.53,
        327.92,
        555.8
      ],
      "rows": 3,
      "columns": 1,
      "table_confidence": "low",
      "quality_features": {
        "filled_ratio": 1.0,
        "fragment_ratio": 0.0,
        "lower_start_ratio": 0.25,
        "avg_words_per_cell": 1.75,
        "page_area_share": 0.039
      },
      "caption": "",
      "headers": [
        "Model"
      ],
      "matrix": [
        [
          "Model"
        ],
        [
          "ndation’s A"
        ],
        [
          "Technical R"
        ],
        [
          "AI Found"
        ]
      ],
      "reject_reason": "menos de 2 filas o 2 columnas"
    },
    {
      "table_id": "tbl_bd5bd6f9ec2454ee",
      "document_id": "doc_469e2c31d8cd93f1",
      "page_number": 2,
      "strategy": "text",
      "bbox": [
        72.02,
        38.66,
        540.21,
        756.14
      ],
      "rows": 20,
      "columns": 8,
      "table_confidence": "low",
      "quality_features": {
        "filled_ratio": 0.911,
        "fragment_ratio": 0.065,
        "lower_start_ratio": 0.791,
        "avg_words_per_cell": 2.22,
        "page_area_share": 0.693
      },
      "caption": "",
      "headers": [
        "SAFE AI Foun",
        "dation U",
        "SA",
        "column_4",
        "column_5",
        "AI Sa",
        "fety Model (AISM",
        ") Elaborated"
      ],
      "matrix": [
        [
          "SAFE AI Foun",
          "dation U",
          "SA",
          "",
          "",
          "AI Sa",
          "fety Model (AISM",
          ") Elaborated"
        ],
        [
          "A bstract",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        ],
        [
          "On 15 April 2",
          "025, the",
          "SAFE AI F",
          "ou",
          "ndation USA very",
          "briefly int",
          "roduced the AI",
          "Safety Model"
        ],
        [
          "(AISM), whic",
          "h has 4",
          "compon",
          "ent",
          "s of safety: (i) i",
          "nput, (ii)",
          "model, (iii) outp",
          "ut, and (iv)"
        ],
        [
          "compliance.",
          "At that",
          "time, no",
          "or",
          "ganization has",
          "viewed A",
          "I safety in this",
          "way. Other"
        ],
        [
          "organizations",
          "were de",
          "eply inves",
          "tig",
          "ating specific iss",
          "ues and p",
          "roblems, but sol",
          "ving input or"
        ],
        [
          "model safety",
          "alone d",
          "oes not so",
          "lve",
          "the end-to-end",
          "system AI",
          "safety issues. Th",
          "is is why we"
        ],
        [
          "introduced AI",
          "SM. Ben",
          "chmarkin",
          "g a",
          "nd measuremen",
          "ts alone a",
          "re not solutions",
          "to AI safety"
        ],
        [
          "issues. They",
          "are mea",
          "surement",
          "s,",
          "not solutions. In",
          "this repo",
          "rt, we present A",
          "ISM from an"
        ],
        [
          "engineering a",
          "nd syste",
          "ms perspe",
          "cti",
          "ve, so that industr",
          "ies can eff",
          "ectively implem",
          "ent workable"
        ],
        [
          "end-to-end s",
          "olutions",
          "to achiev",
          "e c",
          "omprehensive AI",
          "safety for",
          "AI systems. This",
          "report goes"
        ],
        [
          "into greater d",
          "epth the",
          "technical",
          "det",
          "ails of AISM.",
          "",
          "",
          ""
        ],
        [
          "1 ▒ Intr",
          "oduc",
          "ing Sa",
          "fe",
          "AI Founda",
          "tion’s",
          "AISM",
          ""
        ],
        [
          "Fig 1: The 4 Pil",
          "lar I-M-",
          "O-C AI Saf",
          "ety",
          "Model introduce",
          "d by the SA",
          "FE AI Foundatio",
          "n USA"
        ],
        [
          "Introduced on",
          "15 Apr",
          "il 2025, th",
          "e f",
          "oundation AI Saf",
          "ety Model",
          "provides the ful",
          "l end-to-end"
        ],
        [
          "safety protect",
          "ion and",
          "functions",
          "for",
          "the AI pipeline, g",
          "overning a",
          "ll the interaction",
          "s and events"
        ],
        [
          "happening at",
          "input, m",
          "odel and",
          "ou",
          "tput. This allows",
          "policies,",
          "laws, regulation",
          "s, etc., to be"
        ],
        [
          "applied to ea",
          "ch secti",
          "on of the",
          "AI",
          "pipeline and not",
          "hing goes",
          "unmonitored or",
          "ungoverned."
        ],
        [
          "Humans, ther",
          "efore, c",
          "an remain",
          "in",
          "full control of th",
          "e process",
          "and ensure com",
          "pliance with"
        ],
        [
          "existing requir",
          "ements",
          ". While co",
          "mp",
          "rehensive in desi",
          "gn, AISM r",
          "equires stringent",
          "efforts in its"
        ],
        [
          "All Copyrights",
          "© Rese",
          "rved OCT’",
          "202",
          "6",
          "",
          "",
          "Pg 2 / 22"
        ]
      ],
      "reject_reason": "celdas inician en minúscula"
    },
    {
      "table_id": "tbl_0255469165007286",
      "document_id": "doc_469e2c31d8cd93f1",
      "page_number": 3,
      "strategy": "text",
      "bbox": [
        72.02,
        38.66,
        540.17,
        756.14
      ],
      "rows": 32,
      "columns": 8,
      "table_confidence": "low",
      "quality_features": {
        "filled_ratio": 0.917,
        "fragment_ratio": 0.008,
        "lower_start_ratio": 0.843,
        "avg_words_per_cell": 2.24,
        "page_area_share": 0.693
      },
      "caption": "",
      "headers": [
        "SAFE AI Found",
        "ation",
        "USA",
        "column_4",
        "column_5",
        "AI Safet",
        "y Model (AIS",
        "M) Elaborated"
      ],
      "matrix": [
        [
          "SAFE AI Found",
          "ation",
          "USA",
          "",
          "",
          "AI Safet",
          "y Model (AIS",
          "M) Elaborated"
        ],
        [
          "development.",
          "Each",
          "compo",
          "nent",
          "must be able to c",
          "ommunicate wi",
          "th the compl",
          "iance layer via"
        ],
        [
          "control signals",
          ". Cont",
          "rol m",
          "odules",
          "are present to e",
          "nsure each aspe",
          "ct of safety",
          "are supported."
        ],
        [
          "Collectively, th",
          "ey en",
          "sure th",
          "at co",
          "mprehensive saf",
          "ety can be achie",
          "ved.",
          ""
        ],
        [
          "Unlike other e",
          "xisting",
          "work",
          "where",
          "researchers add",
          "ress each safet",
          "y aspect in si",
          "los, i.e., some"
        ],
        [
          "aggressively w",
          "ork on",
          "input",
          "safet",
          "y, while others lo",
          "ok deeply only",
          "on model sa",
          "fety or output"
        ],
        [
          "safety. Few, if n",
          "ot no",
          "ne, hav",
          "e look",
          "ed at the whole s",
          "pectrum of AI sy",
          "stem safety",
          "requirements."
        ],
        [
          "This is where S",
          "AFE A",
          "I Foun",
          "dation",
          "USA makes its",
          "landmark in this",
          "space. We",
          "are convinced"
        ],
        [
          "that an end-to",
          "-end h",
          "olisti",
          "c archi",
          "tecture is neede",
          "d to achieve ful",
          "l comprehen",
          "sive AI safety."
        ],
        [
          "Current appro",
          "ach of",
          "savin",
          "g fires",
          "on one end doe",
          "s not stop rang",
          "ing fires on",
          "the other end."
        ],
        [
          "That is the logi",
          "c behi",
          "nd ou",
          "r AISM",
          "design.",
          "",
          "",
          ""
        ],
        [
          "2 ▒ AISM",
          "Pil",
          "lar",
          "1: In",
          "put Safet",
          "y",
          "",
          ""
        ],
        [
          "2.1 Definition",
          "and p",
          "urpos",
          "e",
          "",
          "",
          "",
          ""
        ],
        [
          "Input Safety (",
          "IS) is",
          "the fir",
          "st line",
          "of defense in a",
          "n AI system. It e",
          "ncompasse",
          "s the policies,"
        ],
        [
          "controls, and t",
          "echni",
          "cal m",
          "echani",
          "sms used to ins",
          "pect, validate, a",
          "uthenticate,",
          "classify, filter,"
        ],
        [
          "remove, and s",
          "afely p",
          "roces",
          "s infor",
          "mation (data) en",
          "tering into the A",
          "I system.",
          ""
        ],
        [
          "Inputs may i",
          "nclud",
          "e use",
          "r pro",
          "mpts, uploaded",
          "files, images",
          ", audio, vid",
          "eo, retrieved"
        ],
        [
          "documents, e",
          "xterna",
          "l data",
          "bases",
          ", API responses",
          ", and message",
          "s received",
          "from other AI"
        ],
        [
          "agents. Becau",
          "se an",
          "AI sys",
          "tem's",
          "subsequent beh",
          "avior depends",
          "heavily on th",
          "e information"
        ],
        [
          "and instructio",
          "ns it",
          "receiv",
          "es, un",
          "safe or untrust",
          "ed inputs can",
          "undermine",
          "the otherwise"
        ],
        [
          "effective AI LL",
          "M mod",
          "el saf",
          "ety me",
          "chanisms.",
          "",
          "",
          ""
        ],
        [
          "The primary o",
          "bjecti",
          "ve of",
          "Input",
          "Safety is to en",
          "sure that inco",
          "ming inform",
          "ation is valid,"
        ],
        [
          "appropriately",
          "check",
          "ed and",
          "autho",
          "rized, sufficientl",
          "y trustworthy, n",
          "on-maliciou",
          "s, and handled"
        ],
        [
          "according to it",
          "s sen",
          "sitivity",
          "and ri",
          "sk. This does no",
          "t mean that all",
          "inputs mus",
          "t be trusted or"
        ],
        [
          "that every ma",
          "liciou",
          "s inpu",
          "t can",
          "be identified w",
          "ith certainty. R",
          "ather, the s",
          "ystem should"
        ],
        [
          "distinguish tru",
          "sted",
          "instru",
          "ctions",
          "from untrusted",
          "data, identify",
          "suspicious",
          "or potentially"
        ],
        [
          "harmful conte",
          "nt, an",
          "d limit",
          "the co",
          "nsequences of i",
          "nputs that evad",
          "e detection.",
          ""
        ],
        [
          "The IS control",
          "modu",
          "le is t",
          "o prot",
          "ect the system f",
          "rom any harmf",
          "ul data that",
          "may harm the"
        ],
        [
          "model or trick",
          "the m",
          "odel i",
          "nto mi",
          "sbehaving. In ad",
          "dition to filterin",
          "g each toke",
          "n, it must also"
        ],
        [
          "look at multip",
          "le tok",
          "ens, a",
          "nd al",
          "so the subsequ",
          "ent context. Ou",
          "t-of-band p",
          "rocessing and"
        ],
        [
          "buffering are n",
          "eeded",
          ". With",
          "parall",
          "el computation a",
          "rchitectures, all",
          "these can b",
          "e done quickly,"
        ],
        [
          "without users",
          "noticin",
          "g the",
          "differe",
          "nce.",
          "",
          "",
          ""
        ],
        [
          "All Copyrights",
          "© Res",
          "erved",
          "OCT’ 2",
          "026",
          "",
          "",
          "Pg 3 / 22"
        ]
      ],
      "reject_reason": "rejilla de texto demasiado grande"
    },
    {
      "table_id": "tbl_99caf619605a5a89",
      "document_id": "doc_3170e3515ee0b6cb",
      "page_number": 4,
      "strategy": "lines",
      "bbox": [
        0.0,
        -7.83,
        595.59,
        834.58
      ],
      "rows": 1,
      "columns": 7,
      "table_confidence": "high",
      "quality_features": {
        "filled_ratio": 0.786,
        "fragment_ratio": 0.0,
        "lower_start_ratio": 0.545,
        "avg_words_per_cell": 33.0,
        "page_area_share": 1.0
      },
      "caption": "",
      "headers": [
        "Part One The Accelerating AI-Cy",
        "ber",
        "Threat",
        "Lands",
        "cape",
        "column_6",
        "column_7"
      ],
      "matrix": [
        [
          "Part One The Accelerating AI-Cy",
          "ber",
          "Threat",
          "Lands",
          "cape",
          "",
          ""
        ],
        [
          "1.1 From experimentation to industrial-scale misuse The trajectory of AI misuse in cyberspace has moved decisively from experimentation to industrialization. The shift can be approached along four converging dimensions (speed, volume, tempo and cost) and the early 2026 reporting cycle has produced consistent quantitative anchors for each of them. On speed, the time elapsed between initial access and data exfiltration in the fastest observed intrusions has collapsed to a median of seventy-two minutes, an approximate fourfold acceleration relative to the previous year, in a corpus of more than seven hundred and fifty high-stakes incidents reviewed by leading incident- response practitioners. Time-to-exploit on critical vulnerabilities is collapsing in parallel, with industrialized tooling sold on dark-web marketplaces and Telegram channels reducing reconnaissance-to-exploitation windows that once spanned weeks to single-digit hours [1]. On volume, AI-enabled adversary operations rose by approximately eighty-nine per cent year on year in 2025, according to consolidated industry telemetry covering more than two hundred and fifty tracked threat actors [2]. The increase is driven both by long-tracked state-affiliated clusters that have absorbed generative AI into their existing tradecraft and by the diffusion of AI-augmented commodity tooling across the cybercriminal ecosystem. Generative AI is now embedded across reconnaissance, social engineering, scripting, credential theft and operational execution, to the point where the relevant question is no longer where AI is used in the attack chain but where it is not. On tempo, the underlying capability is itself accelerating. Independent evaluations conducted by national AI security institutes indicate that the autonomous cyber-task horizon of frontier models, namely the length of cyber tasks they can reliably complete without human intervention, was doubling approximately every four months at the start of 2026, against an estimate closer to eight months only three months earlier [3]. The most recent frontier models evaluated in the spring of 2026 have significantly outpaced even that revised trend, although it remains PART I — THE ACCELERATING AI-CYBER THREAT LANDSCAPE 03",
          "-scale oved d ging di nt quan",
          "misuse ecisively from mensions (spe titative anchor",
          "experimenta ed, volume, t s for each of t",
          "tion to industr empo and cost hem.",
          "ialization. ) and the",
          ""
        ]
      ],
      "reject_reason": "página completa con prosa (falso positivo)"
    },
    {
      "table_id": "tbl_2b2270c95601f025",
      "document_id": "doc_3170e3515ee0b6cb",
      "page_number": 20,
      "strategy": "lines",
      "bbox": [
        318.22,
        299.67,
        372.24,
        399.46
      ],
      "rows": 1,
      "columns": 3,
      "table_confidence": "high",
      "quality_features": {
        "filled_ratio": 0.5,
        "fragment_ratio": 0.0,
        "lower_start_ratio": 0.667,
        "avg_words_per_cell": 4.33,
        "page_area_share": 0.011
      },
      "caption": "",
      "headers": [
        "column_1",
        "ean-Berna Oran xpert, m Ravis",
        "column_3"
      ],
      "matrix": [
        [
          "",
          "ean-Berna Oran xpert, m Ravis",
          ""
        ],
        [
          "Jim Ravis Clou CEO, Keir Reid",
          "m Ravis",
          ""
        ]
      ],
      "reject_reason": "área demasiado pequeña (residuo)"
    }
  ]
};


const PIPELINE_PHASES = [
  {
    id: 1,
    name: "1. Perfilado y Huella Criptográfica SHA-256",
    class_name: "PDFProfiler",
    file: "src/pdf_intelligence/profiler.py",
    goal: "Establecer la identidad inmutable y cadena de custodia del documento antes de cualquier procesamiento, recuperando metadatos internos y evaluando si el archivo es digital, escaneado o híbrido.",
    methodology: "Para evitar procesar archivos corruptos o redundantes, se calcula el hash criptográfico SHA-256 del binario completo. El muestreo uniforme de hasta 7 páginas evalúa si existe capa vectorial de texto (>=20 palabras) sin incurrir en el costo computacional de renderizar todo el documento.",
    inputs: "Archivo binario PDF (*.pdf) en almacenamiento local o sistema de archivos.",
    outputs: "Diccionario base con sha256, document_id determinista ('doc_' + sha256[:16]), profile_type ('digital' | 'scanned' | 'hybrid' | 'empty') y metadatos pypdf.",
    formula: "\\text{document\\_id} = \\text{\"doc\\_\"} + \\text{SHA256}(\\text{bytes})_{0:16}",
    code_snippet: `class PDFProfiler:
    @staticmethod
    def classify(document):
        n_pages = len(document)
        sample = sorted({int(round(i * (n_pages - 1) / 6)) for i in range(7)}) if n_pages > 7 else list(range(n_pages))
        with_text = sum(word_count(normalize_text(document[i].get_text("text"))) >= 20 for i in sample)
        return "digital" if with_text == len(sample) else "scanned" if with_text == 0 else "hybrid"

    def profile(self, pdf_path):
        return {
            "filename": Path(pdf_path).name,
            "sha256": sha256_file(pdf_path),
            "document_id": stable_id("doc", sha256_file(pdf_path)),
            "profile_type": self.classify(pymupdf.open(pdf_path))
        }`
  },
  {
    id: 2,
    name: "2. Extracción de Layout Nativo y Tipografía",
    class_name: "LayoutExtractor",
    file: "src/pdf_intelligence/layout.py",
    goal: "Capturar la geometría física bidimensional y la micro-tipografía de cada elemento de la página preservando el orden de lectura.",
    methodology: "Ejecuta page.get_text('dict', sort=True) en PyMuPDF. No extrae cadenas planas, sino bloques discretos con bboxes [x0, y0, x1, y1], líneas y spans. Calcula la mediana tipográfica (median_font_size) de cada página, que servirá como línea base para la detección relativa de encabezados.",
    inputs: "Instancia de página de PyMuPDF (fitz.Page).",
    outputs: "Lista de bloques estructurados (type=0 para texto, type=1 para imágenes), metadatos de imágenes y median_font_size.",
    formula: "\\text{median\\_font\\_size} = \\text{Mediana}\\Big(\\{ s.\\text{size} \\mid s \\in \\text{spans de la página} \\}\\Big)",
    code_snippet: `class LayoutExtractor:
    def extract(self, page):
        data = page.get_text("dict", sort=True)
        blocks, font_sizes = [], []
        for block in data.get("blocks", []):
            if block.get("type") == 0:  # Texto
                spans = [s for line in block.get("lines", []) for s in line.get("spans", [])]
                font_sizes.extend(s.get("size", 0) for s in spans)
                blocks.append({"bbox": block["bbox"], "text": "\\n".join(...), "spans": spans})
        return {"blocks": blocks, "median_font_size": statistics.median(font_sizes) if font_sizes else 0}`
  },
  {
    id: 3,
    name: "3. Detección Multicriterio de Encabezados (Paso 1)",
    class_name: "HeadingDetector",
    file: "src/pdf_intelligence/heading.py",
    goal: "Identificar títulos estructurales genuinos sin generar falsas secciones por notas al pie, números de ejes de gráficos o viñetas.",
    methodology: "Aplica un sistema de penalizaciones y recompensas. Primero evalúa filtros descalificadores duros (más de 20 palabras, >35% dígitos en el texto, viñetas, notas al pie, paréntesis desbalanceados). Luego suma señales tipográficas y léxicas. Si el puntaje acumulado alcanza 2.0, se acepta como encabezado y se le asigna nivel H1 a H3.",
    inputs: "Bloque de texto de layout, mediana tipográfica de la página y dimensiones.",
    outputs: "Diccionario con is_heading (bool), heading_confidence (0.0 a 1.0), heading_level (1, 2 o 3) y heading_signals.",
    formula: "\\text{Score} = 3.0(\\text{Standard}) + 2.0(\\text{Numbered}) + 2.5\\Big(\\frac{\\text{size}}{\\text{median}} \\ge 1.30\\Big) + 1.0(\\text{Bold}) + 1.0(\\text{Upper}) \\ge 2.0",
    code_snippet: `class HeadingDetector:
    def detect(self, block, median_font, page_height=None, page_number=1):
        text = single_line(block.get("text", ""))
        # Descalificadores duros:
        if len(text.split()) > 20 or sum(c.isdigit() for c in text)/len(text) > 0.35:
            return {"is_heading": False, "heading_confidence": 0.0}
        
        score, signals = 0.0, []
        if self.standard.match(text): score += 3.0; signals.append("standard")
        if (main_size / median_font) >= 1.30: score += 2.5; signals.append("font>=1.30")
        if self.is_bold(spans): score += 1.0; signals.append("bold")
        
        accepted = score >= 2.0
        return {"is_heading": accepted, "heading_confidence": round(min(1.0, score / 4.0), 3), "heading_signals": signals}`
  },
  {
    id: 4,
    name: "4. OCR Adaptativo Dual-Trigger",
    class_name: "OCRExtractor",
    file: "src/pdf_intelligence/ocr.py",
    goal: "Recuperar el contenido textual de páginas escaneadas o con fuentes tipográficas corruptas sin ralentizar el procesamiento de páginas digitales nativas.",
    methodology: "El OCR no se aplica indiscriminadamente. Solo se dispara si el texto nativo tiene < 80 caracteres, < 20 palabras o una calidad técnica < 0.35. Cuando se activa, renderiza la página a 200 DPI y ejecuta Tesseract (spa+eng). El texto OCR sustituye al nativo solo si aporta > 20% más palabras legibles.",
    inputs: "Página física PyMuPDF y métricas de calidad del texto nativo.",
    outputs: "ocr_text, ocr_confidence, extraction_source ('native' u 'ocr').",
    formula: "\\text{Disparar OCR} \\iff \\text{longitud}(text) < 80 \\lor \\text{palabras}(text) < 20 \\lor \\text{calidad}(text) < 0.35",
    code_snippet: `class OCRExtractor:
    def needs_ocr(self, text, quality):
        return len(text.strip()) < 80 or word_count(text) < 20 or quality < 0.35

    def extract(self, page):
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(200/72, 200/72), alpha=False)
        df = pytesseract.image_to_data(Image.open(io.BytesIO(pixmap.tobytes())), lang="spa+eng", output_type=Output.DATAFRAME)
        return {"text": normalize_text(text), "confidence": round(valid_conf.mean() / 100, 4)}`
  },
  {
    id: 5,
    name: "5. Extracción y Clasificación Heurística de Tablas",
    class_name: "AdaptiveTableExtractor",
    file: "src/pdf_intelligence/tables.py",
    goal: "Extraer tablas numéricas genuinas y discriminar cuadrículas falsas generadas por prosa editorial en dos o tres columnas.",
    methodology: "Aplica pdfplumber priorizando la estrategia 'lines' y utilizando 'text' como respaldo. Cada cuadrícula se evalúa con 5 métricas: filled_ratio, fragment_ratio, lower_start_ratio y page_area_share. Si >= 25% de las celdas inician en minúscula o la rejilla ocupa >= 70% del área de la página, se clasifica como prosa y se envía a tables_rejected.jsonl.",
    inputs: "Página de pdfplumber, document_id y page_number.",
    outputs: "tables.jsonl (aceptadas en Markdown y records) y tables_rejected.jsonl (descartadas con reject_reason).",
    formula: "\\text{Rechazo Prosa} \\iff \\text{lower\\_start\\_ratio} \\ge 0.25 \\lor \\text{area\\_share} \\ge 0.70 \\lor \\text{fragment\\_ratio} \\ge 0.20",
    code_snippet: `class AdaptiveTableExtractor:
    def judge(self, strategy, matrix, feats):
        if len(matrix) < 2 or max(len(r) for r in matrix) < 2: return False, "menos de 2x2"
        if strategy == "text":
            if feats["lower_start_ratio"] >= 0.25: return False, "celdas inician en minúscula (prosa partida)"
            if feats["page_area_share"] >= 0.70: return False, "ocupa casi toda la página (prosa en columnas)"
        return True, "ok"`
  },
  {
    id: 6,
    name: "6. Evaluación de Calidad Desacoplada y Limpieza de Bordes",
    class_name: "QualityAssessor",
    file: "src/pdf_intelligence/quality.py",
    goal: "Limpiar cabeceras y pies repetitivos sin borrar números legítimos del cuerpo y medir la fiabilidad técnica del texto sin sesgos de maquetación.",
    methodology: "Normaliza los dígitos a comodines '#' en las 3 líneas superiores e inferiores de todas las páginas. Si un patrón se repite en >= 35% de las páginas, se recorta ÚNICAMENTE en los bordes y se registra en removed_edge_lines. Además, calcula extraction_quality_score, desacoplado de la presencia de tablas o encabezados.",
    inputs: "Texto de la página, líneas de borde de todo el documento.",
    outputs: "clean_text, removed_edge_lines, extraction_quality_score (0.0 a 1.0) y page_flags.",
    formula: "\\text{extraction\\_quality} = 0.50\\cdot\\text{text\\_score} + 0.30\\cdot\\text{ocr\\_score} + 0.20\\cdot\\text{encoding\\_score}",
    code_snippet: `def infer_repeated_lines(pages, threshold=0.35, k=3):
    counter = Counter()
    for page in pages:
        lines = (page.get("native_text") or page.get("clean_text") or "").splitlines()
        edge = lines[:k] + lines[-k:]
        for pat in {re.sub(r"\\d+", "#", single_line(x).lower()) for x in edge if 1 <= len(x) <= 140}:
            counter[pat] += 1
    return {p for p, c in counter.items() if c >= max(3, ceil(len(pages)*threshold))}`
  },
  {
    id: 7,
    name: "7. Democión de Encabezados Repetidos (Paso 2)",
    class_name: "demote_repeated_headings",
    file: "src/pdf_intelligence/heading.py",
    goal: "Eliminar cabeceras corridas que fragmentan artificialmente las secciones temáticas a lo largo de un documento extenso.",
    methodology: "En documentos de >= 8 páginas, revisa globalmente todos los bloques que fueron catalogados como is_heading. Si el mismo texto se repite como encabezado en >= 4 páginas o >= 8% del documento, se degrada a texto de cuerpo con la marca heading_demoted = 'repeated_on_many_pages'.",
    inputs: "Lista completa de páginas y bloques de layout de un documento.",
    outputs: "Bloques desclasificados y heading_count recalculado por página.",
    formula: "\\text{Umbral Democión} = \\max\\Big(4, \\lceil 0.08 \\cdot N_{\\text{páginas}} \\rceil\\Big)",
    code_snippet: `def demote_repeated_headings(pages):
    threshold = max(4, math.ceil(len(pages) * 0.08))
    for page in pages:
        for block in page.get("blocks", []):
            if block.get("is_heading") and text in repeated:
                block["is_heading"] = False
                block["heading_demoted"] = "repeated_on_many_pages"`
  },
  {
    id: 8,
    name: "8. Construcción de Secciones Jerárquicas",
    class_name: "SectionBuilder",
    file: "src/pdf_intelligence/structure.py",
    goal: "Reconstruir las unidades semánticas y jerárquicas del discurso antes de cualquier proceso de fragmentación.",
    methodology: "Agrupa párrafos bajo encabezados detectados o 'Contenido inicial'. Si encuentra dos encabezados consecutivos sin texto intermedio, los concatena: si están a < 24 puntos los fusiona como título multilínea; si están más separados los une con el delimitador jerárquico ' › ' (ej. 'Capítulo 1 › Metodología'). En páginas OCR utiliza directamente clean_text.",
    inputs: "Páginas del documento con bloques depurados y textos limpios.",
    outputs: "sections.jsonl y sections.parquet con trazabilidad de párrafos, página y block_id.",
    formula: "\\text{Título Jerárquico} = \\text{Título}_{A} + \\text{\" › \"} + \\text{Título}_{B}",
    code_snippet: `class SectionBuilder:
    def build(self, document_id, pages):
        sections, state = [], {"current": None, "counter": 0}
        for page in pages:
            # combina encabezados consecutivos adyacentes o jerárquicos
            # preserva lista de párrafos con página y block_id exacto`
  },
  {
    id: 9,
    name: "9. Segmentación en Chunks con Cero Pérdida de Texto",
    class_name: "ChunkBuilder",
    file: "src/pdf_intelligence/structure.py",
    goal: "Crear fragmentos semánticos autocontenidos para la ventana de contexto de un LLM garantizando que ningún párrafo se descarte y que la paginación sea matemáticamente exacta.",
    methodology: "Empaqueta texto hacia 550 palabras (máximo 800) respetando límites de oraciones. Aplica solapamiento intrasección de 80 palabras. Si una sección tiene < 60 palabras, SE FUSIONA dentro del chunk previo registrando merged_section_ids y merged_section_titles. Crucial: page_start y page_end cubren exclusivamente las palabras propias (unique_words), no el solapamiento.",
    inputs: "Secciones estructuradas, tablas por página y etiquetas impresas.",
    outputs: "chunks.jsonl y chunks.parquet con chunk_coverage >= 0.995 garantizado.",
    formula: "\\text{chunk\\_coverage} = \\frac{\\sum \\text{unique\\_words}}{\\sum \\text{section\\_words}} \\ge 0.995",
    code_snippet: `class ChunkBuilder:
    def build(self, document_id, filename, sections, ...):
        for section in sections:
            if section_words < CHUNK_MIN_WORDS: # < 60 palabras
                absorb(chunks[-1], items, section["section_id"], section["title"])
            else:
                emit_chunks_with_overlap(section, overlap=80)`
  },
  {
    id: 10,
    name: "10. Consolidación Relacional, Índices y Auditoría Automática",
    class_name: "CorpusBuilder",
    file: "src/pdf_intelligence/corpus.py",
    goal: "Crear la infraestructura de consulta relacional y vectorial, y auditar criptográficamente la integridad de todas las entradas y salidas.",
    methodology: "Exporta Parquet con flatten_row, construye la base corpus.duckdb con índices en document_id y page_number, entrena una matriz TF-IDF de n-gramas (1,2) para búsqueda offline ultrarrápida, y opcionalmente vectores densos FAISS. Finalmente ejecuta 9 reglas automáticas de consistencia relacional y emite manifest.json con huellas SHA-256.",
    inputs: "Colección consolidada de documentos, páginas, secciones, chunks y tablas.",
    outputs: "corpus.duckdb, tfidf_*.joblib, embeddings.npy, faiss.index, manifest.json, integrity_report.json.",
    formula: "\\text{Auditoría} = \\bigwedge_{i=1}^{9} \\text{Regla}_{i} \\implies \\text{PASS} \\mid \\text{PASS\\_WITH\\_WARNINGS} \\mid \\text{FAIL}",
    code_snippet: `class CorpusBuilder:
    def process(self):
        self.export_base()      # JSONL y Parquet
        self.build_duckdb()     # corpus.duckdb
        self.build_tfidf()      # TF-IDF local sin tokens
        self.check_integrity()  # 9 controles relacionales
        self.write_manifest()   # Huellas SHA-256 de entradas y salidas`
  }
];

// Navegación entre Pestañas Principales
function switchTab(targetId) {
  if (!targetId) return;
  targetId = targetId.replace(/^#/, '');

  const tabs = document.querySelectorAll(".nav-tab");
  const panes = document.querySelectorAll(".tab-pane");
  const targetPane = document.getElementById(targetId);

  if (!targetPane) return;

  tabs.forEach(t => {
    const isTarget = t.getAttribute("data-tab") === targetId || t.getAttribute("href") === `#${targetId}`;
    t.classList.toggle("active", isTarget);
  });

  panes.forEach(p => {
    p.classList.toggle("active", p.id === targetId);
  });

  if (history.replaceState) {
    history.replaceState(null, null, `#${targetId}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute("data-tab") || (tab.getAttribute("href") ? tab.getAttribute("href").replace(/^#/, '') : null);
      if (targetId) switchTab(targetId);
    });
  });

  document.querySelectorAll("[data-switch-tab]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = el.getAttribute("data-switch-tab");
      if (targetId) switchTab(targetId);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href").replace(/^#/, '');
      if (document.getElementById(targetId)) {
        e.preventDefault();
        switchTab(targetId);
      }
    });
  });

  if (window.location.hash) {
    const initialTab = window.location.hash.replace(/^#/, '');
    if (document.getElementById(initialTab)) {
      switchTab(initialTab);
    }
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash) {
      const currentTab = window.location.hash.replace(/^#/, '');
      if (document.getElementById(currentTab)) {
        switchTab(currentTab);
      }
    }
  });
}

window.switchTab = switchTab;
window.selectPipelinePhase = selectPipelinePhase;
window.copyEvidenceSnippet = copyEvidenceSnippet;

// Configuración de las 10 Fases del Pipeline
function setupPipelinePhases() {
  const container = document.getElementById("phases-list-container");
  if (!container) return;

  container.innerHTML = PIPELINE_PHASES.map((p, idx) => `
    <div class="phase-list-item ${idx === 0 ? 'active' : ''}" data-phase-id="${p.id}" onclick="selectPipelinePhase(${p.id})">
      <div class="phase-badge">Fase ${p.id}</div>
      <div class="phase-title">${p.name}</div>
      <div class="phase-summary-text">${p.goal.substring(0, 110)}...</div>
      <span class="phase-class-pill">${p.class_name}</span>
    </div>
  `).join('');

  renderPhaseDeepDive(PIPELINE_PHASES[0]);
}

function selectPipelinePhase(id) {
  document.querySelectorAll(".phase-list-item").forEach(item => {
    item.classList.toggle("active", parseInt(item.getAttribute("data-phase-id")) === id);
  });
  const phase = PIPELINE_PHASES.find(p => p.id === id);
  if (phase) renderPhaseDeepDive(phase);
}

function renderPhaseDeepDive(phase) {
  const container = document.getElementById("phase-deepdive-container");
  if (!container) return;

  container.innerHTML = `
    <div class="deepdive-header">
      <div>
        <span class="deepdive-kicker">FASE SECUENCIAL ${phase.id} DE 10 · ARQUITECTURA TÉCNICA</span>
        <h3 class="deepdive-title">${phase.name}</h3>
      </div>
      <div class="deepdive-location">
        <code>${phase.file}</code>
      </div>
    </div>

    <div class="deepdive-section">
      <h4 class="deepdive-section-heading">🎯 Propósito Metodológico y Reto Resuelto</h4>
      <p class="deepdive-text">${phase.goal}</p>
      <p class="deepdive-text" style="margin-top:0.5rem; color:#475569;">${phase.methodology}</p>
    </div>

    <div class="grid-2 deepdive-grid">
      <div class="deepdive-box">
        <span class="deepdive-box-label">📥 ENTRADAS FORMALES</span>
        <p class="deepdive-box-content">${phase.inputs}</p>
      </div>
      <div class="deepdive-box">
        <span class="deepdive-box-label">📤 SALIDAS / ARTEFACTOS GENERADOS</span>
        <p class="deepdive-box-content">${phase.outputs}</p>
      </div>
    </div>

    <div class="deepdive-section">
      <h4 class="deepdive-section-heading">📐 Formulación Algorítmica y Heurística</h4>
      <div class="formula-box">${phase.formula}</div>
    </div>

    <div class="deepdive-section">
      <h4 class="deepdive-section-heading">💻 Implementación en Python Anotada (${phase.class_name})</h4>
      <pre><code>${phase.code_snippet}</code></pre>
    </div>
  `;
}

// Configuración del Explorador de Artefactos (100% Offline con SAMPLE_CORPUS)
function switchArtifactTab(artifact) {
  const subTabButtons = document.querySelectorAll(".artifact-sub-btn");
  subTabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-artifact") === artifact);
  });
  renderArtifactDetails(artifact);
}

function setupArtifactExplorer() {
  const subTabButtons = document.querySelectorAll(".artifact-sub-btn");
  subTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const artifact = btn.getAttribute("data-artifact");
      switchArtifactTab(artifact);
    });
  });

  renderArtifactDetails("chunks");
}

window.switchArtifactTab = switchArtifactTab;

function renderArtifactDetails(artifactName) {
  const container = document.getElementById("artifact-display-container");
  if (!container) return;

  if (artifactName === "chunks") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">chunks.parquet / chunks.jsonl — Unidad Primaria para LLMs</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Fragmentos semánticos autocontenidos de ~550 palabras con ventana de solapamiento de 80 palabras y trazabilidad dual de páginas. Sumar siempre <code>unique_words</code> para volumen léxico. Los registros mostrados abajo ilustran la estructura exacta generada al procesar cualquier PDF.
          </p>
        </div>
        <span class="badge-pill badge-pass">Cobertura esperada: ${SAMPLE_CORPUS.summary.integrity_status} (≥ 99.5%)</span>
      </div>

      ${SAMPLE_CORPUS.chunks.map(c => `
        <div class="artifact-card">
          <div class="artifact-card-header">
            <div class="meta-pills-row">
              <span class="meta-pill highlight">ID: ${c.chunk_id}</span>
              <span class="meta-pill">Doc: ${c.filename}</span>
              <span class="meta-pill">Pág. PDF: ${c.page_start}${c.page_start !== c.page_end ? '–' + c.page_end : ''}</span>
              <span class="meta-pill">Pág. Impresa: ${c.page_label_start}</span>
              <span class="meta-pill" style="color:var(--ucr-blue); font-weight:700;">Palabras únicas: ${c.unique_words}</span>
              <span class="meta-pill">Solapamiento: ${c.overlap_words}w</span>
              <span class="meta-pill badge-pass">Score Calidad: ${c.quality_score}</span>
              ${c.related_table_ids.length ? `<span class="meta-pill" style="background:#fef3c7; color:#92400e;">📊 ${c.related_table_ids.length} Tabla vinculada</span>` : ''}
              ${c.merged_section_titles.length ? `<span class="meta-pill" style="background:#e0e7ff; color:#3730a3;">🔗 Absorbió: ${c.merged_section_titles.join(', ')}</span>` : ''}
            </div>
            <button class="btn btn-outline" style="font-size:0.75rem; padding:0.3rem 0.65rem;" onclick="copyEvidenceSnippet('${c.chunk_id}')">
              📋 Copiar Bloque de Evidencia
            </button>
          </div>
          <div class="chunk-section-title">
            ${c.section_title} ${c.section_title_reliable ? '<span class="reliable-indicator">✓ Título Confiable</span>' : ''}
          </div>
          <div class="chunk-body-text">${c.text}</div>
        </div>
      `).join('')}
    `;
  } else if (artifactName === "tables") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">tables.parquet / tables.jsonl — Evidencia Cuantitativa Tabular</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Cuadrículas validadas por el clasificador heurístico. Incluyen leyenda superior (caption), representación Markdown lista para inyección en prompt y lista de registros estructurados. Estructura idéntica a la que se generará para tus tablas.
          </p>
        </div>
        <span class="badge-pill badge-pass">Muestra: ${SAMPLE_CORPUS.tables.length} Tablas</span>
      </div>

      ${SAMPLE_CORPUS.tables.map(t => `
        <div class="artifact-card">
          <div class="artifact-card-header">
            <div>
              <span class="meta-pill highlight">ID: ${t.table_id}</span>
              <span class="meta-pill">Doc: ${t.document_id}</span>
              <span class="meta-pill">Página: ${t.page_number}</span>
              <span class="meta-pill badge-pass">Confianza: ${t.table_confidence.toUpperCase()}</span>
              <span class="meta-pill">Estrategia: ${t.strategy}</span>
              <span class="meta-pill">Dimensión: ${t.rows} filas × ${t.columns} columnas</span>
            </div>
          </div>
          <div style="font-weight:700; margin:0.75rem 0 0.5rem; color:var(--primary);">
            ${t.caption || 'Tabla sin leyenda detectada'}
          </div>
          <div style="margin-bottom:1rem; overflow-x:auto;">
            ${formatMarkdownTable(t.markdown)}
          </div>
          <div>
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Markdown Crudo para Inyección en Prompt LLM:</span>
            <pre><code>${t.markdown}</code></pre>
          </div>
        </div>
      `).join('')}
    `;
  } else if (artifactName === "tables_rejected") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">tables_rejected.jsonl — Auditoría de Rejillas Descartadas</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Registro auditable de cuadrículas descartadas por representar prosa maquetada en columnas o celdas fragmentadas. Permite verificar que no se descarten tablas válidas en tus ejecuciones.
          </p>
        </div>
        <span class="badge-pill badge-warn">Muestra: ${SAMPLE_CORPUS.tables_rejected.length} Rechazo</span>
      </div>

      <table class="manual-table">
        <thead>
          <tr>
            <th>ID Rejilla</th>
            <th>Pág</th>
            <th>Estrategia</th>
            <th>Motivo Explícito de Rechazo</th>
            <th>Métricas Heurísticas Calculadas</th>
          </tr>
        </thead>
        <tbody>
          ${SAMPLE_CORPUS.tables_rejected.map(r => `
            <tr>
              <td><code>${r.table_id}</code></td>
              <td>${r.page_number}</td>
              <td><span class="meta-pill">${r.strategy}</span></td>
              <td><strong style="color:var(--danger);">${r.reject_reason}</strong></td>
              <td><span style="font-size:0.8rem;">lower_start: ${r.quality_features.lower_start_ratio} | area: ${r.quality_features.page_area_share} | fragment: ${r.quality_features.fragment_ratio}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (artifactName === "sections") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">sections.parquet / sections.jsonl — Estructura Jerárquica Documental</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Unidades temáticas lógicas completas del documento antes de la fragmentación en chunks. Conserva la procedencia exacta por bloque y página.
          </p>
        </div>
        <span class="badge-pill">Muestra: ${SAMPLE_CORPUS.sections.length} Secciones</span>
      </div>

      <table class="manual-table">
        <thead>
          <tr>
            <th>ID Sección</th>
            <th>Título Detectado</th>
            <th>Fuente</th>
            <th>Nivel</th>
            <th>Confianza</th>
            <th>Rango Páginas</th>
            <th>Total Palabras</th>
          </tr>
        </thead>
        <tbody>
          ${SAMPLE_CORPUS.sections.map(s => `
            <tr>
              <td><code>${s.section_id}</code></td>
              <td><strong>${s.title}</strong></td>
              <td><span class="meta-pill">${s.title_source}</span></td>
              <td>H${s.heading_level || 1}</td>
              <td>${(s.heading_confidence * 100).toFixed(0)}%</td>
              <td>Págs. ${s.page_start}${s.page_start !== s.page_end ? '–' + s.page_end : ''}</td>
              <td><strong>${s.word_count}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (artifactName === "pages") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">pages.parquet / pages.jsonl — Auditoría Página por Página</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Evidencia primaria física. Almacena las tres capas de texto (nativo, OCR y limpio) junto con las líneas de borde repetitivas eliminadas para garantizar trazabilidad inmutable.
          </p>
        </div>
        <span class="badge-pill badge-pass">Muestra: ${SAMPLE_CORPUS.pages.length} Páginas</span>
      </div>
      </div>

      <div class="grid-2">
        ${SAMPLE_CORPUS.pages.map(p => `
          <div class="artifact-card">
            <div class="artifact-card-header">
              <div>
                <strong style="color:var(--primary); font-size:1rem;">Página ${p.page_number} (Etiqueta Impresa: "${p.page_label}")</strong>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                  Fuente: <strong>${p.extraction_source.toUpperCase()}</strong> | Palabras: ${p.word_count}
                </div>
              </div>
              <span class="badge-pill ${p.overall_quality_score >= 0.8 ? 'badge-pass' : 'badge-warn'}">
                Calidad: ${(p.overall_quality_score * 100).toFixed(1)}%
              </span>
            </div>

            ${p.removed_edge_lines.length ? `
              <div style="background:#fef2f2; border:1px solid #fecaca; padding:0.5rem 0.75rem; border-radius:var(--radius-sm); margin-bottom:0.75rem; font-size:0.8rem; color:#991b1b;">
                <strong>✂️ Líneas de borde recortadas:</strong> ${p.removed_edge_lines.join(', ')}
              </div>
            ` : ''}

            <div>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Texto Normalizado (clean_text):</span>
              <div style="font-size:0.85rem; background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border); max-height:140px; overflow-y:auto; white-space:pre-wrap;">${p.clean_text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (artifactName === "integrity") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <h4 style="color:var(--primary); font-size:1.15rem; margin:0;">integrity_report.json — Matriz de Auditoría Relacional</h4>
            <span class="badge-pill" style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:700;">CORPUS REAL AUDITADO (V5.6)</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">
            Resultado de la verificación automática de 9 reglas de consistencia interna. Si falla alguna regla crítica en tus documentos, el estado se declara FAIL y se detiene la exportación.
          </p>
        </div>
        <span class="badge-pill badge-pass" style="font-size:0.9rem; padding:0.4rem 0.9rem;">ESTADO ESPERADO: ${SAMPLE_CORPUS.integrity_report.status}</span>
      </div>

      <table class="manual-table">
        <thead>
          <tr>
            <th>Regla de Consistencia Relacional</th>
            <th>Estado</th>
            <th>Resultado de la Verificación</th>
          </tr>
        </thead>
        <tbody>
          ${SAMPLE_CORPUS.integrity_report.checks.map(c => `
            <tr>
              <td><strong>${c.check}</strong></td>
              <td><span class="badge-pill ${c.status === 'PASS' ? 'badge-pass' : 'badge-warn'}">${c.status}</span></td>
              <td><span style="font-size:0.85rem; color:#475569;">${c.detail}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

// Convertidor de Tabla Markdown a HTML Seguro
function formatMarkdownTable(md) {
  const lines = md.trim().split('\n');
  if (lines.length < 2) return md;
  const parseRow = line => line.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return `
    <table class="manual-table" style="margin:0;">
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

// Copiar Bloque Canónico de Evidencia al Portapapeles
function copyEvidenceSnippet(chunkId) {
  const chunk = SAMPLE_CORPUS.chunks.find(c => c.chunk_id === chunkId);
  if (!chunk) return;

  let tablesSection = "";
  if (chunk.related_table_ids && chunk.related_table_ids.length) {
    const linked = SAMPLE_CORPUS.tables.filter(t => chunk.related_table_ids.includes(t.table_id));
    if (linked.length) {
      tablesSection = "\n\nTABLAS ASOCIADAS:\n" + linked.map(t => `${t.caption || 'Tabla'}:\n${t.markdown}`).join('\n\n');
    }
  }

  const promptBlock = `[BLOQUE DE EVIDENCIA PRIMARIA — CIOdD-UCR V5.6]
ID de Evidencia: ${chunk.chunk_id}
Documento: ${chunk.filename} (${chunk.document_id})
Sección: ${chunk.section_title} (Título Confiable: ${chunk.section_title_reliable ? 'Sí' : 'No'})
Ubicación: Páginas PDF ${chunk.page_start}${chunk.page_start !== chunk.page_end ? ' a ' + chunk.page_end : ''} (Etiqueta Impresa: ${chunk.page_label_start})
Puntuación de Calidad Técnica: ${chunk.quality_score}

CONTENIDO:
${chunk.text}${tablesSection}
[FIN DE BLOQUE DE EVIDENCIA]`;

  navigator.clipboard.writeText(promptBlock).then(() => {
    showNotice(`✓ Bloque de evidencia para ${chunkId} copiado al portapapeles`);
  });
}

function showNotice(msg) {
  const toast = document.getElementById("toast-alert");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}


// ==========================================================================
// HISTORIAL DE CAMBIOS & BENCHMARK FORENSE (V5.2 -> V5.6)
// ==========================================================================

const BENCHMARK_DATA = [
  {
    name: "Corpus Consolidado (4 Documentos)",
    pages: 257,
    v53: { words: 85378, chunks: 200, tables_acc: 9, tables_rej: 254, coverage: "PASS (1.000)", status: "PASS", note: "Falsos positivos de tablas (9 aceptadas)" },
    v54: { words: 85378, chunks: 200, tables_acc: 4, tables_rej: 264, coverage: "PASS (1.000)", status: "PASS", note: "Filtro de prosa (table_lines_max_area=0.85)" },
    v55: { words: 75361, chunks: 171, tables_acc: 1, tables_rej: 227, coverage: "FAIL (Pérdida 10.017 palabras)", status: "FAIL", note: "Bug crítico is_numbered aborta extracción" },
    v56: { words: 85378, chunks: 200, tables_acc: 2, tables_rej: 266, coverage: "PASS (1.0000 · 100%)", status: "PASS", note: "Fix is_numbered + table_min_area=0.03 + clean_title" }
  },
  {
    name: "Paris Peace Forum / INTAiC (file_33C69...pdf)",
    pages: 21,
    v53: { words: 8349, chunks: 29, tables_acc: 4, tables_rej: 30, coverage: "PASS (1.000)", status: "PASS", note: "Prosa justificada aceptada como tablas" },
    v54: { words: 8349, chunks: 29, tables_acc: 4, tables_rej: 34, coverage: "PASS (1.000)", status: "PASS", note: "Control de páginas completas" },
    v55: { words: 995, chunks: 7, tables_acc: 1, tables_rej: 25, coverage: "FAIL (Pérdida del 88.1% de texto)", status: "FAIL", note: "Fallo silencioso UnboundLocalError en headings" },
    v56: { words: 8349, chunks: 29, tables_acc: 2, tables_rej: 36, coverage: "PASS (1.0000 · 100%)", status: "PASS", note: "100% rescatado. 2 tablas reales, 2 microtablas descartadas" }
  },
  {
    name: "Anthropic 2026 Public Benefit Report",
    pages: 20,
    v53: { words: 6750, chunks: 16, tables_acc: 0, tables_rej: 20, coverage: "PASS (1.000)", status: "PASS", note: "Concatenación excesiva de títulos + subtítulos" },
    v54: { words: 6750, chunks: 16, tables_acc: 0, tables_rej: 20, coverage: "PASS (1.000)", status: "PASS", note: "Títulos extensos ('Pillar 1 ...')" },
    v55: { words: 5218, chunks: 13, tables_acc: 0, tables_rej: 18, coverage: "FAIL (Pérdida del 22.7% de texto)", status: "FAIL", note: "Páginas abortadas por bug en detector" },
    v56: { words: 6750, chunks: 16, tables_acc: 0, tables_rej: 20, coverage: "PASS (1.0000 · 100%)", status: "PASS", note: "Fusión controlada (máx 2 títulos cortos). 100% texto." }
  },
  {
    name: "SAFE AI Foundation — AI Safety Model (AISM)",
    pages: 22,
    v53: { words: 5693, chunks: 18, tables_acc: 0, tables_rej: 21, coverage: "PASS (1.000)", status: "PASS", note: "Títulos contaminados con carácter de caja ▒" },
    v54: { words: 5693, chunks: 18, tables_acc: 0, tables_rej: 21, coverage: "PASS (1.000)", status: "PASS", note: "Ruido tipográfico presente ('1 ▒ Introducing...')" },
    v55: { words: 4844, chunks: 15, tables_acc: 0, tables_rej: 19, coverage: "FAIL (Pérdida del 14.9% de texto)", status: "FAIL", note: "Páginas con títulos numerados afectadas" },
    v56: { words: 5693, chunks: 18, tables_acc: 0, tables_rej: 21, coverage: "PASS (1.0000 · 100%)", status: "PASS", note: "clean_title() remueve ▒ y ■. 100% texto recuperado." }
  },
  {
    name: "La era de la IA y nuestro futuro (Libro / Ensayo)",
    pages: 194,
    v53: { words: 64586, chunks: 137, tables_acc: 0, tables_rej: 189, coverage: "PASS (1.000)", status: "PASS", note: "3 páginas OCR condicionadas" },
    v54: { words: 64586, chunks: 137, tables_acc: 0, tables_rej: 189, coverage: "PASS (1.000)", status: "PASS", note: "Estable en texto continuo" },
    v55: { words: 64304, chunks: 136, tables_acc: 0, tables_rej: 188, coverage: "FAIL (Pérdida de 282 palabras)", status: "FAIL", note: "Afectación en encabezados puntuales" },
    v56: { words: 64586, chunks: 137, tables_acc: 0, tables_rej: 189, coverage: "PASS (1.0000 · 100%)", status: "PASS", note: "194 páginas integradas sin pérdida." }
  }
];

function selectBenchmarkDoc(index) {
  const buttons = document.querySelectorAll('.benchmark-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  const doc = BENCHMARK_DATA[index];
  if (!doc) return;

  const cardsContainer = document.getElementById('benchmark-metric-cards-container');
  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div class="benchmark-card">
        <div class="benchmark-card-val">${doc.pages}</div>
        <div class="benchmark-card-lbl">Páginas Físicas</div>
      </div>
      <div class="benchmark-card">
        <div class="benchmark-card-val ${doc.v55.status === 'FAIL' ? 'loss' : ''}">${doc.v55.words.toLocaleString()}</div>
        <div class="benchmark-card-lbl">Palabras V5.5 (Con Bug)</div>
      </div>
      <div class="benchmark-card">
        <div class="benchmark-card-val recovered">${doc.v56.words.toLocaleString()}</div>
        <div class="benchmark-card-lbl">Palabras V5.6 (Rescatadas)</div>
      </div>
      <div class="benchmark-card">
        <div class="benchmark-card-val">${doc.v56.chunks}</div>
        <div class="benchmark-card-lbl">Chunks RAG (V5.6)</div>
      </div>
      <div class="benchmark-card">
        <div class="benchmark-card-val" style="color:var(--ucr-blue);">${doc.v56.tables_acc} / ${doc.v56.tables_rej}</div>
        <div class="benchmark-card-lbl">Tablas: Aceptadas / Rechazadas</div>
      </div>
    `;
  }

  const tableContainer = document.getElementById('benchmark-table-display');
  if (tableContainer) {
    tableContainer.innerHTML = `
      <thead>
        <tr>
          <th>Versión del Pipeline</th>
          <th>Palabras Totales</th>
          <th>Chunks RAG</th>
          <th>Tablas Aceptadas</th>
          <th>Tablas Rechazadas</th>
          <th>Garantía de Cobertura</th>
          <th>Comportamiento Heurístico / Diagnóstico</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="v-badge v-badge-cloud">V5.3 (Colab)</span></td>
          <td><strong>${doc.v53.words.toLocaleString()}</strong></td>
          <td>${doc.v53.chunks}</td>
          <td><strong style="color:var(--danger);">${doc.v53.tables_acc}</strong></td>
          <td>${doc.v53.tables_rej}</td>
          <td><span class="badge-pill badge-pass">${doc.v53.coverage}</span></td>
          <td><span style="font-size:0.85rem; color:#475569;">${doc.v53.note}</span></td>
        </tr>
        <tr>
          <td><span class="v-badge v-badge-cloud">V5.4 (Tablas)</span></td>
          <td><strong>${doc.v54.words.toLocaleString()}</strong></td>
          <td>${doc.v54.chunks}</td>
          <td><strong>${doc.v54.tables_acc}</strong></td>
          <td>${doc.v54.tables_rej}</td>
          <td><span class="badge-pill badge-pass">${doc.v54.coverage}</span></td>
          <td><span style="font-size:0.85rem; color:#475569;">${doc.v54.note}</span></td>
        </tr>
        <tr style="background:#fef2f2;">
          <td><span class="v-badge v-badge-bug">V5.5 (Bug)</span></td>
          <td><strong style="color:var(--danger);">${doc.v55.words.toLocaleString()}</strong></td>
          <td><strong style="color:var(--danger);">${doc.v55.chunks}</strong></td>
          <td>${doc.v55.tables_acc}</td>
          <td>${doc.v55.tables_rej}</td>
          <td><span class="badge-pill badge-warn">${doc.v55.coverage}</span></td>
          <td><span style="font-size:0.85rem; color:#991b1b; font-weight:600;">${doc.v55.note}</span></td>
        </tr>
        <tr style="background:#f0fdf4;">
          <td><span class="v-badge v-badge-stable">V5.6 (Estable)</span></td>
          <td><strong style="color:var(--success);">${doc.v56.words.toLocaleString()}</strong></td>
          <td><strong>${doc.v56.chunks}</strong></td>
          <td><strong style="color:var(--success);">${doc.v56.tables_acc}</strong></td>
          <td><strong>${doc.v56.tables_rej}</strong></td>
          <td><span class="badge-pill badge-pass">${doc.v56.coverage}</span></td>
          <td><span style="font-size:0.85rem; color:#166534; font-weight:600;">${doc.v56.note}</span></td>
        </tr>
      </tbody>
    `;
  }
}

window.selectBenchmarkDoc = selectBenchmarkDoc;

// Inicialización de la Aplicación (Garantizada tanto en DOMContentLoaded como si el DOM ya cargó)
function initApp() {
  setupNavigation();
  setupPipelinePhases();
  setupArtifactExplorer();
  selectBenchmarkDoc(0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

