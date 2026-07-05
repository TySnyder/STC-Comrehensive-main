import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Dices, Shuffle, Check, ArrowRight, FlaskConical } from 'lucide-react';
import { Client, CensusEntry, UaAssignment } from '../types';
import { getMonday, isoDate, weekDaysFrom, formatWeekRange } from '../utils/weekHelpers';
import { generateWeekAssignments, rerollDate, effectiveUaDate, needsAssignment } from '../utils/uaHelpers';

interface UaTrackingViewProps {
  clients: Client[];
  censusEntries: CensusEntry[];
  assignments: UaAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<UaAssignment[]>>;
}

const FREQ_LABEL: Record<string, string> = {
  'twice-weekly': '2×/week',
  'weekly': '1×/week',
  'monthly': 'Monthly',
  'external': 'External (PCP)',
  'none': 'None',
};

const DAY_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function dayLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function UaTrackingView({ clients, censusEntries, assignments, setAssignments }: UaTrackingViewProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(isoDate(new Date())));
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedBy, setCompletedBy] = useState('');

  const weekDays = weekDaysFrom(weekStart);
  const weekAssignments = useMemo(
    () => assignments.filter(a => a.weekStart === weekStart),
    [assignments, weekStart]
  );

  const assignableClients = clients.filter(c => needsAssignment(c.uaFrequency));
  const externalClients = clients.filter(c => c.uaFrequency === 'external');
  const unassignedClients = assignableClients.filter(c => !weekAssignments.some(a => a.clientId === c.id));

  const updateAssignment = (id: string, updates: Partial<UaAssignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleGenerate = () => {
    const created = generateWeekAssignments(assignableClients, weekStart, assignments);
    if (created.length > 0) setAssignments(prev => [...prev, ...created]);
  };

  const handleReroll = (a: UaAssignment) => {
    updateAssignment(a.id, { assignedDate: rerollDate(a, weekAssignments) });
  };

  const handleComplete = (a: UaAssignment) => {
    const { date } = effectiveUaDate(a, censusEntries);
    updateAssignment(a.id, {
      status: 'completed',
      completedDate: date <= isoDate(new Date()) ? date : isoDate(new Date()),
      completedBy: completedBy.trim(),
    });
    setCompletingId(null);
    setCompletedBy('');
  };

  const completedCount = weekAssignments.filter(a => a.status === 'completed').length;

  // Sort: pending first, then by effective date, then name
  const clientName = (id: string) => clients.find(c => c.id === id)?.name ?? id;
  const rows = [...weekAssignments].sort((x, y) => {
    if (x.status !== y.status) return x.status === 'pending' ? -1 : 1;
    const dx = effectiveUaDate(x, censusEntries).date;
    const dy = effectiveUaDate(y, censusEntries).date;
    return dx !== dy ? dx.localeCompare(dy) : clientName(x.clientId).localeCompare(clientName(y.clientId));
  });

  return (
    <div className="space-y-6">

      {/* Week nav + generate */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(w => addWeeks(w, -1))}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-slate-700 text-sm px-2 min-w-52 text-center">
            {formatWeekRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart(w => addWeeks(w, 1))}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(getMonday(isoDate(new Date())))}
            className="ml-1 text-xs font-mono text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            This week
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {completedCount}/{weekAssignments.length} completed
          </span>
          <button
            onClick={handleGenerate}
            disabled={unassignedClients.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            title={unassignedClients.length === 0 ? 'All eligible clients are assigned this week' : 'Randomly assign days for unassigned clients'}
          >
            <Dices className="w-4 h-4" />
            Generate this week
            {unassignedClients.length > 0 && (
              <span className="bg-indigo-500 rounded-full px-1.5 py-0.5 text-[10px] font-mono">{unassignedClients.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Assignment table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <FlaskConical className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No UA assignments for this week yet.</p>
            <p className="text-xs font-mono text-slate-300 mt-1">
              {assignableClients.length === 0
                ? 'No clients have an in-house UA frequency set — set one on the client profile.'
                : 'Click "Generate this week" to randomize days.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                <th className="py-3 px-5 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Client</th>
                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Frequency</th>
                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Assigned day</th>
                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</th>
                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Billed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => {
                const c = clients.find(x => x.id === a.clientId);
                const eff = effectiveUaDate(a, censusEntries);
                const done = a.status === 'completed';
                return (
                  <tr key={a.id} className={`border-b border-slate-50 last:border-0 ${done ? 'bg-emerald-50/30' : ''}`}>
                    <td className="py-3 px-5">
                      <p className="font-medium text-slate-700">{c?.name ?? a.clientId}</p>
                      <p className="text-[10px] font-mono text-slate-400">{c?.program} · {c?.location}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-slate-500">{c?.uaFrequency ? FREQ_LABEL[c.uaFrequency] : '—'}</span>
                      {c?.uaNote && <p className="text-[10px] text-slate-400 max-w-40 truncate" title={c.uaNote}>{c.uaNote}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={a.assignedDate}
                          disabled={done}
                          onChange={e => updateAssignment(a.id, { assignedDate: e.target.value })}
                          className="text-xs font-mono border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 disabled:bg-transparent disabled:border-transparent disabled:appearance-none"
                        >
                          {weekDays.map((d, i) => (
                            <option key={d} value={d}>{DAY_LABEL[i]} {d.slice(8)}</option>
                          ))}
                        </select>
                        {!done && (
                          <button onClick={() => handleReroll(a)} title="Re-roll a different random day"
                            className="text-slate-300 hover:text-indigo-500 transition-colors">
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {eff.rolledFrom && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                            title={`Absent ${dayLabel(eff.rolledFrom)} — rolled to next program day`}>
                            <ArrowRight className="w-3 h-3" />
                            rolled to {dayLabel(eff.date)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {done ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-xs font-mono">{a.completedDate}{a.completedBy ? ` · ${a.completedBy}` : ''}</span>
                        </div>
                      ) : completingId === a.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={completedBy}
                            onChange={e => setCompletedBy(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleComplete(a); if (e.key === 'Escape') setCompletingId(null); }}
                            placeholder="Completed by (initials)"
                            className="text-xs border border-indigo-300 rounded-md px-2 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          <button onClick={() => handleComplete(a)}
                            className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-md px-2 py-1 transition-colors">
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCompletingId(a.id); setCompletedBy(''); }}
                          className="text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-md px-2.5 py-1 transition-colors"
                        >
                          Mark complete
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => updateAssignment(a.id, { billed: !a.billed })}
                        title={a.billed ? 'Billed — click to unmark' : 'Not billed — click to mark billed'}
                        className={`w-5 h-5 rounded-md border inline-flex items-center justify-center transition-colors ${
                          a.billed ? 'bg-emerald-400 border-emerald-500 text-white' : 'bg-white border-slate-200 text-transparent hover:border-emerald-300'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* External clients footnote */}
      {externalClients.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
            External testing (PCP) — no in-house assignment
          </p>
          <p className="text-xs text-slate-500">{externalClients.map(c => c.name).join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

function addWeeks(monday: string, n: number): string {
  const d = new Date(monday + 'T12:00:00');
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().slice(0, 10);
}
