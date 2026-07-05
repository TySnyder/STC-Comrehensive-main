import * as XLSX from 'xlsx';
import { ParsedContactClient } from './types';

const CONTACT_PROGRAM_HEADERS: Record<string, string> = {
  'diop level of care': 'DIOP',
  'dop level of care': 'DOP',
  'eiop level of care': 'EIOP',
  'eop level of care': 'EOP',
  'ind level of care': 'IND',
};

// Contact sheet column layout (0-based)
const ADMIT_DATE_COL = 1;
const CELL_PHONE_COL = 2;
const HOME_PHONE_COL = 3;
const EMAIL_COL = 4;
const HOME_ADDRESS_COL = 7;
const THERAPIST_COL = 9;

export function excelSerialToISO(serial: number): string {
  const d = new Date((serial - 25569) * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function isClientContactWorkbook(wb: ReturnType<typeof XLSX.read>): boolean {
  if (wb.SheetNames.length < 3) return false;
  const ws = wb.Sheets[wb.SheetNames[0]];
  const grid: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][];
  const r0 = grid[0] ?? [];
  const r1 = grid[1] ?? [];
  return (
    String(r0[1] ?? '').trim().toLowerCase() === 'admit date' ||
    /level of care/i.test(String(r1[0] ?? ''))
  );
}

export function parseClientContactSheet(wb: ReturnType<typeof XLSX.read>): ParsedContactClient[] {
  const sheetLocations: ('SF' | 'ABQ' | null)[] = [null, 'ABQ', 'SF'];
  const results: ParsedContactClient[] = [];
  let keyCounter = 0;

  for (let si = 0; si < Math.min(3, wb.SheetNames.length); si++) {
    const ws = wb.Sheets[wb.SheetNames[si]];
    const grid: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][];
    const autoLocation = sheetLocations[si];
    let currentProgram = '';

    for (const row of grid) {
      const nameRaw = row[0];
      if (!nameRaw || typeof nameRaw !== 'string') continue;
      const name = nameRaw.trim();
      if (!name) continue;

      const lower = name.toLowerCase();
      if (CONTACT_PROGRAM_HEADERS[lower]) {
        currentProgram = CONTACT_PROGRAM_HEADERS[lower];
        continue;
      }
      if (lower === 'name') continue;

      const admitSerial = row[ADMIT_DATE_COL];
      const admitDate = typeof admitSerial === 'number' ? excelSerialToISO(admitSerial) : '';

      const clean = (v: unknown) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/^\t+/, '').trim();

      results.push({
        key: keyCounter++,
        name,
        program: currentProgram,
        admitDate,
        cellPhone: clean(row[CELL_PHONE_COL]),
        homePhone: clean(row[HOME_PHONE_COL]),
        email: clean(row[EMAIL_COL]),
        homeAddress: clean(row[HOME_ADDRESS_COL]),
        therapist: clean(row[THERAPIST_COL]),
        autoLocation,
      });
    }
  }

  return results;
}
