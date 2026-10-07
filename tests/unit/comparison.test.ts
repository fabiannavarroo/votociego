import { describe, expect, it } from 'vitest';
import { comparePositions, topicProfile, orderedCategories } from '../../src/utils/comparison';
import { questions, categories, dataErrors } from '../../src/data';
describe('comparison by issue', () => {
  it('never turns uncertainty, missing evidence or a skip into coincidence', () => {
    for (const answer of [null, undefined, 0] as const) expect(comparePositions(answer, 1)).toBe('unknown');
    expect(comparePositions(1, null)).toBe('unknown');
    expect(comparePositions(0, 0)).toBe('unknown');
  });
  it('uses direction without inventing party intensity; conditions produce partial agreement', () => {
    expect(comparePositions(2, 1)).toBe('coincidence');
    expect(comparePositions(-2, -1)).toBe('coincidence');
    expect(comparePositions(1, 1, 'conditional')).toBe('partial');
    expect(comparePositions(-1, 1, 'conditional')).toBe('difference');
  });
  it('keeps personal uncertainty in the profile and excludes skips', () => {
    const topic = questions.filter(q => q.category === 'employment');
    const profile = topicProfile(questions, { [topic[0].id]: 0, [topic[1].id]: null }, 'employment');
    expect(profile.answered).toBe(1); expect(profile.neutral).toBe(1); expect(profile.mean).toBe(0);
  });
  it('priorities reorder personal categories without changing source data', () => {
    const ids=categories.map(c=>c.id);
    expect(orderedCategories(categories,{ housing:3, economy:1 })[0].id).toBe('housing');
    expect(categories.map(c=>c.id)).toEqual(ids);
  });
  it('loads a validated real corpus with the requested thematic scope', () => {
    expect(dataErrors).toEqual([]);expect(questions.length).toBeGreaterThanOrEqual(40);expect(questions.length).toBeLessThanOrEqual(60);expect(categories).toHaveLength(31);
  });
});
