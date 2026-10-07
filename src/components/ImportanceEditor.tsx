import { categories } from '../data';
import { useAppState } from '../hooks/useAppState';
import { CategoryIcon } from './Icon';
export default function ImportanceEditor() {
  const { progress, setImportance } = useAppState();
  return <section className="importance-panel"><h2>¿Qué temas te importan más?</h2><p>Esto solo cambia el orden de los temas en tu mapa y en las comparaciones. No cambia las coincidencias ni recomienda un partido.</p><div className="importance-grid">{categories.map(category => <fieldset className="importance-row" key={category.id}><legend><CategoryIcon name={category.icon} size={17} />{category.name}</legend><div className="segmented-control">{([1, 2, 3] as const).map(value => <label className={(progress.importance[category.id] || 2) === value ? 'active' : ''} key={value}><input type="radio" name={`importance-${category.id}`} checked={(progress.importance[category.id] || 2) === value} onChange={() => setImportance(category.id, value)} /><span>{['Poco', 'Normal', 'Mucho'][value - 1]}</span></label>)}</div></fieldset>)}</div></section>;
}
