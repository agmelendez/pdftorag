# Ciclos de Depuración, Limpieza y Heurísticas del Pipeline

El procesamiento de documentos PDF heterogéneos presenta múltiples patologías que los convertidores convencionales no manejan adecuadamente. En esta sección se explican a fondo los **ciclos de depuración y saneamiento** implementados en el pipeline CIOdD-UCR V5.6.

---

## Ciclo 1: Detección y Recorte de Cabeceras y Pies Corridos (`infer_repeated_lines` + `remove_repeated_lines`)

### El Problema
En informes y libros extensos, cada página incluye cabeceras y pies con numeraciones variables o títulos recurrentes (ej. `"28 Informe de Resultados"`, `"Informe de Resultados 29"`). Los extractores convencionales cometen dos errores:
1. Tratan esas líneas como párrafos legítimos dentro del texto, contaminando los chunks con ruido repetitivo.
2. O bien intentan un reemplazo ingenuo de cadenas, borrando números legítimos dentro del cuerpo del texto (ej. borrar `"28"` de una fecha o estadística).

### La Solución en V5.6
1. **Inspección Focalizada**: Se analizan exclusivamente las $k = 3$ primeras y $k = 3$ últimas líneas de cada página.
2. **Normalización a Patrones con Dígitos Comodín (`#`)**:
   $$\text{normalize\_pattern}(\text{"Informe Anual 2026 - Pág. 14"}) \to \text{"informe anual #### - pág. ##"}$$
3. **Umbral de Frecuencia Documental**: Un patrón se considera cabecera o pie recurrente si aparece en al menos el $35\%$ de las páginas (`HEADER_FOOTER_THRESHOLD = 0.35`).
4. **Recorte en Borde Estricto**: La eliminación se ejecuta **únicamente** si la línea coincide con el patrón Y se encuentra dentro de las primeras o últimas 3 líneas de la página.
5. **Trazabilidad Total**: Las líneas eliminadas no desaparecen silenciosamente; se guardan ordenadas en `page["removed_edge_lines"]`.

---

## Ciclo 2: Degradación de Falsos Encabezados Repetidos (`demote_repeated_headings`)

### El Problema
Muchos documentos sitúan el título del capítulo o el nombre del ministerio en la parte superior de cada página con una tipografía en negrita o ligeramente mayor a la mediana. Si un detector de encabezados evalúa cada página de forma aislada, creará una nueva "sección" en cada página física, despedazando párrafos continuos en fragmentos diminutos.

### La Solución en V5.6
1. Tras evaluar todas las páginas del PDF (en documentos de $\ge 8$ páginas), se contabiliza en cuántas páginas distintas aparece cada texto marcado como `is_heading = True`.
2. Si un encabezado aparece en:
   $$\text{páginas} \ge \max(4, \lceil 0.08 \cdot N \rceil)$$
   se concluye que es una cabecera corrida o una etiqueta recurrente (ej. `"CUADRO ESTADÍSTICO"`).
3. Se degrada el bloque:
   - `block["is_heading"] = False`
   - `block["heading_confidence"] = 0.0`
   - `block["heading_demoted"] = "repeated_on_many_pages"`
4. De este modo, la sección no se rompe y el texto fluye de manera natural a través de las páginas.

---

## Ciclo 3: Clasificación Heurística de Tablas vs. Prosa Fragmentada (`AdaptiveTableExtractor`)

### El Problema
Herramientas como `pdfplumber` basadas en la estrategia `"text"` buscan alineaciones verticales de palabras. En páginas con texto justificado en 2 o 3 columnas, casi cualquier bloque de prosa puede ser interpretado erróneamente como una tabla con decenas de celdas que contienen fragmentos como `"ap | plies to person | s concerned"`.

### La Solución en V5.6
Se diseñó un clasificador multivariable que evalúa cinco propiedades geométricas y lingüísticas de cada cuadrícula candidata:
1. **Razón de Inicio en Minúscula (`lower_start_ratio`)**:
   En una tabla genuina, las celdas contienen cifras numéricas, códigos o sustantivos que inician en mayúscula. Si $\ge 25\%$ de las celdas inician en minúscula, es inequívocamente prosa partida.
2. **Razón de Fragmentación (`fragment_ratio`)**:
   Mide la proporción de celdas con $\le 2$ caracteres. Si supera el $20\%$ en la estrategia text, se rechaza.
