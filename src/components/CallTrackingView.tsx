/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Phone, PhoneIncoming, Search } from 'lucide-react';
import { CallLogEntry, CallFollowUpStatus } from '../types';
import AddCallLogModal from './AddCallLogModal';

interface CallTrackingViewProps {
  callLog: CallLogEntry[];
  onAddEntry: (entry: CallLogEntry) => void;
  onUpdateEntry: (id: string, updates: Partial<CallLogEntry>) => void;
}

const FOLLOW_UP_OPTIONS: CallFollowUpStatus[] = ['New', 'Follow-Up Needed', 'Scheduled', 'No Action Needed', 'Closed'];

const STATUS_STYLE: Record<CallFollowUpStatus, string> = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Follow-Up Needed': 'bg-amber-50 text-amber-700 border-amber-200',
  'Scheduled': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'No Action Needed': 'bg-slate-100 text-slate-500 border-slate-200',
  'Closed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function CallTrackingView({ callLog, onAddEntry, onUpdateEntry }: CallTrackingViewProps) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'All' | 'SF' | 'ABQ'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CallFollowUpStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);

  const intakeSpecialists = useMemo(
    () => Array.from(new Set(callLog.map(c => c.intakeSpecialist))).sort(),
    [callLog]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...callLog]
      .filter(c => locationFilter === 'All' || c.location === locationFilter)
      .filter(c => statusFilter === 'All' || c.followUpStatus === statusFilter)
      .filter(c => !q || c.clientName.toLowerCase().includes(q) || c.callerName.toLowerCase().includes(q))
      .sort((a, b) => (b.date + (b.time ?? '')).localeCompare(a.date + (a.time ?? '')));
  }, [callLog, search, locationFilter, statusFilter]);

  const openCount = callLog.filter(c => c.followUpStatus === 'New' || c.followUpStatus === 'Follow-Up Needed').length;

  return (
    <div className="space-y-6">

      {/* Header row: search + filters + add */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search caller or client…"
              className="text-xs font-sans border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-56"
            />
          </div>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value as typeof locationFilter)}
            className="text-xs font-sans border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All locations</option>
            <option value="SF">Santa Fe</option>
            <option value="ABQ">Albuquerque</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-xs font-sans border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All follow-up statuses</option>
            {FOLLOW_UP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">{openCount} need follow-up</span>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <PhoneIncoming className="w-4 h-4" />
            Log Call
          </button>
        </div>
      </div>

      {/* Call log table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Phone className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No calls match these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="py-3 px-5 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Date</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Client</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Caller</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Loc</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Referral Source</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Insurance</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Intake Specialist</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="py-3 px-5">
                      <p className="font-medium text-slate-700 whitespace-nowrap">{c.date}</p>
                      {c.time && <p className="text-[10px] font-mono text-slate-400">{c.time}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-700">{c.clientName}</p>
                      {(c.clientPhone || c.clientEmail) && (
                        <p className="text-[10px] font-mono text-slate-400">{[c.clientPhone, c.clientEmail].filter(Boolean).join(' · ')}</p>
                      )}
                      {(c.issuesNotes || c.clinicianNotes) && (
                        <p className="text-[11px] text-slate-500 max-w-64 mt-1" title={[c.issuesNotes, c.clinicianNotes].filter(Boolean).join(' — ')}>
                          {c.issuesNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-600">{c.callerName}</p>
                      {c.callerRelationship && <p className="text-[10px] font-mono text-slate-400">{c.callerRelationship}</p>}
                      {c.callerPhone && <p className="text-[10px] font-mono text-slate-400">{c.callerPhone}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-slate-500">{c.location}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-slate-500">{c.referralSource ?? '—'}</p>
                      {c.referringProvider && <p className="text-[10px] font-mono text-slate-400">{c.referringProvider}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-500">{c.insurance ?? '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-500">{c.intakeSpecialist}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={c.followUpStatus}
                        onChange={e => onUpdateEntry(c.id, { followUpStatus: e.target.value as CallFollowUpStatus })}
                        className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${STATUS_STYLE[c.followUpStatus]}`}
                      >
                        {FOLLOW_UP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddCallLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddEntry}
        intakeSpecialists={intakeSpecialists}
      />
    </div>
  );
}
