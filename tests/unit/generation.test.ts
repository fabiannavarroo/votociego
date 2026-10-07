import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('publication of web evidence', () => {
  it('accepts text locators and rejects web quotations without a locator', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'votociego-generation-'));
    try {
      mkdirSync(join(temporary, 'scripts'));
      cpSync('scripts/generate-data.mjs', join(temporary, 'scripts/generate-data.mjs'));
      cpSync('src/data', join(temporary, 'src/data'), { recursive: true });
      const generate = () => execFileSync(process.execPath, [join(temporary, 'scripts/generate-data.mjs')]);
      generate();
      const read = (name: string) => JSON.parse(readFileSync(join(temporary, `src/data/${name}.json`), 'utf8'));
      const questions = read('questions');
      expect(questions).toHaveLength(50);
      expect(questions.find((q: {issueId: string}) => q.issueId === 'infantil').positions.podemos.position).toBe(1);
      const proposals = read('proposals');
      const web = proposals.find((p: {id: string}) => p.id === 'podemos-infantil-podemos-infantil-programa');
      web.sourceLocator = '';
      writeFileSync(join(temporary, 'src/data/proposals.json'), JSON.stringify(proposals));
      generate();
      expect(read('pending/question-review').find((q: {issueId: string}) => q.issueId === 'infantil').checks.hasPrimarySource).toBe(false);
      expect(read('questions').some((q: {issueId: string}) => q.issueId === 'infantil')).toBe(false);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
