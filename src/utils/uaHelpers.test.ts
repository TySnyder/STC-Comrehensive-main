import { describe, it, expect } from 'vitest';
import { generateWeekAssignments, rerollDate, effectiveUaDate, isAbsentOn } from './uaHelpers';
import { Client, CensusEntry, UaAssignment } from '../types';

const WEEK = '2026-06-29'; // Monday
const DAYS = ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03'];

function client(id: string, uaFrequency?: Client['uaFrequency']): Client {
  return {
    id, name: id, program: 'DIOP', location: 'ABQ',
    admissionDate: '2026-06-01',
    status: 'Active', followUpNeeded: false, insurance: 'Aetna',
    age: 30, gender: 'M', diagnoses: [], primaryTherapist: 'T',
    uaFrequency, attendanceHistory: [],
  };
}

function assignment(clientId: string, assignedDate: string, over: Partial<UaAssignment> = {}): UaAssignment {
  return {
    id: `ua-${clientId}-${WEEK}-0`, clientId, weekStart: WEEK,
    assignedDate, status: 'pending', billed: false, ...over,
  };
}

function census(clientId: string, date: string, status: 'Present' | 'Absent', block: CensusEntry['block'] = 'DIOP'): CensusEntry {
  return {
    id: `${clientId}-${date}-${block}`, clientId, date, block,
    status, excused: false, tardy: false, virtualMode: 'none', autoFilled: false,
  };
}

describe('generateWeekAssignments', () => {
  it('creates one assignment for weekly, two distinct days for twice-weekly', () => {
    const out = generateWeekAssignments([client('a', 'weekly'), client('b', 'twice-weekly')], WEEK, [], () => 0.4);
    const a = out.filter(x => x.clientId === 'a');
    const b = out.filter(x => x.clientId === 'b');
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(2);
    expect(b[0].assignedDate).not.toBe(b[1].assignedDate);
    out.forEach(x => expect(DAYS).toContain(x.assignedDate));
  });

  it('skips none, external, and unset frequencies', () => {
    const out = generateWeekAssignments(
      [client('a', 'none'), client('b', 'external'), client('c')], WEEK, []
    );
    expect(out).toHaveLength(0);
  });

  it('skips clients who already have an assignment this week', () => {
    const existing = [assignment('a', DAYS[2])];
    const out = generateWeekAssignments([client('a', 'weekly')], WEEK, existing);
    expect(out).toHaveLength(0);
  });

  it('skips monthly clients already assigned in the same calendar month', () => {
    const existing = [assignment('a', '2026-06-10', { id: 'ua-a-2026-06-08-0', weekStart: '2026-06-08', status: 'completed' })];
    const out = generateWeekAssignments([client('a', 'monthly')], WEEK, existing);
    expect(out).toHaveLength(0);
  });

  it('assigns monthly clients when the month is clear', () => {
    const existing = [assignment('a', '2026-05-12', { id: 'x', weekStart: '2026-05-11', status: 'completed' })];
    const out = generateWeekAssignments([client('a', 'monthly')], WEEK, existing);
    expect(out).toHaveLength(1);
  });
});

describe('rerollDate', () => {
  it('never returns the current day or a sibling day', () => {
    const target = assignment('a', DAYS[0]);
    const sibling = assignment('a', DAYS[1], { id: 'ua-a-x-1' });
    for (let i = 0; i < 20; i++) {
      const d = rerollDate(target, [target, sibling], Math.random);
      expect([DAYS[2], DAYS[3], DAYS[4]]).toContain(d);
    }
  });
});

describe('isAbsentOn', () => {
  it('is false with no census data (unknown ≠ absent)', () => {
    expect(isAbsentOn([], 'a', DAYS[0])).toBe(false);
  });

  it('is false if any block that day is Present', () => {
    const entries = [census('a', DAYS[0], 'Absent', 'DIOP'), census('a', DAYS[0], 'Present', 'DOP')];
    expect(isAbsentOn(entries, 'a', DAYS[0])).toBe(false);
  });

  it('is true when all recorded blocks are Absent', () => {
    const entries = [census('a', DAYS[0], 'Absent', 'DIOP'), census('a', DAYS[0], 'Absent', 'DOP')];
    expect(isAbsentOn(entries, 'a', DAYS[0])).toBe(true);
  });
});

describe('effectiveUaDate', () => {
  it('stays on the assigned day when present', () => {
    const entries = [census('a', DAYS[1], 'Present')];
    expect(effectiveUaDate(assignment('a', DAYS[1]), entries)).toEqual({ date: DAYS[1] });
  });

  it('rolls to the next weekday when absent', () => {
    const entries = [census('a', DAYS[1], 'Absent')];
    expect(effectiveUaDate(assignment('a', DAYS[1]), entries))
      .toEqual({ date: DAYS[2], rolledFrom: DAYS[1] });
  });

  it('rolls across consecutive absences', () => {
    const entries = [census('a', DAYS[1], 'Absent'), census('a', DAYS[2], 'Absent')];
    expect(effectiveUaDate(assignment('a', DAYS[1]), entries))
      .toEqual({ date: DAYS[3], rolledFrom: DAYS[1] });
  });

  it('rolls over a weekend: Friday absence lands on Monday', () => {
    const entries = [census('a', DAYS[4], 'Absent')];
    expect(effectiveUaDate(assignment('a', DAYS[4]), entries))
      .toEqual({ date: '2026-07-06', rolledFrom: DAYS[4] });
  });

  it('does not roll completed assignments', () => {
    const entries = [census('a', DAYS[1], 'Absent')];
    const done = assignment('a', DAYS[1], { status: 'completed', completedDate: DAYS[1] });
    expect(effectiveUaDate(done, entries)).toEqual({ date: DAYS[1] });
  });
});
