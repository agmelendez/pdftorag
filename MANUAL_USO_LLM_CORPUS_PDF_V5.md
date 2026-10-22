# MANUAL DE USO PARA LLM DEL CORPUS PDF V5.x
## CIOdD-UCR — Research & RAG Edition

**Propósito:** definir cómo un modelo de lenguaje (LLM), agente RAG o sistema de análisis documental debe interpretar, priorizar y utilizar los archivos generados por el pipeline PDF Intelligence V5.x.

**Este manual NO explica cómo funciona el código.** Su objetivo es establecer reglas de uso, lectura, recuperación, validación, trazabilidad y citación de la información extraída de documentos PDF.

---

# 1. PRINCIPIO GENERAL DE USO

Los archivos generados representan distintas vistas del mismo corpus documental. No todos tienen la misma función ni el mismo nivel de autoridad.

Un LLM debe distinguir entre:

1. **Archivos de contenido:** contienen el texto y las tablas extraídas.
2. **Archivos de estructura:** describen documentos, páginas, secciones y chunks.
3. **Archivos de calidad y auditoría:** indican confiabilidad, errores y condiciones de extracción.
4. **Archivos de consulta:** permiten buscar y filtrar información de forma eficiente.
5. **Archivos de índice:** aceleran recuperación lexical o semántica, pero no deben considerarse evidencia primaria.

La regla fundamental es:

> **El índice ayuda a encontrar evidencia; la evidencia debe validarse contra el contenido estructurado y su trazabilidad documental.**

---

# 2. JERARQUÍA DE EVIDENCIA

Cuando un LLM deba responder una pregunta basada en el corpus, deberá usar esta jerarquía:

## Nivel 1 — Evidencia primaria

- `pages.parquet`
- `pages.jsonl`
- `tables.parquet`
- `tables.jsonl`

Estos archivos contienen la representación más cercana al documento original y deben considerarse la fuente primaria para verificar una afirmación.

## Nivel 2 — Evidencia estructurada

- `sections.parquet`
- `sections.jsonl`
- `chunks.parquet`
- `chunks.jsonl`

Estos archivos reorganizan el contenido para análisis, búsqueda y RAG. Son adecuados para recuperar información y construir contexto, pero una afirmación importante debe conservar su referencia al documento y página.

## Nivel 3 — Metadatos documentales

- `documents.parquet`
- `documents.jsonl`

Se utilizan para identificar el documento, sus características generales, calidad promedio, número de páginas, secciones, chunks, tablas y uso de OCR.

## Nivel 4 — Calidad y auditoría

- `quality_report.json`
- `processing_log.jsonl`
- `errors.jsonl`
- `manifest.json`

Se utilizan para evaluar la confiabilidad del corpus, detectar problemas de extracción y decidir si una respuesta requiere cautela o verificación adicional.

## Nivel 5 — Índices de recuperación

- `tfidf_vectorizer.joblib`
- `tfidf_matrix.joblib`
- opcionalmente `embeddings.npy`
- opcionalmente `faiss.index`
- opcionalmente `faiss_mapping.jsonl`

Estos archivos sirven para **encontrar** contenido relevante. No deben utilizarse como evidencia por sí mismos.

---

# 3. REGLA GENERAL PARA UN LLM

Un LLM que trabaje con este corpus debe seguir siempre este flujo:

```text
Pregunta del usuario
        ↓
Identificar tipo de información solicitada
        ↓
Buscar candidatos en chunks / TF-IDF / DuckDB
        ↓
Recuperar sección y páginas asociadas
        ↓
Verificar calidad de extracción
        ↓
Consultar pages / tables cuando sea necesario
        ↓
Construir respuesta
        ↓
Citar documento + sección + página
        ↓
Indicar incertidumbre si la evidencia es parcial
```

Nunca debe responder únicamente porque un chunk contiene una frase aparentemente relevante.

---

# 4. `documents.parquet` / `documents.jsonl`

## Función

Representan el nivel **documento**.

Cada registro corresponde a un PDF procesado.

## Usos principales

El LLM debe utilizar estos archivos para:

