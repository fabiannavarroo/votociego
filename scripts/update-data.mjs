import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(`src/data/${name}.json`, root), 'utf8'));
const [sources, parties, incidents] = await Promise.all([read('sources'), read('parties'), read('pending/source-incidents')]);
const targets = new Map();
for (const s of sources) targets.set(s.sourceUrl, { url:s.sourceUrl, sourceId:s.id, partyIds:s.partyIds, baseline:s.sha256, expectedPdf:!!s.pageCount||/\.pdf$/i.test(s.sourceUrl) });
for (const p of parties) if (!targets.has(p.website)) targets.set(p.website, {url:p.website, partyIds:[p.id]});
for (const i of incidents) if (!targets.has(i.url)) targets.set(i.url, {url:i.url, partyIds:i.partyId?[i.partyId]:[], incidentId:i.id, expectedPdf:/\.pdf$/i.test(i.url)});
const temp = await mkdtemp(join(tmpdir(), 'votociego-sources-'));
const run = promisify(execFile);
const queue = [...targets.values()]; const results=[];
async function worker() {
  while (queue.length) {
    const target=queue.shift(); const file=join(temp, String(results.length)+'-'+Math.random().toString(16).slice(2));
    let status='network_error', httpStatus=null, error=null, sha256=null, contentType=null, effectiveUrl=null;
    try {
      const {stdout}=await run('curl', ['--location','--silent','--show-error','--max-time','30','--connect-timeout','10','--max-redirs','5','--proto','=https','--proto-redir','=https','--output',file,'--write-out','%{http_code}\n%{content_type}\n%{url_effective}',target.url], {maxBuffer:1024*1024});
      const parts=stdout.split('\n'); httpStatus=Number(parts[0]); contentType=parts[1]; effectiveUrl=parts[2];
      const body=await readFile(file); const isPdf=body.subarray(0,5).toString()==='%PDF-';
      const start=body.subarray(0,100000).toString();
      const blocked=/captcha|cloudflare|verify you are human|access denied|challenge-platform|just a moment/i.test(start);
      status=[404,410].includes(httpStatus)?'broken':httpStatus===403||httpStatus===429||blocked?'blocked':httpStatus<200||httpStatus>=300?'http_error':target.expectedPdf&&!isPdf?'unexpected_content':'accessible';
      if(status==='accessible') {sha256=createHash('sha256').update(body).digest('hex');status=target.baseline?(sha256===target.baseline?'unchanged':'changed'):'accessible';}
      if(status==='unexpected_content') error='La respuesta no es el PDF esperado. No se publica como fuente verificada.';
    } catch(e) {error=String(e.stderr||e.message).slice(0,400);}
    results.push({...target,checkedAt:new Date().toISOString(),httpStatus,status,sha256,contentType,effectiveUrl,error});
    console.log(`${status}: ${target.sourceId||target.incidentId||target.partyIds.join(',')}`);
  }
}
try { await Promise.all(Array.from({length:4},()=>worker())); }
finally { await rm(temp,{recursive:true,force:true}); }
results.sort((a,b)=>a.url.localeCompare(b.url));
const report={checkedAt:new Date().toISOString(),policy:'Solo diagnóstico. No modifica fuentes, propuestas ni preguntas verificadas. Los cambios requieren lectura y revisión editorial.',counts:Object.fromEntries([...new Set(results.map(r=>r.status))].map(s=>[s,results.filter(r=>r.status===s).length])),results};
await writeFile(new URL('src/data/pending/update-report.json',root),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('src/data/pending/UPDATE_REPORT.md',root),`# Comprobación de fuentes\n\n${report.checkedAt}\n\n${report.policy}\n\n${results.map(r=>`- ${r.status} · ${r.httpStatus??'sin HTTP'} · ${r.url}${r.error?` · ${r.error}`:''}`).join('\n')}\n`);
console.log(JSON.stringify(report.counts));
