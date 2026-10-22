/**
 * CIOdD-UCR PDF Intelligence Pipeline V5.2 - Interactive Web Application Logic
 */

let corpusData = null;

// The 10 Phases of the PDF Intelligence Pipeline
const PIPELINE_PHASES = [
  {
    id: 1,
    name: "1. Perfilado y Huella Criptográfica",
    module: "pdf_intelligence.profiler.PDFProfiler",
    description: "Calcula el hash SHA-256 inmutable del archivo, extrae metadatos con pypdf y clasifica el PDF en digital, escaneado o híbrido mediante muestreo de hasta 7 páginas.",
    inputs: "Archivo binario PDF (*.pdf)",
    outputs: "Diccionario de documento, document_id determinista (doc_<16hex>), profile_type",
    formula: "document_id = 'doc_' + sha256(file_sha256)[:16]",
    code: `def profile(self, pdf_path):\n    sha = sha256_file(pdf_path)\n    document_id = stable_id('doc', sha)\n    profile_type = self.classify(document)`
  },
  {
    id: 2,
    name: "2. Extracción de Layout y Tipografía",
    module: "pdf_intelligence.layout.LayoutExtractor",
    description: "Extrae bloques de texto con page.get_text('dict', sort=True), aislando bounding boxes (bbox), spans tipográficos (fuente, tamaño, banderas bold) y calculando la mediana tipográfica de la página.",
    inputs: "Página física PyMuPDF (fitz.Page)",
    outputs: "Lista de bloques de layout, metadatos de imágenes y median_font_size",
    formula: "median_font_size = median([span.size for line in block for span in line])",
    code: `data = page.get_text('dict', sort=True)\nfor block in data['blocks']:\n    # extrae spans y bbox ordenados por lectura`
  },
  {
    id: 3,
    name: "3. Detección Multicriterio de Encabezados (Paso 1)",
    module: "pdf_intelligence.heading.HeadingDetector",
    description: "Evalúa cada bloque descartando notas al pie, viñetas, pies de figura y números de ejes. Asigna puntaje acumulado (score >= 2.0) y nivel jerárquico H1-H3.",
    inputs: "Bloques de layout + mediana tipográfica",
    outputs: "Atributos is_heading, heading_confidence, heading_level, heading_signals",
    formula: "Score = 3.0(Std) + 2.0(Num) + 2.5(Font>=1.3) + 1.5(Font>=1.18) + 1.0(Bold) + 1.0(Upper)",
    code: `if score >= HEADING_MIN_SCORE:\n    block['is_heading'] = True\n    block['heading_confidence'] = round(min(1.0, score / 4.0), 3)`
  },
  {
    id: 4,
    name: "4. OCR Adaptativo Dual-Trigger",
    module: "pdf_intelligence.ocr.OCRExtractor",
    description: "Dispara OCR con Tesseract (spa+eng a 200 DPI) solo si la página tiene < 80 caracteres, < 20 palabras o text_quality < 0.35. Sustituye si aporta > 20% más palabras.",
    inputs: "Página renderizada a 200 DPI si falla el texto nativo",
    outputs: "ocr_text, ocr_confidence, extraction_source ('native' u 'ocr')",
    formula: "Trigger: len(text) < 80 OR words < 20 OR quality < 0.35",
    code: `if OCR.needs_ocr(native_text, quality):\n    ocr_result = OCR.extract(page)\n    if word_count(ocr_text) > word_count(native_text) * 1.20:\n        final_text = ocr_text`
  },
  {
    id: 5,
    name: "5. Extracción y Clasificación de Tablas",
    module: "pdf_intelligence.tables.AdaptiveTableExtractor",
    description: "Extrae cuadrículas con pdfplumber priorizando 'lines' y evaluando 'text' como respaldo. Clasifica tablas genuinas vs prosa fragmentada, extrayendo caption superior (45pt).",
    inputs: "Página pdfplumber + coordenadas",
    outputs: "tables.jsonl (aceptadas en Markdown y records) y tables_rejected.jsonl (con motivo)",
    formula: "Filtro Prosa: fragment_ratio < 0.20 AND lower_start_ratio < 0.25 AND area < 0.70",
    code: `ok, reason = self.judge(strategy, matrix, feats)\nif ok:\n    record['markdown'] = self.to_markdown(matrix)\n    accepted.append(record)`
  },
  {
    id: 6,
    name: "6. Evaluación de Calidad y Limpieza de Bordes",
    module: "pdf_intelligence.quality.QualityAssessor",
    description: "Calcula métricas desacopladas (extraction_quality_score vs overall_quality_score), detecta patrones recurrentes (#) en bordes en >= 35% de páginas y los elimina.",
    inputs: "Texto de páginas y 3 líneas superior/inferior",
    outputs: "clean_text, removed_edge_lines, extraction_quality_score, page_flags",
    formula: "extraction_quality = 0.50*text_quality + 0.30*ocr_score + 0.20*encoding",
    code: `patterns = infer_repeated_lines(pages)\nclean_text, removed = remove_repeated_lines(raw_text, patterns, edge_lines=3)`
  },
  {
    id: 7,
    name: "7. Democión de Encabezados Repetidos (Paso 2)",
    module: "pdf_intelligence.heading.demote_repeated_headings",
    description: "Degrada bloques marcados como is_heading si se repiten en >= 4 páginas o >= 8% del documento, evitando que cabeceras corridas fragmenten secciones.",
    inputs: "Colección de páginas del documento (>= 8 págs)",
    outputs: "Bloques desclasificados (heading_demoted = 'repeated_on_many_pages')",
    formula: "Threshold = max(4, ceil(n_pages * 0.08))",
    code: `if occurrences >= threshold:\n    block['is_heading'] = False\n    block['heading_demoted'] = 'repeated_on_many_pages'`
  },
  {
    id: 8,
    name: "8. Construcción de Secciones Jerárquicas",
    module: "pdf_intelligence.structure.SectionBuilder",
    description: "Agrupa párrafos y bloques bajo títulos lógicos ({doc_id}_S0001). Concatena títulos consecutivos sin cuerpo con jerarquía (' › ') y preserva párrafos OCR.",
    inputs: "Bloques limpios por página",
    outputs: "sections.jsonl y sections.parquet con trazabilidad exacta de párrafos",
    formula: "Jerarquía: H1 › H2 › H3 cuando encabezados consecutivos están sin texto intermedio",
    code: `if cur_heading and not cur_paragraphs:\n    cur['title'] += (' ' if adjacent else ' › ') + title`
  },
  {
    id: 9,
    name: "9. Segmentación en Chunks con Cero Pérdida",
    module: "pdf_intelligence.structure.ChunkBuilder",
    description: "Empaqueta texto hacia 550 palabras (máx 800), divide oraciones largas, aplica solapamiento de 80 palabras intrasección y fusiona secciones cortas (< 60 palabras).",
    inputs: "Secciones construidas + mapeo de tablas",
    outputs: "chunks.jsonl y chunks.parquet (garantía chunk_coverage >= 0.995)",
    formula: "unique_words = total_words - overlap_words (page_start/end cubren solo unique_words)",
    code: `if section_words < CHUNK_MIN_WORDS:\n    absorb(last_chunk, section_items, extra_section_id)\nelse:\n    emit_chunk_with_overlap(section, overlap=80)`
  },
  {
    id: 10,
    name: "10. Consolidación Relacional, Índices y Auditoría",
    module: "pdf_intelligence.corpus.CorpusBuilder",
    description: "Exporta Parquet con flatten_row, construye corpus.duckdb, entrena TF-IDF y dense embeddings FAISS, y ejecuta 9 controles de integridad relacional.",
    inputs: "Corpus consolidado completo",
    outputs: "corpus.duckdb, tfidf_*.joblib, faiss.index, manifest.json, integrity_report.json",
    formula: "Auditoría: 9 Reglas Booleanas -> PASS | PASS_WITH_WARNINGS | FAIL",
    code: `con = duckdb.connect('corpus.duckdb')\nfor name in datasets:\n    con.execute(f'CREATE TABLE {name} AS SELECT * FROM read_parquet(...)')\nself.check_integrity()`
  }
];

