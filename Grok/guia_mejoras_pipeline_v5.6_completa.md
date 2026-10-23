# Guía de Mejoras Locales — CIOdD-UCR PDF Intelligence Pipeline V5.6

**Objetivo**: Instrucciones precisas y accionables para que un LLM o desarrollador aplique localmente las mejoras de V5.4–V5.6 al paquete modular de producción (`src/pdf_intelligence/`).

**Fecha**: 2026-10-23  
**Versión objetivo del paquete modular**: 5.6  
**Estado actual del código modular**: V5.2 (basado en `src/pdf_intelligence/`)  
**Referencias de origen**: Notebooks y documentación en `artifacts/v5.6_final/`

---

## 0. Contexto y cambios a portar

Las mejoras V5.4–V5.6 se desarrollaron en notebooks Colab. Deben integrarse al código modular:

| Mejora | Descripción | Archivos afectados |
|--------|-------------|--------------------|
| Headings más estrictos | Máx. 16 palabras; rechazo de bloques con puntos internos (salvo numerados) | `heading.py`, `config.py` |
| `clean_title()` | Elimina ▒ y caracteres de control de títulos | `utils.py` o `heading.py` |
| Fusión controlada de títulos | Máximo 2 títulos consecutivos se fusionan | `heading.py` o `structure.py` |
| `table_min_area = 0.03` | Descartar tablas/fragmentos con área relativa < 0.03 | `config.py`, `tables.py` |
| Descarte de chunks cortos | Chunks con < 20 palabras se descartan | `config.py`, `structure.py` |
| Bugfix `is_numbered` | Asegurar asignación antes de uso (ya parece correcto en modular) | `heading.py` |
| Búsqueda de PDFs case-insensitive | `.pdf` / `.PDF` | `document.py` o `profiler.py` |
| Versiones | Actualizar a 5.6 | `config.py`, `__init__.py` |

**Impacto del bug V5.5 (referencia)**: Paris Peace Forum perdió ~88% del texto por el error de orden de variables.

---

## 1. Preparación

```bash
cd "0. FROM PDF to RAG"
git checkout -b mejoras-v5.6
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

---

## 2. Limpieza de dependencias

### 2.1. Reemplazar contenido de `requirements.txt`

```txt
# Core dependencies
pymupdf>=1.23.0
pdfplumber>=0.10.0
pypdf>=4.0.0
pandas>=2.0.0
numpy>=1.24.0
pyarrow>=14.0.0
duckdb>=0.9.0
pytesseract>=0.3.10
pillow>=10.0.0
scikit-learn>=1.3.0
joblib>=1.3.0
tqdm>=4.66.0
langdetect>=1.0.9
```

### 2.2. Crear `requirements-embeddings.txt`

```txt
# Optional embeddings (install only if you need FAISS + sentence-transformers)
sentence-transformers>=2.2.0
faiss-cpu>=1.7.4
```

### 2.3. Actualizar sección de instalación en `README.md`

Añadir o reemplazar:

```markdown
## Instalación

