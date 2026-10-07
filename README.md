# VotoCiego

Aplicación estática para responder a medidas políticas sin identificar su autor y consultar después las posiciones documentadas, cuestión por cuestión. Mantiene la interfaz existente y funciona sin backend, cuentas ni claves.

La primera base real contiene **18 fichas, 19 fuentes primarias, 130 propuestas o actuaciones, 50 preguntas y 31 categorías**. La comprobación editorial corresponde al **07/10/2026**. Los programas son antecedentes de las generales de 2023; se distinguen de actividad parlamentaria y declaraciones posteriores. La cobertura es incompleta y desigual. Las casillas desconocidas no expresan neutralidad ni ausencia de postura del partido.

Consulta [DATA_REPORT.md](DATA_REPORT.md) para conocer la cobertura, los documentos, las incidencias y las decisiones editoriales. Las Cámaras fueron disueltas el 06/10/2026 y las elecciones están convocadas para el 29/11/2026. No se incorporan candidatos sin confirmación oficial para esa convocatoria.

## Ejecutar

Node.js 22.18 o superior y npm:

```bash
npm install
npm run dev
npm run build
npm run preview
```

El desarrollo normalmente abre `http://127.0.0.1:5173`. Producción: `dist/`. La caché PWA se activa en producción sobre HTTPS o localhost. Permite leer los registros integrados sin conexión tras la primera carga; los documentos originales externos requieren internet.

## Datos y actualización

- `src/data/parties.json`: partidos, coaliciones, federaciones y relaciones documentadas.
- `entities.json`: grupos parlamentarios, componentes, candidaturas históricas y atribuciones personales.
- `sources.json`: origen, fecha o incertidumbre, convocatoria, verificación, vigencia, páginas y hash SHA-256.
- `proposals.json`: fragmento original, resumen neutral, asunto, categorías, certeza y condiciones de comparabilidad.
- `issues.json`: asuntos y preguntas revisadas, argumentos posibles a favor/en contra y matices.
- `questions.json`: generado, con posiciones explícitas nulas y referencias a toda la evidencia.
- `candidates.json`: solo candidaturas oficialmente confirmadas; actualmente vacío.
- `pending/`: extracciones dudosas, preguntas rechazadas, incidencias y resultados de actualización.
- `research/documents/` y `research/text/`: documentos descargados y extracción por página para auditoría local. No se publican como recursos de la web.

```bash
npm run verify-data
npm run generate-data
npm run update-data
```

`verify-data` comprueba hashes locales, páginas, citas literales y uniones. `generate-data` publica únicamente asuntos revisados con evidencia comparable alta/media y controles de procedencia, vocabulario y duplicados. Conserva todos los registros y marca conflictos sin elegir una posición única.

`update-data` comprueba las URLs oficiales, los tipos de contenido y los hashes. Distingue 404/410, bloqueos, errores, cambios y documentos iguales. Escribe `pending/update-report.json` y `pending/UPDATE_REPORT.md`; **no sobrescribe fuentes, propuestas ni preguntas verificadas**. Una respuesta HTML que sustituye al PDF no cuenta como descarga válida. Los cambios requieren lectura, revisión editorial y una nueva generación.

Las recetas `prepare-editorial.py`, `complete-corpus.py` y `supplement-corpus.py` documentan la extracción inicial revisada y se ejecutan en ese orden. No son buscadores que infieran posturas por palabras clave. La extracción PDF original utilizó `pypdf`; los comandos habituales de comprobación/generación utilizan Node. Las interpretaciones dudosas permanecen pendientes.

Al modificar el contenido o significado de las preguntas, cambia `dataVersion` en `src/config.json` para impedir que se mezclen respuestas anteriores. Las fechas de publicación desconocidas permanecen nulas. Las páginas cuentan la portada del PDF como página 1.

## Comparación y privacidad