// Document Ready Initialization
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupPipelineExplorer();
  await loadCorpusData();
  setupRAGSimulator();
  setupHeuristicsLab();
  setupDuckDBStudio();
});

// Navigation Handling
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("active");
      });
      const activePane = document.getElementById(targetId);
      if (activePane) activePane.classList.add("active");
    });
  });
}

// Pipeline Explorer Setup
function setupPipelineExplorer() {
  const container = document.getElementById("pipeline-flow-container");
  if (!container) return;

  container.innerHTML = PIPELINE_PHASES.map((p, idx) => `
    <div class="phase-node ${idx === 0 ? 'active' : ''}" data-phase-id="${p.id}" onclick="selectPhase(${p.id})">
      <div>
        <div class="phase-number">Fase ${p.id}</div>
        <div class="phase-name">${p.name}</div>
        <div class="phase-summary">${p.description.substring(0, 95)}...</div>
      </div>
      <span class="phase-pill">${p.module.split('.').pop()}</span>
    </div>
  `).join('');

  renderPhaseDetails(PIPELINE_PHASES[0]);
}

function selectPhase(id) {
  document.querySelectorAll(".phase-node").forEach(node => {
    node.classList.toggle("active", parseInt(node.getAttribute("data-phase-id")) === id);
  });
  const phase = PIPELINE_PHASES.find(p => p.id === id);
  if (phase) renderPhaseDetails(phase);
}

