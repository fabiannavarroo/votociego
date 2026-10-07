# Revisión del lenguaje del cuestionario

Revisión editorial asistida: 07/10/2026. Se revisaron las 50 preguntas publicadas, sus explicaciones, argumentos posibles y matices. No se ha realizado una prueba de comprensión con usuarios ni una validación externa de lectura fácil.

## Criterios

- Preguntar por la misma medida con palabras cotidianas, sin atribuirla a un partido ni sugerir una respuesta.
- Conservar actor, alcance, dirección, condiciones, porcentajes y fechas. No sustituir una medida concreta por una preferencia política general.
- Mostrar una explicación breve junto al enunciado. Explicar los términos que no pueden eliminarse sin perder precisión.
- Dejar los argumentos y matices en el bloque opcional de contexto, sin repetir la explicación ni el argumento favorable como «objetivo».
- Mantener los 50 identificadores, el orden, las fuentes y las posiciones de los partidos. Es una revisión de redacción: la versión del cuestionario y las respuestas existentes siguen siendo compatibles.
- Editar `src/data/issues.json`, origen editorial, y regenerar `questions.json`. Las recetas de extracción inicial conservan la historia de esa extracción y no sustituyen el corpus actual.

## Ejemplos

| Antes | Después |
|---|---|
| ¿Debería ampliarse la cobertura de salud bucodental de la sanidad pública? | ¿Debería la sanidad pública cubrir más tratamientos dentales? |
| ¿Deberían hacerse permanentes los gravámenes extraordinarios a banca y empresas energéticas? | ¿Deberían mantenerse de forma permanente los impuestos especiales a bancos y empresas energéticas? |
| ¿Debería destinarse apoyo público específico a la ganadería extensiva? | ¿Deberían darse ayudas públicas específicas a la ganadería que aprovecha los pastos y el terreno? |
| ¿Debería priorizarse software libre en la contratación informática pública? | ¿Debería la Administración dar prioridad a programas informáticos que se puedan usar, estudiar y modificar libremente? |

## Precisiones conservadas

El salario mínimo sigue preguntando por el 60 % del salario medio, explicado como 6 de cada 10 euros de esa referencia. Se conserva la diferencia entre el tipo general del impuesto de sociedades y un mínimo efectivo. El aval del 95 % de vivienda sigue siendo un préstamo que hay que devolver. La ayuda de crianza no se convierte en una prestación universal. Las renovables se refieren a electricidad, no a toda la energía. La cooperación conserva RNB, 0,7 % y 2030; defensa conserva PIB y 2 %. El convenio autonómico conserva la condición de ser más favorable. Los desahucios se refieren a hogares, también si vive una sola persona, y las pensiones contributivas incluyen su vínculo con las cotizaciones sin exigir que quien las cobra haya cotizado personalmente.

El contexto de la Ley de Seguridad Ciudadana de 2015 se comprobó en el [texto oficial del BOE](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2015-3442). La pregunta sigue planteando quitar la ley completa, no cambiar solo una parte.

El reconocimiento de Palestina se formula como opinión sobre la decisión, sin presentarlo como pendiente: España lo aprobó el 28/05/2024. Se comprobó en el [resumen oficial del Consejo de Ministros](https://www.lamoncloa.gob.es/consejodeministros/resumenes/paginas/2024/280524-rueda-de-prensa-ministros.aspx). Este contexto no añade una postura a ningún partido.

Las explicaciones de extranjería se contrastaron con la [información del Ministerio del Interior sobre internamiento](https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/regimen-general/centro-de-internamiento-de-extranjeros/) y la [hoja de Migraciones sobre arraigo social](https://www.inclusion.gob.es/web/migraciones/w/autorizacion-residencia-temporal-por-circunstancias-excepcionales.-arraigo-social). La descripción del órgano de gobierno judicial y de sus doce miembros judiciales se cotejó con el [informe institucional del CGPJ de marzo de 2025](https://www.poderjudicial.es/stfls/CGPJ/AN%C3%81LISIS%20DE%20LA%20ACTIVIDAD%20JUDICIAL/ESTUDIOS%20Y%20ENCUESTAS/ESTUDIOS/FICHERO/20250325%20Informe%20GT%20CGPJ%20Disposici%C3%B3n%20Adicional%20Ley%20Org%C3%A1nica%2032024.pdf). Estas referencias sirven para explicar vocabulario; no se usan para inferir posiciones políticas nuevas.
