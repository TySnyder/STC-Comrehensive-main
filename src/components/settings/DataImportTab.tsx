/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Client, CensusEntry } from '../../types';
import {
  ParsedRow,
  ParsedContactClient,
  DxEntry,
  parseCSVText,
  parseRows,
  parseXLSXWorkbook,
  hasWeeklyCensusSheets,
  isClientContactWorkbook,
  parseClientContactSheet,
  parseDxXlsx,
  matchClientByName,
} from '../../utils/importParsers';
import ContactImportStep from './ContactImportStep';

// ── Import wizard state ──────────────────────────────────────────────────────
// A single discriminated union replaces the old set of loose isXlsx/isDxFile/
// isContactFile/dxImportDone/contactImportDone booleans plus their per-kind
// payload records — one variable that can only hold data valid for its `kind`.

export type ImportStep = 'idle' | 'parsed' | 'importing' | 'done';

export type ImportFileState =
  | { kind: 'csv'; selectedClientId: string }
  | { kind: 'census-xlsx'; clientNames: string[]; mappings: Record<string, string>; duplicateBlocks: Record<string, boolean> }
  | { kind: 'dx-xlsx'; entries: DxEntry[]; mappings: Record<string, string> }
  | { kind: 'contact-xlsx'; clients: ParsedContactClient[]; selectedKeys: Set<number>; locationPicks: Record<number, 'SF' | 'ABQ'> }
  | null;

interface DataImportTabProps {
  clients: Client[];
  censusEntries: CensusEntry[];
  onImportCensus: (entries: CensusEntry[]) => void;
  onUpdateDiagnoses: (updates: { clientId: string; diagnoses: string[] }[]) => void;
  onImportClients: (clients: Client[]) => void;

