import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../../src/config.json',import.meta.url),'utf8'));
const measures = JSON.parse(readFileSync(new URL('../../src/data/questions.json', import.meta.url), 'utf8')) as { id: string }[];
test('accessible landmarks, names and contrast in both themes', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(({ measures, dataVersion }) => {
    if (!localStorage.getItem('votociego:progress:v1')) localStorage.setItem('votociego:progress:v1', JSON.stringify({ version: dataVersion, answers: Object.fromEntries(measures.map((q, i) => [q.id, i % 5 - 2])), importance: {}, index: measures.length-1, completed: true }));
  }, { measures, dataVersion:config.dataVersion });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['Claro', 'Oscuro']) {
    for (const route of ['', 'test', 'resultados', 'comparar', 'partidos', 'partidos/pp', 'revelacion', 'metodologia', 'fuentes', 'admin-data']) {
      await page.goto(`/#/${route}`); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.getByRole('button', { name: theme, exact: true }).click();
      await expect(page.locator('.site-header .brand')).toHaveCSS('color', theme === 'Oscuro' ? 'rgb(240, 244, 245)' : 'rgb(36, 41, 45)');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.map(v => ({ id: v.id, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), `${theme}: ${route}`).toEqual([]);
      if (route === 'resultados') {
        for (const summary of ['.results-topics > summary', '.affinity-method > summary']) await page.locator(summary).click();
        const unknownSummary = page.locator('.affinity-unknown > summary');
        if (await unknownSummary.count()) await unknownSummary.click();
        await page.getByRole('button', { name: 'Personalizar temas' }).click();
        const expanded = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(expanded.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) })), `${theme}: expanded results`).toEqual([]);
        const previousProgress = await page.evaluate(() => localStorage.getItem('votociego:progress:v1'));
        await page.evaluate(() => {
          const progress = JSON.parse(localStorage.getItem('votociego:progress:v1')!);
          progress.answers = Object.fromEntries(Object.keys(progress.answers).map(id => [id, 0]));
          localStorage.setItem('votociego:progress:v1', JSON.stringify(progress));
        });
        await page.reload();
        await page.locator('.affinity-unknown > summary').click();
        await expect(page.locator('.affinity-unknown li')).toHaveCount(18);
        const withoutComparableAnswers = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(withoutComparableAnswers.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) })), `${theme}: results without comparable answers`).toEqual([]);
        await page.evaluate(progress => localStorage.setItem('votociego:progress:v1', progress!), previousProgress);
      }
    }
  }
});
