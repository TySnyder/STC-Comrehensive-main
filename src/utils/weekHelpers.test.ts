import { describe, it, expect } from 'vitest';
import { isoDate, getMonday, addDays, weekDaysFrom, ordinal, weekNavLabel, formatWeekRange } from './weekHelpers';

describe('isoDate', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(isoDate(new Date('2026-07-02T12:00:00Z'))).toBe('2026-07-02');
  });
});

describe('getMonday', () => {
  it('returns the same day for a Monday', () => {
    expect(getMonday('2026-06-29')).toBe('2026-06-29');
  });

  it('returns the previous Monday for a mid-week day', () => {
    expect(getMonday('2026-07-02')).toBe('2026-06-29'); // Thursday
  });

  it('returns the previous Monday for a Sunday', () => {
    expect(getMonday('2026-07-05')).toBe('2026-06-29');
  });
});

describe('addDays', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-06-30', 2)).toBe('2026-07-02');
  });

  it('subtracts days with negative n', () => {
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30');
  });
});

describe('weekDaysFrom', () => {
  it('returns Mon–Fri for the given Monday', () => {
    expect(weekDaysFrom('2026-06-29')).toEqual([
      '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03',
    ]);
  });
});

describe('ordinal', () => {
  it.each([
    [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'],
    [11, '11th'], [12, '12th'], [13, '13th'],
    [21, '21st'], [22, '22nd'], [23, '23rd'],
  ])('%i → %s', (n, expected) => {
    expect(ordinal(n)).toBe(expected);
  });
});

describe('weekNavLabel', () => {
  it('uses a single month name when the week stays in one month', () => {
    expect(weekNavLabel('2026-07-06')).toEqual({ month: 'July', startDay: '6th', endDay: '10th' });
  });

  it('abbreviates both months when the week spans two', () => {
    expect(weekNavLabel('2026-06-29')).toEqual({ month: 'Jun / Jul', startDay: '29th', endDay: '3rd' });
  });
});

describe('formatWeekRange', () => {
  it('formats a Mon–Fri range with year on the end date', () => {
    expect(formatWeekRange('2026-06-29')).toBe('Mon Jun 29 – Fri Jul 3, 2026');
  });
});
