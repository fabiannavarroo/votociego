import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../../src/config.json', import.meta.url), 'utf8'));
const questions = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8'));

test('neutral answers retain party stances and related measures are readable', async ({ page }) => {
  await page.addInitScript(({ measures, version }) => {
    localStorage.setItem('votociego:progress:v1', JSON.stringify({ version, answers: Object.fromEntries(measures.map((q: {id: string}) => [q.id, 0])), importance: {}, index: measures.length - 1, completed: true }));
  }, { measures: questions, version: config.dataVersion });
  await page.goto('/#/revelacion');
  const childcare = page.locator('.reveal-card').filter({ has: page.getByRole('heading', { name: '¿Debería ser universal y gratuita la educación de 0 a 3 años?', exact: true }) });
  const psoe = childcare.locator('.documented-position').filter({ has: page.getByRole('heading', { name: 'Partido Socialista Obrero Español', exact: true }) });
  await expect(psoe.getByText('A favor', { exact: true })).toBeVisible();
  await expect(psoe.getByText('Sin comparar: respuesta neutral o incierta.', { exact: true })).toBeVisible();
  await expect(psoe).toContainText('plazas públicas gratuitas');
  const hours = page.locator('.reveal-card').filter({ has: page.getByRole('heading', { name: '¿Debería reducirse la jornada laboral máxima manteniendo el salario?', exact: true }) });
  const joint = hours.locator('.documented-position').filter({ has: page.getByRole('heading', { name: 'Compromís', exact: true }) });
  await expect(joint.getByText('A favor', { exact: true })).toBeVisible();
  await expect(joint.getByText('Sin comparar: respuesta neutral o incierta.', { exact: true })).toBeVisible();
  const pnv = childcare.locator('.documented-position').filter({ has: page.getByRole('heading', { name: 'Euzko Alderdi Jeltzalea–Partido Nacionalista Vasco', exact: true }) });
  await expect(pnv.getByText('Documentación relacionada', { exact: true })).toBeVisible();
  await expect(pnv).toContainText('Estas medidas no permiten asignar un apoyo o rechazo al enunciado.');
  const rent = page.locator('.reveal-card').filter({ has: page.getByRole('heading', { name: '¿Deberían limitarse los precios del alquiler en zonas con dificultades de acceso a vivienda?', exact: true }) });
  const compromis = rent.locator('.documented-position').filter({ has: page.getByRole('heading', { name: 'Compromís', exact: true }) });
  await expect(compromis.getByText('A favor con condiciones', { exact: true })).toBeVisible();
  await expect(compromis).toContainText('2025-03-27');
  await compromis.locator('summary').click();
  await expect(compromis.getByRole('link', { name: /Consultar fuente original/ }).last()).toHaveAttribute('href', /valencia\.compromis\.net/);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
});