Al terminar el cuestionario, los resultados muestran logos y porcentajes de coincidencia por formación, con la base de preguntas comparable de cada una. La fórmula es 100 × (coincidencias + 0,5 × coincidencias parciales) / preguntas comparables, redondeada al entero más cercano y sin ponderación temática. Acuerdo y acuerdo total tienen el mismo sentido, sin inventar intensidad del partido. Neutrales, saltos, conflictos, baja certeza y posiciones desconocidas quedan fuera del denominador. Los resultados se ordenan por porcentaje; en empates, por mayor base y después alfabéticamente. La cobertura es desigual, por lo que no describen el programa completo ni recomiendan un voto. Sin base comparable se muestra ausencia de porcentaje, nunca un 0 % inventado. El desglose por temas, el método y las formaciones sin resultado quedan cerrados en desplegables. El comparador y la lista extensa de respuestas se retiraron del recorrido principal.

Los programas conjuntos se atribuyen a su coalición o candidatura; sus componentes no heredan automáticamente posturas. Las actuaciones de grupos se distinguen de las del partido. La documentación de Compromís-Sumar se conserva como contexto conjunto; la intervención de Noemí Santana identifica a la diputada y su adscripción comprobada.

Las respuestas y preferencias se guardan únicamente en `votociego:progress:v1` y `votociego:settings:v1`. No hay analítica ni envío de respuestas. El PNG se genera en el navegador, contiene el perfil personal y puede revisarse antes de compartir. Las tipografías e iconos se sirven localmente.

Rutas principales: `/#/test`, `/#/resultados`, `/#/revelacion`, `/#/partidos/pp`, `/#/fuentes`, `/#/metodologia` y `/#/admin-data`. La antigua ruta `/#/comparar` redirige a resultados. `/#/admin-data` es un inspector público de solo lectura, sin credenciales ni operaciones administrativas.

## Verificar

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas comprueban incertidumbre, atribución, conflictos, citas y páginas. El recorrido de navegador cubre las 50 preguntas, reanudación, saltos, prioridades, descarga PNG, fuentes, teclado, claro/oscuro, borrado, offline y tamaños entre 320 y 1920 px. Axe comprueba accesibilidad automáticamente en ambos temas; no equivale a una certificación ni sustituye pruebas con lectores de pantalla y personas.

## GitHub Pages

La aplicación usa `HashRouter` y archivos estáticos. Publica el repositorio con rama `main` y elige **GitHub Actions** en Settings → Pages. `.github/workflows/deploy.yml` instala, prueba, compila y publica `dist/` usando la base que proporciona `actions/configure-pages`.

Para una carpeta de proyecto:

```bash
VITE_BASE_PATH=/nombre-repo/ npm run build
```

`VITE_SITE_URL` permite configurar el origen público real para canonical, robots y sitemap. Sin variables, la base es relativa (`./`). Sirve los archivos mediante HTTP; no abras `index.html` con `file://`. La caché tiene ámbito propio por subcarpeta.

Repositorio: [fabiannavarroo/votociego](https://github.com/fabiannavarroo/votociego). Web: [VotoCiego en GitHub Pages](https://fabiannavarroo.github.io/votociego/). La publicación se realiza automáticamente al subir cambios a `main`. Las rutas con hash no se indexan como páginas HTML independientes.

El repositorio conserva únicamente los documentos y extracciones utilizados por el corpus publicado para reproducir sus comprobaciones. Los borradores de investigación, respuestas de controles de acceso y datos locales quedan fuera de Git; los PDF de auditoría tampoco se incluyen en `dist/`.

El código conserva su licencia MIT. Los documentos y marcas conservan las condiciones de sus titulares. Las fichas usan logotipos obtenidos de las webs oficiales, servidos localmente y disponibles sin conexión. Su procedencia, fecha y hashes constan en [docs/LOGOS.md](docs/LOGOS.md) y `public/logos/ATTRIBUTIONS.json`. Si una imagen no carga, se muestran las siglas. El cuestionario ciego sigue ocultando toda identidad de las formaciones.