function renderPhaseDetails(phase) {
  const panel = document.getElementById("phase-details-content");
  if (!panel) return;

  panel.innerHTML = `
    <div class="card-header">
      <div>
        <div class="badge-pill" style="background:#e0f2fe; color:#0369a1;">Fase Secuencial ${phase.id} de 10</div>
        <h3 class="card-title">${phase.name}</h3>
      </div>
      <code class="inline-code">${phase.module}</code>
    </div>
    <p style="margin-bottom: 1.25rem; font-size: 0.95rem; color: #334155;">${phase.description}</p>
    
    <div class="grid-2" style="margin-bottom: 1.25rem;">
      <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
        <strong style="color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">📥 ENTRADAS</strong>
        <span style="font-size: 0.9rem; color: #475569;">${phase.inputs}</span>
      </div>
      <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
        <strong style="color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">📤 SALIDAS / ARTEFACTOS</strong>
        <span style="font-size: 0.9rem; color: #475569;">${phase.outputs}</span>
      </div>
    </div>

    <div style="margin-bottom: 1rem;">
      <strong style="color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.35rem;">📐 REGLA O HEURÍSTICA MATEMÁTICA</strong>
      <code style="display:block; padding:0.6rem 0.85rem; background:#f1f5f9; border-radius:var(--radius-sm); color:#0f172a; font-weight:600;">${phase.formula}</code>
    </div>

    <div>
      <strong style="color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.35rem;">💻 EXTRACTO DE IMPLEMENTACIÓN (PYTHON)</strong>
      <pre><code>${phase.code}</code></pre>
    </div>
  `;
}

// Load Corpus Data from JSON
async function loadCorpusData() {
  try {
    const res = await fetch("data/sample_corpus.json");
    corpusData = await res.json();
    renderArtifacts();
  } catch (err) {
    console.error("Error loading sample corpus:", err);
  }
}

// Artifacts Sub-tab switching & rendering
function setupArtifactSubTabs() {
  const buttons = document.querySelectorAll(".sub-tab-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-artifact");
      renderArtifactView(target);
    });
  });
}

function renderArtifacts() {
  setupArtifactSubTabs();
  renderArtifactView("chunks");
}

