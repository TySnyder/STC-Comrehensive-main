/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileSpreadsheet, Upload } from 'lucide-react';
import { Client } from '../../types';
import { ParsedContactClient } from '../../utils/importParsers';

interface ContactImportStepProps {
  fileName: string;
  contactClients: ParsedContactClient[];
  selectedKeys: Set<number>;
  onSelectedKeysChange: (keys: Set<number>) => void;
  locationPicks: Record<number, 'SF' | 'ABQ'>;
  onLocationPicksChange: (picks: Record<number, 'SF' | 'ABQ'>) => void;
  onImport: (clients: Client[]) => void;
}

const PROGRAM_COLORS: Record<string, string> = {
  DIOP: 'bg-indigo-50 text-indigo-700',
  DOP:  'bg-violet-50 text-violet-700',
  EIOP: 'bg-emerald-50 text-emerald-700',
  EOP:  'bg-teal-50 text-teal-700',
  IND:  'bg-amber-50 text-amber-700',
};

function toClient(c: ParsedContactClient, location: 'SF' | 'ABQ'): Client {
  return {
    id: `client-import-${c.key}-${Date.now()}`,
    name: c.name,
    program: c.program || 'DIOP',
    location,
    admissionDate: c.admitDate,
    status: 'Active',
    followUpNeeded: false,
    insurance: '',
    age: 0,
    gender: '',
    diagnoses: [],
    primaryTherapist: c.therapist,
    attendanceHistory: [],
    cellPhone: c.cellPhone || undefined,
    homePhone: c.homePhone && c.homePhone !== 'N/A' ? c.homePhone : undefined,
    email: c.email || undefined,
    homeAddress: c.homeAddress || undefined,
  };
}

export default function ContactImportStep({
  fileName,
  contactClients,
  selectedKeys,
  onSelectedKeysChange,
  locationPicks,
  onLocationPicksChange,
  onImport,
}: ContactImportStepProps) {
  const allSelected = contactClients.length > 0 && selectedKeys.size === contactClients.length;

  const toggleAll = () => {
    onSelectedKeysChange(allSelected ? new Set() : new Set(contactClients.map(c => c.key)));
  };

  const toggleOne = (key: number) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key); else next.add(key);
    onSelectedKeysChange(next);
  };

  const setLoc = (key: number, loc: 'SF' | 'ABQ') =>
    onLocationPicksChange({ ...locationPicks, [key]: loc });

  const handleImport = () => {
    onImport(
      contactClients
        .filter(c => selectedKeys.has(c.key))
        .map(c => toClient(c, c.autoLocation ?? locationPicks[c.key] ?? 'SF'))
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600">Step 2 — Review &amp; Select Clients</h4>

        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-800 truncate">{fileName}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {contactClients.length} clients detected across 3 tabs
            </p>
          </div>
        </div>

        {/* Select all row */}
        <label className="flex items-center gap-2 cursor-pointer select-none group w-fit">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">
            {allSelected ? 'Deselect All' : 'Select All'} ({contactClients.length})
          </span>
        </label>

        {/* Client table */}
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-3 py-2.5 w-8"></th>
                <th className="px-3 py-2.5 text-left">Name</th>
                <th className="px-3 py-2.5 text-left">Program</th>
                <th className="px-3 py-2.5 text-left">Admit Date</th>
                <th className="px-3 py-2.5 text-left">Therapist</th>
                <th className="px-3 py-2.5 text-left">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {contactClients.map(c => {
                const checked = selectedKeys.has(c.key);
                const needsPick = c.autoLocation === null;
                const pick = locationPicks[c.key] ?? 'SF';
                return (
                  <tr
                    key={c.key}
                    className={`transition-colors cursor-pointer ${checked ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'}`}
                    onClick={() => toggleOne(c.key)}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(c.key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="px-3 py-2.5">
                      {c.program ? (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${PROGRAM_COLORS[c.program] ?? 'bg-slate-100 text-slate-600'}`}>
                          {c.program}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {c.admitDate || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {c.therapist || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      {needsPick ? (
                        <div className="flex gap-1">
                          {(['SF', 'ABQ'] as const).map(loc => (
                            <button
                              key={loc}
                              onClick={() => setLoc(c.key, loc)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                                pick === loc
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          {c.autoLocation}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-500">
            {selectedKeys.size} of {contactClients.length} clients selected
          </p>
          <button
            onClick={handleImport}
            disabled={selectedKeys.size === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Import {selectedKeys.size} Client{selectedKeys.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
