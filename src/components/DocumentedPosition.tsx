import { Link } from 'react-router-dom';
import { entities, proposals, sourceTypeLabels, unknownPosition } from '../data';
import type { Party, Question, Answer } from '../types';
import { comparePositions } from '../utils/comparison';
import { MatchBadge, SourceLink } from './ui';
export default function DocumentedPosition({ question, party, answer }: {question: Question; party: Party; answer?: Answer}) {
  const pos=question.positions[party.id];
  const history=proposals.filter(p=>pos?.proposalIds.includes(p.id));
  return <article className="documented-position"><div className="position-heading"><h4>{party.name}</h4><MatchBadge match={comparePositions(answer,pos?.position,pos?.stance)} /></div>
    <p>{pos?.position!=null ? pos.summary : unknownPosition}</p>
    {pos?.conflict && <p className="inline-notice">Hay posiciones diferentes entre documentos. Se conservan todas con sus fechas.</p>}
    {pos?.stance==='conditional' && <p className="muted">La coincidencia está condicionada por el alcance o las condiciones del documento.</p>}
    {history.length>0 && <details className="evidence-history"><summary>Ver {history.length} registro{history.length!==1?'s':''} y sus fuentes</summary>{history.map(p=><div className="evidence-entry" key={p.id} id={p.id}><p className="eyebrow">{sourceTypeLabels[p.sourceType || '']}</p>{p.attributedEntityId && <p><strong>Atribución: {entities.find(e=>e.id===p.attributedEntityId)?.name}</strong></p>}<p>{p.neutralSummary}</p><p className="muted">Certeza: {p.certainty==='high'?'alta':p.certainty==='medium'?'media':'baja'}{!p.comparisonEligible && ' · Contexto relacionado; excluido de coincidencias'}</p>{p.comparisonNote && <p className="muted">{p.comparisonNote}</p>}<blockquote>{p.originalText}</blockquote><SourceLink source={p} /><Link className="text-link" to={`/partidos/${party.slug}?issue=${question.issueId}#${p.id}`}>Ficha de la propuesta · {p.id}</Link></div>)}</details>}
  </article>;
}
