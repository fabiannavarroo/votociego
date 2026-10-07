const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const date = (x: unknown) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x));
const url = (x: unknown) => typeof x === 'string' && /^https:\/\//.test(x) && !/example\.(com|org)|pdfemb-data/.test(x);
export function validateData(data: Record<string, unknown>): string[] {
  const errors: string[] = []; const lists: Record<string, Record<string, unknown>[]> = {};
  for (const key of ['questions','parties','categories','candidates','proposals','issues','sources','entities']) {
    const value = data[key]; const items = Array.isArray(value) ? value.filter(record) : []; lists[key]=items;
    if (!Array.isArray(value) || value.length!==items.length) errors.push(`${key}: formato inválido.`);
    const ids=items.map(x=>x.id); if (ids.some(x=>typeof x!=='string'||!x)||new Set(ids).size!==ids.length) errors.push(`${key}: identificadores inválidos o duplicados.`);
  }
  const has=(key: string,id: unknown)=>lists[key].some(x=>x.id===id);
  const pages=(x: unknown)=>Array.isArray(x)&&x.length>0&&x.every(p=>Number.isInteger(p)&&p>0);
  for (const source of lists.sources) if (!url(source.sourceUrl)||!date(source.lastVerified)||(source.sourceDate!==null&&!date(source.sourceDate))) errors.push(`${source.id}: procedencia o fecha inválida.`);
  for (const party of lists.parties) {
    if (typeof party.name!=='string'||typeof party.slug!=='string'||!url(party.website)||!['party','coalition','federation'].includes(String(party.type))||party.demo!==false) errors.push(`${party.id}: ficha inválida.`);
    if (!date(party.lastUpdated)) errors.push(`${party.id}: fecha inválida.`);
  }
  for (const p of lists.proposals) {
    const source=lists.sources.find(s=>s.id===p.sourceId);
    if (!has('parties',p.partyId)||!has('issues',p.issueId)||!source||p.sourceUrl!==source.sourceUrl||p.documentHash!==source.sha256||p.sourceDate!==source.sourceDate||(Array.isArray(p.sourcePages)&&p.sourcePages.some(n=>typeof n!=='number'||n<1||typeof source.pageCount!=='number'||n>source.pageCount))||!(source?.pageCount?pages(p.sourcePages):typeof p.sourceLocator==='string'&&p.sourceLocator.length>0)||typeof p.originalText!=='string'||!p.originalText||!url(p.sourceUrl)||!date(p.lastVerified)) errors.push(`${p.id}: trazabilidad incompleta.`);
    if (!Array.isArray(p.categories)||p.categories.some(c=>!has('categories',c))) errors.push(`${p.id}: categorías inválidas.`);
    if (p.attributedEntityId&&!has('entities',p.attributedEntityId)) errors.push(`${p.id}: entidad de atribución desconocida.`);
    if (p.comparisonEligible&&(!['high','medium'].includes(String(p.certainty))||![-1,1].includes(p.stanceDirection as number)||p.stance==='related')) errors.push(`${p.id}: inferencia no comparable.`);
  }
  for (const q of lists.questions) {
    if (!has('issues',q.issueId)||!has('categories',q.category)||typeof q.statement!=='string'||!record(q.context)||!['meaning','objectives','for','against','implications'].every(k=>typeof (q.context as Record<string, unknown>)[k]==='string')) errors.push(`${q.id}: cuestión incompleta.`);
    if (!record(q.positions)) { errors.push(`${q.id}: posiciones inválidas.`); continue; }
    for (const party of lists.parties) {
      const pos=q.positions[String(party.id)];
      if (!record(pos)||!Array.isArray(pos.proposalIds)) { errors.push(`${q.id}: falta posición explícita para ${party.id}.`);continue; }
      const evidence=pos.proposalIds.map(id=>lists.proposals.find(p=>p.id===id));
      if (evidence.some(p=>!p||p.partyId!==party.id||p.issueId!==q.issueId)) errors.push(`${q.id}: propuesta de otra formación o cuestión.`);
      const usable=evidence.filter(p=>p?.comparisonEligible&&p.certainty!=='low');
      const conflict=new Set(usable.map(p=>p?.stanceDirection)).size>1;
      if(pos.conflict!==conflict) errors.push(`${q.id}: contradicción no reflejada.`);
      if(pos.position!==null&&(!date(pos.lastVerified)||!url(pos.sourceUrl)||!usable.some(p=>p&&p.sourceUrl===pos.sourceUrl&&p.originalText===pos.quote&&p.sourceDate===pos.sourceDate))) errors.push(`${q.id}: metadatos de posición sin fuente completa.`);
      if (pos.position!==null&&(![-1,1].includes(pos.position as number)||pos.conflict===true||!evidence.some(p=>p?.comparisonEligible&&p.certainty!=='low'&&p.stanceDirection===pos.position))) errors.push(`${q.id}: posición sin evidencia comparable.`);
    }
  }
  for (const c of lists.candidates) if (!has('parties',c.partyId)||c.officiallyConfirmed!==true||!url(c.confirmationSource)||!date(c.confirmationDate)||typeof c.election!=='string') errors.push(`${c.id}: candidatura no acreditada.`);
  return errors;
}
