import { Link } from 'react-router-dom';
import { entities, proposals, sourceTypeLabels, unknownPosition } from '../data';
import type { Party, Question, Answer } from '../types';
import { documentedPositionLabel } from '../utils/documentedPosition';
import { comparePositions } from '../utils/comparison';
import { MatchBadge, SourceLink } from './ui';
export default function DocumentedPosition({ question, party, answer }: {question: Question; party: Party; answer?: Answer}) {
  const pos=question.positions[party.id];
  const history=proposals.filter(p=>pos?.proposalIds.includes(p.id));
  return <article className="documented-position"><div className="position-heading"><h4>{party.name}</h4>{answer!=null && answer!==0 && <MatchBadge match={comparePositions(answer,pos?.position,pos?.stance)} />}</div>
    <p><strong>{documentedPositionLabel(pos)}</strong></p>
    {pos?.position!=null ? <p>{pos.summary}</p> : history.length ? <>{history.map(p=><div key={p.id}><p>{p.neutralSummary}</p><p className="muted">{p.sourceDate ?? p.sourceDateLabel}{p.comparisonNote && ` · ${p.comparisonNote}`}</p></div>)}<p className="muted">{pos?.conflict ? 'No se asigna una postura única para comparar.' : 'Estas medidas no permiten asignar un apoyo o rechazo al enunciado.'}</p></> : <p>{unknownPosition}</p>}
    {pos?.position!=null && <p className="muted">{pos.sourceDate ?? pos.sourceDateLabel}{pos.comparisonNote && ` · ${pos.comparisonNote}`}</p>}
    {(answer==null || answer===0) && <p className="muted">{answer===null?'Sin comparar: pregunta saltada.':answer===0?'Sin comparar: respuesta neutral o incierta.':'Responde para comparar.'}</p>}
    {pos?.conflict && <p className="inline-notice">Hay posiciones diferentes entre documentos. Se conservan todas con sus fechas.</p>}
    {pos?.stance==='conditional' && <p className="muted">La coincidencia está condicionada por el alcance o las condiciones del documento.</p>}
    {history.length>0 && <details className="evidence-history"><summary>Ver {history.length} registro{history.length!==1?'s':''} y sus fuentes</summary>{history.map(p=><div className="evidence-entry" key={p.id} id={p.id}><p className="eyebrow">{sourceTypeLabels[p.sourceType || '']}</p>{p.attributedEntityId && <p><strong>Atribución: {entities.find(e=>e.id===p.attributedEntityId)?.name}</strong></p>}<p>{p.neutralSummary}</p><p className="muted">Certeza: {p.certainty==='high'?'alta':p.certainty==='medium'?'media':'baja'}{!p.comparisonEligible && ' · Contexto relacionado; excluido de coincidencias'}</p>{p.comparisonNote && <p className="muted">{p.comparisonNote}</p>}<blockquote>{p.originalText}</blockquote><SourceLink source={p} /><Link className="text-link" to={`/partidos/${party.slug}?issue=${question.issueId}#${p.id}`}>Ficha de la propuesta · {p.id}</Link></div>)}</details>}
  </article>;
}