  importStep: ImportStep;
  setImportStep: (step: ImportStep) => void;
  fileName: string;
  setFileName: (name: string) => void;
  parsedRows: ParsedRow[];
  setParsedRows: (rows: ParsedRow[]) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  importedCount: number;
  setImportedCount: (n: number) => void;
  importTotalCount: number;
  setImportTotalCount: (n: number) => void;
  fileState: ImportFileState;
  setFileState: React.Dispatch<React.SetStateAction<ImportFileState>>;
  pendingEntriesRef: React.MutableRefObject<CensusEntry[]>;
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function DataImportTab({
  clients,
  censusEntries,
  onImportCensus,
  onUpdateDiagnoses,
  onImportClients,
  importStep,
  setImportStep,
  fileName,
  setFileName,
  parsedRows,
  setParsedRows,
  isDragging,
  setIsDragging,
  importedCount,
  setImportedCount,
  importTotalCount,
  setImportTotalCount,
  fileState,
  setFileState,
  pendingEntriesRef,
  intervalRef,
  fileInputRef,
}: DataImportTabProps) {
  const validRows = parsedRows
    .filter(r => r.valid)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const invalidRows = parsedRows.filter(r => !r.valid);

  const isXlsx = fileState !== null && fileState.kind !== 'csv';
  const isDxFile = fileState?.kind === 'dx-xlsx';
  const isContactFile = fileState?.kind === 'contact-xlsx';

  const selectedClientId = fileState?.kind === 'csv' ? fileState.selectedClientId : '';
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const xlsxClientNames = fileState?.kind === 'census-xlsx' ? fileState.clientNames : [];
  const censusClientMappings = fileState?.kind === 'census-xlsx' ? fileState.mappings : {};
  const duplicateBlocks = fileState?.kind === 'census-xlsx' ? fileState.duplicateBlocks : {};

  const dxEntries = fileState?.kind === 'dx-xlsx' ? fileState.entries : [];
  const dxMappings = fileState?.kind === 'dx-xlsx' ? fileState.mappings : {};

  const contactClients = fileState?.kind === 'contact-xlsx' ? fileState.clients : [];
  const selectedContactKeys = fileState?.kind === 'contact-xlsx' ? fileState.selectedKeys : new Set<number>();
  const contactLocationPicks = fileState?.kind === 'contact-xlsx' ? fileState.locationPicks : {};

  // Anchor date: oldest existing entry for this client (or earliest import date)
  const existingDates = censusEntries
    .filter(e => e.clientId === selectedClientId)
    .map(e => e.date)
    .sort();
  const oldestExistingDate = existingDates[0] ?? validRows[0]?.date ?? null;
  const newestImportDate = validRows[validRows.length - 1]?.date ?? null;
  const currentImportDate = importedCount > 0 ? validRows[importedCount - 1]?.date : validRows[0]?.date;

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const xlsx = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    const reader = new FileReader();
    if (xlsx) {
      reader.onload = e => {
        const buffer = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: 'array', cellDates: false });

        // Detect client contact sheet
        if (isClientContactWorkbook(wb)) {
          const parsed = parseClientContactSheet(wb);
          const allKeys = new Set(parsed.map(c => c.key));
          const locPicks: Record<number, 'SF' | 'ABQ'> = {};
          for (const c of parsed) {
            if (c.autoLocation === null) locPicks[c.key] = 'SF';
          }
          setFileState({ kind: 'contact-xlsx', clients: parsed, selectedKeys: allKeys, locationPicks: locPicks });
          setImportStep('parsed');
          return;
        }

        if (!hasWeeklyCensusSheets(wb.SheetNames)) {
          const entries = parseDxXlsx(buffer);
          if (entries.length > 0) {
            const mappings: Record<string, string> = {};
            for (const entry of entries) {
              mappings[entry.xlsxName] = matchClientByName(entry.xlsxName, clients);
            }
            setFileState({ kind: 'dx-xlsx', entries, mappings });
            setImportStep('parsed');
            return;
          }
        }
        const { rows, clientNames } = parseXLSXWorkbook(buffer);
        setParsedRows(rows);
        const autoMappings: Record<string, string> = {};
        for (const name of clientNames) {
          autoMappings[name] = matchClientByName(name, clients);
        }
        setFileState({ kind: 'census-xlsx', clientNames, mappings: autoMappings, duplicateBlocks: {} });
        setImportStep('parsed');
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = e => {
        const text = e.target?.result as string;
        const rawRows = parseCSVText(text);
        const rows = parseRows(rawRows);
        setParsedRows(rows);
        setFileState({ kind: 'csv', selectedClientId: clients[0]?.id ?? '' });
        setImportStep('parsed');
      };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const toCensusEntry = (clientId: string, r: ParsedRow): CensusEntry => ({
    id: `import-${clientId}-${r.date}-${r.block}`,
    clientId,
    date: r.date!,
    block: r.block!,
    status: r.status,
    excused: r.excused,
    tardy: r.tardy,
    virtualMode: r.virtualMode,
    specialCode: r.specialCode,
    autoFilled: false,
  });

  const buildImportEntries = (): CensusEntry[] => {
    if (!isXlsx) {
      if (!selectedClientId) return [];
      return validRows.map(r => toCensusEntry(selectedClientId, r));
    }
    const entries: CensusEntry[] = [];
    for (const [xlsxName, clientId] of Object.entries(censusClientMappings)) {
      if (!clientId) continue;
      for (const r of parsedRows.filter(r => r.valid && r.xlsxClientName === xlsxName)) {
        const base = toCensusEntry(clientId, r);
        entries.push(base);
        if (duplicateBlocks[xlsxName] && (r.block === 'DIOP' || r.block === 'EIOP')) {
          entries.push({ ...base, id: `${base.id}-B` });
        }
      }
    }
    return entries;
  };

  // The progress bar is cosmetic pacing only — all entries are committed in a
  // single call when the animation completes.
  const animateProgressThen = (total: number, commit: () => void) => {
    const batchSize = Math.max(1, Math.ceil(total / 80));
    let count = 0;
    intervalRef.current = setInterval(() => {
      count = Math.min(count + batchSize, total);
      setImportedCount(count);
      if (count >= total) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        commit();
        setTimeout(() => setImportStep('done'), 400);
      }
    }, 25);
  };

