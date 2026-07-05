/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, LogOut, GraduationCap } from 'lucide-react';
import { Client, DcStatus } from '../types';
import { DischargeInput, getCurrentEpisode } from '../utils/episodeHelpers';

interface DischargeClientModalProps {
  client: Client;
  onClose: () => void;
  onDischarge: (clientId: string, input: DischargeInput) => void;
}

const DC_STATUSES: { value: DcStatus; hint: string }[] = [
  { value: 'Approved', hint: 'Planned / clinically appropriate, staff-approved' },
  { value: 'ASA', hint: 'Against staff advice — client chose to stop treatment' },
  { value: 'Admin DC', hint: 'Program-initiated: attendance, policy, compliance, auth' },
];

export default function DischargeClientModal({ client, onClose, onDischarge }: DischargeClientModalProps) {
  const episode = getCurrentEpisode(client);
  const today = new Date().toISOString().slice(0, 10);

  const [iopDcDate, setIopDcDate] = useState(episode.iopDcDate ?? '');
  const [stcDcDate, setStcDcDate] = useState('');
  const [dcStatus, setDcStatus] = useState<DcStatus[]>([]);
  const [graduated, setGraduated] = useState(false);
  const [note, setNote] = useState(episode.note ?? '');

  const fullDischarge = stcDcDate !== '';
  // IOP step-down alone is valid; a full discharge needs at least one DC status.
  const canSave = (iopDcDate !== '' || fullDischarge) && (!fullDischarge || dcStatus.length > 0);

  const toggleStatus = (s: DcStatus) =>
    setDcStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    if (!canSave) return;
    onDischarge(client.id, {
      iopDcDate: iopDcDate || undefined,
      stcDcDate: stcDcDate || undefined,
      dcStatus: fullDischarge ? dcStatus : undefined,
      graduated: fullDischarge ? graduated : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-red-50 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider block">
              Discharge · Episode {episode.episodeNumber}
            </span>
            <h2 className="text-lg font-display font-bold text-slate-900 mt-0.5">{client.name}</h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Admitted {episode.admitDate} · {client.program}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                IOP DC Date
              </label>
              <input
                type="date"
                value={iopDcDate}
                max={today}
                onChange={e => setIopDcDate(e.target.value)}
                className="w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-400"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-sans leading-tight">
                Step-down only — client stays Active at STC.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                STC DC Date
              </label>
              <input
                type="date"
                value={stcDcDate}
                onChange={e => setStcDcDate(e.target.value)}
                className="w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-400"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-sans leading-tight">
                Full discharge — starts the paperwork checklist.
              </p>
            </div>
          </div>

          {/* DC status multi-select — required for full discharge */}
          {fullDischarge && (
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                DC Status <span className="text-red-400">(select all that apply)</span>
              </label>
              <div className="space-y-1.5">
                {DC_STATUSES.map(({ value, hint }) => (
                  <button
                    key={value}
                    onClick={() => toggleStatus(value)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                      dcStatus.includes(value)
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 mt-0.5 rounded border shrink-0 flex items-center justify-center ${
                      dcStatus.includes(value) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                    }`}>
                      {dcStatus.includes(value) && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
                    </span>
                    <span>
                      <span className="text-xs font-bold text-slate-800 font-sans block">{value}</span>
                      <span className="text-[10px] text-slate-400 font-sans leading-tight">{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Graduated */}
          {fullDischarge && (
            <button
              onClick={() => setGraduated(g => !g)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                graduated ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs font-bold font-sans">Graduated program</span>
            </button>
          )}

          {/* Note */}
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Follow-up context, LVM, emailed…"
              className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-400 resize-none font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 flex">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-bold font-mono uppercase text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <div className="w-px bg-slate-100" />
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 text-[10px] font-bold font-mono uppercase text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {fullDischarge ? 'Discharge from STC' : 'Record IOP step-down'}
          </button>
        </div>
      </div>
    </div>
  );
}
