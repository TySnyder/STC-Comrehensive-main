import { ProgramBlock, VirtualMode, SpecialCode } from '../../types';
import { ParsedRow, ParsedStatus } from './types';

export function parseCSVText(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    vals.push(cur.trim());
    const row: Record<string, string> = {};
    rawHeaders.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

export function pickCol(row: Record<string, string>, ...candidates: string[]): string {
  for (const c of candidates) if (row[c] !== undefined) return row[c];
  return '';
}

export function parseDate(raw: string): string | null {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

export function parseBlock(raw: string): ProgramBlock | null {
  const u = raw.trim().toUpperCase();
  const valid: ProgramBlock[] = ['DIOP', 'DOP', 'EIOP', 'EOP', 'IND'];
  return valid.includes(u as ProgramBlock) ? (u as ProgramBlock) : null;
}

export function parseStatus(raw: string): ParsedStatus | null {
  const l = raw.trim().toLowerCase();
  if (['present', 'p', '1', 'yes', 'y', 'attended', 'att'].includes(l)) return 'Present';
  if (['absent', 'a', '0', 'no', 'n', 'abs'].includes(l)) return 'Absent';
  if (['special', 's'].includes(l)) return 'Special';
  return null;
}

export function parseBool(raw: string): boolean {
  return ['true', 'yes', 'y', '1', 'x'].includes(raw.trim().toLowerCase());
}

export function parseVirtual(raw: string): VirtualMode {
  const l = raw.trim().toLowerCase();
  if (['residence', 'res', 'home', 'remote'].includes(l)) return 'residence';
  if (['away', 'offsite', 'off-site', 'travel'].includes(l)) return 'away';
  return 'none';
}

export function parseSpecialCode(raw: string): SpecialCode | undefined {
  const u = raw.trim().toUpperCase();
  if (['L', 'D', 'H', 'C'].includes(u)) return u as SpecialCode;
  return undefined;
}

export function parseRows(rows: Record<string, string>[]): ParsedRow[] {
  return rows.map(row => {
    const dateRaw = pickCol(row, 'date', 'day', 'session_date', 'session_day');
    const blockRaw = pickCol(row, 'block', 'program', 'program_type', 'type', 'program_block', 'service');
    const statusRaw = pickCol(row, 'status', 'attendance', 'attendance_status', 'present');
    const excusedRaw = pickCol(row, 'excused', 'excuse', 'exc');
    const tardyRaw = pickCol(row, 'tardy', 'late', 'tardiness');
    const virtualRaw = pickCol(row, 'virtual', 'virtual_mode', 'virtualmode', 'mode', 'location_mode');
    const codeRaw = pickCol(row, 'special_code', 'specialcode', 'code', 'special', 'spec_code');

    const date = parseDate(dateRaw);
    const block = parseBlock(blockRaw);
    const status = parseStatus(statusRaw);

    let error: string | undefined;
    if (!date) error = `Bad date: "${dateRaw}"`;
    else if (!block) error = `Bad block: "${blockRaw}"`;

    return {
      raw: row,
      date,
      block,
      status,
      excused: parseBool(excusedRaw),
      tardy: parseBool(tardyRaw),
      virtualMode: parseVirtual(virtualRaw),
      specialCode: parseSpecialCode(codeRaw),
      valid: !!date && !!block,
      error,
    };
  });
}
