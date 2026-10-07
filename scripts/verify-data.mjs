import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(`src/data/${n}.json`,root),'utf8'));
const [sources,proposals,questions,parties,issues,categories]=['sources','proposals','questions','parties','issues','categories'].map(read);
const normalize=s=>s.replace(/\s+/g,' ').trim();
for(const list of [sources,proposals,questions,parties,issues,categories]) assert.equal(new Set(list.map(x=>x.id)).size,list.length,'Duplicated identifier');
for(const s of sources) {
  assert.match(s.sourceUrl,/^https:\/\//); assert.equal(s.demo,false);
  if(s.localFile&&s.sha256) assert.equal(createHash('sha256').update(readFileSync(new URL(s.localFile,root))).digest('hex'),s.sha256,s.id+' document hash');
}
for(const p of proposals) {
  const s=sources.find(s=>s.id===p.sourceId); assert.ok(s,p.id+' source');
  assert.equal(p.sourceUrl,s.sourceUrl);assert.equal(p.documentHash,s.sha256);
  const pages=JSON.parse(readFileSync(new URL(`research/text/${s.id}.json`,root),'utf8'));
  assert.ok(p.sourcePages.every(n=>Number.isInteger(n)&&n>0&&n<=pages.length),p.id+' pages');
  assert.ok(s.pageCount?p.sourcePages.length>0:!!p.sourceLocator,p.id+' locator');
  assert.ok(normalize((s.pageCount?p.sourcePages.map(n=>pages[n-1]):pages).join(' ')).includes(normalize(p.originalText)),p.id+' quote not present in specified pages');
  assert.ok(parties.some(x=>x.id===p.partyId));assert.ok(issues.some(x=>x.id===p.issueId));
  assert.ok(p.categories.every(c=>categories.some(x=>x.id===c)));
  assert.ok(!p.comparisonEligible||['high','medium'].includes(p.certainty));
}
assert.ok(questions.length>=40&&questions.length<=60);
for(const q of questions) for(const party of parties) {
  const p=q.positions[party.id];assert.ok(p);
  const history=p.proposalIds.map(id=>proposals.find(p=>p.id===id));
  assert.ok(history.every(p=>p&&p.partyId===party.id&&p.issueId===q.issueId));
  const usable=history.filter(p=>p.comparisonEligible&&p.certainty!=='low');
  const conflict=new Set(usable.map(p=>p.stanceDirection)).size>1;
  assert.equal(p.conflict,conflict);
  if(p.position!==null) {
    assert.ok(!conflict);assert.ok(usable.some(x=>x.stanceDirection===p.position&&x.sourceUrl===p.sourceUrl&&x.originalText===p.quote));
  } else assert.equal(p.summary,'No se ha encontrado una posición suficientemente clara en las fuentes consultadas.');
}
console.log(`${sources.length} fuentes, ${proposals.length} citas y ${questions.length} cuestiones: hashes, páginas y trazabilidad correctos.`);
