import { describe, it, expect } from 'vitest';
import { themeWeekFor, ThemeAnchor } from './themeHelpers';
import { THEMES, THEME_CYCLE_LENGTH } from '../themes';

const anchor: ThemeAnchor = { mondayIso: '2026-06-29', themeWeek: 5 };

describe('themeWeekFor', () => {
  it('returns the anchored week for the anchor Monday', () => {
    expect(themeWeekFor('2026-06-29', anchor)).toBe(5);
  });

  it('advances one theme week per calendar week', () => {
    expect(themeWeekFor('2026-07-06', anchor)).toBe(6);
    expect(themeWeekFor('2026-07-13', anchor)).toBe(7);
  });

  it('wraps forward past week 17 back to week 1', () => {
    // 13 weeks after week 5 → week 18 → wraps to 1
    expect(themeWeekFor('2026-09-28', anchor)).toBe(1);
    // full cycle later, back to the anchored week
    expect(themeWeekFor('2026-06-29', { mondayIso: '2026-03-02', themeWeek: 5 })).toBe(5);
  });

  it('computes past weeks, wrapping backward below week 1 to 17', () => {
    expect(themeWeekFor('2026-06-22', anchor)).toBe(4);
    // 5 weeks before week 5 → week 0 → wraps to 17
    expect(themeWeekFor('2026-05-25', anchor)).toBe(17);
    expect(themeWeekFor('2026-05-18', anchor)).toBe(16);
  });

  it('handles anchors far in the past across many cycles', () => {
    const oldAnchor: ThemeAnchor = { mondayIso: '2024-01-01', themeWeek: 1 };
    // 130 weeks later: 130 % 17 = 11 → week 12
    expect(themeWeekFor('2026-06-29', oldAnchor)).toBe(12);
  });
});

describe('THEMES', () => {
  it('has exactly 17 themes with content', () => {
    expect(THEMES).toHaveLength(THEME_CYCLE_LENGTH);
    for (const t of THEMES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.techniques.length).toBeGreaterThan(0);
    }
  });

  it('follows the confirmed cycle order at key positions', () => {
    expect(THEMES[0].name).toBe('Personal Goals');
    expect(THEMES[1].name).toBe('Identity');
    expect(THEMES[4].name).toBe('Self Destruction & Escape');
    expect(THEMES[16].name).toBe('Meaning & Purpose');
  });
});
