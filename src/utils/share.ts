import config from '../config.json';
import { categories, questions } from '../data';
import { orderedCategories, topicProfile } from './comparison';
import type { Answers, Importance } from '../types';
export async function downloadProfile(answers: Answers, importance: Importance) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 520 + categories.length * 76;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No se pudo crear la imagen en este navegador.');
  ctx.fillStyle = '#fafbfb'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#444851'; ctx.font = '700 30px Manrope, sans-serif'; ctx.fillText(`${config.name} · MIS RESPUESTAS`, 80, 90);
  ctx.fillStyle = '#24292d'; ctx.font = '800 64px Manrope, sans-serif'; ctx.fillText('Mi mapa de posiciones', 80, 190);
  ctx.font = '26px Inter, sans-serif'; ctx.fillStyle = '#5c656b'; ctx.fillText('Mis respuestas por tema. Sin etiquetas ni recomendaciones de voto.', 80, 245);
  orderedCategories(categories, importance).forEach((category, i) => {
    const profile = topicProfile(questions, answers, category.id); const y = 345 + i * 76;
    ctx.fillStyle = '#24292d'; ctx.font = '600 26px Inter, sans-serif'; ctx.fillText(category.name, 80, y);
    ctx.font = '23px Inter, sans-serif'; ctx.fillStyle = '#5c656b'; ctx.fillText(profile.answered ? `${profile.agree} acuerdo · ${profile.neutral} neutral · ${profile.disagree} desacuerdo` : 'Sin respuestas', 580, y);
    ctx.fillStyle = '#e1e6e8'; ctx.fillRect(80, y + 17, 1040, 5);
    if (profile.answered) { let x = 80; for (const [count, color] of [[profile.agree, '#444851'], [profile.neutral, '#adb6ba'], [profile.disagree, '#505c63']] as const) { const width = count / profile.answered * 1040; ctx.fillStyle = color; ctx.fillRect(x, y + 17, width, 5); x += width; } }
  });
  ctx.fillStyle = '#5c656b'; ctx.font = '24px Inter, sans-serif'; ctx.fillText('Las ideas no se reducen a una puntuación. Mi criterio sigue siendo mío.', 80, canvas.height - 70);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo descargar la imagen.')), 'image/png'));
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mi-mapa-de-posiciones.png'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
