import { categories, questions } from '../data';
import { CategoryIcon } from './Icon';
import { topicProfile, orderedCategories } from '../utils/comparison';
import type { Answers, Importance } from '../types';
export function Profile({ answers, importance }: { answers: Answers; importance: Importance }) {
  return <div className="profile-list">{orderedCategories(categories, importance).map(category => {
    const profile = topicProfile(questions, answers, category.id);
    return <div className="profile-row" key={category.id}><div className="profile-category"><span className="category-icon"><CategoryIcon name={category.icon} /></span><div><strong>{category.name}</strong><span>{profile.answered} de {profile.total} propuestas respondidas</span></div>{importance[category.id] === 3 && <span className="priority-tag">Prioridad</span>}</div><div className="profile-distribution"><div className={`distribution-bar ${profile.answered ? '' : 'no-data'}`} aria-hidden="true">{profile.answered > 0 && <><span className="agree" style={{ width: `${profile.agree / profile.answered * 100}%` }} /><span className="neutral" style={{ width: `${profile.neutral / profile.answered * 100}%` }} /><span className="disagree" style={{ width: `${profile.disagree / profile.answered * 100}%` }} /></>}</div><span className="distribution-caption">{profile.answered ? `${profile.agree} acuerdo · ${profile.neutral} neutral · ${profile.disagree} desacuerdo` : 'Aún no hay respuestas en este tema'}</span></div></div>;
  })}</div>;
}
