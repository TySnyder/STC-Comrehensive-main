import { describe, it, expect } from 'vitest';
import { parseCSVText, parseRows, parseDate, parseStatus } from './censusCsv';
import { xlsxCodeToFields, hasWeeklyCensusSheets } from './censusXlsx';
import { excelSerialToISO } from './contactSheet';
import { matchClientByName } from './matchClient';
import { Client } from '../../types';

const makeClient = (id: string, name: string): Client => ({
  id, name, program: 'DIOP', location: 'SF', admissionDate: '2026-01-01',
  status: 'Active', followUpNeeded: false, insurance: '', age: 30, gender: '',
  diagnoses: [], primaryTherapist: '', attendanceHistory: [],
});

describe('parseCSVText', () => {
  it('parses headers case-insensitively with underscores', () => {
    const rows = parseCSVText('Date,Program Type\n2026-06-01,DIOP');
    expect(rows).toEqual([{ date: '2026-06-01', program_type: 'DIOP' }]);
  });

  it('respects quoted commas', () => {
    const rows = parseCSVText('date,note\n2026-06-01,"a, b"');
    expect(rows[0].note).toBe('a, b');
  });

  it('returns [] for header-only input', () => {
    expect(parseCSVText('date,block')).toEqual([]);
  });
});

describe('parseRows', () => {
  it('maps flexible column names and flags invalid rows', () => {
    const parsed = parseRows([
      { day: '6/15/2026', service: 'eiop', attendance: 'p', late: 'y' },
      { day: 'garbage', service: 'EIOP', attendance: 'p' },
    ]);
    expect(parsed[0]).toMatchObject({
      date: '2026-06-15', block: 'EIOP', status: 'Present', tardy: true, valid: true,
    });
    expect(parsed[1].valid).toBe(false);
    expect(parsed[1].error).toContain('Bad date');
  });
});

describe('parseDate', () => {
  it('accepts ISO and M/D/YYYY', () => {
    expect(parseDate('2026-06-15')).toBe('2026-06-15');
    expect(parseDate('6/5/2026')).toBe('2026-06-05');
    expect(parseDate('June 5')).toBeNull();
  });
});

describe('parseStatus', () => {
  it('normalizes the accepted aliases', () => {
    expect(parseStatus('P')).toBe('Present');
    expect(parseStatus('abs')).toBe('Absent');
    expect(parseStatus('s')).toBe('Special');
    expect(parseStatus('maybe')).toBeNull();
  });
});

describe('xlsxCodeToFields', () => {
  it('maps attendance values to statuses', () => {
    expect(xlsxCodeToFields(1, '', new Set(), '2026-06-15').status).toBe('Present');
    expect(xlsxCodeToFields(0, '', new Set(), '2026-06-15').status).toBe('Absent');
    expect(xlsxCodeToFields('H', '', new Set(), '2026-06-15').status).toBe('Special');
    expect(xlsxCodeToFields(null, 'E', new Set(), '2026-06-15')).toMatchObject({
      status: 'Absent', excused: true,
    });
  });

  it('derives virtual mode and tardy from codes', () => {
    expect(xlsxCodeToFields(1, 'T', new Set(), '2026-06-15').virtualMode).toBe('residence');
    expect(xlsxCodeToFields(1, 'N', new Set(), '2026-06-15').virtualMode).toBe('away');
    expect(xlsxCodeToFields(1, '', new Set(['2026-06-15']), '2026-06-15').tardy).toBe(true);
  });
});

describe('hasWeeklyCensusSheets', () => {
  it('detects month-labelled weekly sheet names', () => {
    expect(hasWeeklyCensusSheets(['Jun 15 - Jun 19'])).toBe(true);
    expect(hasWeeklyCensusSheets(['Sheet1', 'Clients'])).toBe(false);
  });
});

describe('excelSerialToISO', () => {
  it('converts Excel serial dates', () => {
    expect(excelSerialToISO(45838)).toBe('2025-06-30');
  });
});

describe('matchClientByName', () => {
  const clients = [makeClient('c1', 'Jane Doe'), makeClient('c2', 'John Smith')];

  it('matches exact names case-insensitively', () => {
    expect(matchClientByName('jane doe', clients)).toBe('c1');
  });

  it('falls back to last-name match', () => {
    expect(matchClientByName('J. Smith', clients)).toBe('c2');
  });

  it('returns "" (skip) when nothing matches — never a wrong client', () => {
    expect(matchClientByName('Nobody Here', clients)).toBe('');
  });
});