  const handleImport = () => {
    const allEntries = buildImportEntries();
    if (!allEntries.length) return;
    pendingEntriesRef.current = allEntries;
    setImportTotalCount(allEntries.length);
    setImportedCount(0);
    setImportStep('importing');
    animateProgressThen(allEntries.length, () => onImportCensus(pendingEntriesRef.current));
  };

  const resetImport = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setImportStep('idle');
    setFileName('');
    setParsedRows([]);
    setImportedCount(0);
    setFileState(null);
    setImportTotalCount(0);
    pendingEntriesRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">

      {/* Container header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Import Client Census Records</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
              Upload a CSV spreadsheet to bulk-import attendance records for a single client. Records are merged into the Weekly Census and will appear across all relevant views.
            </p>
          </div>
          {importStep !== 'idle' && (
            <button onClick={resetImport} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-4">
              <RotateCcw className="w-3.5 h-3.5" /> Start over
            </button>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mt-4">
          {['Upload File', 'Select Client', 'Review & Import'].map((label, i) => {
            const stepNum = i + 1;
            const currentStep = importStep === 'idle' ? 1 : importStep === 'parsed' ? 2 : 3; // importing + done both = step 3
            const done = stepNum < currentStep;
            const active = stepNum === currentStep;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                  done ? 'text-emerald-600' : active ? 'text-indigo-600' : 'text-slate-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    done ? 'bg-emerald-100' : active ? 'bg-indigo-100' : 'bg-slate-100'
                  }`}>
                    {done ? '✓' : stepNum}
                  </span>
                  {label}
                </div>
                {i < 2 && <ChevronRight className="w-3 h-3 text-slate-200 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Upload zone */}
      {importStep === 'idle' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 mb-4">Step 1 — Select File</h4>

          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-500' : 'text-slate-300'}`} />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600">Drop a CSV file here or click to browse</p>
              <p className="text-[11px] text-slate-400 mt-1">Accepts .xlsx workbooks (STC census format) or .csv files</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={handleFileInput} />
          </div>

          {/* Column guide */}
          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Expected CSV columns (flexible naming)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
              {[
                ['date', 'session_date, day'],
                ['block', 'program, type, service'],
                ['status', 'attendance, present'],
                ['excused', 'excuse, exc'],
                ['tardy', 'late, tardiness'],
                ['virtual', 'virtual_mode, mode'],
                ['special_code', 'code, spec_code'],
              ].map(([col, alts]) => (
                <div key={col} className="flex items-baseline gap-1.5">
                  <code className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{col}</code>
                  <span className="text-[10px] text-slate-400">or {alts}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">
              Block values: <span className="font-mono font-bold text-slate-600">DIOP DOP EIOP EOP IND</span> &nbsp;·&nbsp;
              Status values: <span className="font-mono font-bold text-slate-600">Present Absent Special P A Y N</span> &nbsp;·&nbsp;
              Date formats: <span className="font-mono font-bold text-slate-600">YYYY-MM-DD MM/DD/YYYY</span>
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Parsed — diagnosis mapping (dx files only) */}
      {importStep === 'parsed' && isDxFile && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600">Step 2 — Map Diagnoses to Clients</h4>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-800 truncate">{fileName}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">{dxEntries.length} clients with diagnoses detected</p>
              </div>
            </div>

            {clients.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">No clients found in the system</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Please add clients in the <span className="font-bold">Clients</span> tab first, then return here to import diagnoses.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="px-4 py-2.5 text-left">Name in file</th>
                        <th className="px-4 py-2.5 text-left">Diagnoses</th>
                        <th className="px-4 py-2.5 text-left">System client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dxEntries.map((entry, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap align-top">{entry.xlsxName}</td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {entry.diagnoses.slice(0, 4).map((d, j) => (
                                <span key={j} className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{d}</span>
                              ))}
                              {entry.diagnoses.length > 4 && (
                                <span className="text-[10px] text-slate-400 self-center">+{entry.diagnoses.length - 4} more</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              value={dxMappings[entry.xlsxName] ?? ''}
                              onChange={e => setFileState(prev => prev?.kind === 'dx-xlsx' ? { ...prev, mappings: { ...prev.mappings, [entry.xlsxName]: e.target.value } } : prev)}
                              className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700 w-full"
                            >
                              <option value="">— skip —</option>
                              {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500">
                    Diagnoses will be <span className="font-bold text-slate-700">merged</span> — existing diagnoses are never removed
                  </p>
                  <button
                    onClick={() => {
                      const updates = dxEntries
                        .map(entry => ({ clientId: dxMappings[entry.xlsxName] ?? '', diagnoses: entry.diagnoses }))
                        .filter(u => u.clientId);
                      if (!updates.length) return;
                      onUpdateDiagnoses(updates);
                      setImportStep('done');
                    }}
                    disabled={!dxEntries.some(e => dxMappings[e.xlsxName])}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors"
                  >
                    Import Diagnoses
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Parsed — client contact sheet */}
      {importStep === 'parsed' && isContactFile && (
        <ContactImportStep
          fileName={fileName}
          contactClients={contactClients}
          selectedKeys={selectedContactKeys}
          onSelectedKeysChange={keys => setFileState(prev => prev?.kind === 'contact-xlsx' ? { ...prev, selectedKeys: keys } : prev)}
          locationPicks={contactLocationPicks}
          onLocationPicksChange={picks => setFileState(prev => prev?.kind === 'contact-xlsx' ? { ...prev, locationPicks: picks } : prev)}
          onImport={imported => {
            onImportClients(imported);
            setImportStep('done');
          }}
        />
      )}

      {/* STEP 2+3: Parsed — client picker + preview */}
      {importStep === 'parsed' && !isDxFile && !isContactFile && (
        <div className="space-y-4">

          {/* File summary + client selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600">Step 2 — Assign to Client</h4>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-800 truncate">{fileName}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  {isXlsx
                    ? `${xlsxClientNames.length} clients detected · ${parsedRows.length} total records`
                    : `${parsedRows.length} rows parsed · ${validRows.length} valid · ${invalidRows.length} skipped`}
                </p>
              </div>
            </div>

            {invalidRows.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">{invalidRows.length} row{invalidRows.length > 1 ? 's' : ''} will be skipped</p>
                  <ul className="mt-1 space-y-0.5">
                    {invalidRows.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-[10px] text-amber-700 font-mono">{r.error}</li>
                    ))}
                    {invalidRows.length > 3 && (
                      <li className="text-[10px] text-amber-600">…and {invalidRows.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {clients.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">No clients found in the system</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Census records must be linked to an existing client. Please add the client in the <span className="font-bold">Clients</span> tab first, then return here to complete the import.
                  </p>
                </div>
              </div>
            ) : isXlsx ? (
              /* xlsx: multi-client mapping table */
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Match each workbook name to a system client
                </p>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="px-4 py-2.5 text-left">Name in workbook</th>
                        <th className="px-4 py-2.5 text-left">Records</th>
                        <th className="px-4 py-2.5 text-left">System client</th>
                        <th className="px-4 py-2.5 text-left">Dup PM block</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {xlsxClientNames.map(xlsxName => {
                        const rows = parsedRows.filter(r => r.valid && r.xlsxClientName === xlsxName);
                        const hasDiopEiop = rows.some(r => r.block === 'DIOP' || r.block === 'EIOP');
                        const firstDate = rows[0]?.date ?? null;
                        const lastDate = rows[rows.length - 1]?.date ?? null;
                        const dupOn = !!duplicateBlocks[xlsxName];
                        return (
                          <tr key={xlsxName} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap align-middle">{xlsxName}</td>
                            <td className="px-4 py-3 align-middle">
                              <span className="font-mono font-bold text-indigo-600">{rows.length}</span>
                              {firstDate && <span className="text-[10px] text-slate-400 ml-1.5">{firstDate} – {lastDate}</span>}
                              {hasDiopEiop && dupOn && (
                                <span className="ml-1 text-[10px] text-emerald-600 font-semibold">→ {rows.length + rows.filter(r => r.block === 'DIOP' || r.block === 'EIOP').length} w/ dup</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <select
                                value={censusClientMappings[xlsxName] ?? ''}
                                onChange={e => setFileState(prev => prev?.kind === 'census-xlsx' ? { ...prev, mappings: { ...prev.mappings, [xlsxName]: e.target.value } } : prev)}
                                className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700 w-full min-w-[160px]"
                              >
                                <option value="">— skip —</option>
                                {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {hasDiopEiop ? (
                                <button
                                  onClick={() => setFileState(prev => prev?.kind === 'census-xlsx' ? { ...prev, duplicateBlocks: { ...prev.duplicateBlocks, [xlsxName]: !prev.duplicateBlocks[xlsxName] } } : prev)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer focus:outline-none ${
                                    dupOn ? 'bg-indigo-600' : 'bg-slate-200'
                                  }`}
                                  title="Duplicate AM block as PM block for DIOP/EIOP days"
                                >
                                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${dupOn ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400">
                  <span className="font-bold text-slate-600">Dup PM block</span> — for DIOP/EIOP clients, creates a second census entry per day to cover both AM and PM sessions
                </p>
              </div>
            ) : (
              /* CSV: single client dropdown */
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Which client do these records belong to?
                </label>
                <div className="flex items-center gap-3">
                  {selectedClient && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedClient.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <select
                    value={selectedClientId}
                    onChange={e => setFileState(prev => prev?.kind === 'csv' ? { ...prev, selectedClientId: e.target.value } : prev)}
                    className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.program}</option>
                    ))}
                  </select>
                </div>
                {selectedClient && (
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Admitted {selectedClient.admissionDate} · {selectedClient.insurance} · {selectedClient.program}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview table — only shown when a client is selected */}
          {clients.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {(() => {
              const xlsxEstimate = isXlsx ? xlsxClientNames.reduce((sum, name) => {
                if (!censusClientMappings[name]) return sum;
                const rows = parsedRows.filter(r => r.valid && r.xlsxClientName === name);
                const dupCount = duplicateBlocks[name] ? rows.filter(r => r.block === 'DIOP' || r.block === 'EIOP').length : 0;
                return sum + rows.length + dupCount;
              }, 0) : validRows.length;
              const mappedCount = isXlsx ? Object.values(censusClientMappings).filter(Boolean).length : (selectedClientId ? 1 : 0);
              const canImport = isXlsx ? mappedCount > 0 : (!!selectedClientId && validRows.length > 0);
              return (
                <>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                      Step 3 — Review Records
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{validRows.length} records · {xlsxEstimate} after duplicates</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          {isXlsx && <th className="px-4 py-2.5 text-left">Client</th>}
                          <th className="px-4 py-2.5 text-left">Date</th>
                          <th className="px-4 py-2.5 text-left">Block</th>
                          <th className="px-4 py-2.5 text-left">Status</th>
                          <th className="px-4 py-2.5 text-left">Excused</th>
                          <th className="px-4 py-2.5 text-left">Tardy</th>
                          <th className="px-4 py-2.5 text-left">Virtual</th>
                          <th className="px-4 py-2.5 text-left">Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {validRows.slice(0, 50).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            {isXlsx && (
                              <td className="px-4 py-2 text-slate-500 text-[10px] whitespace-nowrap">{r.xlsxClientName ?? '—'}</td>
                            )}
                            <td className="px-4 py-2 font-mono text-slate-600">{r.date}</td>
                            <td className="px-4 py-2">
                              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">{r.block}</span>
                            </td>
                            <td className="px-4 py-2">
                              {r.status ? (
                                <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  r.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                  r.status === 'Absent'  ? 'bg-red-50 text-red-700' :
                                                           'bg-amber-50 text-amber-700'
                                }`}>{r.status}</span>
                              ) : (
                                <span className="text-slate-300 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-slate-500">{r.excused ? 'Yes' : '—'}</td>
                            <td className="px-4 py-2 text-slate-500">{r.tardy ? 'Yes' : '—'}</td>
                            <td className="px-4 py-2 text-slate-500 capitalize">{r.virtualMode !== 'none' ? r.virtualMode : '—'}</td>
                            <td className="px-4 py-2">
                              {r.specialCode
                                ? <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{r.specialCode}</span>
                                : <span className="text-slate-300 text-[10px]">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validRows.length > 50 && (
                      <p className="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-100">
                        Showing first 50 of {validRows.length} records
                      </p>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-[11px] text-slate-500">
                      {isXlsx
                        ? <>{mappedCount} client{mappedCount !== 1 ? 's' : ''} mapped · <span className="font-bold text-slate-700">{xlsxEstimate}</span> records (incl. duplicates)</>
                        : <>Importing as <span className="font-bold text-slate-700">{selectedClient?.name ?? '—'}</span> · {validRows.length} records</>
                      }
                      {' '}· existing entries will be overwritten
                    </p>
                    <button
                      onClick={handleImport}
                      disabled={!canImport}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors"
                    >
                      Import {xlsxEstimate} Records
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
          )}
        </div>
      )}

      {/* STEP importing: Animated progress */}
      {importStep === 'importing' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">
              {isXlsx ? `Importing ${Object.values(censusClientMappings).filter(Boolean).length} clients…` : `Importing records for ${selectedClient?.name}…`}
            </h4>
              <p className="text-xs text-slate-400 mt-0.5">Merging into the Weekly Census. Do not navigate away.</p>
            </div>
          </div>

          {/* Date range context */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
            <span>{oldestExistingDate ?? '—'}</span>
            <span className="text-indigo-600">{currentImportDate ?? '—'}</span>
            <span>{newestImportDate ?? '—'}</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-75"
                style={{ width: `${importTotalCount > 0 ? (importedCount / importTotalCount) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{importedCount} of {importTotalCount} records</span>
              <span>{importTotalCount > 0 ? Math.round((importedCount / importTotalCount) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP done: Success */}
      {importStep === 'done' && (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900">Import Successful</h4>
            {isContactFile ? (
              <>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-bold text-slate-700">{selectedContactKeys.size} client{selectedContactKeys.size !== 1 ? 's' : ''}</span> added to the Client Directory.
                </p>
                <p className="text-xs text-slate-400 mt-1">Contact info, admit dates, and therapist assignments are now on each profile.</p>
              </>
            ) : isDxFile ? (
              <>
                <p className="text-sm text-slate-500 mt-1">
                  Diagnoses merged for <span className="font-bold text-slate-700">{dxEntries.filter(e => dxMappings[e.xlsxName]).length} client{dxEntries.filter(e => dxMappings[e.xlsxName]).length !== 1 ? 's' : ''}</span>.
                </p>
                <p className="text-xs text-slate-400 mt-1">Client profiles now reflect the updated diagnoses.</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-bold text-slate-700">{importTotalCount}</span> census records imported
                  {isXlsx
                    ? <> across <span className="font-bold text-slate-700">{Object.values(censusClientMappings).filter(Boolean).length} clients</span></>
                    : <> for <span className="font-bold text-slate-700">{selectedClient?.name}</span></>
                  }.
                </p>
                <p className="text-xs text-slate-400 mt-1">The Weekly Census view now reflects the updated records.</p>
              </>
            )}
          </div>
          <button
            onClick={resetImport}
            className="mt-2 flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Import another file
          </button>
        </div>
      )}

    </div>
  );
}
