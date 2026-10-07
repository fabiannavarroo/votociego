"""Reviewed shared-candidacy and later-activity context; no automatic party inheritance."""
from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parent.parent;D=R/'src/data'
def read(n): return json.loads((D/(n+'.json')).read_text())
def save(n,v): (D/(n+'.json')).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
docs=read('sources');proposals=read('proposals');entities=read('entities');parties=read('parties');incidents=read('pending/source-incidents')
def document(id,party,title,url,file,date,typ,election=None):
 pages=json.loads((R/f'research/text/{id}.json').read_text())
 doc=dict(id=id,partyIds=[party],sourceTitle=title,sourceUrl=url,sourceDate=date,sourceDateLabel=date or 'Julio de 2023; día de publicación no acreditado',datePrecision='day' if date else 'month',sourceType=typ,election=election,electionDate='2023-07-23' if election else None,lastVerified='2026-10-07',validity='Documento histórico; no acredita posición ni candidatura para 2026.',sha256=hashlib.sha256((R/'research/documents'/file).read_bytes()).hexdigest(),pageCount=len(pages) if file.endswith('.pdf') else None,localFile='research/documents/'+file,verificationMethod='Descarga HTTPS, extracción local y lectura del contexto',verificationStatus='downloaded',demo=False)
 docs.append(doc);return doc,pages
def proposal(doc,pages,party,issue,page,anchor,summary,entity=None):
 text=' '.join(pages[page-1].split());start=text.index(anchor);end=text.find('. ',start+len(anchor));quote=text[start:end+1 if end>=0 else len(text)]
 p={k:doc[k] for k in ['sourceTitle','sourceUrl','sourceDate','sourceDateLabel','datePrecision','sourceType','election','electionDate','lastVerified','validity','demo']}
 categories=next(i['categories'] for i in read('issues') if i['id']==issue)
 p.update(id=f'{party}-{issue}-{doc["id"]}',partyId=party,issueId=issue,categories=categories,originalText=quote,neutralSummary=summary,sourcePage=page if doc['pageCount'] else None,sourcePages=[page] if doc['pageCount'] else [],sourceLocator=None if doc['pageCount'] else 'Texto principal de la nota de prensa',sourceId=doc['id'],documentHash=doc['sha256'],certainty='high',stance='related',stanceDirection=None,comparisonEligible=False,comparisonNote='Se conserva como contexto sin inferir una postura que no responda a todas las condiciones de la pregunta.')
 if entity:p['attributedEntityId']=entity
 proposals.append(p)
 return p
doc,pages=document('compromis-sumar-2023','compromis','Compromís-Sumar · programa conjunto 23J 2023','https://sumar.compromis.net/docs/programa-val.pdf','compromis-sumar-2023.pdf',None,'electoral_program','Generales · candidatura Compromís-Sumar · 23/07/2023')
entities.append(dict(id='compromis-sumar-candidatura-2023',type='electoral_candidacy',name='Compromís-Sumar · candidatura conjunta valenciana de 2023',sourceUrl=doc['sourceUrl'],lastVerified='2026-10-07',validity='Atribución conjunta, no programa propio exclusivo de Compromís ni candidatura de 2026.'))
for issue,page,anchor,summary in [
 ('jornada',7,'Avanç en la reducció de la jornada laboral','El programa conjunto Compromís-Sumar propone 32 horas semanales con el mismo salario.'),
 ('vivienda-publica',3,'Traspàs de tots els habitatges SAREB','El programa conjunto Compromís-Sumar propone transferir viviendas de Sareb a comunidades y ayuntamientos para protección pública y alquiler o venta asequibles.')]:
 p=proposal(doc,pages,'compromis',issue,page,anchor,summary,'compromis-sumar-candidatura-2023');p['comparisonNote']='Documento de una candidatura conjunta de 2023. No se atribuye automáticamente a Compromís como formación separada.'
party=next(p for p in parties if p['id']=='compromis');party['programs'].append(dict(sourceId=doc['id'],title=doc['sourceTitle'],election=doc['election'],date=None,url=doc['sourceUrl'],lastVerified='2026-10-07'))
doc,pages=document('cc-menores-2024','cc','CC · distribución de menores migrantes entre comunidades','https://coalicioncanaria.org/coalicion-canaria-continua-su-hoja-de-ruta-para-conseguir-un-trato-digno-a-los-menores-migrantes-en-todo-el-estado/','cc-menores-2024.html','2024-07-11','official_statement')
proposal(doc,pages,'cc','regularizacion',1,'El partido valora que el mejor instrumento','Propone modificar la Ley de Extranjería para distribuir menores migrantes entre comunidades, mediante decreto ley. Esta medida no equivale a ampliar vías de regularización.')
doc=next(s for s in docs if s['id']=='congreso-jornada-2025');doc['partyIds'].append('podemos');pages=json.loads((R/'research/text/congreso-jornada-2025.json').read_text())
entities.append(dict(id='noemi-santana-xv',type='parliamentarian',name='Noemí Santana Perera · diputada de Podemos en la XV legislatura',sourceUrl='https://www.congreso.es/es/busqueda-de-diputados?_diputadomodule_mostrarFicha=true&codParlamentario=33&idLegislatura=XV&p_p_id=diputadomodule&p_p_lifecycle=0&p_p_mode=view&p_p_state=normal',lastVerified='2026-10-07',validity='Intervención parlamentaria de 2025; no etiqueta de candidata.'))
proposal(doc,pages,'podemos','jornada',143,'Nosotras vamos a apostar por una jornada laboral','Noemí Santana defiende una jornada de 30 horas semanales. Este fragmento de su intervención no explicita la condición salarial del enunciado.','noemi-santana-xv')
for i in incidents:
 if i.get('partyId')=='upn':i.update(status='resolved',resolution='Se recuperó y procesó el PDF oficial de seis páginas con curl del sistema. Las condiciones no explícitas siguen sin posición.')
 if i.get('partyId')=='compromis':i['resolution']='Se procesó el programa conjunto Compromís-Sumar de 2023 como contexto con atribución a la candidatura; no se hereda a Compromís.'
 if i.get('partyId')=='podemos':i['resolution']='Se conservó intervención de Noemí Santana de 2025 con adscripción oficial comprobada. El PDF europeo de 2024 bloqueado no se mezcla con generales.'
 if i.get('partyId')=='cc':i['resolution']='Se procesó una declaración oficial de 2024 sobre menores migrantes. No se infiere una posición sobre regularización.'
for n,v in [('sources',docs),('proposals',proposals),('entities',entities),('parties',parties),('pending/source-incidents',incidents)]:save(n,v)
