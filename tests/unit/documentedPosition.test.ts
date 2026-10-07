import { describe, expect, it } from 'vitest';
import { documentedPositionLabel } from '../../src/utils/documentedPosition';
import { questions } from '../../src/data';

describe('documented positions independent of user answers', () => {
  it('distinguishes support, opposition, scope and related evidence', () => {
    const rent = questions.find(q => q.issueId === 'alquiler')!;
    expect(documentedPositionLabel(rent.positions.podemos)).toBe('A favor');
    expect(documentedPositionLabel(rent.positions.vox)).toBe('En contra');
    expect(documentedPositionLabel(rent.positions.compromis)).toBe('A favor con condiciones');
    const hours = questions.find(q => q.issueId === 'jornada')!;
    expect(documentedPositionLabel(hours.positions.compromis)).toBe('A favor');
    expect(documentedPositionLabel(hours.positions.ahi)).toBe('A favor con condiciones');
    const preschool = questions.find(q => q.issueId === 'infantil')!;
    expect(documentedPositionLabel(preschool.positions.pnv)).toBe('Documentación relacionada');
    const wage = questions.find(q => q.issueId === 'smi')!;
    expect(documentedPositionLabel(wage.positions.ahi)).toBe('Sin posición documentada');
    expect(documentedPositionLabel({ ...rent.positions.podemos, position: null, conflict: true })).toBe('Posturas contradictorias');
  });
});
