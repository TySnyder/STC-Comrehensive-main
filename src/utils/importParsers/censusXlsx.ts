import * as XLSX from 'xlsx';
import { ProgramBlock, VirtualMode, SpecialCode } from '../../types';
import { ParsedRow, ParsedStatus } from './types';

// STC weekly census sheet layout (0-based column/row indexes)
const NAME_COL = 2;
const BLOCK_COL = 21;
const NOTES_COL = 45;
const WEEK_LABEL_ROW = 1;
const WEEK_LABEL_COL = 47;
const DAY_NUMBER_ROW = 7;
const SHEET_MIN_WIDTH = 55;
export const XLSX_DAY_COLS = [7, 9, 11, 13, 15, 17, 19];

const MONTH_ABBREVIATIONS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const VALID_BLOCKS: ProgramBlock[] = ['DIOP','DOP','EIOP','EOP','IND'];

function isWeeklyCensusSheetName(name: string): boolean {
  const l = name.toLowerCase();
  return name.includes(' - ') && MONTH_ABBREVIATIONS.some(m => l.includes(m));
}

/** True when the workbook contains STC weekly census sheets (e.g. "Jun 15 - Jun 19"). */
export function hasWeeklyCensusSheets(sheetNames: string[]): boolean {
  return sheetNames.some(isWeeklyCensusSheetName);
}

export function xlsxCodeToFields(attVal: unknown, codeStr: string, tardyDates: Set<string>, isoDate: string) {
  const att = String(attVal ?? '').trim().toUpperCase();
  const code = codeStr.toUpperCase();

  let status: ParsedStatus | null = null;
  if (attVal === 1 || (typeof attVal === 'number' && attVal > 0)) status = 'Present';
  else if (attVal === 0) status = 'Absent';
  else if (att === 'H' || att === 'C') status = 'Special';
  else if (attVal == null && (code.includes('E') || code.includes('U'))) status = 'Absent';

  const excused = status === 'Absent' && code.includes('E');
  const tardy = tardyDates.has(isoDate);

  let virtualMode: VirtualMode = 'none';
  if (code.includes('T')) virtualMode = 'residence';
  else if (code.includes('R')) virtualMode = 'residence';
  if (code.includes('N')) virtualMode = 'away';

  let specialCode: SpecialCode | undefined;
  for (const sc of ['L','D','H','C'] as SpecialCode[]) {
    if (att === sc || code.split(/[/,-]/).includes(sc)) { specialCode = sc; break; }
  }

  return { status, excused, tardy, virtualMode, specialCode };
}

export function parseXLSXWorkbook(buffer: ArrayBuffer): { rows: ParsedRow[]; clientNames: string[] } {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });

  const weeklySheets = wb.SheetNames.filter(isWeeklyCensusSheetName);

  const allRows: ParsedRow[] = [];
  const clientNameSet = new Set<string>();

  for (const sheetName of weeklySheets) {
    const ws = wb.Sheets[sheetName];
    const grid: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][];
    const rows = grid.map(r => {
      const a = [...r];
      while (a.length < SHEET_MIN_WIDTH) a.push(null);
      return a;
    });

    // Week date string like "MM/DD/YY - MM/DD/YY"
    const weekStr = rows[WEEK_LABEL_ROW]?.[WEEK_LABEL_COL];
    if (!weekStr || typeof weekStr !== 'string') continue;
    const wParts = weekStr.trim().split(' - ');
    if (wParts.length !== 2) continue;
    const [wm, wd, wy] = wParts[0].trim().split('/').map(Number);
    if (!wm || !wd || !wy) continue;
    const startDate = new Date(2000 + wy, wm - 1, wd);

    // Day number → ISO date map
    const dayRow = rows[DAY_NUMBER_ROW] ?? [];
    const dayMap: Record<number, string> = {};
    for (const col of XLSX_DAY_COLS) {
      const raw = dayRow[col];
      if (raw == null) continue;
      const n = Number(raw);
      if (isNaN(n)) continue;
      let dt = new Date(startDate.getFullYear(), startDate.getMonth(), n);
      if (dt.getTime() < startDate.getTime() - 86400000) {
        dt = new Date(startDate.getFullYear(), startDate.getMonth() + 1, n);
      }
      dayMap[col] = dt.toISOString().split('T')[0];
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameCell = row[NAME_COL];
      if (!nameCell || typeof nameCell !== 'string') continue;
      // Skip abbreviation sub-rows like "DaSu: 1"
      if (/:\s*\d/.test(nameCell)) continue;

      const blockCell = row[BLOCK_COL];
      if (!blockCell || typeof blockCell !== 'string') continue;
      const block = blockCell.trim().toUpperCase() as ProgramBlock;
      if (!VALID_BLOCKS.includes(block)) continue;

      // Strip schedule suffix ("M-F", "M-W-F", "T-TH", etc.)
      const clientName = nameCell.trim().replace(/\s+[MTWTHFSU][-/MTWTHFSU]*\s*$/i, '').trim();
      clientNameSet.add(clientName);

      const codeRow = rows[i + 1] ?? [];
      const notesCell = row[NOTES_COL];

      // Parse tardy dates from notes e.g. "6/15/26-Tardy, 6/17/26-Tardy"
      const tardyDates = new Set<string>();
      if (notesCell && typeof notesCell === 'string') {
        for (const segment of notesCell.split(/[,;]/)) {
          if (!/tardy/i.test(segment)) continue;
          const m = segment.match(/(\d{1,2})\/(\d{2})\/(\d{2})/);
          if (m) tardyDates.add(`20${m[3]}-${m[1].padStart(2,'0')}-${m[2]}`);
        }
      }

      for (const col of XLSX_DAY_COLS) {
        const d = dayMap[col];
        if (!d) continue;
        const attVal = row[col];
        const codeVal = codeRow[col];
        const codeStr = codeVal != null ? String(codeVal).trim() : '';
        if (attVal == null && !codeStr) continue;

        const { status, excused, tardy, virtualMode, specialCode } =
          xlsxCodeToFields(attVal, codeStr, tardyDates, d);

        allRows.push({
          raw: { date: d, block, status: status ?? '' },
          date: d, block, status, excused, tardy, virtualMode, specialCode,
          valid: true,
          xlsxClientName: clientName,
        });
      }

      // IND sub-row sits 2 rows below the main row
      if (i + 2 < rows.length) {
        const indRow = rows[i + 2];
        const indBlockCell = indRow[BLOCK_COL];
        if (typeof indBlockCell === 'string' && indBlockCell.trim().toUpperCase() === 'IND') {
          const indCodeRow = rows[i + 3] ?? [];
          for (const col of XLSX_DAY_COLS) {
            const d = dayMap[col];
            if (!d) continue;
            const attVal = indRow[col];
            const codeVal = indCodeRow[col];
            const codeStr = codeVal != null ? String(codeVal).trim() : '';
            if (attVal == null && !codeStr) continue;
            const { status, virtualMode } = xlsxCodeToFields(attVal, codeStr, new Set(), d);
            allRows.push({
              raw: { date: d, block: 'IND', status: status ?? '' },
              date: d, block: 'IND', status, excused: false, tardy: false,
              virtualMode, specialCode: undefined, valid: true,
              xlsxClientName: clientName,
            });
          }
        }
      }
    }
  }

  return { rows: allRows, clientNames: Array.from(clientNameSet).sort() };
}