- identificar documentos;
- conocer su nombre;
- conocer el tipo de PDF;
- conocer número de páginas;
- conocer número de palabras;
- conocer cantidad de tablas;
- conocer número de secciones;
- conocer número de chunks;
- conocer páginas procesadas mediante OCR;
- conocer calidad promedio;
- distinguir documentos digitales, escaneados o híbridos.

## Campos importantes

### `document_id`

Identificador único del documento.

Debe utilizarse como llave principal para relacionar:

- documentos;
- páginas;
- secciones;
- chunks;
- tablas.

Nunca debe confundirse con el nombre del archivo.

### `filename`

Nombre original del PDF.

Es el identificador que debe utilizarse preferentemente al comunicar resultados al usuario.

### `profile_type`

Valores esperados:

- `digital`
- `scanned`
- `hybrid`
- `empty`
- `unknown`

Interpretación:

| Valor | Interpretación |
|---|---|
| digital | El PDF contiene una capa de texto usable |
| scanned | El contenido depende principalmente de OCR |
| hybrid | Mezcla de texto digital e imágenes/escaneos |
| empty | No se detectó contenido útil |
| unknown | No fue posible clasificar adecuadamente |

### `ocr_pages`

Número de páginas cuyo contenido principal fue recuperado mediante OCR.

Un valor alto debe aumentar la cautela del LLM.

### `average_quality`

Calidad promedio de extracción del documento.

Este valor **no mide calidad científica, metodológica ni editorial del documento**.

Solo indica calidad técnica de la extracción.

## Regla para el LLM

Nunca interpretar:

> `average_quality = 0.95`

como:

> “Este es un documento científicamente excelente.”

Debe interpretarse como:

> “La extracción del contenido de este documento presenta alta calidad técnica.”

---

# 5. `pages.parquet` / `pages.jsonl`

## Función

Representan el nivel más importante para **trazabilidad**.

Cada registro corresponde a una página específica del PDF.

## Usos principales

El LLM debe utilizarlos para:

- verificar citas;
- comprobar contenido recuperado desde un chunk;
- identificar página exacta;
- determinar si una página proviene de OCR;
- evaluar calidad de extracción;
- estudiar bloques;
- localizar encabezados;
- identificar imágenes;
- identificar tablas asociadas.

## Campos importantes

### `page_number`

Número de página dentro del PDF procesado.

Es la referencia principal que debe acompañar una respuesta.

### `clean_text`

Texto recomendado para análisis.

Se ha normalizado y se han eliminado encabezados/pies repetitivos cuando fueron detectados.

### `native_text`

Texto recuperado directamente de la capa textual del PDF.

Debe utilizarse para auditoría cuando exista alguna duda sobre el texto final.

### `ocr_text`

Texto obtenido mediante OCR.

Solo tendrá contenido cuando se haya realizado OCR.

### `extraction_source`

Valores típicos:

- `native`
- `ocr`

Interpretación:

- `native`: se utilizó principalmente la capa textual del PDF.
- `ocr`: el OCR produjo una representación considerada superior a la extracción nativa.

### `ocr_confidence`

Estimación de confianza del OCR.

Debe utilizarse como evidencia auxiliar, no como garantía absoluta.

### `overall_quality_score`

Calidad técnica general de extracción de esa página.

## Regla de decisión recomendada

### Calidad ≥ 0.80

Uso normal.

### Calidad 0.60–0.79

Uso aceptable, con verificación cuando la afirmación sea importante.

### Calidad 0.40–0.59

Usar con cautela.

Verificar:

- texto nativo;
- OCR;
- contexto de páginas vecinas;
- tablas asociadas.

### Calidad < 0.40

No utilizar como única fuente de una afirmación importante.

El LLM debe:

1. buscar otra página o documento;
2. verificar el contenido;
3. informar la limitación si no existe evidencia alternativa.

---

# 6. `sections.parquet` / `sections.jsonl`

## Función

Representan la estructura lógica detectada de cada documento.

Ejemplos:

- Introducción;
- Marco teórico;
- Metodología;
- Resultados;
- Discusión;
- Conclusiones;
- Referencias;
- secciones institucionales;
- apartados numerados.

