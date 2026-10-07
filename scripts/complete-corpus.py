from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parent.parent;D=R/'src/data';date='2026-10-07'
def read(n): return json.loads((D/n).read_text())
def save(n,v):(D/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
senate='https://www.senado.es/web/composicionorganizacion/gruposparlamentarios/programaselectoralespartidos/index.html'
groups='https://www.senado.es/web/composicionorganizacion/gruposparlamentarios/composiciongruposparlamentarios/index.html?lang=es_ES'
congress='https://www.congreso.es/backoffice_doc/atp/odiapleno_textos/210.144_Sol.Comp.y.Inc.Firma.pdf'
raw=[
('ahi','Agrupación Herreña Independiente','AHI','https://ahi-elhierro.es/','party','senado','plural'),
('asg','Agrupación Socialista Gomera','ASG','https://www.agrupacionsocialistagomera.es/','party','senado','confederal'),
('bng','Bloque Nacionalista Galego','BNG','https://www.bng.gal/','coalition','congreso y senado','plural'),
('cc','Coalición Canaria','CC','https://coalicioncanaria.org/','party','congreso y senado','plural'),
('compromis','Compromís','Compromís','https://compromis.net/','coalition','congreso y senado','confederal'),
('erc','Esquerra Republicana de Catalunya','ERC','https://www.esquerra.cat/','party','congreso y senado','erc-bildu'),
('eh-bildu','Euskal Herria Bildu','EH Bildu','https://ehbildu.eus/','coalition','congreso y senado','erc-bildu'),
('pnv','Euzko Alderdi Jeltzalea–Partido Nacionalista Vasco','EAJ-PNV','https://www.eaj-pnv.eus/','party','congreso y senado','vasco'),
('geroa-bai','Geroa Bai','Geroa Bai','https://www.geroabai.eus/','coalition','senado','confederal'),
('iu','Izquierda Unida','IU','https://izquierdaunida.org/','federation','formación integrante de Sumar en 2023','sumar'),
('junts','Junts per Catalunya','Junts','https://junts.cat/','party','congreso y senado','plural'),
('mas-madrid','Más Madrid','Más Madrid','https://masmadrid.org/','party','senado','confederal'),
('pp','Partido Popular','PP','https://www.pp.es/','party','congreso y senado','popular'),
('psoe','Partido Socialista Obrero Español','PSOE','https://www.psoe.es/','party','congreso y senado','socialista'),
('podemos','Podemos','Podemos','https://podemos.info/','party','congreso','mixto'),
('sumar-2023','Sumar · coalición electoral de 2023','Sumar 2023','https://movimientosumar.es/','coalition','candidatura de 2023 con representación en el Congreso','sumar'),
('upn','Unión del Pueblo Navarro','UPN','https://www.upn.org/','party','congreso y senado','mixto'),
('vox','VOX','VOX','https://www.voxespana.es/','party','congreso y senado','mixto')]
pg_names={'plural':'Grupo Plural (Senado)','confederal':'Izquierda Confederal (Senado)','erc-bildu':'Izquierdas por la Independencia (Senado)','vasco':'Grupo Vasco (Senado)','sumar':'Grupo Plurinacional Sumar (Congreso)','popular':'Grupo Popular','socialista':'Grupo Socialista','mixto':'Grupo Mixto; cámara indicada en la relación'}
docs=read('sources.json');parties=[];entities=[]
for i,name,acronym,website,typ,chamber,g in raw:
 ds=[s for s in docs if i in s['partyIds']];url=ds[0]['sourceUrl'] if ds else None;pub=ds[0]['sourceDate'] if ds else None
 authority=congress if i in ['podemos','compromis'] else docs[-1]['sourceUrl'] if i in ['iu','sumar-2023'] else senate
 desc=f'{"Coalición electoral" if typ=="coalition" else "Federación política" if typ=="federation" else "Partido político"}. Referencia: {chamber} en la XV legislatura o convocatoria de 2023. Las Cámaras fueron disueltas el 06/10/2026.'
 parties.append(dict(id=i,slug=i,name=name,acronym=acronym,website=website,officialWebsite=website,logo=None,type=typ,description=desc,demo=False,programUrl=url,programDate=pub,lastUpdated=date,lastVerified=date,parliamentaryGroup=pg_names[g],programs=[dict(sourceId=s['id'],title=s['sourceTitle'],election=s['election'],date=s['sourceDate'],url=s['sourceUrl'],lastVerified=date) for s in ds],representation={'scope':chamber,'legislature':'XV (2023–2026), disuelta','sourceUrl':authority,'lastVerified':date,'note':'La inclusión de IU se apoya en su aportación propia al programa y relación de coalición; no se atribuyen automáticamente las posiciones de Sumar.' if i=='iu' else 'La ficha no afirma escaños actuales de la Cámara disuelta ni una candidatura oficial de 2026.'},relations=[dict(type='parliamentary_group_reference',entityId='gp-'+g,validity='Referencia histórica de la XV legislatura; revisar adscripción individual y cámara.',sourceUrl=authority)]))
 if i in ['iu','podemos','compromis','mas-madrid']:
  parties[-1]['relations'].append(dict(type='coalition_member_2023',entityId='sumar-2023',validity='Convocatoria 23/07/2023; no presume continuidad en 2026 ni posición común.',sourceUrl=docs[-1]['sourceUrl']))
for i,name in pg_names.items():entities.append(dict(id='gp-'+i,type='parliamentary_group',name=name,lastVerified=date,sourceUrl=groups if i not in ['sumar'] else 'https://www.congreso.es/es/grupos-parlamentarios',validity='XV legislatura; referencias históricas tras disolución. No equivale a partido.'))
# Explicit group references for activity, disambiguated from Senate entries.
for i,name in [('gp-popular-congreso','Grupo Parlamentario Popular en el Congreso'),('gp-vox-congreso','Grupo Parlamentario VOX en el Congreso'),('gp-junts-congreso','Grupo Parlamentario Junts per Catalunya en el Congreso')]:entities.append(dict(id=i,type='parliamentary_group',name=name,lastVerified=date,sourceUrl='https://www.congreso.es/es/grupos-parlamentarios',validity='XV legislatura; actuación de 2025.'))
entities.extend([dict(id='movimiento-sumar',type='party',name='Movimiento Sumar',lastVerified=date,sourceUrl='https://movimientosumar.es/transparencia/wp-content/uploads/sites/6/2024/08/Memoria-anual-2023-2.pdf',validity='Organización distinta de coalición Sumar 2023 y grupo parlamentario.'),dict(id='sumar-candidatura-2023',type='electoral_candidacy',name='Sumar · candidatura a las generales de 2023',lastVerified=date,sourceUrl=docs[3]['sourceUrl'],election='2023-07-23',coalitionId='sumar-2023')])
# Preserve coalition components as relationship references; not every contributor obtained a seat.
for i,name in [('catalunya-en-comu','Catalunya en Comú'),('cha','Chunta Aragonesista'),('ara-mes','Ara MÉS'),('verdes-equo','Los Verdes Equo'),('alianza-verde','Alianza Verde'),('drago','Drago'),('iniciativa-andalucia','Iniciativa del Pueblo Andaluz'),('batzarre','Batzarre'),('izquierda-asturiana','Izquierda Asturiana')]: entities.append(dict(id=i,type='coalition_component',name=name,coalitionId='sumar-2023',lastVerified=date,sourceUrl=docs[-1]['sourceUrl'],sourcePage=6,validity='Relación electoral de 2023, no evidencia por sí sola representación ni adscripción actual.'))
save('parties.json',parties);save('entities.json',entities);save('candidates.json',[])
for ident,title,url,typ,docdate,file in [
('boe-convocatoria-2026','Real Decreto 806/2026 · disolución y convocatoria','https://www.boe.es/boe/dias/2026/10/06/pdfs/BOE-A-2026-20742.pdf','institutional','2026-10-05','boe-convocatoria-2026.pdf'),
('congreso-jornada-2025','Diario de Sesiones · Pleno 135 · 10/09/2025','https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-135.PDF','parliamentary_activity','2025-09-10','congreso-jornada-2025.pdf'),
('congreso-jornada-35','Diario de Sesiones · Pleno 142 · 14/10/2025','https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-142.PDF','parliamentary_activity','2025-10-14','congreso-jornada-35.pdf')]:
 body=(R/'research/documents'/file).read_bytes();pg=read('issues.json') # metadata only; actual page count below
 pages=json.loads((R/f'research/text/{ident}.json').read_text())
 docs.append(dict(id=ident,partyIds=['pp','vox','junts'] if ident=='congreso-jornada-2025' else ['bng'] if ident=='congreso-jornada-35' else [],sourceTitle=title,sourceUrl=url,sourceDate=docdate,sourceDateLabel=docdate,datePrecision='day',sourceType=typ,election=None,electionDate=None,lastVerified=date,validity='Actuación en la fecha indicada, sin sustituir el programa electoral.' if typ!='institutional' else 'Convocatoria vigente comprobada el 07/10/2026.',sha256=hashlib.sha256(body).hexdigest(),pageCount=len(pages),pageConvention='Página del PDF, portada incluida.',verificationMethod='Descarga HTTPS y extracción local del PDF',verificationStatus='downloaded',localFile=f'research/documents/{file}',demo=False))
for ident,title,url in [('senado-partidos','Senado · programas electorales de partidos',senate),('senado-grupos','Senado · composición de los grupos',groups),('congreso-mixto','Congreso · GP Mixto (Podemos, BNG y Compromís) · 30/04/2026',congress),('jec-candidaturas','JEC · LOREG · artículo 45 · presentación de candidaturas','https://www.juntaelectoralcentral.es/cs/jec/loreg/contenido?idContenido=2740540')]: docs.append(dict(id=ident,partyIds=[],sourceTitle=title,sourceUrl=url,sourceDate='2026-04-30' if ident=='congreso-mixto' else None,sourceDateLabel='30/04/2026' if ident=='congreso-mixto' else 'Página institucional; fecha documental no indicada',datePrecision='day' if ident=='congreso-mixto' else 'unknown',sourceType='institutional',election=None,electionDate=None,lastVerified=date,validity='Referencia institucional consultada el 07/10/2026; las listas pueden cambiar.',sha256=None,pageCount=None,verificationMethod='Lectura de página oficial mediante navegador o consulta web',verificationStatus='read_official',demo=False))
proposals=read('proposals.json');doc=next(s for s in docs if s['id']=='congreso-jornada-2025');text=' '.join(json.loads((R/'research/text/congreso-jornada-2025.json').read_text())[6].split());left=text.index('Sometidas a votación conjunta');right=text.find('.',left)+1;quote=text[left:right]
for party,group in [('pp','gp-popular-congreso'),('vox','gp-vox-congreso'),('junts','gp-junts-congreso')]:
 rec={k:doc[k] for k in ['sourceTitle','sourceUrl','sourceDate','sourceDateLabel','datePrecision','sourceType','election','electionDate','lastVerified','validity','demo']}
 rec.update(id=party+'-jornada-devolucion-2025',partyId=party,attributedEntityId=group,issueId='jornada',categories=['employment','justice'],originalText=quote,neutralSummary='El grupo parlamentario presentó una enmienda de devolución al proyecto que reunía reducción de jornada, registro horario y desconexión. Se aprobaron conjuntamente las enmiendas: el proyecto fue devuelto. Esto no acredita por sí solo una oposición a toda reducción de jornada.',sourcePage=7,sourcePages=[7],sourceId=doc['id'],documentHash=doc['sha256'],certainty='high',stance='related',stanceDirection=None,comparisonEligible=False,comparisonNote='Atribución al grupo parlamentario; no se hereda una posición categórica de cada partido integrante. Votación de un conjunto de medidas, no de una medida aislada.')
 proposals.append(rec)
doc=next(s for s in docs if s['id']=='congreso-jornada-35');text=' '.join(json.loads((R/'research/text/congreso-jornada-35.json').read_text())[5].split());anchor='reducción a 35 horas';start=text.index(anchor);quote=text[max(0,text.rfind('.',0,start)+1):text.find('.',start)+1].strip()
rec={k:doc[k] for k in ['sourceTitle','sourceUrl','sourceDate','sourceDateLabel','datePrecision','sourceType','election','electionDate','lastVerified','validity','demo']};rec.update(id='bng-jornada-iniciativa-2025',partyId='bng',issueId='jornada',categories=['employment'],originalText=quote,neutralSummary='Néstor Rego presenta la toma en consideración de la iniciativa de jornada de 35 horas; se conserva junto al compromiso del programa de 2023.',sourcePage=6,sourcePages=[6],sourceId=doc['id'],documentHash=doc['sha256'],certainty='high',stance='related',stanceDirection=None,comparisonEligible=False,comparisonNote='Se muestra como actividad posterior. El fragmento no repite todas las condiciones salariales de la pregunta.');proposals.append(rec)
save('sources.json',docs);save('proposals.json',proposals)
checks=[]
for manifest in (R/'research/checks').glob('*.json'):
 checks.extend(json.loads(manifest.read_text()))
# Expose unresolved accesses as incidents, never active proposal source links.
incidents=[]
for c in checks:
 if c['status']!='unavailable' and (not c['url'].endswith('.pdf') or c.get('pages')):continue
 if c['id']=='pp-2023':continue # resolved with system curl and PDF extraction
 incidents.append(dict(id=c['id']+'-access',partyId={'psoe-2023':'psoe','psoe-retry':'psoe','vox-2023':'vox','upn-2023':'upn'}.get(c['id']),url=c['url'],status='blocked_or_unavailable',reason=c.get('error','Se recibió HTML de un control de acceso en lugar del PDF.'),lastVerified=date,resolution='Se obtuvo un PDF oficial alternativo de campaña.' if c['id'] in ['psoe-2023','psoe-retry','vox-2023'] else 'Pendiente; no se ha atribuido ninguna posición.'))
incidents.append(dict(id='junts-programa',partyId='junts',url='https://junts.cat/',status='blocked_or_unavailable',reason='Web oficial bloqueada; no se localizó un PDF oficial de las generales de 2023 descargable. Las fuentes municipales/europeas se excluyeron del test nacional.',lastVerified=date,resolution='Se conserva actividad parlamentaria, sin atribuir un programa no procesado.'))
for p in parties:
 if not p['programs']:
  incidents.append(dict(id=p['id']+'-coverage',partyId=p['id'],url=p['website'],status='missing_coverage',reason='Se consultó el índice institucional y se buscó programa propio de generales; no se obtuvo un documento propio comparable procesado. No se heredan programas de coalición ni de comicios autonómicos/europeos.',lastVerified=date,resolution='Posiciones desconocidas. Ampliación editorial pendiente.'))
save('pending/source-incidents.json',incidents)
save('dataset.json',dict(country='España',lastVerified=date,election={'date':'2026-11-29','status':'Convocada; sin candidaturas oficiales publicadas en este conjunto','sourceId':'boe-convocatoria-2026'},scope='Formaciones del índice del Senado, Podemos documentado en GP Mixto, coalición Sumar de 2023 y aportación propia de IU. Referencias de la XV legislatura, disuelta el 06/10/2026. No es un censo exhaustivo de afiliación individual de diputados.',candidatesStatus='Candidatura todavía no oficializada',coverageNote='La cobertura es incompleta y desigual; las casillas vacías son ausencia de evidencia en este corpus, no silencio del partido.',questionGeneration='Medidas revisadas editorialmente; solo propuestas explícitas comparables con certeza alta/media. No hay inferencia por ideología.'))
