import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, EyeOff, Info, SkipForward, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { categories, questions } from '../data';
import { useAppState } from '../hooks/useAppState';
import { answerLabels } from '../utils/comparison';
import { CategoryIcon } from '../components/Icon';
import { EmptyState, PrivacyNote } from '../components/ui';
import type { Position } from '../types';
const options: Position[] = [2, 1, 0, -1, -2];
const contextSections = [
  { key: 'for', label: 'Argumentos a favor' },
  { key: 'against', label: 'Argumentos en contra' },
  { key: 'implications', label: 'Qué conviene tener en cuenta' },
] as const;
export default function Quiz() {
  const { progress, answer, setIndex, finish, restart } = useAppState(); const navigate = useNavigate();
  const [resume, setResume] = useState(Object.keys(progress.answers).length > 0 || progress.completed);
  const [contextOpen, setContextOpen] = useState(false); const questionRef = useRef<HTMLHeadingElement>(null);
  const question = questions[progress.index]; const category = categories.find(item => item.id === question?.category);
  useEffect(() => { setContextOpen(false); if (!resume) questionRef.current?.focus({ preventScroll: true }); }, [progress.index, resume]);
  if (!question || !category) return <div className="container page"><EmptyState headingLevel={1} title="No hay preguntas disponibles" text="El conjunto de propuestas todavía no está disponible. Puedes consultar la metodología y las fuentes." to="/metodologia" action="Consultar metodología" /></div>;
  if (resume) return <div className="container quiz-resume"><div className="resume-card"><span className="empty-icon"><EyeOff size={30} aria-hidden="true" /></span><p className="eyebrow">TU ESPACIO SIGUE AQUÍ</p><h1>{progress.completed ? 'Tus resultados ya están listos.' : '¿Quieres continuar donde lo dejaste?'}</h1><p>{Object.keys(progress.answers).length} de {questions.length} preguntas revisadas. Tus respuestas están guardadas en este navegador.</p><div className="resume-actions"><button className="button primary" onClick={() => progress.completed ? navigate('/resultados') : setResume(false)}>{progress.completed ? 'Ver resultados' : 'Continuar'}<ArrowRight size={18} aria-hidden="true" /></button><button className="button secondary" onClick={() => { restart(); setResume(false); }}><RotateCcw size={17} aria-hidden="true" />Empezar de nuevo</button></div><PrivacyNote /></div></div>;
  const selected = progress.answers[question.id];
  function advance(skip = false) { if (skip) answer(question.id, null); if (progress.index === questions.length - 1) { finish(); navigate('/resultados'); } else setIndex(progress.index + 1); }
  return <div className="quiz-page"><div className="quiz-top container"><Link className="text-link subtle" to="/"><ArrowLeft size={17} aria-hidden="true" />Salir y guardar</Link><span className="blind-badge"><EyeOff size={16} aria-hidden="true" /> Modo ciego</span><span className="quiz-top-meta">Sin siglas. Solo propuestas.</span></div><section className="quiz-shell"><div className="quiz-progress-info"><span>Pregunta <strong>{progress.index + 1}</strong> de {questions.length}</span><span>{Math.round(progress.index / questions.length * 100)} % del recorrido</span></div><progress className="quiz-progress" value={progress.index} max={questions.length} aria-label="Progreso del cuestionario" />
    <div className="question-content" key={question.id}><p className="category-label"><CategoryIcon name={category.icon} />{category.name}<span>Propuesta {progress.index + 1}</span></p><h1 ref={questionRef} tabIndex={-1}>{question.statement}</h1><p className="question-help" id="question-help">{question.context.meaning}</p><fieldset className="answer-list" aria-describedby="question-help"><legend className="sr-only">Tu opinión sobre la propuesta. No hay respuestas correctas.</legend>{options.map(value => <label key={value} className={`answer-option ${selected === value ? 'selected' : ''}`}><input type="radio" name={question.id} value={value} checked={selected === value} onChange={() => answer(question.id, value)} /><span className="answer-radio" aria-hidden="true">{selected === value && <Check size={14} />}</span><span>{answerLabels[value]}</span></label>)}</fieldset>
    {selected === null && <p className="skipped-note" role="status">Has saltado esta pregunta. Puedes responderla ahora o mantenerla saltada.</p>}
    <div className="context-panel"><button className="context-toggle" onClick={() => setContextOpen(!contextOpen)} aria-expanded={contextOpen} aria-controls="proposal-context"><Info size={18} aria-hidden="true" />Necesito contexto<ChevronDown size={18} className={contextOpen ? 'rotated' : ''} aria-hidden="true" /></button>{contextOpen && <div className="context-content" id="proposal-context">{contextSections.map(({ key, label }) => <div key={key}><h2>{label}</h2><p>{question.context[key]}</p></div>)}<div className="blind-source"><BookSource /> <p><strong>Fuente de la propuesta</strong><br />{question.sourceContext}</p></div></div>}</div>
    <div className="quiz-navigation"><button className="button secondary" onClick={() => setIndex(Math.max(0, progress.index - 1))} disabled={progress.index === 0}><ArrowLeft size={17} aria-hidden="true" /><span>Anterior</span></button><button className="skip-button" onClick={() => advance(true)}>Saltar pregunta<SkipForward size={16} aria-hidden="true" /></button><button className="button primary" onClick={() => advance()} disabled={selected === undefined}>{progress.index === questions.length - 1 ? 'Ver resultados' : 'Siguiente'}<ArrowRight size={18} aria-hidden="true" /></button></div><p className="quiz-save-note"><ShieldCheck size={15} aria-hidden="true" /> Se guarda automáticamente en tu navegador.</p></div>
    </section><PrivacyNote /></div>;
}
function BookSource() { return <Info size={18} aria-hidden="true" />; }