## Usos principales

El LLM debe utilizarlas para:

- comprender la estructura del documento;
- distinguir resultados de antecedentes;
- distinguir metodología de conclusiones;
- restringir búsquedas a una sección;
- contextualizar un chunk.

## Campo principal

### `section_title`

Título de la sección detectada.

No debe asumirse que la detección es perfecta.

En documentos con diseños complejos, ciertos encabezados pueden haber sido detectados erróneamente.

## Regla para el LLM

Una frase encontrada en:

> `section_title = "Resultados"`

tiene una función documental diferente de una frase encontrada en:

> `section_title = "Antecedentes"`

El LLM debe preservar esta diferencia.

Por ejemplo:

- un antecedente no debe presentarse como resultado del estudio;
- una recomendación no debe presentarse como hallazgo;
- una cita bibliográfica no debe presentarse como conclusión del autor.

---

# 7. `chunks.parquet` / `chunks.jsonl`

## Función

Es el archivo principal para **RAG y recuperación de contexto**.

Cada chunk representa una unidad de texto suficientemente pequeña para ser analizada por un LLM, manteniendo trazabilidad.

## Usos principales

Usar `chunks` para:

- búsqueda lexical;
- búsqueda semántica;
- RAG;
- clasificación;
- extracción temática;
- comparación documental;
- análisis cualitativo;
- construcción de contexto para un LLM.

## Campos esenciales

### `chunk_id`

Identificador único del fragmento.

### `document_id`

Documento de origen.

### `filename`

Nombre del PDF original.

### `section_id`

Sección de origen.

### `section_title`

Título de la sección.

### `page_start`

Primera página cubierta por el chunk.

### `page_end`

Última página cubierta por el chunk.

### `text`

Contenido principal del chunk.

### `quality_score`

Promedio aproximado de calidad de las páginas que alimentan el chunk.

### `related_table_ids`

Lista de tablas relacionadas con las páginas del chunk.

## Regla crítica

Un chunk es una **unidad de recuperación**, no una nueva fuente documental.

El LLM no debe citar:

> “chunk 147”

como evidencia para el usuario.

Debe citar:

> Documento X, sección Y, pp. 15–16.

---

# 8. CHUNKS CON OVERLAP

Los chunks pueden contener una porción de texto repetida respecto del chunk anterior.

Esto existe para preservar contexto.

## Regla para el LLM

No interpretar fragmentos repetidos como evidencia independiente.

Ejemplo:

Si la misma oración aparece en:

- chunk 15;
- chunk 16;

esto no significa que dos fuentes distintas confirmen la afirmación.

Ambos chunks pueden proceder de la misma página y del mismo documento.

---

# 9. `tables.parquet` / `tables.jsonl`

## Función

Contienen las tablas estructuradas detectadas dentro de los PDF.

## Usos principales

Utilizar estos archivos para:

- recuperar cifras;
- identificar indicadores;
- comparar valores;
- analizar frecuencias;
- recuperar categorías;
- realizar análisis estadístico;
- convertir tablas documentales en datasets.

## Campos principales

### `table_id`

Identificador único de la tabla.

### `document_id`

Documento de origen.

### `page_number`

Página donde aparece.

### `headers`

Encabezados detectados.

### `records`

Representación fila por fila.

### `matrix`

Representación completa de la tabla.

### `strategy`

Método utilizado para detectar la tabla.

Puede incluir:

- `lines`
- `text`

## Regla para el LLM

Las tablas deben interpretarse con más cautela que el texto continuo.

Antes de afirmar un dato:

1. verificar encabezados;
2. verificar fila;
3. verificar unidad;
4. verificar página;
5. verificar contexto textual de la página.

## Prohibición

No inferir automáticamente que:

- una columna es porcentaje;
- una cifra está en millones;
- una variable es anual;
- una categoría corresponde a sexo, edad o región;

si la tabla no lo establece claramente.

---

# 10. TABLAS Y CONTEXTO

Cuando un chunk tenga:

```text
related_table_ids
```

el LLM debe considerar esas tablas como evidencia relacionada.

Flujo recomendado:

