import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { questions, proposals, parties, unknownPosition } from '../../src/data';
describe('primary-source traceability',()=>{
 it('verifies every quotation against its exact pages and the downloaded document hash',()=>{
  expect(execFileSync(process.execPath,['scripts/verify-data.mjs'],{encoding:'utf8'})).toContain('trazabilidad correctos');
 });
 it('keeps related or joint-candidacy evidence out of independent party matches',()=>{
  const q=questions.find(q=>q.issueId==='jornada')!;
  expect(q.positions.compromis.position).toBeNull();expect(q.positions.podemos.position).toBeNull();
  expect(q.positions.compromis.proposalIds.length).toBeGreaterThan(0);
  expect(proposals.find(p=>p.id==='sumar-2023-banca-energia')?.comparisonEligible).toBe(false);
 });
 it('does not replace absent information with neutral positions or ideological guesses',()=>{
  for(const q of questions)for(const p of Object.values(q.positions)){
   expect(p.demo).toBe(false);if(p.position===null)expect(p.summary).toBe(unknownPosition);
   else {expect(p.sourceUrl).toMatch(/^https:\/\//);expect(p.proposalIds.length).toBeGreaterThan(0);}
  }
  expect(parties.some(p=>p.name.includes('Demo'))).toBe(false);
 });
});
