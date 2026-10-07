import { useState } from 'react';
import { Check, Filter } from 'lucide-react';
import { questions, categories, alphabeticalParties, unknownPosition } from '../data';
import { useAppState } from '../hooks/useAppState';
import { answerLabels } from '../utils/comparison';
import { EmptyState, PageHeading } from '../components/ui';
import DocumentedPosition from '../components/DocumentedPosition';
export default function Reveal(){
 const {progress}=useAppState();const [filter,setFilter]=useState('all');
 if(!progress.completed)return <div className="container page"><EmptyState headingLevel={1} title="Primero, tus ideas" text="Las atribuciones se revelan al terminar el cuestionario ciego."/></div>;
 const reviewed=questions.filter(q=>Object.hasOwn(progress.answers,q.id)&&(filter==='all'||q.categories.includes(filter)));
 return <div className="container page"><PageHeading eyebrow="LAS IDEAS YA TIENEN SIGLAS" title="Descubre las propuestas documentadas" description="Apoyos, diferencias y medidas relacionadas conservan sus fechas y sus documentos. No se atribuye automáticamente una propuesta a todos los miembros de una coalición."/><div className="explorer-toolbar"><p>{reviewed.length} cuestiones revisadas</p><label className="select-label"><Filter size={16} aria-hidden="true"/>Tema<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos los temas</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div><div className="reveal-grid">{reviewed.map(q=>{
 const documented=alphabeticalParties.filter(p=>q.positions[p.id]?.proposalIds.length);const unknown=alphabeticalParties.filter(p=>!q.positions[p.id]?.proposalIds.length);
 return <article className="reveal-card" key={q.id}><div className="reveal-question"><p className="eyebrow">Asunto: {q.issueId}</p><h2>{q.statement}</h2><p className="user-answer"><Check size={16} aria-hidden="true"/>Tu respuesta: {progress.answers[q.id]===null?'Pregunta saltada':answerLabels[progress.answers[q.id]!]}</p><p>{q.context.meaning}</p></div><div className="reveal-sources">{documented.map(p=><DocumentedPosition key={p.id} question={q} party={p} answer={progress.answers[q.id]}/>)}<details className="evidence-history"><summary>Otras formaciones sin posición documentada ({unknown.length})</summary><p>{unknownPosition}</p><ul>{unknown.map(p=><li key={p.id}>{p.name}</li>)}</ul></details></div></article>;
 })}</div></div>;
}