```text
chunk relevante
       ↓
related_table_ids
       ↓
tables.parquet
       ↓
page_number
       ↓
pages.parquet
       ↓
contexto textual
```

Esto permite interpretar correctamente:

- títulos;
- notas;
- unidades;
- definiciones;
- fuentes;
- advertencias metodológicas.

---

# 11. `quality_report.json`

## Función

Resume la calidad técnica general del corpus.

## Usos principales

El LLM puede utilizarlo para conocer:

- número total de documentos;
- número total de páginas;
- número de chunks;
- número de tablas;
- número de errores;
- número de páginas OCR;
- calidad promedio;
- distribución de calidad.

## Uso correcto

Sirve para responder preguntas como:

> ¿Qué tan confiable es técnicamente la extracción del corpus?

No sirve para responder:

> ¿Qué tan confiables son científicamente los estudios?

---

# 12. `processing_log.jsonl`

## Función

Registro de procesamiento por documento.

## Usos principales

Permite identificar:

- documentos procesados correctamente;
- tiempo de procesamiento;
- número de páginas;
- palabras;
- tablas;
- chunks;
- páginas OCR;
- calidad.

## Uso para un LLM

Debe utilizarse principalmente para auditoría y diagnóstico.

No debe utilizarse como contenido sustantivo del corpus.

---

# 13. `errors.jsonl`

## Función

Registra problemas ocurridos durante el procesamiento.

## Regla crítica

Antes de afirmar que:

> “El corpus contiene todos los documentos sin problemas.”

el LLM debe consultar este archivo.

## Tipos de errores posibles

- documento completo;
- página;
- tabla;
- DuckDB;
- embeddings;
- otros procesos secundarios.

## Interpretación

Un error de embeddings **no invalida el contenido documental**.

Un error de una página sí puede afectar la evidencia contenida en esa página.

Un error de documento completo puede indicar ausencia total de ese PDF dentro del corpus analítico.

---

# 14. `manifest.json`

## Función

Es el inventario general del corpus generado.

## Usos principales

Utilizarlo para:

- identificar versión del pipeline;
- conocer configuración;
- conocer cantidad de elementos;
- verificar archivos disponibles;
- registrar reproducibilidad.

## Regla para agentes

Antes de iniciar una tarea compleja, un agente debería consultar `manifest.json` para conocer qué recursos están disponibles.

---

# 15. `corpus.duckdb`

## Función

Base de datos analítica integrada.

Es uno de los recursos más importantes para agentes capaces de ejecutar SQL.

## Tablas esperadas

- `documents`
- `pages`
- `sections`
- `chunks`
- `tables`

## Uso recomendado

DuckDB debe utilizarse para:

- filtros;
- conteos;
- cruces;
- búsquedas exactas;
- selección de documentos;
- selección de páginas;
- análisis de calidad;
- consultas sobre secciones;
- identificación de tablas.

## Ejemplo conceptual

Pregunta:

> ¿Qué documentos contienen referencias a pobreza multidimensional?

Flujo:

```sql
SELECT DISTINCT
    filename
FROM chunks
WHERE LOWER(text)
LIKE '%pobreza multidimensional%';
```

Después deben recuperarse los chunks y páginas relevantes.

## Regla

SQL sirve para **seleccionar evidencia**, no para sustituir su interpretación.

---

# 16. `tfidf_vectorizer.joblib`

## Función

Contiene el modelo lexical utilizado para transformar consultas y documentos en una representación TF-IDF.

## Uso

Un LLM no debe leer directamente este archivo.

Debe ser utilizado por una herramienta de recuperación.

---

# 17. `tfidf_matrix.joblib`

## Función

Contiene la matriz lexical del corpus.

Permite comparar una consulta con los chunks existentes.

## Uso

Debe utilizarse para:

- recuperación rápida;
- ranking lexical;
- identificación de fragmentos relevantes.

## Limitación

TF-IDF reconoce coincidencias lexicales, no necesariamente equivalencia semántica profunda.

Ejemplo:

Puede recuperar muy bien:

> inteligencia artificial

cuando el texto contiene:

> inteligencia artificial

