import { describe, expect, it } from 'vitest';
import { comparePositions, topicProfile, orderedCategories, partyCoincidence } from '../../src/utils/comparison';
import { questions, categories, dataErrors } from '../../src/data';
import type { PartyPosition, Question } from '../../src/types';
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

describe('party percentages', () => {
  const base = questions.find(question => question.positions.pp.position !== null)!;
  const fixture = (id: string, changes: Partial<PartyPosition> = {}): Question => ({
    ...base, id, positions: { pp: { ...base.positions.pp, position: 1, stance: 'support', certainty: 'high', conflict: false, ...changes } },
  });
  it('calculates a known mixed result without inventing answer intensity', () => {
    const result = partyCoincidence([fixture('same'), fixture('partial', { stance: 'conditional' }), fixture('opposite')], { same: 2, partial: 1, opposite: -2 }, 'pp');
    expect(result).toEqual({ percentage: 50, compared: 3, available: 3, eligibleAnswers: 3, coincidence: 1, partial: 1, difference: 1 });
  });
  it('does not penalize a party for missing evidence or a neutral/skipped user answer', () => {
    const result = partyCoincidence([fixture('same'), fixture('missing', { position: null }), fixture('neutral'), fixture('skipped'), fixture('pending')], { same: 1, missing: -2, neutral: 0, skipped: null }, 'pp');
    expect(result.percentage).toBe(100); expect(result.compared).toBe(1); expect(result.available).toBe(4); expect(result.eligibleAnswers).toBe(2);
  });
  it('distinguishes genuine zero agreement from absence of a calculable result', () => {
    expect(partyCoincidence([fixture('opposite')], { opposite: -1 }, 'pp').percentage).toBe(0);
    expect(partyCoincidence([fixture('neutral')], { neutral: 0 }, 'pp').percentage).toBeNull();
    expect(partyCoincidence([fixture('same')], { same: 1 }, 'absent-party').percentage).toBeNull();
  });
  it('excludes contradictory, low-certainty and merely related evidence', () => {
    const items = [fixture('conflict', { conflict: true }), fixture('uncertain', { certainty: null }), fixture('related', { stance: 'related' }), fixture('party-neutral', { position: 0 })];
    const result = partyCoincidence(items, Object.fromEntries(items.map(question => [question.id, 1])), 'pp');
    expect(result.compared).toBe(0); expect(result.available).toBe(0); expect(result.percentage).toBeNull();
  });
  it('rounds a fractional result and retains its documented base', () => {
    const result = partyCoincidence([fixture('yes'), fixture('no-a'), fixture('no-b')], { yes: 1, 'no-a': -1, 'no-b': -2 }, 'pp');
    expect(result.percentage).toBe(33); expect(result.compared).toBe(3);
  });
});