3. **Celdas Vacías (`filled_ratio`)**:
   Exige que al menos el $50\%$ de las celdas contengan datos (o $25\%$ si la tabla tiene líneas explícitas).
4. **Porcentaje de Área de Página (`page_area_share`)**:
   Si la cuadrícula ocupa $\ge 70\%$ de la página en estrategia text, se descarta por tratarse de un diseño editorial de página completa a varias columnas.
5. **Auditoría de Rechazos**:
   Toda rejilla rechazada se exporta a `tables_rejected.jsonl` con su motivo exacto (`reject_reason`), permitiendo inspección humana posterior.

---

## Ciclo 4: Fusión de Secciones Cortas y Garantía de Cero Pérdida (`ChunkBuilder`)

### El Problema
Los pipelines convencionales descartan cualquier sección con menos de 60 palabras considerándola "ruido". En literatura científica, esto causa la eliminación silenciosa de:
- Notas metodológicas breves.
- Epígrafes y dedicatorias con valor histórico.
- Conclusiones y recomendaciones redactadas en una o dos frases contundentes.
- Páginas completas que quedan sin ningún chunk indexado.

### La Solución en V5.6
1. Cuando una sección contiene $< 60$ palabras (`CHUNK_MIN_WORDS`), **nunca se descarta**.
2. Se intenta fusionar (`absorb`) dentro del chunk inmediatamente anterior, siempre que la suma de palabras no exceda el límite máximo (`CHUNK_MAX_WORDS = 800`).
3. El chunk receptor registra:
   - `merged_section_ids`: lista de IDs de las secciones absorbidas.
   - `merged_section_titles`: títulos de las secciones absorbidas.
   - Actualiza `_pages` para que la cobertura física de páginas se expanda adecuadamente.
4. Si no existe un chunk anterior (ej. ocurre al principio del documento) o superaría el límite de palabras, se emite como un chunk independiente marcado con `short_section = True`.
5. Se audita que `chunk_coverage >= 0.995` en cada documento.

---

## Ciclo 5: OCR Adaptativo con Doble Disparador (`OCRExtractor`)

### El Problema
Aplicar OCR con Tesseract a todas las páginas de una biblioteca de cientos de PDFs ralentiza enormemente el procesamiento (hasta 10x) y degrada la calidad tipográfica en páginas digitales nativas. Por otro lado, no aplicar OCR deja en blanco documentos escaneados o páginas con fuentes vectoriales no embebidas.

### La Solución en V5.6
1. Se evalúa primero el texto nativo y su métrica técnica `text_quality_score`.
2. Se ejecuta OCR únicamente si:
   - Longitud $< 80$ caracteres, o
   - Palabras $< 20$, o
   - Calidad del texto nativo $< 0.35$.
3. Se renderiza la página a 200 DPI y se ejecuta Tesseract en modo bilingüe (`spa+eng`).
4. **Criterio de Victoria del OCR**: El texto OCR sustituye al nativo si aporta $> 20\%$ más palabras o si el nativo tenía $< 20$ palabras.
5. En `pages.jsonl` se conservan tanto `native_text` como `ocr_text` para auditoría comparativa.

---

## Ciclo 6: Auditoría Relacional de 9 Controles (`check_integrity`)

Al finalizar el procesamiento de un lote, `CorpusBuilder` evalúa automáticamente 9 invariantes lógicas:
1. **Unicidad de Identificadores**: Ningún ID de documento, página, sección, chunk o tabla está duplicado.
2. **Conteo de Páginas**: Las páginas extraídas equivalen exactamente al número de páginas del PDF original.
3. **Límites de Paginación en Chunks**: $1 \le \text{page\_start} \le \text{page\_end} \le \text{page\_count}$.
4. **Integridad Referencial de Secciones**: Todo chunk apunta a un `section_id` existente.
5. **Existencia de Chunks por Documento**: Ningún documento termina con 0 chunks.
6. **Umbral de Cobertura**: Todo documento cumple `chunk_coverage >= 0.995`.
7. **Páginas Huérfanas**: Ninguna página con $\ge 20$ palabras queda sin ser cubierta por al menos un chunk.
8. **Deduplicación Inter-documental**: Detección de párrafos idénticos entre documentos distintos.
9. **Marcado para Revisión Humana**: Identificación de páginas con baja confianza OCR o texto escaso en `review_pages`.
