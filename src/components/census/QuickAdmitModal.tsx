import React, { useState } from 'react';
import { Clock, UserPlus, ChevronDown, ChevronUp, X } from 'lucide-react';
import { TempClient } from '../../utils/clientAdapter';

interface QuickAdmitCardProps {
  onClose: () => void;
  onAdmit: (client: TempClient) => void;
}

const PROGRAMS = ['DIOP', 'EIOP', 'IND', 'DOP', 'EOP'] as const;
const DOCTORS  = ['Dr. Aris Thorne', 'Dr. Marcus Vance', 'Elena Rostova', 'Sarah Lin'];
const STATUSES = ['On Track', 'Extended Care', 'At Risk'] as const;
const AVATAR_COLORS = ['bg-indigo-600','bg-emerald-600','bg-purple-600','bg-blue-600','bg-teal-600','bg-rose-600'];

type Status = typeof STATUSES[number];

export default function QuickAdmitCard({ onClose, onAdmit }: QuickAdmitCardProps) {
  const [name,     setName]     = useState('');
  const [program,  setProgram]  = useState<string>('DIOP');
  const [doctor,   setDoctor]   = useState(DOCTORS[0]);
  const [status,   setStatus]   = useState<Status>('On Track');
  const [runway,   setRunway]   = useState(14);
  const [possible, setPossible] = useState(10);
  const [attended, setAttended] = useState(8);
  const [excused,  setExcused]  = useState(1);
  const [showSeed, setShowSeed] = useState(false);

  const headerBg =
    status === 'On Track'      ? 'bg-emerald-50' :
    status === 'Extended Care' ? 'bg-amber-50'   : 'bg-red-50';

  const statusColor =
    status === 'On Track'      ? 'text-emerald-600' :
    status === 'Extended Care' ? 'text-amber-500'   : 'text-red-500';

  const unexcused = Math.max(0, possible - attended - excused);

  const handleAdmit = () => {
    if (!name.trim()) return;
    const parts = name.trim().split(/[\s,]+/);
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

    const discharge = new Date();
    discharge.setDate(discharge.getDate() + runway);
    const dcProjectionDate = discharge.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const completedPct = possible > 0 ? Math.round((attended / possible) * 100) : 0;

    onAdmit({
      id: String(Date.now()),
      name: name.trim(),
      initials,
      program,
      doctor,
      fullDaysAtt: attended,
      excused,
      unexcused,
      halfDaysAtt: 0, halfExc: 0, halfUnexc: 0,
      possible,
      virtualCount: 0, tardyCount: 0,
      dcProjectionDate,
      dcProjectionStatus: status,
      clinicalRunwayDays: runway,
      completedPercentage: completedPct,
      currentPositionPercentage: Math.min(95, completedPct + 5),
      stalled: status === 'At Risk',
      avatarBg: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      weeklyAttendance: {
        Mon: { status: 'Present', virtual: false },
        Tue: { status: 'Present', virtual: false },
        Wed: { status: 'Present', virtual: false },
        Thu: { status: 'Present', virtual: false },
        Fri: { status: 'Present', virtual: false },
      },
    });

    onClose();
    setName(''); setProgram('DIOP'); setDoctor(DOCTORS[0]);
    setStatus('On Track'); setRunway(14); setPossible(10); setAttended(8); setExcused(1);
  };

  return (
    <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

      {/* ── Tinted header ── */}
      <div className={`px-5 pt-3 pb-4 ${headerBg} transition-colors`}>
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex flex-wrap gap-1">
            {PROGRAMS.map(p => (
              <button
                key={p}
                onClick={() => setProgram(p)}
                className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded transition-all ${
                  program === p
                    ? 'bg-slate-700 text-white'
                    : 'bg-white/60 text-slate-400 hover:text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors ml-1 mt-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <input
          autoFocus
          placeholder="Patient name…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdmit()}
          className={`block w-full bg-transparent text-[1.35rem] font-display font-bold leading-snug placeholder:text-slate-300 focus:outline-none ${statusColor}`}
        />
      </div>

      <div className="border-t border-slate-200" />

      {/* ── Status pill toggle ── */}
      <div className="px-4 py-3">
        <div className="flex bg-slate-100 rounded-full p-0.5 gap-0.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 text-[9px] font-bold font-mono px-1 py-1.5 rounded-full uppercase transition-all leading-none ${
                status === s
                  ? s === 'On Track'      ? 'bg-emerald-500 text-white shadow-sm'
                  : s === 'Extended Care' ? 'bg-amber-400 text-white shadow-sm'
                  :                        'bg-red-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s === 'Extended Care' ? 'Extended' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Runway + doctor ── */}
      <div className="px-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-300" />
          <button onClick={() => setRunway(r => Math.max(1, r - 1))} className="text-slate-400 hover:text-slate-700 font-bold text-sm leading-none">−</button>
          <span className="text-sm font-bold text-slate-700 w-6 text-center">{runway}</span>
          <button onClick={() => setRunway(r => Math.min(120, r + 1))} className="text-slate-400 hover:text-slate-700 font-bold text-sm leading-none">+</button>
          <span className="text-[9px] font-mono text-slate-400 uppercase">days</span>
        </div>
        <select
          value={doctor}
          onChange={e => setDoctor(e.target.value)}
          className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer flex-1 min-w-0 truncate"
        >
          {DOCTORS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* ── Attendance seed (collapsible) ── */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setShowSeed(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <span>Attendance Seed</span>
          {showSeed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showSeed && (
          <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
            {([
              { label: 'Possible', val: possible, set: setPossible },
              { label: 'Attended', val: attended, set: setAttended },
              { label: 'Excused',  val: excused,  set: setExcused  },
            ] as const).map(({ label, val, set }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{label}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => set(v => Math.max(0, v - 1))} className="text-slate-400 hover:text-slate-700 text-xs font-bold">−</button>
                  <span className="text-sm font-bold text-slate-700 w-5 text-center">{val}</span>
                  <button onClick={() => set(v => v + 1)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Admit / Cancel footer ── */}
      <div className="border-t border-slate-100 flex">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 text-[10px] font-bold font-mono uppercase text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <div className="w-px bg-slate-100" />
        <button
          onClick={handleAdmit}
          disabled={!name.trim()}
          className="flex-1 py-2.5 text-[10px] font-bold font-mono uppercase text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-30 flex items-center justify-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Admit
        </button>
      </div>
    </div>
  );
}
