import * as XLSX from 'xlsx';
import { DxEntry } from './types';

const DX_PROGRAM_LABELS = new Set(['DIOP','DOP','EIOP','EOP','IND','EIOP/EOP','DIOP/DOP','MASTER']);

// Diagnosis sheet layout: header "Dx" at row 14 col 9; data starts at row 15
const NAME_COL = 1;
const DX_COL = 9;
const HEADER_ROW = 14;

export function parseDxXlsx(buffer: ArrayBuffer): DxEntry[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const results: DxEntry[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const grid: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][];
    if (String(grid[HEADER_ROW]?.[DX_COL] ?? '').trim() !== 'Dx') continue;

    for (let i = HEADER_ROW + 1; i < grid.length; i++) {
      const row = grid[i];
      const nameRaw = row?.[NAME_COL];
      const dxRaw = row?.[DX_COL];
      if (!nameRaw || typeof nameRaw !== 'string') continue;
      const name = nameRaw.trim();
      if (!name || DX_PROGRAM_LABELS.has(name.toUpperCase())) continue;
      const dxStr = dxRaw != null ? String(dxRaw).trim() : '';
      if (!dxStr) continue;
      const diagnoses = dxStr.split(',').map(d => d.trim()).filter(Boolean);
      if (!diagnoses.length) continue;
      const existing = results.find(r => r.xlsxName === name);
      if (existing) {
        existing.diagnoses = Array.from(new Set([...existing.diagnoses, ...diagnoses]));
      } else {
        results.push({ xlsxName: name, diagnoses });
      }
    }
  }
  return results;
}
