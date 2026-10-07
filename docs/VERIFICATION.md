# Verificación de la base real de VotoCiego

Fecha: 07/10/2026.

- `npm run verify-data`: 19 fuentes, 130 citas y 50 cuestiones; hashes locales, páginas y trazabilidad correctos.
- `npm test`: 13 pruebas aprobadas en tres archivos.
- `npm run test:e2e`: ocho pruebas aprobadas. Recorrido completo de las 50 preguntas, contexto, guardado, resultados, exportación PNG, revelación, comparador, fuentes, navegación por teclado, lectura sin conexión y controles automáticos de accesibilidad en claro y oscuro.
- Responsive: rutas principales y fichas comprobadas a 320, 375, 390, 430, 768, 1280 y 1920 píxeles; sin desbordamiento horizontal del documento.
- GitHub Pages: build con `VITE_BASE_PATH=/votociego/`; recursos bajo esa base, ámbito de caché correspondiente y navegación y recarga de ficha y cuestionario verificadas en el navegador. Es una comprobación local de compatibilidad; no constituye un despliegue público.
- `npm run build`: compilación TypeScript y build de producción completados. Se restauró el build normal después de comprobar la base de GitHub Pages. Vite avisa del tamaño del bloque principal que incluye el corpus estático; no hay error de compilación.
- `npm run update-data`: informe HTTP conservado en `src/data/pending/`; no sobrescribe registros verificados. Los bloqueos y el enlace antiguo roto se detallan en `DATA_REPORT.md`.

Estas comprobaciones validan funcionamiento y trazabilidad. La revisión política fue asistida, sin revisión humana externa independiente. Los programas electorales de 2023 se identifican como históricos. La cobertura incompleta y las posiciones desconocidas permanecen visibles.

Capturas finales: `real-data-quality.jpg` y `real-data-comparison.jpg`.
