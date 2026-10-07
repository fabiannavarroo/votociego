import { expect, it } from 'vitest';
import { validateData } from '../../src/utils/validation';
import { questions, parties, categories, candidates, proposals, issues, sources, entities } from '../../src/data';
const corpus = { questions, parties, categories, candidates, proposals, issues, sources, entities };
it('rejects malformed input without crashing',()=>{expect(validateData({questions:[null],parties:null}).length).toBeGreaterThan(0);});
it('rejects claimed positions with missing traceability',()=>{
 const q=questions.find(q=>q.positions.pp.position!==null)!;
 const corrupted={...q,positions:{...q.positions,pp:{...q.positions.pp,sourceUrl:'',lastVerified:''}}};
 expect(validateData({...corpus,questions:[corrupted]})).toContain(`${q.id}: metadatos de posición sin fuente completa.`);
});
it('rejects inheriting evidence from another formation',()=>{
 const q=questions.find(q=>q.positions.pp.position!==null)!;
 const corrupted={...q,positions:{...q.positions,psoe:{...q.positions.pp}}};
 expect(validateData({...corpus,questions:[corrupted]})).toContain(`${q.id}: propuesta de otra formación o cuestión.`);
});
it('rejects a categorical conclusion when dated sources conflict',()=>{
 const p=proposals.find(p=>p.partyId==='pp'&&p.comparisonEligible)!;
 const opposite={...p,id:'test-opposite',stanceDirection:(-p.stanceDirection!) as 1|-1};
 const q=questions.find(q=>q.issueId===p.issueId)!;
 const corrupted={...q,positions:{...q.positions,pp:{...q.positions.pp,proposalIds:[p.id,opposite.id]}}};
 expect(validateData({...corpus,proposals:[...proposals,opposite],questions:[corrupted]})).toContain(`${q.id}: contradicción no reflejada.`);
});
it('rejects an unconfirmed leader as a candidate and invalid PDF pages',()=>{
 expect(validateData({...corpus,candidates:[{id:'leader',partyId:'pp',officiallyConfirmed:false}]})).toContain('leader: candidatura no acreditada.');
 const p=proposals[0];expect(validateData({...corpus,proposals:[{...p,sourcePages:[99999]}]})).toContain(`${p.id}: trazabilidad incompleta.`);
});
