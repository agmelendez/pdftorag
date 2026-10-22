/**
 * CIOdD-UCR PDF Intelligence Pipeline V5.2
 * Manual Técnico de Alto Nivel y Portal Metodológico Interactivo
 * 
 * Nota: Los datos de muestra están embebidos directamente para garantizar funcionamiento
 * 100% offline y compatible con el protocolo file:/// sin bloqueos de CORS.
 */

// Corpus de Demostración Embebido Directamente (Zero CORS Dependencies)
const SAMPLE_CORPUS = {
  summary: {
    pipeline_version: "5.2",
    schema_version: "5.2.0",
    total_documents: 2,
    total_pages: 24,
    total_sections: 18,
    total_chunks: 42,
    total_tables: 6,
    total_tables_rejected: 4,
    average_quality: 0.884,
    integrity_status: "PASS"
  },
  documents: [
    {
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      sha256: "8f3a91b2c4e57d018b4e7239a01f92e457cb1d0923e4f71a098bcda4923e8172",
      inferred_title: "Inteligencia Artificial y Desarrollo Cognitivo en la Niñez: Oportunidades y Riesgos Éticos en Costa Rica",
      title_source: "largest_font_cover",
      year_candidates: ["2026", "2025"],
      document_language: "es",
      profile_type: "digital",
      profile_type_observed: "digital",
      page_count: 16,
      extracted_pages: 16,
      total_words: 8450,
      total_tables: 4,
      tables_rejected: 2,
      total_sections: 11,
      sections_with_detected_title: 9,
      total_chunks: 26,
      ocr_pages: 0,
      low_text_pages: 1,
      chunk_coverage: 0.9982,
      average_quality: 0.892,
      average_extraction_quality: 0.941
    },
    {
      document_id: "doc_e12b489c77da31fa",
      filename: "Marco_Regulatorio_Gobernanza_Algoritmica_UCR.pdf",
      sha256: "e12b489c77da31fa4358a912c980debc49a71239bcda018274efbca928374182",
      inferred_title: "Marco Regulatorio para la Gobernanza Algorítmica y la Protección de Datos en el Sector Público",
      title_source: "pdf_metadata",
      year_candidates: ["2026", "2024"],
      document_language: "es",
      profile_type: "hybrid",
      profile_type_observed: "hybrid",
      page_count: 8,
      extracted_pages: 8,
      total_words: 4120,
      total_tables: 2,
      tables_rejected: 2,
      total_sections: 7,
      sections_with_detected_title: 6,
      total_chunks: 16,
      ocr_pages: 1,
      low_text_pages: 0,
      chunk_coverage: 0.9965,
      average_quality: 0.871,
      average_extraction_quality: 0.915
    }
  ],
  chunks: [
    {
      chunk_id: "doc_8f3a91b2c4e57d01_C00001",
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      section_id: "doc_8f3a91b2c4e57d01_S0001",
      section_title: "1. Resumen Ejecutivo y Alcance del Estudio",
      section_title_source: "detected",
      section_title_reliable: true,
      merged_section_ids: [],
      merged_section_titles: [],
      short_section: false,
      text: "El Observatorio del Desarrollo (CIOdD) de la Universidad de Costa Rica presenta esta investigación integral sobre el impacto de los sistemas generativos de inteligencia artificial en el entorno escolar costarricense. El estudio analizó una muestra representativa de 45 centros educativos en las siete provincias del país durante el primer semestre de 2026.\n\nLos hallazgos revelan que el 68% de los docentes incorpora herramientas basadas en LLMs para la preparación didáctica, mientras que el 42% del estudiantado de secundaria emplea agentes conversacionales como tutores extracurriculares. Sin embargo, persisten brechas críticas en alfabetización algorítmica y privacidad de datos sensibles.",
      overlap_words: 0,
      unique_words: 105,
      word_count: 105,
      page_start: 2,
      page_end: 2,
      page_label_start: "ii",
      page_label_end: "ii",
      related_table_ids: ["tbl_08f91a2bc41029aa"],
      quality_score: 0.9125,
      language: "es",
      text_sha256: "1a8b92c4e5781a029384756bcdae01928374650192837465abcdae0192837465"
    },
    {
      chunk_id: "doc_8f3a91b2c4e57d01_C00002",
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      section_id: "doc_8f3a91b2c4e57d01_S0002",
      section_title: "2. Marco Metodológico y Muestreo Territorial",
      section_title_source: "detected",
      section_title_reliable: true,
      merged_section_ids: [],
      merged_section_titles: [],
      short_section: false,
      text: "Sin embargo, persisten brechas críticas en alfabetización algorítmica y privacidad de datos sensibles.\n\nLa recolección de datos primarios se estructuró mediante un diseño cuasi-experimental estratificado por región socioeconómica (Central, Chorotega, Pacífico Central, Brunca, Huetar Caribe y Huetar Norte). Se aplicaron 1.250 cuestionarios estructurados y 35 entrevistas en profundidad con comités pedagógicos locales.\n\nLa evaluación psicométrica de interacción humano-IA consideró tres variables dependientes: retención conceptual a largo plazo, pensamiento crítico analítico y autonomía resolutiva frente a problemas no estructurados.",
      overlap_words: 15,
      unique_words: 82,
      word_count: 97,
      page_start: 3,
      page_end: 4,
      page_label_start: "1",
      page_label_end: "2",
      related_table_ids: ["tbl_8f3a91b2_cuadro1"],
      quality_score: 0.895,
      language: "es",
      text_sha256: "4b7e8912c980debc49a71239bcda018274efbca928374182901a8b92c4e5781a"
    },
    {
      chunk_id: "doc_8f3a91b2c4e57d01_C00003",
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      section_id: "doc_8f3a91b2c4e57d01_S0003",
      section_title: "3. Recomendaciones Regulatorias y Políticas Públicas",
      section_title_source: "detected",
      section_title_reliable: true,
      merged_section_ids: ["doc_8f3a91b2c4e57d01_S0004"],
      merged_section_titles: ["Nota Técnica sobre Consentimiento Informado"],
      short_section: false,
      text: "Se formula una propuesta de política institucional para regular el despliegue de sistemas de recomendación y tutores sintéticos en el aula pública. Es perentorio establecer protocolos de auditoría de sesgos algorítmicos cada seis meses y prohibir explícitamente el perfilamiento psicométrico de menores con fines publicitarios o comerciales.\n\nNota Técnica sobre Consentimiento Informado: Todo tratamiento de metadatos de voz, patrones de escritura o métricas biométricas infantiles requerirá autorización expresa de los tutores legales bajo el principio de proporcionalidad de la Ley 8968.",
      overlap_words: 0,
      unique_words: 86,
      word_count: 86,
      page_start: 8,
      page_end: 8,
      page_label_start: "6",
      page_label_end: "6",
      related_table_ids: [],
      quality_score: 0.942,
      language: "es",
      text_sha256: "77da31fa4358a912c980debc49a71239bcda018274efbca928374182901a8b92"
    }
  ],
  tables: [
    {
      table_id: "tbl_08f91a2bc41029aa",
      document_id: "doc_8f3a91b2c4e57d01",
      page_number": 2,
      strategy: "lines",
      bbox: [72.0, 310.5, 520.0, 480.0],
      rows: 3,
      columns: 4,
      table_confidence: "high",
      caption: "Tabla 1. Distribución porcentual de uso de herramientas LLM en docentes por región",
      quality_features: {
        filled_ratio: 0.92,
        fragment_ratio: 0.05,
        lower_start_ratio: 0.08,
        avg_words_per_cell: 2.8,
        page_area_share: 0.18
      },
      markdown: "| Región Educativa | Docentes que usan LLM (%) | Frecuencia Semanal Promedio | Nivel de Capacitación Formal (%) |\n|---|---|---|---|\n| Central Occidental | 74.2% | 4.8 días | 28.5% |\n| Huetar Norte | 58.1% | 2.9 días | 14.2% |\n| Chorotega | 63.4% | 3.5 días | 19.8% |",
      headers: ["Región Educativa", "Docentes que usan LLM (%)", "Frecuencia Semanal Promedio", "Nivel de Capacitación Formal (%)"]
    },
    {
      table_id: "tbl_8f3a91b2_cuadro1",
      document_id: "doc_8f3a91b2c4e57d01",
      page_number": 4,
      strategy: "lines",
      bbox: [72.0, 180.0, 520.0, 320.0],
      rows: 2,
      columns: 3,
      table_confidence: "high",
      caption: "Cuadro 2. Dimensiones psicométricas evaluadas en cohortes escolares",
      quality_features: {
        filled_ratio: 1.0,
        fragment_ratio: 0.0,
        lower_start_ratio: 0.0,
        avg_words_per_cell: 4.1,
        page_area_share: 0.14
      },
      markdown: "| Dimensión Cognitiva | Instrumento de Medición | Confiabilidad Alpha de Cronbach |\n|---|---|---|\n| Retención Conceptual | Batería CIOdD-Test V2 | α = 0.89 |\n| Pensamiento Crítico | Escala Watson-Glaser Adaptada | α = 0.92 |",
      headers: ["Dimensión Cognitiva", "Instrumento de Medición", "Confiabilidad Alpha de Cronbach"]
    }
  ],
  tables_rejected: [
    {
      table_id: "tbl_rej_00192837",
      document_id: "doc_8f3a91b2c4e57d01",
      page_number": 6,
      strategy: "text",
      bbox: [54.0, 120.0, 540.0, 720.0],
      reject_reason: "ocupa casi toda la página (prosa en 2 columnas, no tabla numérica)",
      table_confidence: "low",
      quality_features: {
        filled_ratio: 0.65,
        fragment_ratio: 0.28,
        lower_start_ratio: 0.42,
        avg_words_per_cell: 11.4,
        page_area_share: 0.74
      }
    }
  ],
  sections: [
    {
      section_id: "doc_8f3a91b2c4e57d01_S0001",
      document_id: "doc_8f3a91b2c4e57d01",
      title: "1. Resumen Ejecutivo y Alcance del Estudio",
      section_title: "1. Resumen Ejecutivo y Alcance del Estudio",
      title_source: "detected",
      heading_confidence: 0.95,
      heading_level: 1,
      page_start: 2,
      page_end: 2,
      word_count: 105,
      paragraph_count: 2,
      language: "es"
    },
    {
      section_id: "doc_8f3a91b2c4e57d01_S0002",
      document_id: "doc_8f3a91b2c4e57d01",
      title: "2. Marco Metodológico y Muestreo Territorial",
      section_title: "2. Marco Metodológico y Muestreo Territorial",
      title_source: "detected",
      heading_confidence: 0.92,
      heading_level: 1,
      page_start: 3,
      page_end: 4,
      word_count: 82,
      paragraph_count: 2,
      language: "es"
    },
    {
      section_id: "doc_8f3a91b2c4e57d01_S0003",
      document_id: "doc_8f3a91b2c4e57d01",
      title: "3. Recomendaciones Regulatorias y Políticas Públicas",
      section_title: "3. Recomendaciones Regulatorias y Políticas Públicas",
      title_source: "detected",
      heading_confidence: 0.88,
      heading_level: 1,
      page_start: 8,
      page_end: 8,
      word_count: 52,
      paragraph_count: 1,
      language: "es"
    },
    {
      section_id: "doc_8f3a91b2c4e57d01_S0004",
      document_id: "doc_8f3a91b2c4e57d01",
      title: "Nota Técnica sobre Consentimiento Informado",
      section_title: "Nota Técnica sobre Consentimiento Informado",
      title_source: "detected",
      heading_confidence: 0.72,
      heading_level: 3,
      page_start: 8,
      page_end: 8,
      word_count: 34,
      paragraph_count: 1,
      language: "es"
    }
  ],
  pages: [
    {
      page_id: "doc_8f3a91b2c4e57d01_P00001",
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      page_number: 1,
      page_label: "i",
      width: 612.0,
      height: 792.0,
      extraction_source: "native",
      ocr_applied: false,
      word_count: 32,
      page_flags: ["low_text"],
      removed_edge_lines: [],
      extraction_quality_score: 0.94,
      overall_quality_score: 0.76,
      clean_text: "UNIVERSIDAD DE COSTA RICA\nCENTRO DE INVESTIGACIÓN OBSERVATORIO DEL DESARROLLO (CIOdD)\n\nINTELIGENCIA ARTIFICIAL Y DESARROLLO COGNITIVO EN LA NIÑEZ\nSan José, Costa Rica — 2026"
    },
    {
      page_id: "doc_8f3a91b2c4e57d01_P00002",
      document_id: "doc_8f3a91b2c4e57d01",
      filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf",
      page_number: 2,
      page_label: "ii",
      width: 612.0,
      height: 792.0,
      extraction_source: "native",
      ocr_applied: false,
      word_count: 145,
      page_flags: [],
      removed_edge_lines: ["CIOdD-UCR — INFORME TÉCNICO 2026"],
      extraction_quality_score: 0.96,
      overall_quality_score: 0.92,
      clean_text: "1. Resumen Ejecutivo y Alcance del Estudio\nEl Observatorio del Desarrollo (CIOdD) de la Universidad de Costa Rica presenta esta investigación integral sobre el impacto de los sistemas generativos de inteligencia artificial en el entorno escolar costarricense. El estudio analizó una muestra representativa de 45 centros educativos en las siete provincias del país durante el primer semestre de 2026."
    }
  ],
  integrity_report: {
    generated_at: "2026-10-22T08:00:00Z",
    status: "PASS",
    checks: [
      { check: "ids únicos (documents/pages/sections/chunks/tables)", status: "PASS", detail: "0 duplicados detectados" },
      { check: "páginas extraídas == page_count del PDF", status: "PASS", detail: "100% de páginas físicas extraídas" },
      { check: "rango de páginas de chunks válido", status: "PASS", detail: "Todos los rangos contenidos en [1, page_count]" },
      { check: "chunks apuntan a secciones existentes", status: "PASS", detail: "Integridad referencial completa" },
      { check: "todo documento tiene chunks", status: "PASS", detail: "Ningún documento vacío" },
      { check: "cobertura de texto en chunks >= 0.995", status: "PASS", detail: "chunk_coverage promedio: 0.9974" },
      { check: "páginas con texto sin ningún chunk", status: "PASS", detail: "0 páginas huérfanas con texto" },
      { check: "chunks idénticos entre documentos distintos", status: "PASS", detail: "0 colisiones SHA-256 inter-documento" },
      { check: "páginas con texto escaso/OCR dudoso", status: "PASS", detail: "0 páginas marcadas para revisión humana obligatoria" }
    ]
  }
};

