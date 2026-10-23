# Integración con Bóvedas de Conocimiento: Brain OS v1.6 & PDF Intelligence

Este documento explica cómo el **CIOdD-UCR PDF Intelligence Pipeline V5.6** se integra de manera nativa con la arquitectura de **Brain OS (Manual v1.6 por Jaime Figueres para FAIR.cr)**, convirtiéndose en el motor de ingesta y compilación para sistemas personales y organizacionales de inteligencia operativa con IA.

---

## 1. El Enlace Conceptual: De Documentos Estáticos a Conocimiento Operativo

En la arquitectura de Brain OS, un modelo de lenguaje (Claude, Gemini o agentes locales) no debe operar como un simple chatbot de preguntas y respuestas, sino como un **colaborador operativo real** que conoce el estado de los proyectos, recuerda acuerdos y produce archivos terminados.

Sin embargo, el 80% de la evidencia documental en universidades, gobiernos y empresas reside en archivos PDF estáticos (informes de consultoría, reglamentos, actas de juntas, investigaciones empíricas). 

El PDF Intelligence Pipeline actúa como el **Compilador Documental Primario (Capa 0)** que transforma esos binarios inertes en entidades estructuradas listas para el territorio del Vault de Brain OS.

```text
[PDFs Heterogéneos]
        ↓  (Fases 1–10: PDF Intelligence V5.6)
[chunks.parquet / tables.jsonl / corpus.duckdb]
        ↓  (Capa de Ingesta Brain OS)
[Territorio de Acceso del Vault (Obsidian / Markdown)]
        ↓  (Compilador HTML / Daily Logs)
[Agente Operativo RAG / Claude / Antigravity]
```

---

## 2. Correspondencia entre Capas de Brain OS y Artefactos del Pipeline

El Manual v1.6 de Brain OS define 4 capas funcionales. A continuación se detalla cómo se alimentan con las salidas del pipeline:

### Capa 0: Ingesta y Evidencia Primaria (Pipeline V5.6)
- **Artefactos**: `pages.parquet`, `tables.parquet`, `manifest.json`.
- **Función en Brain OS**: Proporciona el repositorio inmutable de evidencia. Cada afirmación en el sistema se respalda en una huella SHA-256 y coordenadas de página exactas.

### Capa 1: Compilador de Salidas y Documentos (Markdown vs. HTML)
- **Principio de Brain OS**: *"El texto se escribe en Markdown; la experiencia de uso se compila a HTML interactivo."*
- **Integración**:
  - Las tablas extraídas en `tables.jsonl` ya vienen serializadas en sintaxis Markdown limpia y en diccionarios `records`.
  - El visualizador interactivo en GitHub Pages (`docs/index.html`) implementa precisamente esta filosofía: compilar los JSONLs del pipeline en una interfaz HTML reactiva sin dependencias externas pesadas.

### Capa 2: Memoria Operativa (Daily Logs y Memoria de Largo Plazo)
- **Daily Logs**: Los registros de ejecución de `processing_log.jsonl` y `errors.jsonl` se mapean directamente a las bitácoras diarias de Brain OS.
- **Memoria de Largo Plazo (Biblioteca de Claims)**: Los `chunks.jsonl` actúan como notas atómicas de biblioteca. Cada chunk posee un `chunk_id` único, un `section_title` como título conceptual y palabras clave asociadas.

### Capa 3: Agente Autónomo y Skills Operativos
- Los agentes de IA de Brain OS reciben herramientas para consultar `corpus.duckdb` vía SQL o invocar búsquedas léxicas locales con `LocalSearch(tfidf)`.
- El agente no necesita procesar el PDF cada vez; consulta el índice pre-construido en milisegundos y cita con precisión de página PDF y página impresa.

---

## 3. Ejemplo Práctico: Ingesta de un Informe Técnico en el Vault

1. **Ingesta**:
   ```bash
   pdf-intelligence process --input ./vault/raw_pdfs --output ./vault/corpus
   ```
2. **Generación de Ficha Atómica en Obsidian (Markdown)**:
   Por cada documento procesado, el sistema genera automáticamente una nota en el Vault:
   ```markdown
   ---
   tipo: documento_fuente
   id: doc_8f3a91b2c4e57d01
   titulo: "Inteligencia Artificial y Desarrollo Cognitivo en la Niñez"
   año_referencia: 2026
   paginas: 16
   calidad_extraccion: 0.941
   sha256: 8f3a91b2c4e57d01...
   ---

   # Inteligencia Artificial y Desarrollo Cognitivo en la Niñez

   ## Secciones Identificadas
   - [[doc_8f3a91b2c4e57d01_S0001]] 1. Resumen Ejecutivo
   - [[doc_8f3a91b2c4e57d01_S0002]] 2. Marco Metodológico
   - [[doc_8f3a91b2c4e57d01_S0003]] 3. Recomendaciones Regulatorias

   ## Tablas Disponibles
   - `tbl_08f91a2bc41029aa`: Distribución porcentual de docentes (Pág. 2)
   ```

3. **Consulta Operativa por el Asistente**:
   Cuando el usuario le pide a Claude en Brain OS: *"Redactá una propuesta de política pública basada en los hallazgos del informe de niñez"*, el agente consulta los chunks filtrando por `section_title LIKE '%Recomendaciones%'`, inyecta la evidencia primaria y cita el número de página impreso correspondiente.
