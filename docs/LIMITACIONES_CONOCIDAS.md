# Limitaciones Conocidas — CIOdD-UCR PDF Intelligence Pipeline V5.6

**Fecha:** Octubre 2026  
**Versión:** 5.6.0  
**Centro de Investigación Observatorio del Desarrollo (CIOdD) — Universidad de Costa Rica**

Este documento detalla con transparencia científica las fronteras operativas, casos de borde y limitaciones metodológicas del pipeline V5.6, derivadas de las auditorías empíricas sobre documentos heterogéneos.

---

## 1. Maquetación y Multi-columna Compleja
- **Orden de lectura en columnas asimétricas**: PyMuPDF (`page.get_text("dict", sort=True)`) asume un flujo de lectura estándar (occidental, de arriba hacia abajo y de izquierda a derecha). En documentos con notas marginales densas, infografías entrelazadas o más de 2 columnas asimétricas, el flujo de lectura puede intercalar fragmentos de columnas adyacentes.
- **Recomendación**: En informes con maquetación tipo revista o tríptico, verificar los fragmentos resultantes en `chunks.jsonl`.

## 2. Reconocimiento Óptico de Caracteres (OCR)
- **Dependencia de Tesseract**: Requiere `tesseract` instalado en el sistema operativo con paquetes de idiomas (`tesseract-ocr-spa`, `tesseract-ocr-eng`).
- **Resolución y contraste**: El OCR se ejecuta a 200 DPI por defecto. Documentos escaneados con bajo contraste, manchas de tinta, curvatura de encuadernación o resolución inferior a 150 DPI pueden generar palabras mal reconocidas.
- **Formato plano**: El OCR condicional actual no reconstruye coordenadas de cajas de texto ni jerarquía tipográfica compleja; sustituye el texto de la página en bloque para garantizar cobertura de contenido.

## 3. Extracción y Clasificación de Tablas
- **Tablas multi-columna tipo prosa**: El clasificador heurístico (`AdaptiveTableExtractor`) descarta tablas de estrategia `text` cuando las celdas comienzan mayoritariamente en minúscula o cuando la cuadrícula abarca casi toda la página con alta densidad de palabras por celda. Esto evita alucinar tablas en columnas de texto justificado, pero puede rechazar listas tabulares no estructuradas sin líneas divisorias.
- **Micro-tablas residuales**: Se descartan tablas con un área relativa inferior al 3% (`page_area_share < 0.03`) para limpiar cajas decorativas o artefactos de encabezado. Si un documento posee una tabla genuina de 2x2 celdas de tamaño diminuto, podría ser reclasificada en `tables_rejected.jsonl`.
- **Tablas rotadas o apaisadas**: No se aplica rotación automática a páginas apaisadas dentro de documentos verticales si los metadatos de rotación no están presentes en el PDF.

## 4. Detección de Encabezados (Headings)
- **Umbral de palabras**: Se establece un límite máximo estricto de 16 palabras y 180 caracteres para prevenir que oraciones de cuerpo de texto con tipografía enfática se clasifiquen como títulos de sección.
- **Rechazo de oraciones con puntuación interna**: Bloques de texto con más de 10 palabras que contengan puntos internos (`.`) son descalificados como títulos a menos que comiencen con numeración formal (ej. `1.1`, `Sección II`).
- **Tipografía homogénea**: En documentos mecanografiados o monospaciados donde no existe variación en el tamaño de fuente o grosor tipográfico, el detector depende de expresiones regulares estándar (ej. *Introducción*, *Metodología*) y puede no detectar subtítulos personalizados.

## 5. Granularidad de Fragmentación (Chunking)
- **Descarte de fragmentos ultracortos**: Chunks residuales aislados con menos de 20 palabras únicas (`min_chunk_words_discard = 20`) se omiten del índice para evitar ruido semántico en RAG (portadas con una sola línea o avisos legales aislados).
- **Cobertura objetivo**: Si un documento contiene únicamente 15 palabras en total, este filtro se desactiva automáticamente para proteger la garantía de cero pérdida.

## 6. Seguridad y Archivos No Soportados
- **PDFs cifrados**: Documentos protegidos por contraseña o con permisos de lectura restringidos no se procesan y se registran en `errors.jsonl`.
- **Formularios interactivos (AcroForms / XFA)**: Los valores de campos de formulario interactivos no siempre son exportados por el flujo de texto estático.
