import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../../src/config.json',import.meta.url),'utf8'));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8')) as { statement: string }[];
const answerLabels = ['Totalmente de acuerdo', 'De acuerdo', 'Neutral / No estoy seguro', 'En desacuerdo', 'Totalmente en desacuerdo'];
test('neutral answers never create invented party percentages', async ({ page }) => {
  await page.addInitScript(({ measures, dataVersion }) => {
    localStorage.setItem('votociego:progress:v1', JSON.stringify({ version: dataVersion, answers: Object.fromEntries(measures.map(question => [question.id, 0])), importance: {}, index: measures.length - 1, completed: true }));
  }, { measures: questions as { id: string; statement: string }[], dataVersion: config.dataVersion });
  await page.goto('/#/resultados');
  await expect(page.getByRole('heading', { name: 'No hay respuestas comparables' })).toBeVisible();
  await expect(page.locator('.affinity-percentage')).toHaveCount(0);
  await expect(page.locator('.results-topics')).not.toHaveAttribute('open');
  await page.locator('.affinity-unknown > summary').click();
  await expect(page.locator('.affinity-unknown li')).toHaveCount(18);
});
test('blind questionnaire, local resume, map, priorities, sources and download', async ({ page }) => {
  const failures: string[] = []; page.on('pageerror', error => failures.push(error.message));
  const externalRequests: string[] = []; page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('blob:') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
  await page.goto('/#/test');
  await expect(page.getByRole('button', { name: 'Siguiente', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Necesito contexto' }).click();
  await expect(page.getByRole('heading', { name: 'Argumentos en contra' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/Partido Popular|Socialista Obrero|VOX|Sumar|Sánchez|Feijóo|Abascal/);
  await page.getByText('De acuerdo', { exact: true }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '¿Quieres continuar donde lo dejaste?' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(questions[1].statement);
  await page.getByRole('button', { name: 'Anterior', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'De acuerdo', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  for (let index = 1; index < questions.length; index++) {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(questions[index].statement);
    if (index === 7) await page.getByRole('button', { name: 'Saltar pregunta', exact: true }).click();
    else { await page.getByText(answerLabels[index % 5], { exact: true }).click(); await page.getByRole('button', { name: index === questions.length - 1 ? 'Ver resultados' : 'Siguiente', exact: true }).click(); }
  }
  await expect(page.getByRole('heading', { name: 'Coincidencia con partidos', exact: true })).toBeVisible();
  await expect(page.getByText(`${questions.length-1} propuestas respondidas`, { exact: false }).first()).toBeVisible();
  expect(await page.locator('.affinity-card').count()).toBeGreaterThan(0);
  await expect(page.locator('.results-topics')).not.toHaveAttribute('open');
  await expect(page.locator('.profile-row').first()).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tus respuestas, cuestión por cuestión' })).toHaveCount(0);
  const percentages = await page.locator('.affinity-percentage').allTextContents();
  for (const percentage of percentages) expect(Number.parseInt(percentage)).toBeGreaterThanOrEqual(0);
  await page.reload();
  await expect(page.locator('.affinity-percentage')).toHaveText(percentages);
  await page.locator('.results-topics > summary').click();
  await page.getByRole('button', { name: 'Personalizar temas' }).click();
  await page.locator('.importance-row').filter({ has: page.getByText('Vivienda', { exact: true }) }).getByText('Mucho', { exact: true }).click();
  await expect(page.locator('.profile-row').first()).toContainText('Vivienda');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar mis temas' }).click();
  const exported=await download;expect(exported.suggestedFilename()).toBe('mi-mapa-de-posiciones.png');
  const png=readFileSync((await exported.path())!);expect(png.readUInt32BE(20)).toBeGreaterThan(2000);
  await page.getByRole('link', { name: 'Consultar propuestas y fuentes' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Descubre las propuestas documentadas');
  await expect(page.locator('.reveal-card')).toHaveCount(questions.length);
  await page.locator('.reveal-card').first().locator('.evidence-history').first().locator('summary').click();
  const source = page.getByRole('link', { name: /Consultar fuente original/ }).first();
  expect(await source.getAttribute('href')).toMatch(/^https:\/\//);
  await expect(page.getByRole('link', { name: 'Comparar', exact: true })).toHaveCount(0);
  expect(externalRequests).toEqual([]); expect(failures).toEqual([]);
});
test('themes, text sizing and immediate deletion persist correctly', async ({ page }) => {
  await page.goto('/#/test'); await page.getByText('Neutral / No estoy seguro', { exact: true }).click();
  await page.getByRole('button', { name: 'Oscuro', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark'); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Aumentar tamaño del texto' }).click(); await expect(page.locator('html')).toHaveClass('large-text');
  await page.getByRole('button', { name: 'Borrar mis respuestas', exact: true }).click();
  await expect(page.getByText('Tus respuestas y preferencias se han borrado de este dispositivo.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('votociego:')))).toEqual([]);
});
test('all pages and responsive widths have no body overflow', async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [320, 375, 390, 430, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['', 'test', 'partidos', 'partidos/pp', 'partidos/ahi', 'comparar', 'candidatos', 'fuentes', 'metodologia', 'privacidad', 'acerca-de', 'resultados', 'revelacion', 'admin-data', 'no-existe']) {
      await page.goto(`/#/${route}`); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, `Overflow at ${width}px: ${route}`).toBe(false);
    }
  }
});
test('mobile menu and questionnaire work with keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await page.getByRole('link', { name: 'Test', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('radio', { name: 'Totalmente de acuerdo', exact: true }).focus();
  await page.keyboard.press('ArrowDown'); await expect(page.getByRole('radio', { name: 'De acuerdo', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(questions[1].statement);
});
test('production PWA caches app and extracted records for offline reading', async ({ page, context }) => {
  await page.goto('/'); await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true); await page.goto('/#/test');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(questions[0].statement);
  await page.getByText('De acuerdo', { exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '¿Quieres continuar donde lo dejaste?' })).toBeVisible();
  await page.goto('/#/partidos/pp'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Partido Popular');
  await expect(page.getByText('Propone eliminar el impuesto a las grandes fortunas.',{exact:true}).first()).toBeVisible();
  await context.setOffline(false);
});

test('party percentages, folded topics and sources fit narrow screens and large text', async ({ page }) => {
  await page.addInitScript(({ measures, dataVersion }) => {
    localStorage.setItem('votociego:progress:v1', JSON.stringify({ version: dataVersion, answers: Object.fromEntries(measures.map((q, i) => [q.id, i % 5 - 2])), importance: { housing: 3 }, index: measures.length-1, completed: true }));
  }, { measures: questions as { id: string; statement: string }[], dataVersion:config.dataVersion });
  for (const width of [320, 375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['resultados', 'revelacion', 'comparar']) {
      await page.goto(`/#/${route}`); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), `Populated ${route} overflows ${width}px`).toBe(false);
    }
  }
  await page.goto('/#/resultados'); await page.getByRole('button', { name: 'Aumentar tamaño del texto' }).click();
  await page.locator('.results-topics > summary').click();
  await page.getByRole('button', { name: 'Personalizar temas' }).click();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), `Large text overflows ${width}px`).toBe(false);
  }
});

test('source filters and legacy comparator links preserve a simple results flow',async({page})=>{
 await page.goto('/#/fuentes');
 await page.getByRole('combobox',{name:'Formación',exact:true}).selectOption('pp');
 await page.getByRole('combobox',{name:'Tema',exact:true}).selectOption('tax');
 await page.getByRole('combobox',{name:'Tipo de fuente',exact:true}).selectOption('electoral_program');
 await expect(page.locator('.source-card')).toHaveCount(1);
 await expect(page.locator('.source-card')).toContainText('Programa electoral');
 await page.getByLabel('Buscar fuentes por documento o partido').fill('sin resultado inventado');
 await expect(page.locator('.source-card')).toHaveCount(0);
 await page.goto('/#/comparar?issue=fortunas&parties=pp,psoe,vox,upn');
 await expect(page).toHaveURL(/#\/resultados$/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Coincidencia con partidos');
 await expect(page.getByRole('link',{name:'Comparar',exact:true})).toHaveCount(0);
 const githubLink=page.getByRole('link',{name:'GitHub',exact:false}).last();
 if(config.githubUrl){
  await expect(githubLink).toHaveAttribute('href',config.githubUrl);
  await expect(githubLink).toHaveAttribute('target','_blank');
  await expect(githubLink).toHaveAttribute('rel','noopener noreferrer');
 }else{
  await githubLink.click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Tus ideas. Tu criterio.');
 }
});