pero puede no considerar equivalente:

> sistemas automatizados de aprendizaje

si no comparte vocabulario.

---

# 18. EMBEDDINGS Y FAISS — SI EXISTEN

Los siguientes archivos son opcionales:

- `embeddings.npy`
- `faiss.index`
- `faiss_mapping.jsonl`

No son requeridos en la versión local basada en TF-IDF.

## `embeddings.npy`

Representación vectorial de los chunks.

No constituye evidencia.

## `faiss.index`

Índice para búsqueda por similitud vectorial.

No constituye evidencia.

## `faiss_mapping.jsonl`

Relaciona un vector con un `chunk_id`.

## Regla

Una búsqueda semántica debe terminar siempre en:

```text
vector
 ↓
chunk_id
 ↓
chunk
 ↓
documento
 ↓
página
```

Nunca:

```text
vector
 ↓
respuesta
```

---

# 19. ESTRATEGIA RECOMENDADA DE RECUPERACIÓN

## Pregunta factual simple

Ejemplo:

> ¿Cuál fue el tamaño de muestra reportado?

Flujo:

1. buscar en chunks;
2. priorizar términos exactos;
3. identificar documento;
4. identificar sección;
5. verificar página;
6. responder con página.

---

# 20. PREGUNTA CONCEPTUAL

Ejemplo:

> ¿Cómo definen los documentos la transformación digital?

Flujo:

1. búsqueda lexical amplia;
2. seleccionar múltiples documentos;
3. recuperar chunks;
4. agrupar definiciones;
5. distinguir definiciones explícitas de interpretaciones;
6. citar cada documento.

---

# 21. COMPARACIÓN ENTRE DOCUMENTOS

Ejemplo:

> Compare las metodologías utilizadas.

Flujo:

1. localizar secciones llamadas `Metodología`, `Métodos` o equivalentes;
2. recuperar chunks por documento;
3. identificar:
   - diseño;
   - población;
   - muestra;
   - instrumentos;
   - técnicas;
   - periodo;
4. construir matriz comparativa;
5. no homogenizar conceptos diferentes.

---

# 22. CONSULTAS CUANTITATIVAS

Ejemplo:

> ¿Cuál es el porcentaje de personas mayores de 65 años?

Flujo:

1. buscar chunks relacionados;
2. verificar `related_table_ids`;
3. consultar tabla;
4. identificar fila;
5. identificar columna;
6. verificar unidades;
7. consultar página;
8. responder.

---

# 23. ANÁLISIS DE RESULTADOS

Cuando se pregunte:

> ¿Cuáles son los principales resultados?

el LLM debe priorizar:

1. secciones `Resultados`;
2. tablas relacionadas;
3. figuras descritas en texto;
4. `Discusión`;
5. `Conclusiones`.

No debe priorizar:

- introducción;
- antecedentes;
- referencias.

---

# 24. ANÁLISIS METODOLÓGICO

Cuando se pregunte sobre metodología, priorizar:

- Metodología;
- Métodos;
- Diseño;
- Población;
- Muestra;
- Instrumentos;
- Procedimientos;
- Análisis estadístico.

No inferir métodos que no estén documentados.

---

# 25. CITACIÓN INTERNA DEL CORPUS

Toda respuesta factual debería conservar al menos:

- nombre del archivo;
- página;
- sección, cuando exista.

Formato recomendado:

```text
[Archivo: informe_2026.pdf | Sección: Resultados | pp. 34–35]
```

Para una tabla:

```text
[Archivo: informe_2026.pdf | Tabla en p. 42]
```

Para varias fuentes:

```text
[Fuente 1: documento_A.pdf, pp. 12–13]
[Fuente 2: documento_B.pdf, p. 45]
```

---

# 26. REGLAS ANTI-ALUCINACIÓN

Un LLM que utilice este corpus debe obedecer estas reglas:

## Regla 1

No afirmar información que no aparezca en el corpus.

## Regla 2

No completar cifras faltantes.

## Regla 3

No inventar nombres de variables.

## Regla 4

No inferir causalidad a partir de asociación.

## Regla 5

No convertir recomendaciones en resultados.

