import { ArrowUpRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Match, Party, Source } from '../types';
import { formatDate } from '../utils/format';
import { matchLabels, matchSymbols } from '../utils/comparison';
export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><div className="heading-row"><div><h1>{title}</h1><p className="lead">{description}</p></div>{children}</div></header>;
}
export function PrivacyNote({ compact = false }: { compact?: boolean }) { return <p className={`privacy-note ${compact ? 'compact' : ''}`}><ShieldCheck size={17} aria-hidden="true" /><span>{compact ? 'Anónimo. Sin registro. Solo en tu dispositivo.' : 'Tus respuestas permanecen en este dispositivo y no se envían a ningún servidor.'}</span></p>; }
export function MatchBadge({ match }: { match: Match }) { return <span className={`match-badge ${match}`}><span aria-hidden="true">{matchSymbols[match]}</span> {matchLabels[match]}</span>; }
export function PartyMark({ party, small = false }: { party: Party; small?: boolean }) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const mark=party.acronym.length<=4?party.acronym:party.acronym.split(/[\s·-]+/).map(word=>word[0]).join('').slice(0,3).toUpperCase();
  if (party.logo && failedLogo !== party.logo) {
    return <span className={`party-mark party-logo ${small ? 'small' : ''}`} aria-hidden="true" title={`Logotipo de ${party.name}`} style={party.logoBackground ? { backgroundColor: party.logoBackground } : undefined}><img src={`${import.meta.env.BASE_URL}${party.logo.replace(/^\/+/, '')}`} alt="" width="112" height="64" loading="lazy" decoding="async" onError={() => setFailedLogo(party.logo)} /></span>;
  }
  return <span className={`party-mark party-monogram ${small ? 'small' : ''}`} aria-hidden="true" title="Identificador tipográfico; no es un logotipo oficial">{mark}</span>;
}
export function SourceLink({ source }: { source: Source }) {
  const pages = source.sourcePages?.length ? source.sourcePages.join(', ') : source.sourcePage;
  const href = source.sourceUrl + (pages && source.sourceType!=="official_statement" ? `#page=${source.sourcePages?.[0] || source.sourcePage}` : '');
  return <div className="source-block"><div><strong>{source.sourceTitle}</strong><p>{pages ? `Página PDF: ${pages} (portada = 1)` : 'Página no aplicable / no indicada'} · Documento: {source.sourceDate ? formatDate(source.sourceDate) : source.sourceDateLabel || 'Fecha no acreditada'}</p>{source.election && <p>{source.election}</p>}<p>Datos comprobados por última vez: {formatDate(source.lastVerified)}</p>{source.validity && <p>{source.validity}</p>}</div>{source.sourceUrl ? <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">Consultar fuente original <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (abre en otra pestaña)</span></a> : <span>Fuente no disponible</span>}</div>;
}
export function EmptyState({ title, text, action = 'Empezar cuestionario', to = '/test', headingLevel = 2 }: { title: string; text: string; action?: string; to?: string; headingLevel?: 1 | 2 }) { const Heading = headingLevel === 1 ? 'h1' : 'h2'; return <div className="empty-state"><div className="empty-icon"><OrbitMark /></div><Heading>{title}</Heading><p>{text}</p><Link className="button primary" to={to}>{action}<ArrowRight size={18} aria-hidden="true" /></Link></div>; }
export function OrbitMark() { return <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1.5"/><ellipse cx="40" cy="40" rx="13" ry="35" transform="rotate(45 40 40)" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="60" cy="20" r="5" fill="currentColor"/></svg>; }
