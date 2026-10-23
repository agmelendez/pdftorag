# Guía de Mejoras Locales — CIOdD-UCR PDF Intelligence Pipeline V5.2

**Objetivo**: Aplicar de forma ordenada y segura las mejoras prioritarias identificadas en la auditoría.

**Fecha de referencia**: Octubre 2026  
**Versión del pipeline**: 5.2.0

---

## 0. Preparación del entorno

```bash
# Clona o ubícate en la raíz del proyecto
cd "0. FROM PDF to RAG"

# Crea un entorno virtual (recomendado)
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows

# Instala dependencias actuales
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

---

## 1. Limpieza y unificación de dependencias (prioridad alta, bajo esfuerzo)

### 1.1. Actualizar `requirements.txt`

Reemplaza el contenido de `requirements.txt` por:

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

### 1.2. Crear `requirements-embeddings.txt`

```txt
# Optional embeddings (install only if you need FAISS + sentence-transformers)
sentence-transformers>=2.2.0
faiss-cpu>=1.7.4
```

### 1.3. Actualizar README (sección de instalación)

Añade o reemplaza la sección de instalación con:

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

## 2. Documentar limitaciones conocidas

Crea o actualiza el archivo `docs/LIMITACIONES_CONOCIDAS.md`:

```markdown
# Limitaciones Conocidas — V5.2

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

## Otros
- PDFs protegidos con contraseña no son procesados.
- Formularios PDF (AcroForm) no extraen campos de formulario como texto estructurado.
- Documentos con más de ~500 páginas pueden ser lentos en máquinas modestas (especialmente con OCR).
```

---

## 3. Mejora de robustez en el CLI

Edita `src/pdf_intelligence/cli.py` y añade las siguientes opciones al parser de `process`:

```python
run_parser.add_argument("--dry-run", action="store_true", help="Solo perfilar documentos sin generar corpus completo")
run_parser.add_argument("--max-pages", type=int, default=None, help="Limitar número máximo de páginas por documento")
```

Luego, en la función `main()`, pasa estos parámetros a `PipelineConfig` (tendrás que extender la dataclass en `config.py` si quieres que sea configurable de forma centralizada).

---

## 4. Suite de tests de integración (prioridad alta)

### 4.1. Estructura recomendada

```text
tests/
├── test_pipeline.py          # (existente)
├── test_integration.py       # NUEVO
├── fixtures/
│   ├── digital_simple.pdf
│   ├── scanned_sample.pdf
│   └── with_tables.pdf
└── conftest.py               # (opcional)
```

### 4.2. Contenido base de `tests/test_integration.py`

```python
"""Integration tests for the full pipeline."""
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from pdf_intelligence.config import PipelineConfig
from pdf_intelligence.document import DocumentExtractor
from pdf_intelligence.corpus import CorpusBuilder


FIXTURES = Path(__file__).parent / "fixtures"


class TestIntegration(unittest.TestCase):

    def setUp(self):
        self.tmpdir = TemporaryDirectory()
        self.output = Path(self.tmpdir.name) / "output"
        self.output.mkdir()

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_digital_pdf_coverage(self):
        """Procesa un PDF digital y verifica cobertura mínima."""
        pdf = FIXTURES / "digital_simple.pdf"
        if not pdf.exists():
            self.skipTest("Fixture no disponible")

        config = PipelineConfig(
            pdf_directory=FIXTURES,
            output_directory=self.output,
            max_documents=1,
            ocr_enabled=False,
            generate_embeddings=False,
        )
        # Aquí iría la lógica de procesamiento de un solo documento
        # y aserciones sobre chunk_coverage, integrity_report, etc.
        self.assertTrue(True)  # placeholder

    def test_ocr_trigger(self):
        """Verifica que un PDF escaneado dispare OCR."""
        # Implementar similar al anterior
        pass


if __name__ == "__main__":
    unittest.main()
```

### 4.3. Cómo ejecutar los tests

```bash
# Todos los tests
python -m pytest tests/ -v

# Solo unitarios
python -m pytest tests/test_pipeline.py -v

# Solo integración (cuando estén listos)
python -m pytest tests/test_integration.py -v
```

---

## 5. Decisión sobre el monolito

**Recomendación**: Marcar claramente el monolito como histórico.

En `legacy/v5_2_monolith/README.md` añade al inicio:

```markdown
> **AVISO**: Este archivo es una versión monolítica histórica (octubre 2026).  
> La fuente de verdad actual es el paquete modular en `src/pdf_intelligence/`.  
> No se recomienda modificar este monolito.
```

---

## 6. Checklist final de verificación

Después de aplicar los cambios, ejecuta:

```bash
# 1. Instalación limpia
pip install -r requirements.txt

# 2. Tests unitarios
python -m pytest tests/test_pipeline.py -v

# 3. CLI ayuda
pdf-intelligence --help
pdf-intelligence process --help

# 4. Procesamiento de prueba (ajusta rutas)
pdf-intelligence process --input ./ruta/a/pdfs_prueba --output ./salida_prueba --no-embeddings --max-docs 2

# 5. Revisar artefactos generados
ls -la ./salida_prueba/
# Debe existir: chunks.jsonl, corpus.duckdb, integrity_report.json, etc.
```

---

## Orden recomendado de implementación

| Orden | Mejora                        | Esfuerzo | Impacto |
|-------|-------------------------------|----------|---------|
| 1     | Limpieza de dependencias      | Bajo     | Alto    |
| 2     | Documentar limitaciones       | Bajo     | Medio   |
| 3     | Tests de integración          | Alto     | Alto    |
| 4     | Robustez CLI (`--dry-run`)    | Medio    | Medio   |
| 5     | Marcar monolito como legacy   | Bajo     | Bajo    |

---

## Notas finales

- Trabaja siempre en una rama (`git checkout -b mejoras-v5.2-auditoria`).
- Haz commits pequeños y descriptivos por cada mejora.
- Si vas a añadir PDFs de ejemplo, asegúrate de que sean pequeños y no contengan información sensible.
- Después de cada cambio importante, ejecuta los tests unitarios existentes para no romper nada.

**¿Necesitas que profundice en alguna sección concreta (por ejemplo, el código completo de los tests de integración o la extensión de `PipelineConfig`)?**