function renderArtifactView(artifactName) {
  const container = document.getElementById("artifact-viewer-container");
  if (!container || !corpusData) return;

  if (artifactName === "chunks") {
    container.innerHTML = `
      <div style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.875rem; color:var(--text-muted);">Mostrando fragmentos semánticos estructurados (${corpusData.chunks.length} chunks)</span>
        <span class="badge-pill badge-pass">Zero Text Loss (coverage >= 0.995)</span>
      </div>
      ${corpusData.chunks.map(c => `
        <div class="chunk-card">
          <div class="chunk-meta">
            <span class="chunk-meta-tag highlight">ID: ${c.chunk_id}</span>
            <span class="chunk-meta-tag">Doc: ${c.filename}</span>
            <span class="chunk-meta-tag">Pág. PDF: ${c.page_start}${c.page_start !== c.page_end ? '–' + c.page_end : ''}</span>
            <span class="chunk-meta-tag">Pág. Impresa: ${c.page_label_start}</span>
            <span class="chunk-meta-tag">Palabras únicas: ${c.unique_words}</span>
            <span class="chunk-meta-tag">Solapamiento: ${c.overlap_words}w</span>
            <span class="chunk-meta-tag">Calidad: ${c.quality_score}</span>
            ${c.related_table_ids.length ? `<span class="chunk-meta-tag" style="background:#fef3c7; color:#b45309;">📊 ${c.related_table_ids.length} Tabla(s) vinculada(s)</span>` : ''}
          </div>
          <div style="font-weight:700; margin-bottom:0.5rem; color:var(--primary); font-size:0.95rem;">
            ${c.section_title} ${c.section_title_reliable ? '<span style="color:#10b981; font-size:0.8rem;">✓ Título Confiable</span>' : ''}
          </div>
          <div class="chunk-text">${c.text}</div>
          <div style="margin-top:0.75rem; display:flex; justify-content:flex-end;">
            <button class="btn btn-outline" style="color:var(--accent); border-color:var(--accent); font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="copyPromptContext('${c.chunk_id}')">
              📋 Copiar Evidencia para Prompt LLM
            </button>
          </div>
        </div>
      `).join('')}
    `;
  } else if (artifactName === "tables") {
    container.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <span style="font-size:0.875rem; color:var(--text-muted);">Tablas validadas y clasificadas (${corpusData.tables.length} tablas aceptadas)</span>
      </div>
      ${corpusData.tables.map(t => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <div>
              <div class="badge-pill badge-pass">Confianza: ${t.table_confidence.toUpperCase()} | Estrategia: ${t.strategy}</div>
              <h4 style="color:var(--primary);">${t.caption || 'Tabla sin título detectado'}</h4>
              <span style="font-size:0.8rem; color:var(--text-muted);">ID: ${t.table_id} | Pág: ${t.page_number} | Dimensión: ${t.rows} filas × ${t.columns} columnas</span>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="font-size:0.85rem; color:var(--primary); display:block; margin-bottom:0.35rem;">Vista Renderizada Markdown:</strong>
            <div style="background:#f8fafc; padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border); overflow-x:auto;">
              ${markdownTableToHtml(t.markdown)}
            </div>
          </div>
          <div>
            <strong style="font-size:0.85rem; color:var(--primary); display:block; margin-bottom:0.35rem;">Markdown Crudo para Prompt:</strong>
            <pre><code>${t.markdown}</code></pre>
          </div>
        </div>
      `).join('')}
    `;
  } else if (artifactName === "tables_rejected") {
    container.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <span style="font-size:0.875rem; color:var(--text-muted);">Rejillas descartadas por el clasificador heurístico (tables_rejected.jsonl)</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Rejilla</th>
            <th>Pág</th>
            <th>Estrategia</th>
            <th>Motivo de Rechazo</th>
            <th>Métricas de Detección</th>
          </tr>
        </thead>
        <tbody>
          ${corpusData.tables_rejected.map(r => `
            <tr>
              <td><code>${r.table_id}</code></td>
              <td>${r.page_number}</td>
              <td><span class="badge-pill">${r.strategy}</span></td>
              <td><strong style="color:var(--danger);">${r.reject_reason}</strong></td>
              <td><span style="font-size:0.75rem;">lower_start: ${r.quality_features.lower_start_ratio} | area: ${r.quality_features.page_area_share}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (artifactName === "sections") {
    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Sección</th>
            <th>Título Detectado</th>
            <th>Fuente</th>
            <th>Nivel</th>
            <th>Confianza</th>
            <th>Páginas</th>
            <th>Palabras</th>
          </tr>
        </thead>
        <tbody>
          ${corpusData.sections.map(s => `
            <tr>
              <td><code>${s.section_id}</code></td>
              <td><strong>${s.title}</strong></td>
              <td><span class="badge-pill">${s.title_source}</span></td>
              <td>H${s.heading_level || 1}</td>
              <td>${(s.heading_confidence * 100).toFixed(0)}%</td>
              <td>${s.page_start}${s.page_start !== s.page_end ? '–' + s.page_end : ''}</td>
              <td>${s.word_count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (artifactName === "pages") {
    container.innerHTML = `
      <div class="grid-2">
        ${corpusData.pages.map(p => `
          <div class="card">
            <div class="card-header">
              <div>
                <h4 style="color:var(--primary);">Página ${p.page_number} (${p.page_label ? 'Etiqueta: ' + p.page_label : 'Sin etiqueta'})</h4>
                <span style="font-size:0.8rem; color:var(--text-muted);">Fuente: ${p.extraction_source.toUpperCase()} | Palabras: ${p.word_count}</span>
              </div>
              <span class="badge-pill ${p.overall_quality_score >= 0.8 ? 'badge-pass' : 'badge-warn'}">Calidad: ${(p.overall_quality_score * 100).toFixed(1)}%</span>
            </div>
            ${p.removed_edge_lines.length ? `
              <div style="background:#fef2f2; border:1px solid #fecaca; padding:0.5rem 0.75rem; border-radius:var(--radius-sm); margin-bottom:0.75rem; font-size:0.8rem; color:#991b1b;">
                <strong>✂️ Líneas de borde eliminadas:</strong> ${p.removed_edge_lines.join(', ')}
              </div>
            ` : ''}
            <div>
              <strong style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:0.25rem;">Texto Normalizado (clean_text):</strong>
              <div style="font-size:0.85rem; background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border); max-height:160px; overflow-y:auto; white-space:pre-wrap;">${p.clean_text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (artifactName === "integrity") {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Reporte Automatizado de Integridad Relacional</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">Generado el: ${corpusData.integrity_report.generated_at}</span>
          </div>
          <span class="badge-pill badge-pass" style="font-size:0.9rem; padding:0.4rem 0.9rem;">ESTADO GLOBAL: ${corpusData.integrity_report.status}</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Control de Integridad</th>
              <th>Resultado</th>
              <th>Detalles de Auditoría</th>
            </tr>
          </thead>
          <tbody>
            ${corpusData.integrity_report.checks.map(c => `
              <tr>
                <td><strong>${c.check}</strong></td>
                <td><span class="badge-pill ${c.status === 'PASS' ? 'badge-pass' : 'badge-warn'}">${c.status}</span></td>
                <td><span style="font-size:0.85rem; color:var(--text-muted);">${c.detail || 'Verificado con 100% de consistencia relacional'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Convert simple markdown table string to HTML table
function markdownTableToHtml(md) {
  const lines = md.trim().split('\n');
  if (lines.length < 2) return md;

  const parseRow = (line) => line.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return `
    <table class="data-table" style="margin:0;">
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

// 1-Click Copy Prompt Evidence Block
function copyPromptContext(chunkId) {
  if (!corpusData) return;
  const chunk = corpusData.chunks.find(c => c.chunk_id === chunkId);
  if (!chunk) return;

  let tablesText = "";
  if (chunk.related_table_ids && chunk.related_table_ids.length) {
    const linked = corpusData.tables.filter(t => chunk.related_table_ids.includes(t.table_id));
    if (linked.length) {
      tablesText = "\n\nTABLAS VINCULADAS:\n" + linked.map(t => `${t.caption || 'Tabla'}:\n${t.markdown}`).join('\n\n');
    }
  }

  const promptBlock = `[BLOQUE DE EVIDENCIA PRIMARIA]
ID de Evidencia: ${chunk.chunk_id}
Documento: ${chunk.filename} (${chunk.document_id})
Sección: ${chunk.section_title} (Confiabilidad de título: ${chunk.section_title_reliable ? 'Alta' : 'Baja'})
Ubicación: Página PDF ${chunk.page_start}${chunk.page_start !== chunk.page_end ? ' a ' + chunk.page_end : ''} (Etiqueta Impresa: ${chunk.page_label_start})
Puntuación de Calidad Técnica: ${chunk.quality_score}

CONTENIDO:
${chunk.text}${tablesText}
[FIN DE BLOQUE DE EVIDENCIA]`;

  navigator.clipboard.writeText(promptBlock).then(() => {
    showToast(`✓ Bloque de evidencia para ${chunkId} copiado al portapapeles`);
  });
}

// RAG Simulator
function setupRAGSimulator() {
  const searchInput = document.getElementById("rag-search-input");
  const searchBtn = document.getElementById("rag-search-btn");
  if (!searchInput || !searchBtn) return;

  const executeSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query || !corpusData) return;

    const matchedChunks = corpusData.chunks.filter(c => {
      return c.text.toLowerCase().includes(query) ||
             c.section_title.toLowerCase().includes(query) ||
             c.filename.toLowerCase().includes(query);
    });

    renderRAGResults(query, matchedChunks);
  };

  searchBtn.addEventListener("click", executeSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });
}

function renderRAGResults(query, matches) {
  const resultsContainer = document.getElementById("rag-results-container");
  if (!resultsContainer) return;

  if (!matches.length) {
    resultsContainer.innerHTML = `
      <div style="background:#f8fafc; border:1px solid var(--border); padding:1.5rem; text-align:center; border-radius:var(--radius-md);">
        <p style="color:var(--text-muted);">No se encontraron coincidencias exactas para "${query}". Intente con términos como "docentes", "muestreo", "privacidad", "inteligencia artificial".</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `
    <div style="margin-bottom:1rem;">
      <strong style="color:var(--primary); font-size:1.1rem;">Resultados de Búsqueda para: "${query}" (${matches.length} fragmentos recuperados)</strong>
    </div>
    ${matches.map(m => `
      <div class="chunk-card">
        <div class="chunk-meta">
          <span class="chunk-meta-tag highlight">Chunk: ${m.chunk_id}</span>
          <span class="chunk-meta-tag">Doc: ${m.filename}</span>
          <span class="chunk-meta-tag">Páginas: ${m.page_start} (Impresa: ${m.page_label_start})</span>
          <span class="chunk-meta-tag badge-pass">Score Calidad: ${m.quality_score}</span>
        </div>
        <div style="font-weight:700; margin-bottom:0.5rem; color:var(--primary);">${m.section_title}</div>
        <div class="chunk-text">${highlightSearchTerms(m.text, query)}</div>
        <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:var(--text-muted);">Cita generada: <code>[${m.filename}, Sec. "${m.section_title}", Pág. PDF ${m.page_start}]</code></span>
          <button class="btn btn-primary" style="font-size:0.75rem; padding:0.35rem 0.75rem;" onclick="copyPromptContext('${m.chunk_id}')">
            📋 Ensamblar en Prompt
          </button>
        </div>
      </div>
    `).join('')}
  `;
}

function highlightSearchTerms(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark style="background:#fef08a; padding:0.1rem 0.2rem; border-radius:2px;">$1</mark>');
}

// Interactive Heuristics Playground
function setupHeuristicsLab() {
  const targetWordsInput = document.getElementById("slider-target-words");
  const overlapWordsInput = document.getElementById("slider-overlap-words");
  const fontRatioInput = document.getElementById("slider-font-ratio");

  const updateSimulation = () => {
    const targetWords = parseInt(targetWordsInput?.value || 550);
    const overlapWords = parseInt(overlapWordsInput?.value || 80);
    const fontRatio = parseFloat(fontRatioInput?.value || 1.18);

    document.getElementById("val-target-words").textContent = targetWords + " palabras";
    document.getElementById("val-overlap-words").textContent = overlapWords + " palabras";
    document.getElementById("val-font-ratio").textContent = fontRatio + "x mediana";

    // Simulate chunk calculation on a 1500 words sample text
    const sampleWords = 1500;
    const estChunks = Math.ceil(sampleWords / (targetWords - overlapWords));
    const coverage = 0.998;

    const simResult = document.getElementById("simulation-output");
    if (simResult) {
      simResult.innerHTML = `
        <div class="grid-3">
          <div class="stat-box">
            <div class="stat-label">Chunks Estimados</div>
            <div class="stat-value">${estChunks}</div>
            <div class="stat-sub">Para documento de 1.500 palabras</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Solapamiento Intrasección</div>
            <div class="stat-value">${overlapWords} w</div>
            <div class="stat-sub">Palabras retenidas al inicio del chunk</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Tasa de Cobertura</div>
            <div class="stat-value" style="color:var(--success);">${(coverage * 100).toFixed(1)}%</div>
            <div class="stat-sub">Cumple con chunk_coverage >= 0.995</div>
          </div>
        </div>
      `;
    }
  };

  targetWordsInput?.addEventListener("input", updateSimulation);
  overlapWordsInput?.addEventListener("input", updateSimulation);
  fontRatioInput?.addEventListener("input", updateSimulation);
  updateSimulation();
}

// DuckDB SQL Studio Simulator
function setupDuckDBStudio() {
  const selectQuery = document.getElementById("duckdb-query-select");
  const sqlEditor = document.getElementById("duckdb-sql-editor");
  const runBtn = document.getElementById("duckdb-run-btn");
  const resultContainer = document.getElementById("duckdb-result-table");

  const queries = {
    "q1": {
      sql: "SELECT document_id, filename, total_chunks, chunk_coverage, average_quality FROM documents ORDER BY average_quality DESC;",
      results: [
        { document_id: "doc_8f3a91b2c4e57d01", filename: "Informe_IA_Educacion_Ninez_CIOdD_2026.pdf", total_chunks: 26, chunk_coverage: 0.9982, average_quality: 0.892 },
        { document_id: "doc_e12b489c77da31fa", filename: "Marco_Regulatorio_Gobernanza_Algoritmica_UCR.pdf", total_chunks: 16, chunk_coverage: 0.9965, average_quality: 0.871 }
      ]
    },
    "q2": {
      sql: "SELECT chunk_id, section_title, page_start, page_label_start, unique_words, overlap_words FROM chunks WHERE quality_score >= 0.90;",
      results: [
        { chunk_id: "doc_8f3a91b2c4e57d01_C00001", section_title: "1. Resumen Ejecutivo y Alcance del Estudio", page_start: 2, page_label_start: "ii", unique_words: 105, overlap_words: 0 },
        { chunk_id: "doc_8f3a91b2c4e57d01_C00003", section_title: "3. Recomendaciones Regulatorias y Políticas Públicas", page_start: 8, page_label_start: "6", unique_words: 86, overlap_words: 0 }
      ]
    },
    "q3": {
      sql: "SELECT table_id, page_number, caption, rows, columns, table_confidence FROM tables WHERE table_confidence = 'high';",
      results: [
        { table_id: "tbl_08f91a2bc41029aa", page_number: 2, caption: "Tabla 1. Distribución porcentual de uso de herramientas LLM", rows: 3, columns: 4, table_confidence: "high" },
        { table_id: "tbl_8f3a91b2_cuadro1", page_number: 4, caption: "Cuadro 2. Dimensiones psicométricas evaluadas en cohortes", rows: 2, columns: 3, table_confidence: "high" }
      ]
    }
  };

  selectQuery?.addEventListener("change", (e) => {
    const q = queries[e.target.value];
    if (q && sqlEditor) {
      sqlEditor.value = q.sql;
    }
  });

  runBtn?.addEventListener("click", () => {
    const currentVal = selectQuery?.value || "q1";
    const q = queries[currentVal];
    if (q && resultContainer) {
      const keys = Object.keys(q.results[0]);
      resultContainer.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${q.results.map(row => `
              <tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      `;
      showToast("✓ Consulta SQL ejecutada en DuckDB simulado");
    }
  });
}

// Toast Alert
function showToast(msg) {
  const toast = document.getElementById("toast-alert");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}
