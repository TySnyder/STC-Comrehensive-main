import { describe, it, expect } from 'vitest';
import {
  predictDischargeDate,
  estDischargeDate,
  clampEnrollmentDays,
  DEFAULT_ENROLLMENT_DAYS,
  MIN_ENROLLMENT_DAYS,
} from './dcDateHelpers';
import { Client } from '../types';

describe('clampEnrollmentDays', () => {
  it('defaults to 85 when unset', () => {
    expect(clampEnrollmentDays(undefined)).toBe(DEFAULT_ENROLLMENT_DAYS);
  });
  it('floors at 30', () => {
    expect(clampEnrollmentDays(10)).toBe(MIN_ENROLLMENT_DAYS);
    expect(clampEnrollmentDays(30)).toBe(30);
    expect(clampEnrollmentDays(60)).toBe(60);
  });
});

describe('predictDischargeDate', () => {
  // 2026-06-29 is a Monday
  it('counts the admit weekday as treatment day 1', () => {
    expect(predictDischargeDate('2026-06-29', 1)).toBe('2026-06-29');
    expect(predictDischargeDate('2026-06-29', 5)).toBe('2026-07-03');
  });

  it('skips weekends', () => {
    // day 6 from Monday = next Monday
    expect(predictDischargeDate('2026-06-29', 6)).toBe('2026-07-06');
  });

  it('starts a weekend admit on the following Monday', () => {
    // 2026-06-27 is a Saturday
    expect(predictDischargeDate('2026-06-27', 1)).toBe('2026-06-29');
  });

  it('85 weekdays from a Monday = Friday 17 weeks out', () => {
    // 17 full Mon–Fri weeks: ends Friday of week 17
    expect(predictDischargeDate('2026-06-29', 85)).toBe('2026-10-23');
  });

  it('honors days/week enrolled (first N weekdays of each week)', () => {
    // 3 days/week from Monday: days are Mon/Tue/Wed; day 4 = next Monday
    expect(predictDischargeDate('2026-06-29', 3, 3)).toBe('2026-07-01');
    expect(predictDischargeDate('2026-06-29', 4, 3)).toBe('2026-07-06');
  });

  it('mid-week admit with partial-week schedule counts remaining allowed days', () => {
    // admit Wednesday 2026-07-01 with 3 days/week: Wed counts (0 counted this
    // week so far), then Thu; Fri exceeds 3/wk only if Mon/Tue were counted —
    // they weren't, so Wed/Thu/Fri all count.
    expect(predictDischargeDate('2026-07-01', 3, 3)).toBe('2026-07-03');
    expect(predictDischargeDate('2026-07-01', 4, 3)).toBe('2026-07-06');
  });
});

describe('estDischargeDate', () => {
  const base: Client = {
    id: 'c1', name: 'Test', program: 'DIOP', location: 'SF',
    admissionDate: '2026-06-29', status: 'Active',
    followUpNeeded: false, insurance: 'X', age: 30, gender: 'Other',
    diagnoses: [], primaryTherapist: 'T', attendanceHistory: [],
  };

  it('uses defaults: 85 days, 5 days/week, from admissionDate', () => {
    expect(estDischargeDate(base)).toBe('2026-10-23');
  });

  it('uses the current episode admit date for readmissions', () => {
    const c: Client = {
      ...base,
      episodes: [
        { id: 'e1', episodeNumber: 1, admitDate: '2026-01-05', stcDcDate: '2026-03-01' },
        { id: 'e2', episodeNumber: 2, admitDate: '2026-06-29' },
      ],
    };
    expect(estDischargeDate(c)).toBe('2026-10-23');
  });

  it('honors enrollmentDays and scheduleDaysPerWeek overrides', () => {
    expect(estDischargeDate({ ...base, enrollmentDays: 5 })).toBe(
      predictDischargeDate('2026-06-29', 30) // clamped up to the 30 min
    );
    expect(estDischargeDate({ ...base, enrollmentDays: 30, scheduleDaysPerWeek: 3 }))
      .toBe(predictDischargeDate('2026-06-29', 30, 3));
  });
});
