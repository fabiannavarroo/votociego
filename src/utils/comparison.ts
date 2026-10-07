import type { Answers, Importance, Match, Position, Question, Category } from '../types';
export const answerLabels: Record<Position, string> = { '-2': 'Totalmente en desacuerdo', '-1': 'En desacuerdo', 0: 'Neutral / No estoy seguro', 1: 'De acuerdo', 2: 'Totalmente de acuerdo' };
export const matchLabels: Record<Match, string> = { coincidence: 'Coincidencia', partial: 'Coincidencia parcial', difference: 'Posición diferente', unknown: 'Sin información suficiente' };
export const matchSymbols: Record<Match, string> = { coincidence: '✓', partial: '≈', difference: '↔', unknown: '—' };
export function comparePositions(user: Position | null | undefined, party: Position | null | undefined, stance?: string | null): Match {
  if (user == null || user === 0 || party == null || party === 0) return 'unknown';
  if (Math.sign(user) !== Math.sign(party)) return 'difference';
  return stance === 'conditional' ? 'partial' : 'coincidence';
}
export function topicProfile(questions: Question[], answers: Answers, categoryId: string) {
  const topic = questions.filter(question => question.category === categoryId);
  const values = topic.map(question => answers[question.id]).filter((value): value is Position => value != null);
  return { answered: values.length, total: topic.length, agree: values.filter(value => value > 0).length, neutral: values.filter(value => value === 0).length, disagree: values.filter(value => value < 0).length, mean: values.length ? values.reduce<number>((a, b) => a + b, 0) / values.length : null };
}
export function orderedCategories(categories: Category[], importance: Importance) {
  return [...categories].sort((a, b) => (importance[b.id] || 2) - (importance[a.id] || 2));
}
