import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react';
import { Staff, TimeOffRequest } from '../../types';

interface TimeOffModalProps {
  staffList: Staff[];
  requests: TimeOffRequest[];
  onAdd: (req: TimeOffRequest) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const LEAVE_COLORS = [
  { bar: 'bg-indigo-400',  light: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  avatar: 'bg-indigo-500'  },
  { bar: 'bg-emerald-400', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', avatar: 'bg-emerald-500' },
  { bar: 'bg-amber-400',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   avatar: 'bg-amber-500'   },
  { bar: 'bg-rose-400',    light: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    avatar: 'bg-rose-500'    },
  { bar: 'bg-violet-400',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  avatar: 'bg-violet-500'  },
  { bar: 'bg-sky-400',     light: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     avatar: 'bg-sky-500'     },
];

function staffColor(staffId: string, staffList: Staff[]) {
  const idx = staffList.findIndex(s => s.id === staffId);
  return LEAVE_COLORS[Math.max(0, idx) % LEAVE_COLORS.length];
}

function isoToDate(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

function dateToIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + n);
  return dateToIso(d);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function TimeOffModal({ staffList, requests, onAdd, onRemove, onClose }: TimeOffModalProps) {
  const today = dateToIso(new Date());

  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth()); // 0-indexed

  const [formStaffId, setFormStaffId] = useState(staffList[0]?.id ?? '');
  const [formStart,   setFormStart]   = useState(today);
  const [formEnd,     setFormEnd]     = useState(today);
  const [formNote,    setFormNote]    = useState('');

  const handleAdd = () => {
    if (!formStaffId || formStart > formEnd) return;
    onAdd({
      id: `tor-${Date.now()}`,
      staffId: formStaffId,
      startDate: formStart,
      endDate: formEnd,
      note: formNote.trim() || undefined,
    });
    setFormNote('');
  };

  // Build calendar grid for current month
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const lastOfMonth  = new Date(calYear, calMonth + 1, 0);

  // Monday-first: Mon=0 … Sun=6
  const startPad = (firstOfMonth.getDay() + 6) % 7;
  const totalCells = startPad + lastOfMonth.getDate();
  const rows = Math.ceil(totalCells / 7);

  const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function cellIso(row: number, col: number): string | null {
    const dayNum = row * 7 + col - startPad + 1;
    if (dayNum < 1 || dayNum > lastOfMonth.getDate()) return null;
    const d = new Date(calYear, calMonth, dayNum);
    return dateToIso(d);
  }

  function requestsForDay(iso: string) {
    return requests.filter(r => iso >= r.startDate && iso <= r.endDate);
  }

  function isReturnDay(iso: string) {
    return requests.filter(r => addDays(r.endDate, 1) === iso);
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const selectedStaff = staffList.find(s => s.id === formStaffId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">Approved Schedule Requests</h2>
            <p className="text-xs text-slate-400 mt-0.5">Log approved time off — staff will be flagged as unavailable on those dates.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Add request form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600">New Time Off Request</h3>

            {/* Staff selector with avatar preview */}
            <div className="flex items-center gap-3">
              {selectedStaff && (
                selectedStaff.photo
                  ? <img src={selectedStaff.photo} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" alt={selectedStaff.name} referrerPolicy="no-referrer" />
                  : <div className={`w-9 h-9 rounded-full ${staffColor(formStaffId, staffList).avatar} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{initials(selectedStaff.name)}</div>
              )}
              <select
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                value={formStaffId}
                onChange={e => setFormStaffId(e.target.value)}
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">First Day Out</label>
                <input
                  type="date"
                  value={formStart}
                  onChange={e => { setFormStart(e.target.value); if (e.target.value > formEnd) setFormEnd(e.target.value); }}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Last Day Out</label>
                <input
                  type="date"
                  value={formEnd}
                  min={formStart}
                  onChange={e => setFormEnd(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Note (optional)</label>
              <input
                type="text"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="e.g. FMLA, Vacation, Conference"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 text-slate-700"
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!formStaffId || formStart > formEnd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Approve Request
            </button>
          </div>

          {/* Calendar */}
          <div>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-sm text-slate-800">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day header row */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold font-mono text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              {Array.from({ length: rows }).map((_, row) => (
                <div key={row} className="grid grid-cols-7 divide-x divide-slate-100 border-b last:border-b-0 border-slate-100">
                  {Array.from({ length: 7 }).map((_, col) => {
                    const iso = cellIso(row, col);
                    if (!iso) {
                      return <div key={col} className="min-h-[72px] bg-slate-50/50" />;
                    }

                    const d = isoToDate(iso);
                    const dayNum = d.getDate();
                    const isToday = iso === today;
                    const dayRequests = requestsForDay(iso);
                    const returnRequests = isReturnDay(iso);

                    return (
                      <div key={col} className={`min-h-[72px] p-1.5 flex flex-col gap-1 ${isToday ? 'bg-indigo-50/60' : 'bg-white'}`}>
                        <span className={`text-[11px] font-bold self-end leading-none mb-0.5 ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {dayNum}
                        </span>

                        {/* Time off bars */}
                        {dayRequests.map(req => {
                          const colors = staffColor(req.staffId, staffList);
                          const member = staffList.find(s => s.id === req.staffId);
                          const isStart  = iso === req.startDate;
                          const isEnd    = iso === req.endDate;

                          return (
                            <div key={req.id} className="flex flex-col gap-0.5">
                              {/* Start day: show avatar + name */}
                              {isStart && member && (
                                <div className="flex items-center gap-1">
                                  {member.photo
                                    ? <img src={member.photo} className="w-4 h-4 rounded-full object-cover border border-white shadow-sm shrink-0" alt={member.name} referrerPolicy="no-referrer" />
                                    : <div className={`w-4 h-4 rounded-full ${colors.avatar} text-white text-[8px] font-bold flex items-center justify-center shrink-0`}>{initials(member.name)}</div>
                                  }
                                  <span className={`text-[9px] font-bold ${colors.text} truncate leading-none`}>
                                    {member.name.split(' ')[0]}
                                  </span>
                                </div>
                              )}

                              {/* Color bar — left-rounded on start, right-rounded on end, square in middle */}
                              <div className={`h-1.5 w-full ${colors.bar} ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}`} />
                            </div>
                          );
                        })}

                        {/* Return day labels */}
                        {returnRequests.map(req => {
                          const colors = staffColor(req.staffId, staffList);
                          const member = staffList.find(s => s.id === req.staffId);
                          return (
                            <div key={`ret-${req.id}`} className={`text-[9px] font-bold ${colors.text} leading-tight`}>
                              ↩ {member?.name.split(' ')[0] ?? '?'} returns
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Approved requests list */}
          {requests.length > 0 && (
            <div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">All Approved Requests</h3>
              <div className="space-y-2">
                {requests.map(req => {
                  const member = staffList.find(s => s.id === req.staffId);
                  const colors = staffColor(req.staffId, staffList);
                  const returnDate = addDays(req.endDate, 1);
                  return (
                    <div key={req.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${colors.border} ${colors.light}`}>
                      {member?.photo
                        ? <img src={member.photo} className="w-7 h-7 rounded-full object-cover border border-white shadow-sm shrink-0" alt={member.name} referrerPolicy="no-referrer" />
                        : <div className={`w-7 h-7 rounded-full ${colors.avatar} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{initials(member?.name ?? '?')}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${colors.text}`}>{member?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {req.startDate} → {req.endDate}
                          <span className="ml-1.5 text-slate-400">· returns {returnDate}</span>
                          {req.note && <span className="ml-1.5 italic">{req.note}</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(req.id)}
                        className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
