import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { questions, proposals, parties, unknownPosition } from '../../src/data';
describe('primary-source traceability',()=>{
 it('verifies every quotation against its exact pages and the downloaded document hash',()=>{
  expect(execFileSync(process.execPath,['scripts/verify-data.mjs'],{encoding:'utf8'})).toContain('trazabilidad correctos');
 });
 it('keeps related or joint-candidacy evidence out of independent party matches',()=>{
  const q=questions.find(q=>q.issueId==='jornada')!;
  expect(q.positions.compromis.position).toBe(1);expect(q.positions.podemos.position).toBe(1);
  expect(q.positions.compromis.sourceUrl).toContain('congreso.es');
  expect(q.positions.podemos.sourceUrl).toContain('podemos.info/medida/jornada-laboral');
  expect(q.positions.compromis.proposalIds.length).toBeGreaterThan(0);
  expect(proposals.filter(p=>p.sourceId==='compromis-sumar-2023').every(p=>!p.comparisonEligible)).toBe(true);
  const preschool=questions.find(q=>q.issueId==='infantil')!;
  expect(preschool.positions.pnv.position).toBeNull();
  expect(preschool.positions.pnv.proposalIds.length).toBeGreaterThan(0);
  expect(proposals.find(p=>p.id==='sumar-2023-banca-energia')?.comparisonEligible).toBe(false);
 });
 it('publishes independently attributed web evidence with its territorial limits',()=>{
  const rent=questions.find(q=>q.issueId==='alquiler')!;
  expect(rent.positions.compromis.position).toBe(1);
  expect(rent.positions.compromis.stance).toBe('conditional');
  expect(rent.positions.compromis.sourceDate).toBe('2025-03-27');
  expect(rent.positions.compromis.sourceUrl).toContain('valencia.compromis.net');
  expect(rent.positions.vox.position).toBe(-1);
  const preschool=questions.find(q=>q.issueId==='infantil')!;
  expect(preschool.positions.psoe.position).toBe(1);
  expect(preschool.positions.podemos.position).toBe(1);
  expect(questions).toHaveLength(50);
 });
 it('does not replace absent information with neutral positions or ideological guesses',()=>{
  for(const q of questions)for(const p of Object.values(q.positions)){
   expect(p.demo).toBe(false);if(p.position===null)expect(p.summary).toBe(unknownPosition);
   else {expect(p.sourceUrl).toMatch(/^https:\/\//);expect(p.proposalIds.length).toBeGreaterThan(0);}
  }
  expect(parties.some(p=>p.name.includes('Demo'))).toBe(false);
 });
});