```bash
# Dependencias base
pip install -r requirements.txt

# (Opcional) Embeddings + FAISS
pip install -r requirements-embeddings.txt

# Dependencia de sistema (OCR)
# Ubuntu/Debian:
sudo apt install tesseract-ocr tesseract-ocr-spa tesseract-ocr-eng

# macOS:
brew install tesseract tesseract-lang
```
```

---

## 3. Actualizar `PipelineConfig` (`src/pdf_intelligence/config.py`)

### 3.1. Cambiar versiones

Buscar y reemplazar:

```python
pipeline_version: str = "5.2"
schema_version: str = "5.2.0"
```

por:

```python
pipeline_version: str = "5.6"
schema_version: str = "5.6.0"
```

### 3.2. Añadir nuevos parámetros

Después de `heading_min_score: float = 2.0` añadir:

```python
heading_max_words: int = 16
```

Después de los parámetros de tablas existentes añadir:

```python
table_min_area: float = 0.03
```

Después de `chunk_min_words: int = 60` añadir:

```python
min_chunk_words_discard: int = 20
```

---

## 4. Mejoras en `HeadingDetector` (`src/pdf_intelligence/heading.py`)

### 4.1. Límite de palabras más estricto

En el método `detect`, cambiar:

```python
if not text or n > 20 or len(text) > 200:
```

por:

```python
if not text or n > self.config.heading_max_words if hasattr(self, 'config') else 16 or len(text) > 200:
```

**Nota**: Si `HeadingDetector` no recibe `config`, usar literal `16` o pasar el valor. Preferible inyectar config o usar constante.

Alternativa simple (recomendada si no se quiere modificar la firma):

```python
if not text or n > 16 or len(text) > 200:
```

### 4.2. Asegurar orden de `is_numbered` (ya correcto en modular)

Verificar que estas líneas aparezcan **antes** de cualquier uso:

```python
is_standard = bool(self.standard.match(text.strip(" .:-"))) or bool(self.prefixed.match(text))
is_numbered = bool(self.numbered.match(text)) and n <= 16
```

### 4.3. Añadir función `clean_title` en `src/pdf_intelligence/utils.py`

Al final del archivo añadir:

```python
def clean_title(text: Optional[str]) -> str:
    """Remove control characters and block characters from titles."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    # Remove block character and other controls
    text = re.sub(r"[▒■▪•◦●·\x00-\x1f\x7f]", "", text)
    return re.sub(r"\s+", " ", text).strip()
```

Importar y usar en `heading.py` o donde se asignen títulos:

```python
from .utils import clean_title, single_line
# ...
title = clean_title(single_line(block.get("text", "")))
```

### 4.4. Rechazo de bloques tipo oración (mejora V5.5)

Después de la asignación de `is_numbered`, añadir (si no existe ya):

```python
# Reject sentence-like blocks (internal periods) unless numbered
if not is_numbered and text.count(".") > 0 and n > 4:
    return result
```

---

## 5. Filtro de tablas (`src/pdf_intelligence/tables.py`)

En `AdaptiveTableExtractor.extract` o en el método que calcula `page_area_share`:

Después de calcular `area` / `page_area_share`, añadir rechazo temprano:

```python
min_area = cfg.table_min_area if cfg else 0.03
if feats.get("page_area_share", 0.0) < min_area:
    # Reject small residual tables
    return None  # o marcar como rejected según el flujo existente
```

Asegurar que las tablas rechazadas por área pequeña se registren en `tables_rejected.jsonl` si el flujo lo permite.

---

## 6. Descarte de chunks cortos (`src/pdf_intelligence/structure.py`)

En `ChunkBuilder`, después de calcular `word_count` de un chunk candidato, añadir lógica de descarte:

Buscar donde se emiten chunks (alrededor de las líneas que usan `chunk_min_words`).

Añadir (ejemplo de lógica):

```python
min_discard = self.config.min_chunk_words_discard
if chunk["word_count"] < min_discard:
    # Discard very short chunks (V5.5+)
    continue  # o no añadir a la lista de chunks
```

**Importante**: Mantener la cobertura objetivo `chunk_coverage_min >= 0.995`. El descarte debe ser solo de fragmentos residuales, no de contenido sustancial. Validar con documentos reales.

---

## 7. Búsqueda de PDFs case-insensitive

En el módulo que lista archivos PDF (probablemente `document.py` o `profiler.py`):

Cambiar filtros de extensión para que sean insensibles a mayúsculas:

```python
# Ejemplo
pdf_files = [p for p in path.iterdir() if p.suffix.lower() == ".pdf"]
```

---

## 8. Documentar limitaciones conocidas

Crear archivo `docs/LIMITACIONES_CONOCIDAS.md`:

```markdown
# Limitaciones Conocidas — V5.6

## Layout y multi-columna
- `page.get_text("dict", sort=True)` de PyMuPDF puede fallar en documentos con columnas complejas o lectura no lineal.
- Recomendación: revisar manualmente documentos con más de 2 columnas densas.

## OCR
- Depende de Tesseract instalado en el sistema.
- Calidad depende fuertemente de la resolución y contraste del PDF original.
- Idiomas soportados por defecto: `spa+eng`.

## Tablas
- La estrategia `text` puede generar falsos positivos en prosa fragmentada en columnas estrechas.
- Las tablas sin líneas y con celdas muy irregulares pueden ser rechazadas.
- Fragmentos con área relativa < 0.03 se descartan.

## Headings
- Máximo 16 palabras.
- Fusión controlada de máximo 2 títulos consecutivos.
- Bloques con puntos internos (tipo oración) se rechazan salvo si están numerados.

## Chunks
- Chunks con menos de 20 palabras se descartan.

## Otros
- PDFs protegidos con contraseña no son procesados.
- Formularios PDF (AcroForm) no extraen campos de formulario como texto estructurado.
- Documentos con más de ~500 páginas pueden ser lentos en máquinas modestas (especialmente con OCR).
```

---

## 9. Robustez en el CLI (`src/pdf_intelligence/cli.py`)

Añadir al parser de `process`:

```python
run_parser.add_argument("--dry-run", action="store_true", help="Solo perfilar documentos sin generar corpus completo")
run_parser.add_argument("--max-pages", type=int, default=None, help="Limitar número máximo de páginas por documento")
```

Pasar estos parámetros a `PipelineConfig` (extender la dataclass si es necesario y usarlo en el extractor).

---

## 10. Tests de integración

Crear `tests/test_integration.py` con al menos:

- Test de cobertura en PDF digital.
- Test de trigger de OCR.
- Test de regresión del bugfix V5.6 (no debe fallar con `is_numbered` y debe recuperar texto completo).

Usar fixtures pequeños en `tests/fixtures/`.

---

## 11. Marcar monolito como legacy

En `legacy/v5_2_monolith/README.md` añadir al inicio:

```markdown
> **AVISO**: Este archivo es una versión monolítica histórica (octubre 2026, V5.2).  
> La fuente de verdad actual es el paquete modular en `src/pdf_intelligence/` (V5.6).  
> No se recomienda modificar este monolito.
```

---

## 12. Checklist de verificación post-cambios

```bash
# 1. Instalación
pip install -r requirements.txt

# 2. Tests unitarios existentes
python -m pytest tests/test_pipeline.py -v

# 3. CLI
pdf-intelligence --help
pdf-intelligence process --help

# 4. Procesamiento de prueba
pdf-intelligence process --input ./ruta/a/pdfs_prueba --output ./salida_prueba --no-embeddings --max-docs 2

# 5. Validaciones clave
# - errors.jsonl sin errores de is_numbered
# - Cobertura de chunks ≥ 0.995
# - Paris Peace Forum ≈ 8000 palabras (si se usa ese fixture)
# - Títulos sin carácter ▒
# - Tablas residuales de área < 0.03 rechazadas
# - Artefactos: chunks.jsonl, corpus.duckdb, integrity_report.json, etc.
```

---

## Orden recomendado de implementación

1. **Portar mejoras algorítmicas** (config + heading + tables + structure + utils) — impacto crítico.
2. Limpieza de dependencias.
3. Documentar limitaciones.
4. Tests de integración + regresión.
5. CLI (`--dry-run`, `--max-pages`).
6. Marcar monolito como legacy.
7. Actualizar versiones en `__init__.py` y README.

---

## Notas para el LLM implementador

- Haz commits pequeños y descriptivos por cada mejora.
- Compara salidas del notebook V5.6 vs. el código modular modificado antes de dar por buena la portación.
- No rompas la cobertura objetivo de 0.995.
- Después de cada cambio importante, ejecuta los tests unitarios existentes.
- Si un cambio en `HeadingDetector` o `ChunkBuilder` reduce cobertura de forma significativa, ajustar umbrales o la lógica de descarte.

**Fin de la guía.**