## Regla 6

No convertir antecedentes en hallazgos.

## Regla 7

No considerar dos chunks del mismo documento como dos fuentes independientes.

## Regla 8

No citar un chunk sin identificar documento y página.

## Regla 9

No ignorar `quality_score`.

## Regla 10

Si la extracción presenta problemas, informar la limitación.

---

# 27. MANEJO DE INCERTIDUMBRE

Si la evidencia es ambigua, el LLM debe utilizar lenguaje como:

> La evidencia recuperada sugiere...

> El documento reporta...

> En la página X se indica...

> La tabla parece mostrar..., aunque la extracción presenta calidad limitada.

> No se encontró evidencia suficiente en el corpus para afirmar...

Evitar:

> Definitivamente...

> Está demostrado...

cuando el corpus no justifique ese nivel de certeza.

---

# 28. REGLAS PARA OCR

Cuando:

```text
extraction_source = ocr
```

el LLM debe aumentar la vigilancia sobre:

- cifras;
- símbolos;
- fechas;
- nombres propios;
- fórmulas;
- caracteres especiales;
- tablas.

Ejemplos frecuentes de errores OCR:

```text
0 ↔ O
1 ↔ l
5 ↔ S
8 ↔ B
% omitido
coma decimal mal interpretada
guion convertido en signo menos
```

Una cifra crítica procedente de OCR debe verificarse contra:

- contexto;
- tabla;
- página;
- otra aparición del mismo dato.

---

# 29. REGLAS PARA DATOS ESTADÍSTICOS

Antes de reportar una cifra, verificar:

1. variable;
2. unidad;
3. denominador;
4. población;
5. periodo;
6. territorio;
7. fuente;
8. tabla;
9. página.

Ejemplo incorrecto:

> La pobreza es 18,2 %.

Ejemplo correcto:

> El documento reporta una incidencia de 18,2 % para la población analizada en 2025 [archivo X, p. 35].

---

# 30. USO PARA SÍNTESIS MULTIDOCUMENTAL

Cuando el LLM deba sintetizar varios documentos:

1. recuperar evidencia por documento;
2. mantener separación documental;
3. identificar convergencias;
4. identificar divergencias;
5. identificar evidencia ausente;
6. no fusionar resultados incompatibles;
7. registrar páginas.

Una estructura útil es:

| Tema | Documento | Evidencia | Página | Calidad |
|---|---|---|---:|---:|

---

# 31. FLUJO RAG RECOMENDADO

```text
USUARIO
  ↓
PREGUNTA
  ↓
TF-IDF / SQL
  ↓
TOP-K CHUNKS
  ↓
FILTRO DE CALIDAD
  ↓
DIVERSIFICACIÓN POR DOCUMENTO
  ↓
VERIFICACIÓN DE PÁGINAS
  ↓
RECUPERACIÓN DE TABLAS
  ↓
CONTEXTO FINAL
  ↓
LLM
  ↓
RESPUESTA TRAZABLE
```

---

# 32. DIVERSIFICACIÓN DE EVIDENCIA

No se recomienda enviar al LLM 10 chunks consecutivos del mismo documento si existen múltiples fuentes pertinentes.

Se recomienda:

- máximo 2–4 chunks por documento inicialmente;
- priorizar documentos distintos;
- ampliar contexto solo cuando sea necesario.

Esto reduce redundancia y mejora comparación.

---

# 33. VENTANA DE CONTEXTO

No debe enviarse todo `chunks.parquet` a un LLM.

Debe construirse contexto selectivo.

Ejemplo:

```text
Pregunta
↓
20 candidatos lexicales
↓
10 candidatos tras filtros
↓
5–8 fragmentos finales
↓
LLM
```

---

# 34. FILTRADO POR CALIDAD

Recomendación inicial:

```text
quality_score >= 0.60
```

para recuperación ordinaria.

Permitir:

```text
quality_score >= 0.40
```

cuando exista poca evidencia.

Fragmentos:

```text
quality_score < 0.40
```

deben requerir verificación explícita.

---

# 35. BÚSQUEDA LEXICAL

TF-IDF es especialmente útil para:

