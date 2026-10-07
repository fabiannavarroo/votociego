"""One-time, reviewed extraction recipe. Does not infer party positions from keywords.
Each row specifies a reviewed measure, document page and explicit anchor; a mismatch is pending.
Use generate-data.mjs for reproducible question generation from the published corpus.
"""
from pathlib import Path
import json, hashlib, re
ROOT=Path(__file__).resolve().parent.parent
DATA=ROOT/'src/data'; CHECKED='2026-10-07'
def save(name,value): (DATA/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
cats=[('economy','Economía','Landmark'),('tax','Fiscalidad','Receipt'),('employment','Empleo','BriefcaseBusiness'),('self-employed','Autónomos','BriefcaseBusiness'),('business','Empresas','Building2'),('housing','Vivienda','House'),('health','Sanidad','HeartPulse'),('education','Educación','GraduationCap'),('universities','Universidades','GraduationCap'),('pensions','Pensiones','PiggyBank'),('immigration','Inmigración','Globe'),('security','Seguridad','Shield'),('justice','Justicia','Scale'),('equality','Igualdad','Equal'),('civil-rights','Derechos civiles','Users'),('family','Familia','Users'),('environment','Medio ambiente','Leaf'),('climate','Cambio climático','Leaf'),('energy','Energía','Zap'),('transport','Transporte','TrainFront'),('agriculture','Agricultura','Sprout'),('livestock','Ganadería','Sprout'),('industry','Industria','Factory'),('territory','Política territorial','Map'),('eu','Unión Europea','Globe'),('foreign','Política exterior','Globe'),('defense','Defensa','Shield'),('technology','Tecnología','Laptop'),('ai','Inteligencia artificial','BrainCircuit'),('digital','Digitalización','Laptop'),('administration','Administración pública','Landmark')]
save('categories.json',[dict(id=i,name=n,icon=icon,description=f'Medidas documentadas relacionadas con {n.lower()}.') for i,n,icon in cats])
# id | categories | question | explanation | argument for | argument against | nuances
rows='''jornada|employment,economy|¿Debería reducirse la jornada laboral máxima manteniendo el salario?|Reducir el límite semanal legal sin reducir la remuneración. Los documentos proponen límites diferentes.|Puede dejar más tiempo para descanso y cuidados.|Puede aumentar los costes por hora y exigir reorganizar turnos.|Compara la dirección de la medida; 30, 32, 35 y 37,5 horas no son compromisos idénticos.
smi|employment,economy|¿Debería fijarse el salario mínimo en al menos el 60 % del salario medio?|Vincular el salario mínimo a una referencia salarial, en vez de elegir solo una cantidad fija.|Puede mantener una referencia estable frente a la evolución salarial.|Puede elevar los costes de contratación en sectores con salarios bajos.|Importa si el salario de referencia es bruto, neto o territorial; no se equiparan automáticamente.
fortunas|tax,economy|¿Debería mantenerse un impuesto específico sobre las grandes fortunas?|Mantener un gravamen dirigido al patrimonio elevado.|Puede contribuir a la financiación pública con una base patrimonial.|Puede afectar al ahorro y al lugar donde se declara el patrimonio.|El impuesto temporal de solidaridad y un nuevo tributo permanente pueden tener diseños distintos.
banca-energia|tax,economy|¿Deberían hacerse permanentes los gravámenes extraordinarios a banca y empresas energéticas?|Convertir en estables los gravámenes sectoriales creados con carácter temporal.|Puede aportar ingresos de sectores con beneficios elevados.|Puede repercutir en inversión, crédito o precios.|No se compara cualquier impuesto de sociedades con estos gravámenes concretos.
irpf-inflacion|tax|¿Deberían ajustarse los tramos del IRPF a la inflación?|Modificar los límites de los tramos para que una subida nominal de ingresos no implique por sí sola más carga fiscal.|Puede evitar subidas impositivas derivadas de la inflación.|Puede reducir ingresos públicos aunque aumenten los gastos nominales.|El ajuste puede aplicarse a todos los tramos o centrarse en determinados ingresos.
iva-general|tax|¿Debería reducirse el tipo general del IVA?|Bajar el porcentaje general que se aplica al consumo gravado.|Puede reducir la carga fiscal del consumo.|Puede disminuir la recaudación sin trasladarse íntegramente a los precios.|Una bajada para un producto concreto no demuestra apoyo a reducir el tipo general.
pension-irpf|pensions,tax|¿Deberían estar exentas de IRPF las pensiones contributivas?|Excluir estas pensiones de la base de tributación de la renta.|Puede aumentar los ingresos disponibles de pensionistas.|Puede tratar de forma diferente ingresos de igual cuantía y reducir recaudación.|Las pensiones mínimas con baja tributación no obtendrían el mismo efecto que las altas.
sociedades|business,tax|¿Debería reducirse el tipo general del impuesto de sociedades al 15 %?|Aplicar un tipo general del 15 % a los beneficios empresariales.|Puede aumentar los recursos disponibles para inversión.|Puede reducir ingresos públicos y el gravamen de beneficios elevados.|Un tipo mínimo efectivo del 15 % es una medida distinta y no se interpreta como apoyo a esta bajada.
cuota-autonomos|self-employed,employment|¿Deberían pagar cuota cero los nuevos autónomos durante su primer año?|Eximir de cotización inicial a quienes comienzan una actividad autónoma.|Puede reducir el coste de iniciar una actividad.|Puede financiar actividades que se habrían iniciado igualmente.|Una exención vinculada a ingresos bajos es distinta de una exención universal por comenzar.
contratos-paraisos|business,administration,tax|¿Debería impedirse contratar con empresas que usan paraísos fiscales sin actividad real allí?|Excluir de contratos públicos empresas con sociedades en esos territorios sin una actividad económica que lo justifique.|Puede reducir incentivos a estructuras de evasión fiscal.|Puede exigir controles complejos sobre grupos empresariales.|Requiere definir jurisdicciones, actividad real y garantías de revisión.
alquiler|housing|¿Deberían limitarse los precios del alquiler en zonas con dificultades de acceso a vivienda?|Establecer límites de renta en zonas identificadas mediante criterios públicos.|Puede contener aumentos del coste para inquilinos.|Puede reducir oferta o incentivar vías para eludir los límites.|Los criterios de zona, contratos afectados y excepciones cambian entre documentos.
vivienda-publica|housing|¿Debería ampliarse el parque público de vivienda asequible?|Aumentar viviendas promovidas o gestionadas públicamente con precios o rentas sujetos a condiciones.|Puede ampliar alternativas para hogares con dificultades de acceso.|Requiere financiación, suelo y gestión a largo plazo.|Alquiler, propiedad y opción de compra son instrumentos distintos; se conservan en cada resumen.
hipotecas-jovenes|housing,family|¿Debería el Estado avalar hipotecas de jóvenes para cubrir hasta el 95 % del precio de la vivienda?|Garantizar parte de préstamos para reducir el ahorro inicial necesario.|Puede facilitar el acceso a compra de personas solventes sin ahorro suficiente.|Puede aumentar el endeudamiento y la demanda sin ampliar la oferta.|No equivale a subvencionar todo el precio ni elimina el riesgo de impago.
desahucios|housing,civil-rights|¿Deberían impedirse desahucios de hogares vulnerables sin una alternativa habitacional?|Condicionar el desalojo a que exista una solución de vivienda para hogares definidos como vulnerables.|Puede prevenir situaciones de falta de alojamiento.|Puede trasladar costes o retrasos a propietarios y administraciones.|La vulnerabilidad, las obligaciones públicas y las situaciones cubiertas deben definirse.
dental|health|¿Debería ampliarse la cobertura de salud bucodental de la sanidad pública?|Incluir más prestaciones dentales financiadas por el sistema público.|Puede reducir barreras económicas de acceso.|Exige presupuesto y profesionales adicionales.|La cartera concreta y los grupos de población cubiertos importan.
espera-sanitaria|health|¿Deberían fijarse por ley tiempos máximos de espera sanitaria?|Establecer plazos exigibles para determinadas intervenciones, consultas o pruebas.|Puede dar garantías y hacer visibles los retrasos.|Una garantía sin recursos puede desplazar esperas a otras prestaciones.|Los plazos y las consecuencias de incumplirlos varían; no se asumen resultados garantizados.
cannabis|health,civil-rights|¿Debería regularse el uso medicinal del cannabis?|Autorizar y regular su utilización terapéutica bajo condiciones sanitarias.|Puede ofrecer una vía controlada a pacientes con indicación adecuada.|Exige evaluar indicaciones, seguridad y supervisión.|La legalización de todos los usos no equivale por sí sola a una regulación medicinal concreta.
infantil|education,family|¿Debería ser universal y gratuita la educación de 0 a 3 años?|Garantizar el acceso al primer ciclo infantil sin coste de escolarización.|Puede facilitar cuidados y reducir diferencias de acceso.|Requiere plazas, personal y financiación estable.|Universalizar sin mencionar gratuidad no basta para atribuir apoyo completo a esta medida.
ebau|universities,education|¿Debería haber una prueba de acceso a la universidad común para todo el territorio?|Unificar las condiciones básicas y evaluación del acceso universitario.|Puede facilitar comparar condiciones de acceso.|Puede limitar la adaptación a currículos y competencias territoriales.|Una base común no necesariamente implica preguntas idénticas en cada lengua.
ciencia-abierta|technology,universities|¿Deberían publicarse los resultados y datos científicos en repositorios de acceso abierto?|Hacer consultables resultados y datos de investigación mediante repositorios abiertos.|Puede facilitar reutilización y acceso al conocimiento.|Puede exigir cambios en publicación, propiedad intelectual y costes.|Los datos personales, la seguridad y determinadas patentes pueden requerir excepciones.
pension-ipc|pensions|¿Deberían actualizarse las pensiones según el IPC?|Vincular la revalorización a la evolución de precios al consumo.|Puede mantener poder adquisitivo frente a inflación.|Puede aumentar el gasto cuando los ingresos del sistema crecen menos.|No implica que todas las pensiones suban lo mismo ni define por sí sola su financiación.
jubilacion|pensions,employment|¿Debería situarse la edad ordinaria de jubilación en 65 años?|Establecer esa edad como referencia ordinaria de acceso a la jubilación.|Puede adelantar el acceso al retiro.|Puede aumentar el tiempo de percepción de pensiones y las necesidades de financiación.|No se equipara una jubilación anticipada para oficios concretos con la edad ordinaria general.
regularizacion|immigration,employment|¿Deberían ampliarse las vías de regularización de personas migrantes sin autorización de residencia?|Crear o ampliar procedimientos para acceder a residencia legal.|Puede facilitar empleo formal y acceso a derechos.|Puede exigir recursos administrativos y debatir los requisitos de acceso.|Regularización permanente, extraordinaria y arraigo tienen condiciones distintas.
cie|immigration,civil-rights|¿Deberían cerrarse los centros de internamiento de extranjeros?|Eliminar estos centros de privación de libertad administrativa vinculados a extranjería.|Puede evitar daños asociados al internamiento.|Puede requerir alternativas para ejecutar procedimientos de retorno.|No implica eliminar todos los procedimientos de extranjería.
residencia-trabajo|immigration,employment|¿Debería poder obtenerse residencia por contrato de trabajo sin pasar por el proceso de arraigo?|Permitir otra vía de residencia a personas migrantes con contrato laboral.|Puede facilitar la incorporación al empleo formal.|Puede exigir controles sobre contratos y condiciones laborales.|La medida documentada no elimina todos los requisitos migratorios.
pelotas-goma|security,civil-rights|¿Debería prohibirse el uso policial de pelotas de goma?|Excluir este material de los dispositivos policiales.|Puede reducir lesiones graves asociadas a su impacto.|Puede exigir revisar medios alternativos de intervención.|Se compara este material concreto; no se deduce una posición sobre toda actuación policial.
cgpj|justice|¿Deberían los jueces elegir a los doce vocales judiciales del Consejo General del Poder Judicial?|Cambiar la elección de los vocales procedentes de la judicatura para que los elijan jueces y magistrados.|Puede disminuir la intervención de partidos en esos nombramientos.|Puede reforzar el peso de asociaciones y limitar la participación parlamentaria.|Elegir todos los vocales mediante jueces excede esta medida; se muestra como propuesta relacionada con matices.
seguridad-ciudadana|civil-rights,security|¿Debería derogarse la Ley Orgánica de Seguridad Ciudadana de 2015?|Derogar la norma de 2015 y sustituir su regulación.|Puede revisar restricciones de reunión y expresión.|Puede requerir nuevas reglas para mantener garantías y seguridad.|Modificar artículos concretos es distinto de derogar la ley completa.
planes-igualdad|equality,business|¿Deberían evaluarse los resultados de los planes de igualdad de las empresas?|Comprobar con indicadores los efectos de estos planes.|Puede permitir detectar medidas que no cumplen sus objetivos.|Puede aumentar obligaciones administrativas y exigir indicadores fiables.|Evaluar resultados no equivale a respaldar cualquier contenido de un plan.
aborto-publico|equality,health,civil-rights|¿Debería garantizarse el acceso a la interrupción voluntaria del embarazo en centros públicos?|Ofrecer esta prestación en la red sanitaria pública con acceso territorial efectivo.|Puede reducir desplazamientos y barreras de acceso.|Puede exigir organizar equipos y compatibilizar distintos derechos en la prestación.|Se distingue garantizar acceso de las condiciones y plazos legales concretos.
permiso-nacimiento|family,equality,employment|¿Deberían ampliarse los permisos retribuidos por nacimiento?|Aumentar la duración financiada del permiso para cuidar tras un nacimiento.|Puede ampliar el tiempo disponible para cuidado.|Puede aumentar gasto y necesidades de sustitución laboral.|Las semanas y reglas de transferencia entre progenitores no se equiparan.
crianza|family,economy|¿Debería crearse una prestación económica por crianza hasta los 18 años?|Establecer una ayuda periódica asociada a la crianza de menores.|Puede apoyar gastos familiares y reducir pobreza infantil.|Puede exigir decidir prioridades de gasto y criterios de acceso.|La cuantía y los límites de renta deben consultarse; no se presume universalidad si no se indica.
nuclear|energy,climate|¿Debería prolongarse la vida de las centrales nucleares existentes?|Mantener operativas centrales más allá de sus calendarios de cierre.|Puede conservar generación eléctrica disponible.|Puede prolongar necesidades de gestión de residuos y de seguridad.|Las autorizaciones de seguridad y calendarios se conservan como condiciones del documento.
energia-publica|energy,economy|¿Debería haber una empresa pública de energía que gestione centrales hidroeléctricas al terminar sus concesiones?|Incorporar instalaciones con concesiones vencidas a una empresa pública energética.|Puede dar capacidad de gestión pública de generación eléctrica.|Exige gestión, inversión y definir relación con otros operadores.|Crear una comercializadora pública no demuestra por sí solo apoyo a esta gestión de centrales.
renovables|climate,energy|¿Debería fijarse un objetivo de al menos el 90 % de electricidad renovable para 2030?|Establecer una meta de generación eléctrica renovable para esa fecha.|Puede acelerar la reducción de emisiones eléctricas.|Requiere redes, almacenamiento e inversiones para mantener suministro.|Electricidad no equivale al total de energía consumida; porcentajes inferiores son metas distintas.
restauracion|environment,climate|¿Debería aprobarse una estrategia nacional para restaurar ecosistemas degradados?|Coordinar mediante una estrategia nacional la recuperación de ecosistemas.|Puede recuperar funciones ecológicas y biodiversidad.|Puede exigir recursos y cambiar determinados usos del suelo.|La restauración no implica prohibir de forma general toda actividad económica.
jets|transport,climate|¿Deberían restringirse los vuelos en aviones privados?|Limitar el uso de aviación privada por razones ambientales.|Puede reducir emisiones de usos con pocos pasajeros.|Puede afectar a servicios y requerir delimitar excepciones.|Se distinguen vuelos privados de servicios sanitarios o públicos esenciales.
transporte-joven|transport,family|¿Debería ser gratuito el transporte público para menores y estudiantes jóvenes?|Eliminar el coste de determinados viajes para esos colectivos.|Puede facilitar movilidad y uso de transporte colectivo.|Puede requerir financiación y ampliar servicios para absorber demanda.|Los límites de edad, tipos de transporte y condición de estudiante varían.
cadena-alimentaria|agriculture,business|¿Debería reforzarse la prohibición de pagar a productores agrarios por debajo de sus costes?|Mejorar reglas y control para que el precio recibido cubra costes de producción.|Puede reducir desequilibrios en la cadena alimentaria.|Puede ser difícil calcular costes y trasladarse a precios finales.|Las referencias de coste y las herramientas de inspección cambian entre propuestas.
ganaderia|livestock,environment,agriculture|¿Debería destinarse apoyo público específico a la ganadería extensiva?|Aplicar ayudas o incentivos a explotaciones basadas en aprovechamiento extensivo del territorio.|Puede contribuir a conservar actividad rural y gestión del paisaje.|Puede competir con otras prioridades y exigir criterios de evaluación.|La ganadería extensiva engloba explotaciones con condiciones muy distintas.
ley-industria|industry,business|¿Debería aprobarse una nueva ley de industria?|Actualizar mediante ley el marco de actividad industrial.|Puede adaptar reglas a cambios tecnológicos y energéticos.|Puede aumentar incertidumbre durante la transición normativa.|El apoyo a una ley nueva no implica acuerdo sobre su contenido.
convenios|territory,employment|¿Deberían prevalecer los convenios autonómicos cuando sean más favorables para los trabajadores?|Dar prioridad a convenios de comunidad autónoma frente a estatales bajo esa condición.|Puede adaptar condiciones y mejorar derechos en determinados sectores.|Puede aumentar diferencias territoriales y complejidad de negociación.|No se presume apoyo a prevalencia incondicional ni a cualquier convenio de empresa.
reglas-fiscales|eu,economy,climate|¿Deberían flexibilizarse las reglas fiscales europeas para inversiones de transición ecológica y digital?|Permitir mayor margen de gasto o excluir determinadas inversiones de su cómputo.|Puede facilitar inversión a largo plazo.|Puede reducir límites comunes de disciplina presupuestaria.|Eliminar umbrales generales y exceptuar inversiones son diseños distintos.
palestina|foreign|¿Debería España reconocer al Estado palestino?|Otorgar reconocimiento diplomático estatal.|Puede contribuir a una solución basada en dos Estados.|Puede generar desacuerdos sobre oportunidad y condiciones diplomáticas.|Se muestran propuestas fechadas; no se presenta el reconocimiento como un hecho todavía pendiente.
armas-nucleares|defense,foreign|¿Debería España adherirse al Tratado de Prohibición de las Armas Nucleares?|Incorporarse al tratado internacional que prohíbe estas armas.|Puede reforzar compromisos de desarme.|Puede plantear tensiones con estrategias de defensa de aliados.|Adhesión a este tratado y apoyo genérico al desarme no son equivalentes.
cooperacion|foreign,economy|¿Debería destinarse el 0,7 % de la renta nacional bruta a ayuda oficial al desarrollo para 2030?|Alcanzar esa proporción y fecha en cooperación internacional.|Puede aumentar recursos para desarrollo y acción humanitaria.|Puede exigir priorizarla frente a otros gastos.|PIB y renta nacional bruta son magnitudes diferentes; no se igualan automáticamente.
defensa|defense,economy|¿Debería destinarse al menos el 2 % del PIB a seguridad y defensa?|Adoptar esa referencia mínima de gasto.|Puede financiar capacidades y compromisos de defensa.|Puede competir con otras prioridades presupuestarias.|Se muestra el compromiso de la fecha original; no se presupone que sea la meta actual de un partido.
ia-derechos|ai,technology,civil-rights|¿Debería regularse la inteligencia artificial para proteger derechos fundamentales?|Establecer garantías legales frente a riesgos de sistemas automatizados.|Puede reducir discriminación y hacer exigibles garantías.|Puede aumentar costes regulatorios y ralentizar determinados usos.|Promover investigación en IA no demuestra apoyo a una regulación específica.
atencion-presencial|administration,digital|¿Debería garantizarse atención presencial en la Administración aunque exista una vía digital?|Mantener una alternativa de atención personal accesible.|Puede facilitar trámites a personas con barreras digitales.|Exige personal e instalaciones junto a los servicios digitales.|Las reglas de cita previa y los plazos de atención no se consideran idénticos.
software-publico|digital,technology,administration|¿Debería priorizarse software libre en la contratación informática pública?|Dar preferencia a programas cuyo código permita uso, estudio y modificación bajo licencias abiertas.|Puede facilitar reutilización y reducir dependencia de proveedores.|Puede exigir adaptación, mantenimiento y compatibilidad.|Software gratuito y software libre son conceptos distintos; no se presume ahorro automático.'''
issues=[]
for line in rows.splitlines():
 ident,cs,q,desc,f,a,n=line.split('|');cs=cs.split(',')
 issues.append(dict(id=ident,title=q,category=cs[0],categories=cs,neutralDescription=desc,statement=q,argumentsFor=[f],argumentsAgainst=[a],importantNuances=[n],relatedProposals=[],lastVerified=CHECKED,qualityReview={'neutral':True,'understandable':True,'singleMeasure':True,'blind':True,'editoriallyReviewed':True,'reviewMethod':'Lectura del fragmento y contexto; comprobación de medida, ámbito y fecha. Revisión asistida, sin revisor externo independiente.'}))
save('issues.json',issues)
# Source date is null when no publication date was established; file upload paths are never dates.
doc_specs=[
('pp-2023','pp','Programa electoral · Generales 23J 2023','https://www.pp.es/storage/2023/07/programa_electoral_pp_23j_feijoo_2023.pdf','2023-07-04','pp-2023.pdf'),
('psoe-2023','psoe','Programa electoral · Generales 23J 2023','https://xn--espaaavanza-4db.es/wp-content/uploads/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf','2023-07-07','psoe-campaign.pdf'),
('vox-2023','vox','Programa electoral · Generales 23J 2023','https://www.votaabascal.es/assets/pdf/Programa-VOX-2023.pdf',None,'vox-2023.pdf'),
('sumar-2023','sumar-2023','Un programa para ti · Coalición Sumar · Generales 23J','https://movimientosumar.es/wp-content/uploads/2023/07/Un-Programa-para-ti.pdf',None,'sumar-2023.pdf'),
('bng-2023','bng','Programa electoral · Eleccións Xerais 2023','https://www.bng.gal/media/bnggaliza/files/2023/07/05/23_bng_xerais_programa.pdf',None,'bng-2023.pdf'),
('bildu-2023','eh-bildu','Compromiso de Euskal Herria Bildu · 23J','https://ehbildu.eus/dokumentuak/23J-COMPROMISO-DE-EUSKAL-HERRIA-BILDU.pdf',None,'bildu-2023.download'),
('erc-2023','erc','Programa electoral · Eleccions Generals 2023','https://static.esquerra.cat/uploads/20230905/e2023-programa.pdf',None,'erc-2023.pdf'),
('pnv-2023','pnv','Con voz propia · Programa electoral 23J','https://www.eaj-pnv.eus/es/adjuntos-documentos/20945/pdf/con-voz-propia-programa-electoral-23-j','2023-07-23','pnv-2023.pdf'),
('upn-2023','upn','Programa electoral · Generales 23J 2023','https://www.upn.org/wp-content/uploads/2023/07/Programa-Generales-23J_V2-1.pdf',None,'upn-2023.pdf'),
('iu-2023','iu','Aportación de IU al programa · Generales 23J','https://izquierdaunida.org/wp-content/uploads/2023/07/Programa-IU-Elecciones-Generales-Jl2023.pdf','2023-07-01','iu-2023.pdf')]
docs=[]
for ident,party,title,url,date,file in doc_specs:
 body=(ROOT/'research/documents'/file).read_bytes();pages=json.loads((ROOT/f'research/text/{ident}.json').read_text())
 docs.append(dict(id=ident,partyIds=[party],sourceTitle=title,sourceUrl=url,sourceDate=date,sourceDateLabel=date or 'Julio de 2023; día de publicación no acreditado',datePrecision='day' if date else 'month',sourceType='programmatic_document' if party=='iu' else 'electoral_program',election='Elecciones generales · 23/07/2023',electionDate='2023-07-23',lastVerified=CHECKED,validity='Documento histórico de la convocatoria de 2023; no acredita un programa para las elecciones de 2026.',sha256=hashlib.sha256(body).hexdigest(),pageCount=len(pages),pageConvention='Página del archivo PDF, contando la portada como 1; puede diferir del número impreso.',verificationMethod='Descarga HTTPS y extracción local del PDF; lectura del contexto',verificationStatus='downloaded',localFile=f'research/documents/{file}',demo=False))
docs[1]['verificationNote']='Descargado de la web electoral con pie PSOE–CEF, Ferraz 70. Texto, título, fecha y paginación cotejados con el PDF de psoe.es, que requiere CAPTCHA en el navegador. No se ha resuelto el CAPTCHA.'
docs[1]['canonicalUrl']='https://www.psoe.es/media-content/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf'
save('sources.json',docs)
# party / issue / PDF page / literal anchor / neutral summary / stance (default support)
entries='''pp|fortunas|23|Eliminaremos el impuesto|Propone eliminar el impuesto a las grandes fortunas.|oppose
pp|irpf-inflacion|23|inflación en la tarifa|Propone compensar los efectos de la inflación en la tarifa del IRPF.
pp|cuota-autonomos|20|TARIFA 0|Propone cuota cero durante el primer año de actividad autónoma.
pp|vivienda-publica|34|VIVIENDA SOCIAL|Propone promover vivienda social, sin explicitar titularidad pública en este fragmento.|related
pp|hipotecas-jovenes|34|95%|Propone avales para jóvenes de hasta 35 años que permitan hipotecas de hasta el 95 % del precio.
pp|infantil|53|UNIVERSAL Y GRATUITA|Propone educación de 0 a 3 universal y gratuita, con financiación estatal y autonómica al 50 %.
pp|ebau|52|EBAU|Propone una prueba de acceso universitaria con condiciones básicas y evaluación comunes.
pp|planes-igualdad|21|PLANES DE IGUALDAD|Propone mejorar planes de igualdad con objetivos evaluables.
pp|nuclear|38|EXTENSIÓN DE LA VIDA|Propone extender la vida útil de centrales existentes con autorización del Consejo de Seguridad Nuclear.
pp|cgpj|75|12 vocales|Propone que jueces y magistrados elijan los doce vocales judiciales del CGPJ.
pp|defensa|103|2%|Propone cumplir el compromiso de destinar el 2 % del PIB a seguridad y defensa.
pp|ia-derechos|22|REGLAMENTO DE IA EUROPEO|Propone impulsar la regulación europea de inteligencia artificial conforme a sus principios y valores.
pp|atencion-presencial|87|TENCIÓN PRESENCIAL|Propone compatibilizar cita previa con atención presencial, eliminando trabas.
psoe|smi|26|60% del salario medio|Propone garantizar en el Estatuto de los Trabajadores que el SMI se acompase al 60 % del salario medio.
psoe|dental|204|Bucodental|Propone ampliar la cartera pública de salud bucodental.
psoe|espera-sanitaria|201|120 días|Propone plazos legales de 120 días para cirugía, 60 para consulta especializada y 30 para pruebas.
psoe|infantil|143|Universalizaremos|Propone universalizar la educación de 0 a 3 años; este fragmento no explicita gratuidad.|related
psoe|pension-ipc|170|con arreglo al IPC|Propone preservar el poder adquisitivo de todas las pensiones según el IPC.
psoe|nuclear|74,75|Aprobaremos el 7º Plan|Propone seguir con el desmantelamiento progresivo y ordenado de las centrales nucleares.|oppose
psoe|ganaderia|67|ganadería extensiva|Propone apoyar especialmente la ganadería extensiva por sus efectos sociales y ambientales.
psoe|ley-industria|49|Ley de Industria|Propone aprobar una nueva ley de industria diseñada con sector y agentes sociales.
psoe|cooperacion|261|0,7% de la Renta|Propone alcanzar el 0,7 % de renta nacional bruta en ayuda oficial al desarrollo para 2030.
psoe|atencion-presencial|240|sin cita previa obligatoria|Propone atención presencial sin cita previa obligatoria y horarios flexibles.
psoe|vivienda-publica|222|Incrementaremos el actual parque|Propone ampliar el parque público de vivienda para alquiler asequible.
psoe|crianza|173|Establecer una prestación por crianza|Propone una prestación por crianza para familias con menores a cargo; el fragmento no fija el límite de 18 años.|related
psoe|permiso-nacimiento|173|20 semanas|Propone ampliar permisos por nacimiento a 20 semanas.
sumar-2023|jornada|7|Reordenaremos el tiempo de trabajo|Propone 37,5 horas en 2024 y diálogo social para avanzar hasta 32 horas semanales sin reducción salarial.
sumar-2023|fortunas|16|grandes fortunas|Propone un impuesto permanente a grandes fortunas.
sumar-2023|banca-energia|16|Mantendremos los impuestos extraordinarios|Propone mantener los gravámenes hasta completar la reforma del impuesto de sociedades; no acredita permanencia indefinida.|related
sumar-2023|pension-ipc|15|Este compromiso se mantendrá|Propone conservar la revalorización según IPC y aumentos adicionales para pensiones mínimas y no contributivas.
sumar-2023|crianza|15|Impulso de una prestación por crianza|Propone una prestación por crianza hasta los 18 años que unifique ayudas existentes.
sumar-2023|alquiler|78|haremos obligatoria la declaración|Propone declarar obligatorias las zonas tensionadas que cumplan los requisitos y aplicar allí la regulación de alquileres.
sumar-2023|vivienda-publica|76|fortalecer los parques públicos|Propone programas públicos de compra de viviendas para ampliar los parques públicos.
sumar-2023|regularizacion|104|regularización|Propone un procedimiento de regularización permanente de personas extranjeras.
sumar-2023|cie|105|Cierre de los Centros|Propone cerrar los centros de internamiento de extranjeros.
sumar-2023|pelotas-goma|132|pelotas de goma|Propone prohibir las pelotas de goma en la actuación policial.
sumar-2023|seguridad-ciudadana|132|Se modificará|Propone modificar la ley de seguridad ciudadana; no se atribuye una derogación completa.|related
sumar-2023|aborto-publico|111|aborto|Propone garantizar la interrupción del embarazo en la red sanitaria pública.
sumar-2023|energia-publica|13|empresa pública de energía|Propone gestionar mediante empresa pública centrales hidroeléctricas según venzan las concesiones.
sumar-2023|renovables|41|90%|Propone alcanzar al menos un 90 % de electricidad renovable para 2030.
sumar-2023|restauracion|53|Apro- baremos una estrategia|Propone una estrategia nacional de infraestructuras verdes, conectividad y restauración ecológica.
sumar-2023|jets|82|privados|Propone restringir el uso de aviones privados.
sumar-2023|ganaderia|60|apoyos suple- mentarios|Propone apoyos suplementarios para la ganadería extensiva y un modelo sostenible de producción.
sumar-2023|reglas-fiscales|19|3%|Propone eliminar umbrales uniformes de déficit y deuda; el fragmento no concreta una excepción para inversiones ecológicas y digitales.|related
sumar-2023|armas-nucleares|138|Prohibición de Armas|Propone incorporarse al Tratado de Prohibición de Armas Nucleares.
sumar-2023|cooperacion|148|0,7|Propone dedicar el 0,7 % del PNB a ayuda oficial al desarrollo en 2030. Se conserva la magnitud escrita, sin sustituirla automáticamente por RNB.|related
sumar-2023|software-publico|180|contrataciones|Propone cláusulas en contratación pública para priorizar software libre y abierto.
sumar-2023|ciencia-abierta|162|Potenciación de la ciencia|Propone potenciar ciencia y datos abiertos en repositorios públicos.
vox|iva-general|76|18%|Propone reducir el tipo general de IVA al 18 % y el reducido al 8 %.
vox|sociedades|77|15%|Propone reducir sociedades al 15 %; la reducción efectiva depende de relocalizar beneficios y crear empleo.|conditional
vox|pension-irpf|75|pensiones contributi|Propone exención de IRPF para las pensiones contributivas.
vox|cuota-autonomos|23|Salario Mínimo|Propone exonerar de cuota a autónomos por debajo del SMI, no a todos los nuevos autónomos.|related
vox|vivienda-publica|41|viviendas sociales públicas|Propone construir vivienda social pública en propiedad o alquiler con opción de compra.
vox|dental|58|salud bucodental|Propone incluir prestaciones bucodentales y oftalmológicas en la cartera sanitaria.
vox|infantil|164|guarderías gratuitas|Propone apoyar guarderías municipales gratuitas con horarios amplios; no explicita universalizar todo el ciclo educativo.|related
vox|regularizacion|100|Inmediata expulsión|Propone expulsión inmediata de quienes accedan ilegalmente; no se equipara a oposición a cualquier vía de regularización.|related
vox|aborto-publico|58|suprimiremos de la Sanidad Pública|Propone suprimir de la sanidad pública las intervenciones de aborto.|oppose
vox|nuclear|117|vida útil|Propone ampliar la vida útil de las centrales nucleares existentes.
vox|cgpj|127|todos los miembros|Propone que todos los miembros del CGPJ sean designados o propuestos por jueces; su alcance excede los doce vocales judiciales.|conditional
vox|ganaderia|110|ganadería extensiva|Propone facilitar el pastoreo extensivo como prevención de incendios.
vox|irpf-inflacion|75|tualización automática|Propone actualización automática del ahorro para la inflación; no explicita aquí deflactar los tramos generales del IRPF.|related
bng|jornada|16|35 horas|Propone una jornada de 35 horas sin reducción salarial.
bng|smi|16|60 %|Propone situar el salario mínimo en el 60 % del salario medio.
bng|pension-ipc|18|IPC real|Propone revalorizar pensiones anualmente con el IPC real.
bng|jubilacion|18|65 anos|Propone recuperar jubilación ordinaria a los 65 años y parcial a los 61.
bng|contratos-paraisos|41|paraísos fiscais|Propone impedir contratación pública con sociedades en paraísos fiscales sin actividad económica real.
bng|cadena-alimentaria|43|custos de produción|Propone reforzar la ley para impedir ventas por debajo de costes con referencias objetivas de precio.
bng|palestina|67|Estado palestino|Propone reconocer al Estado palestino.
bng|fortunas|40,41|Estabelecer a permanencia dos impostos específicos|Propone un gravamen permanente a grandes fortunas.
bng|banca-energia|40,41|Estabelecer a permanencia dos impostos específicos|Propone hacer permanentes los impuestos extraordinarios a banca y eléctricas.
bng|cie|20|Internamento|Propone cerrar los centros de internamiento de extranjeros.
bng|seguridad-ciudadana|27|Mordaza|Propone derogar la ley de seguridad ciudadana conocida como ley mordaza.
bng|regularizacion|19|persoas migrantes|Propone regularización de personas migrantes que residen en el Estado.
eh-bildu|jornada|3|32 horas|Propone reducir la jornada semanal máxima a 32 horas sin pérdida salarial ni de condiciones.
eh-bildu|smi|3,4|Exigiremos el aumento del SMI|Propone salario mínimo propio basado en el 60 % del salario medio de cada territorio; ámbito distinto del SMI estatal.|conditional
eh-bildu|vivienda-publica|4|Vivienda|Propone prorrogar contratos de alquiler manteniendo sus condiciones; no acredita ampliar el parque público.|related
eh-bildu|dental|6|dentales|Propone incorporar cobertura dental y oftalmológica al sistema público.
eh-bildu|banca-energia|8|banca|Propone hacer permanentes los impuestos a banca y energéticas respetando competencias forales.
eh-bildu|fortunas|8|fortunas|Propone mantener permanentemente el gravamen a grandes fortunas con respeto a competencias forales.
eh-bildu|ley-industria|8|industria|Propone una nueva ley de industria centrada en pymes, investigación, innovación y digitalización.
eh-bildu|seguridad-ciudadana|12|Mordaza|Propone derogar la ley de seguridad ciudadana.
eh-bildu|pelotas-goma|12|pelotas de goma|Propone prohibir pelotas de goma.
eh-bildu|atencion-presencial|7|presencial|Propone solicitud y tramitación presencial del ingreso mínimo vital; el ámbito no abarca toda la administración.|conditional
eh-bildu|regularizacion|11|extranjería|Propone cambiar la ley de extranjería y garantías migratorias; no se atribuye aquí una regularización concreta.|related
pnv|pension-ipc|33|conforme al IPC|Propone defender vinculación de pensiones al IPC para preservar poder adquisitivo.
pnv|residencia-trabajo|34|contrato de trabajo|Propone que migrantes con contrato de trabajo no necesiten pasar por arraigo.
pnv|convenios|30|más favorables|Propone prevalencia de convenios autonómicos cuando sean más favorables para trabajadores.
pnv|reglas-fiscales|17|transición ecológica y digital|Propone exceptuar inversiones o flexibilizar el cómputo fiscal para transición ecológica y digital.
pnv|cannabis|46|medicinal del cannabis|Propone adaptar normativa para regular el uso medicinal del cannabis.
pnv|ia-derechos|9|derechos humanos|Propone regulación de inteligencia artificial basada en protección de derechos humanos.
pnv|vivienda-publica|45|vivienda pública|Propone fomentar alquiler y promoción de vivienda pública suficiente.
erc|alquiler|52|preus del lloguer|Propone defender límites y reducción de los precios del alquiler.
erc|cie|40|Tancament dels Centres|Propone cerrar los centros de internamiento de extranjeros.
erc|regularizacion|41|Noves vies de regularització|Propone nuevas vías de regularización adaptadas a distintas situaciones de personas migrantes.
erc|seguridad-ciudadana|41|Derogar la llei mordassa|Propone derogar la ley de seguridad ciudadana.
erc|ganaderia|74|ramaderia extensiva|Propone fomentar ganadería extensiva y transición de intensiva hacia modelos más sostenibles.
erc|cadena-alimentaria|74|preus pels productors|Propone modificar la ley alimentaria para mejorar precios de productores, equilibrio y transparencia; no se atribuye una prohibición concreta adicional.|related
erc|armas-nucleares|14|Tractat de Prohibició|Propone ratificar el Tratado de Prohibición de las Armas Nucleares.
erc|infantil|128|0-3 anys|Propone universalizar el ciclo de 0 a 3 años; este fragmento no explicita gratuidad.|related
erc|atencion-presencial|43|atenció directa|Propone procedimientos alternativos a medios telemáticos con atención directa de las administraciones.
iu|jubilacion|108|65 años|Propone devolver la edad de jubilación ordinaria a 65 años.
iu|cie|32|Cierre de los Centros|Propone cerrar centros de internamiento de extranjeros.
iu|regularizacion|32|regularización permanente|Propone introducir un procedimiento de regularización permanente.
iu|infantil|83|universal, pública y gratuita|Propone escuela infantil universal, pública y gratuita desde los 0 años.
iu|energia-publica|55|HUNOSA|Propone convertir HUNOSA en empresa pública energética receptora de concesiones hidráulicas vencidas.
iu|ganaderia|66|ganadería extensiva|Propone apoyo a ganadería extensiva mediante la PAC y condiciones sociales.
iu|armas-nucleares|197|Tratado de prohibición|Propone incorporarse al Tratado de Prohibición de las Armas Nucleares.
iu|cooperacion|199|0,7 % del PIB|Propone destinar el 0,7 % del PIB a cooperación; no se equipara a renta nacional bruta ni al plazo 2030.|related
iu|sociedades|124|Resultado contable|Propone tributación mínima efectiva del 15 % del resultado contable; no es reducir el tipo general al 15 %.|related'''
entries += '''\nupn|irpf-inflacion|2|tarifa del IRPF|Propone deflactar la tarifa del IRPF para combatir los efectos de la inflación.
upn|pension-ipc|4|sistema de pensiones|Propone un sistema de pensiones sin recortes; no explicita en este fragmento vincular su actualización al IPC.|related
upn|alquiler|6|Derogación de la Ley de Vivienda|Propone derogar la Ley de Vivienda y respetar competencias navarras; no acredita oposición a cualquier limitación de precios.|related
upn|renovables|5|energías renovables|Propone desarrollar energías renovables; este fragmento no establece el objetivo del 90 % para 2030.|related'''
entries += '\n' + (ROOT/'research/editorial-additions.txt').read_text().strip()
proposals=[];pending=[];bydoc={s['partyIds'][0]:s for s in docs};byissue={x['id']:x for x in issues}
for line in entries.splitlines():
 parts=line.split('|'); party,issue,page,anchor,summary=parts[:5];stance=parts[5] if len(parts)>5 else 'support';doc=bydoc[party];page_numbers=[int(n) for n in page.split(',')];page=page_numbers[0]
 document_pages=json.loads((ROOT/f"research/text/{doc['id']}.json").read_text());text=' '.join(' '.join(document_pages[n-1] for n in page_numbers).split())
 start=text.casefold().find(anchor.casefold())
 if start<0:
  pending.append(dict(partyId=party,issueId=issue,page=page,anchor=anchor,neutralSummary=summary,reason='El ancla editorial no coincide con la página indicada. Requiere volver a leer el documento.',certainty='low'));continue
 # Keep a compact literal extract plus the surrounding text locally for independent auditing.
 left=max(text.rfind('. ',0,start)+2 if text.rfind('. ',0,start)>=0 else 0,text.rfind('•',0,start)+1,text.rfind('●',0,start)+1,0)
 right=text.find('. ',start+len(anchor));right=right+1 if right>=0 else len(text)
 excerpt=text[left:right]
 if len(excerpt)>900: excerpt=text[max(left,start-100):min(right,start+len(anchor)+420)]
 # Include the explicit condition and commitment, not only a heading or previous achievement.
 if party=='sumar-2023' and issue=='jornada': excerpt=text[start:text.index('32 horas semanales.',start)+len('32 horas semanales.')]
 if party=='sumar-2023' and issue=='crianza': excerpt=text[start:text.index('en el IRPF.',start)+len('en el IRPF.')]
 if party=='sumar-2023' and issue=='pension-ipc':
  left=text.index('Durante esta legislatura');excerpt=text[left:text.index('el umbral de la pobreza.',start)+len('el umbral de la pobreza.')]
 if party=='eh-bildu' and issue=='smi': excerpt=text[start:text.index('lo estipulado a nivel estatal.',start)+len('lo estipulado a nivel estatal.')]
 if party=='vox' and issue=='sociedades': excerpt=text[left:text.index('por tamaño.',start)+len('por tamaño.')]
 # Reviewed cross-page spans: avoid treating page-header numbers as sentence endings.
 if party=='bng' and issue in ['fortunas','banca-energia']:
  excerpt=text[start:text.index('á Galiza.',start)+len('á Galiza.')]
 if party=='psoe' and issue=='nuclear':
  excerpt=text[start:text.index('nucleares.',start)+len('nucleares.')]
 record={k:doc[k] for k in ['sourceTitle','sourceUrl','sourceDate','sourceDateLabel','datePrecision','sourceType','election','electionDate','lastVerified','validity','demo']}
 record.update(id=f'{party}-{issue}',partyId=party,issueId=issue,categories=byissue[issue]['categories'],originalText=excerpt,neutralSummary=summary,sourcePage=page,sourcePages=page_numbers,sourceId=doc['id'],documentHash=doc['sha256'],certainty='medium' if stance=='conditional' else 'high',stance=stance,comparisonEligible=stance!='related',stanceDirection=1 if stance in ['support','conditional'] else -1 if stance=='oppose' else None,comparisonNote=byissue[issue]['importantNuances'][0] if stance in ['related','conditional'] else '',extractionAnchor=anchor)
 proposals.append(record)
save('proposals.json',proposals);save('pending/extraction-review.json',pending)
print('Published',len(proposals),'Pending',len(pending))
for p in pending: print(p['partyId'],p['issueId'],p['page'],p['anchor'])