// Las 10 Fases Metodológicas y Técnicas Detalladas
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

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupPipelinePhases();
  setupArtifactExplorer();
});

// Navegación entre Pestañas Principales
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
      const activePane = document.getElementById(targetId);
      if (activePane) activePane.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

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
function setupArtifactExplorer() {
  const subTabButtons = document.querySelectorAll(".artifact-sub-btn");
  subTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      subTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const artifact = btn.getAttribute("data-artifact");
      renderArtifactDetails(artifact);
    });
  });

  renderArtifactDetails("chunks");
}

function renderArtifactDetails(artifactName) {
  const container = document.getElementById("artifact-display-container");
  if (!container) return;

  if (artifactName === "chunks") {
    container.innerHTML = `
      <div class="artifact-intro-box">
        <div>
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">chunks.parquet / chunks.jsonl — Unidad Primaria para LLMs</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Fragmentos semánticos autocontenidos de ~550 palabras con ventana de solapamiento de 80 palabras y trazabilidad dual de páginas. Sumar siempre <code>unique_words</code> para volumen léxico.
          </p>
        </div>
        <span class="badge-pill badge-pass">Cobertura: ${SAMPLE_CORPUS.summary.integrity_status} (≥ 99.5%)</span>
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
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">tables.parquet / tables.jsonl — Evidencia Cuantitativa Tabular</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Cuadrículas validadas por el clasificador heurístico. Incluyen leyenda superior (caption), representación Markdown lista para inyección en prompt y lista de registros estructurados.
          </p>
        </div>
        <span class="badge-pill badge-pass">Tablas Aceptadas: ${SAMPLE_CORPUS.tables.length}</span>
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
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">tables_rejected.jsonl — Auditoría de Rejillas Descartadas</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Registro auditable de cuadrículas descartadas por representar prosa maquetada en columnas o celdas fragmentadas. Permite verificar que no se descarten tablas válidas.
          </p>
        </div>
        <span class="badge-pill badge-warn">Rejillas Rechazadas: ${SAMPLE_CORPUS.tables_rejected.length}</span>
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
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">sections.parquet / sections.jsonl — Estructura Jerárquica Documental</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Unidades temáticas lógicas completas del documento antes de la fragmentación en chunks. Conserva la procedencia exacta por bloque y página.
          </p>
        </div>
        <span class="badge-pill">Total Secciones: ${SAMPLE_CORPUS.sections.length}</span>
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
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">pages.parquet / pages.jsonl — Auditoría Página por Página</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Evidencia primaria física. Almacena las tres capas de texto (nativo, OCR y limpio) junto con las líneas de borde repetitivas eliminadas para garantizar trazabilidad inmutable.
          </p>
        </div>
        <span class="badge-pill badge-pass">Páginas Auditadas: ${SAMPLE_CORPUS.pages.length}</span>
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
          <h4 style="color:var(--primary); font-size:1.15rem; margin-bottom:0.25rem;">integrity_report.json — Matriz de Auditoría Relacional</h4>
          <p style="font-size:0.875rem; color:var(--text-muted);">
            Resultado de la verificación automática de 9 reglas de consistencia interna. Si falla alguna regla crítica, el estado se declara FAIL.
          </p>
        </div>
        <span class="badge-pill badge-pass" style="font-size:0.9rem; padding:0.4rem 0.9rem;">ESTADO: ${SAMPLE_CORPUS.integrity_report.status}</span>
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

  const promptBlock = `[BLOQUE DE EVIDENCIA PRIMARIA — CIOdD-UCR V5.2]
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