- nombres propios;
- leyes;
- códigos;
- variables;
- siglas;
- indicadores;
- conceptos técnicos;
- frases específicas.

Ejemplos:

```text
"índice de pobreza multidimensional"
"Ley 9986"
"SEIR"
"MIPYME"
"coeficiente de Gini"
```

---

# 36. BÚSQUEDA SQL

DuckDB es especialmente útil para:

- filtros exactos;
- rangos de calidad;
- documentos específicos;
- páginas;
- secciones;
- conteos;
- análisis de estructura.

---

# 37. BÚSQUEDA HÍBRIDA RECOMENDADA

Cuando sea posible combinar herramientas:

```text
TF-IDF
   +
DuckDB
   +
reglas documentales
```

Ejemplo:

```text
1. TF-IDF encuentra 20 chunks.
2. DuckDB filtra quality_score >= 0.60.
3. Se priorizan secciones Resultados.
4. Se verifica página.
5. Se consultan tablas relacionadas.
```

---

# 38. ARCHIVO A USAR SEGÚN LA TAREA

| Tarea | Archivo principal |
|---|---|
| Buscar información | `chunks.parquet` |
| Buscar frase exacta | `chunks.parquet` / DuckDB |
| Verificar página | `pages.parquet` |
| Analizar estructura | `sections.parquet` |
| Identificar documentos | `documents.parquet` |
| Recuperar cifras tabulares | `tables.parquet` |
| Revisar calidad | `quality_report.json` |
| Revisar fallos | `errors.jsonl` |
| Revisar procesamiento | `processing_log.jsonl` |
| Consultar con SQL | `corpus.duckdb` |
| Búsqueda lexical | TF-IDF |
| Auditoría general | `manifest.json` |

---

# 39. PROTOCOLO PARA RESPONDER UNA PREGUNTA

Un agente debe aplicar este protocolo:

## Paso 1 — Interpretar la pregunta

Identificar:

- tema;
- tipo de evidencia;
- periodo;
- población;
- territorio;
- nivel de precisión.

## Paso 2 — Recuperar candidatos

Utilizar:

- TF-IDF;
- DuckDB;
- búsqueda textual.

## Paso 3 — Evaluar contexto

Comprobar:

- documento;
- sección;
- páginas;
- calidad.

## Paso 4 — Recuperar evidencia adicional

Si hay cifras:

- tablas.

Si hay problemas:

- pages;
- OCR;
- errors.

## Paso 5 — Construir respuesta

Separar:

- evidencia explícita;
- síntesis;
- interpretación.

## Paso 6 — Citar

Documento + sección + página.

---

# 40. PLANTILLA DE INSTRUCCIÓN PARA UN LLM

Puede utilizarse la siguiente instrucción de sistema:

```text
Trabajas con un corpus documental derivado de archivos PDF.

Los chunks se utilizan exclusivamente para recuperar evidencia. Cada
afirmación factual debe poder trazarse hasta un documento y una página.

Prioriza evidencia de quality_score >= 0.60. Para información procedente
de OCR, tablas o páginas de menor calidad, verifica el contenido antes
de utilizarlo.

No inventes información faltante. No conviertas antecedentes en
resultados, recomendaciones en hallazgos ni asociaciones en causalidad.

Cuando existan varias fuentes, distingue coincidencias y divergencias.

Cita siempre:
- filename,
- section_title cuando esté disponible,
- page_start/page_end.

Si el corpus no contiene evidencia suficiente, indícalo expresamente.
```

---

# 41. PLANTILLA PARA CONSULTAS CIENTÍFICAS

```text
Responde únicamente con base en la evidencia recuperada del corpus.

Para cada afirmación:
1. identifica documento;
2. identifica sección;
3. identifica página;
4. verifica calidad;
5. verifica tablas relacionadas cuando existan.

Distingue:
- resultados reportados;
- interpretación de los autores;
- antecedentes;
- recomendaciones;
- inferencias propias.

No agregues conocimiento externo salvo que se solicite expresamente.
```

---

# 42. PLANTILLA PARA ANÁLISIS COMPARATIVO

