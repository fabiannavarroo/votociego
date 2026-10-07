import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Download, SlidersHorizontal } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { alphabeticalParties, questions } from '../data';
import { partyCoincidence } from '../utils/comparison';
import { downloadProfile } from '../utils/share';
import { PageHeading, EmptyState, PartyMark } from '../components/ui';
import { Profile } from '../components/Profile';
import ImportanceEditor from '../components/ImportanceEditor';

export default function Results() {
  const { progress } = useAppState();
  const [importanceOpen, setImportanceOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const answered = Object.values(progress.answers).filter(value => value !== null).length;
  const skipped = Object.values(progress.answers).filter(value => value === null).length;

  if (!progress.completed) return <div className="container page">
    <PageHeading eyebrow="TUS RESULTADOS" title="Coincidencia con partidos" description="Responde primero. Al terminar verás tus porcentajes de coincidencia." />
    <EmptyState title={Object.keys(progress.answers).length ? 'Tu cuestionario sigue en marcha' : 'Empieza por tus ideas'} text={Object.keys(progress.answers).length ? `${Object.keys(progress.answers).length} de ${questions.length} preguntas revisadas. Continúa para ver los resultados.` : 'Un cuestionario anónimo, sin siglas durante las preguntas.'} action={Object.keys(progress.answers).length ? 'Continuar cuestionario' : 'Empezar cuestionario'} />
  </div>;

  const results = alphabeticalParties.map(party => ({ party, ...partyCoincidence(questions, progress.answers, party.id) }));
  const comparable = results.filter(result => result.percentage !== null).sort((a, b) => b.percentage! - a.percentage! || b.compared - a.compared || a.party.name.localeCompare(b.party.name, 'es'));
  const unknown = results.filter(result => result.percentage === null);

  async function download() {
    setDownloading(true); setDownloadStatus('');
    try { await downloadProfile(progress.answers, progress.importance); setDownloadStatus('Imagen descargada. Incluye únicamente tu desglose por temas.'); }
    catch (error) { setDownloadStatus(error instanceof Error ? error.message : 'No se pudo descargar la imagen.'); }
    finally { setDownloading(false); }
  }

  return <div className="container page results-page">
    <PageHeading eyebrow="TUS RESULTADOS" title="Coincidencia con partidos" description="Qué porcentaje de tus respuestas coincide con las posiciones documentadas de cada formación." />
    <p className="affinity-summary">{answered} propuestas respondidas · {skipped} saltadas · Solo en tu dispositivo</p>
    <p className="affinity-coverage-note" id="affinity-coverage">Cada porcentaje usa las preguntas comparables de ese partido. La base varía: un 100 % en una pregunta no equivale a un 100 % en veinte.</p>

    {comparable.length ? <section aria-label="Porcentajes de coincidencia" aria-describedby="affinity-coverage">
      <ul className="affinity-list">{comparable.map(result => <li className="affinity-card" key={result.party.id}>
        <div className="affinity-card-top"><PartyMark party={result.party} small />
          <Link className="affinity-party-name" to={`/partidos/${result.party.slug}`} aria-label={`Ver documentación de ${result.party.name}`}><h2>{result.party.acronym}</h2><span>{result.party.name}</span></Link>
          <strong className="affinity-percentage" aria-label={`${result.percentage} por ciento de coincidencia`}>{result.percentage}<span> %</span></strong>
        </div>
        <div className="affinity-bar" aria-hidden="true"><span style={{ width: `${result.percentage}%` }} /></div>
        <p>Base: {result.compared} de {result.eligibleAnswers} respuestas con postura{result.compared < 5 ? ' · Base muy limitada' : ''}</p>
      </li>)}</ul>
    </section> : <div className="affinity-no-results"><h2>No hay respuestas comparables</h2><p>Las respuestas neutrales y los saltos no definen una postura. Puedes empezar de nuevo o consultar las fuentes.</p><Link className="text-link" to="/test">Revisar cuestionario<ArrowRight size={17} aria-hidden="true" /></Link></div>}

    {unknown.length > 0 && <details className="results-disclosure affinity-unknown">
      <summary><span>Formaciones sin porcentaje calculable ({unknown.length})</span><ChevronDown size={20} aria-hidden="true" /></summary>
      <ul>{unknown.map(result => <li key={result.party.id}><PartyMark party={result.party} small /><div><Link className="text-link" to={`/partidos/${result.party.slug}`}>{result.party.acronym}</Link><p>{result.available ? 'Tus respuestas no permiten comparar las posiciones disponibles.' : 'Sin posiciones comparables en las fuentes consultadas.'}</p></div></li>)}</ul>
    </details>}

    <details className="results-disclosure affinity-method">
      <summary><span>Cómo se calcula el porcentaje</span><ChevronDown size={20} aria-hidden="true" /></summary>
      <div className="results-disclosure-content"><p>Cada coincidencia suma 1; una coincidencia parcial por condiciones explícitas, 0,5; una postura opuesta, 0. Se divide por las preguntas comparables y se multiplica por 100, redondeando al entero más cercano.</p><p>Todas las preguntas tienen el mismo peso. Acuerdo y acuerdo total expresan el mismo sentido: no inventamos una intensidad del partido. No se cuentan respuestas neutrales, saltos, conflictos ni posiciones desconocidas.</p><p>La documentación es principalmente de 2023, con actividad posterior fechada. Estos porcentajes describen el corpus disponible; no son una probabilidad de voto ni una valoración del programa completo.</p><Link className="text-link" to="/metodologia">Ver metodología<ArrowRight size={17} aria-hidden="true" /></Link></div>
    </details>

    <details className="results-disclosure results-topics">
      <summary><span>Lo que piensas, tema a tema</span><ChevronDown size={20} aria-hidden="true" /></summary>
      <div className="results-disclosure-content">
        <div className="results-topic-actions"><button className="button secondary small" onClick={() => setImportanceOpen(!importanceOpen)} aria-expanded={importanceOpen} aria-controls="importance-editor"><SlidersHorizontal size={17} aria-hidden="true" />Personalizar temas</button><button className="button secondary small" onClick={download} disabled={downloading}><Download size={17} aria-hidden="true" />{downloading ? 'Creando imagen…' : 'Descargar mis temas'}</button></div>
        {downloadStatus && <p className="inline-notice" role="status">{downloadStatus}</p>}
        {importanceOpen && <div id="importance-editor"><ImportanceEditor /></div>}
        <div className="profile-legend"><span><i className="agree" />Acuerdo</span><span><i className="neutral" />Neutral / No estoy seguro</span><span><i className="disagree" />Desacuerdo</span></div>
        <Profile answers={progress.answers} importance={progress.importance} />
      </div>
    </details>
    <div className="results-end-actions"><Link className="button secondary" to="/revelacion">Consultar propuestas y fuentes<ArrowRight size={17} aria-hidden="true" /></Link><Link className="text-link" to="/test">Volver al cuestionario</Link></div>
  </div>;
}