```text
Compara los documentos seleccionados sin fusionar sus resultados.

Para cada documento identifica:
- objetivo;
- metodología;
- población;
- periodo;
- resultados;
- limitaciones;
- conclusiones.

Indica convergencias y divergencias solamente cuando exista evidencia
documental explícita.

Incluye documento y página para cada resultado relevante.
```

---

# 43. PLANTILLA PARA EXTRACCIÓN DE EVIDENCIA

```text
Extrae únicamente evidencia explícita relacionada con la pregunta.

Devuelve una tabla con:
- documento,
- sección,
- página,
- evidencia,
- tipo de evidencia,
- quality_score,
- observaciones.

No resumas ni interpretes información que no esté explícita.
```

---

# 44. PLANTILLA PARA DATOS CUANTITATIVOS

```text
Localiza las cifras relevantes.

Para cada cifra identifica:
- indicador,
- valor,
- unidad,
- población,
- periodo,
- territorio,
- tabla,
- página,
- documento.

Si alguno de estos elementos no aparece explícitamente, marca
"no especificado" en vez de inferirlo.
```

---

# 45. PROTOCOLO DE CONFIANZA

Un LLM puede utilizar la siguiente clasificación:

## Alta confianza

- evidencia explícita;
- calidad ≥ 0.80;
- página verificable;
- contexto suficiente.

## Confianza moderada

- calidad 0.60–0.79;
- evidencia clara;
- contexto suficiente.

## Confianza limitada

- calidad 0.40–0.59;
- OCR;
- tabla ambigua;
- contexto incompleto.

## No usar sin verificación

- calidad < 0.40;
- página con error;
- OCR muy deficiente;
- contenido fragmentado.

---

# 46. PROVENIENCIA

Toda evidencia debe conservar:

```text
document_id
filename
section_id
section_title
page_start
page_end
chunk_id
quality_score
```

Cuando sea una tabla:

```text
table_id
document_id
page_number
```

La proveniencia no debe eliminarse durante procesos posteriores.

---

# 47. PRINCIPIO DE NO DUPLICACIÓN

Antes de contar hallazgos o fuentes:

- comprobar `document_id`;
- comprobar páginas;
- comprobar overlap;
- comprobar `chunk_id`.

No contar múltiples chunks del mismo pasaje como múltiples evidencias.

---

# 48. PRINCIPIO DE SEPARACIÓN ENTRE RECUPERACIÓN E INTERPRETACIÓN

El sistema debe mantener dos etapas conceptualmente distintas:

## Recuperación

¿Qué evidencia existe?

## Interpretación

¿Qué significa esa evidencia?

No deben mezclarse.

---

# 49. PRINCIPIO DE TRANSPARENCIA

Cuando el corpus no permita responder una pregunta:

> No se encontró evidencia suficiente en los documentos procesados para responder esta pregunta.

Es preferible esta respuesta a completar con conocimiento externo no solicitado.

---

# 50. RESUMEN OPERATIVO

## Para buscar

Usar:

```text
chunks.parquet
+
TF-IDF
```

## Para filtrar

Usar:

```text
corpus.duckdb
```

## Para verificar

Usar:

```text
pages.parquet
```

## Para cifras

Usar:

```text
tables.parquet
```

## Para estructura

Usar:

```text
sections.parquet
```

## Para identificar documentos

Usar:

```text
documents.parquet
```

## Para calidad

Usar:

```text
quality_report.json
```

## Para errores

Usar:

```text
errors.jsonl
```

## Para reproducibilidad

Usar:

```text
manifest.json
```

---

# 51. REGLA FINAL PARA CUALQUIER LLM

> **Buscar → filtrar → verificar → contextualizar → responder → citar.**

Nunca:

> **Buscar → responder.**

La calidad del sistema no depende únicamente de encontrar el fragmento correcto, sino de preservar su contexto, proveniencia, calidad y relación con el documento original.

---

## Versión del manual

**Manual:** 1.0  
**Corpus objetivo:** PDF Intelligence Pipeline V5.x  
**Orientación:** LLM / RAG / agentes de investigación / análisis documental  
**Institución de referencia:** CIOdD-UCR  
