import React from 'react';
import { Clock, User, Home, Car } from 'lucide-react';
import { CensusEntry, ProgramBlock, VirtualMode } from '../../types';

interface CensusCellProps {
  block:    ProgramBlock;
  entry:    CensusEntry | null;
  disabled: boolean;
  onUpdate: (updates: Partial<CensusEntry>) => void;
  onRemove?: () => void;
}

export default function CensusCell({ block, entry, disabled, onUpdate, onRemove }: CensusCellProps) {
  const status      = entry?.status      ?? null;
  const excused     = entry?.excused     ?? false;
  const tardy       = entry?.tardy       ?? false;
  const virtualMode = entry?.virtualMode ?? 'none';
  const specialCode = entry?.specialCode;

  const isPresent = status === 'Present';
  const isAbsent  = status === 'Absent';

  // ── Status toggle: null → Present → Absent → null ──
  const toggleStatus = () => {
    if (disabled) return;
    if (!status)      onUpdate({ status: 'Present', excused: false });
    else if (isPresent) onUpdate({ status: 'Absent',  tardy: false, virtualMode: 'none' });
    else                onUpdate({ status: null });
  };

  // ── * / L / D cycle in top-left corner ──
  const cycleSpecial = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!specialCode)        onUpdate({ specialCode: 'L' });
    else if (specialCode === 'L') onUpdate({ specialCode: 'D' });
    else                         onUpdate({ specialCode: undefined });
  };

  const toggleTardy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !isPresent) return;
    onUpdate({ tardy: !tardy });
  };

  const cycleVirtual = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !isPresent) return;
    const next: VirtualMode =
      virtualMode === 'none' ? 'residence' : virtualMode === 'residence' ? 'away' : 'none';
    onUpdate({ virtualMode: next });
  };

  const setExcused = (val: boolean) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !isAbsent) return;
    onUpdate({ excused: val });
  };

  // ── Styling ──
  const bgBorder = disabled
    ? 'bg-slate-50 border-slate-100'
    : isPresent
    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
    : isAbsent
    ? 'bg-red-50 border-red-200 hover:border-red-300'
    : 'bg-white border-slate-200 border-dashed hover:border-indigo-300 hover:bg-indigo-50/30';

  const statusText =
    isPresent ? 'Present' :
    isAbsent  ? 'Absent'  : '—';

  const statusColor = disabled
    ? 'text-slate-300'
    : isPresent ? 'text-emerald-600'
    : isAbsent  ? 'text-red-500'
    :             'text-slate-300';

  const blockColor = disabled ? 'text-slate-300' : 'text-slate-400';
  const LocationIcon = virtualMode === 'away' ? Car : virtualMode === 'residence' ? Home : User;
  const locationTitle =
    virtualMode === 'none' ? 'In person — click for virtual (home)' :
    virtualMode === 'residence' ? 'Virtual — at residence — click for virtual (away)' :
    'Virtual — away from residence — click for in person';

  return (
    <div className={`relative w-full rounded-xl border transition-all select-none ${bgBorder}`}>

      {/* ── Remove button (IND only) ── */}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          title="Remove this session"
          className="absolute top-1 right-1.5 w-4 h-4 flex items-center justify-center z-10 text-slate-300 hover:text-red-400 transition-colors"
        >
          <span className="text-[10px] font-bold leading-none">×</span>
        </button>
      )}

      {/* ── * / L / D modifier ── */}
      <button
        onClick={cycleSpecial}
        disabled={disabled}
        title={!specialCode ? 'Mark L (Last Day) or D (Discharged)' : specialCode === 'L' ? 'Last Day — click for Discharged' : 'Discharged — click to clear'}
        className="absolute top-1.5 left-2 w-4 h-4 flex items-center justify-center z-10"
      >
        <span
          className={`text-[10px] font-bold font-mono leading-none ${
            !specialCode  ? 'text-slate-400'  :
            specialCode === 'L' ? 'text-blue-500' : 'text-slate-900'
          }`}
          style={!specialCode ? { opacity: 0.18 } : {}}
        >
          {specialCode ?? '*'}
        </span>
      </button>

      {/* ── Block label ── */}
      <p className={`text-[9px] font-mono font-bold uppercase tracking-widest text-center pt-2.5 pb-0.5 ${blockColor}`}>
        {block}
      </p>

      {/* ── Status (clickable) ── */}
      <button
        onClick={toggleStatus}
        disabled={disabled}
        className={`w-full text-center pb-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`text-[1.05rem] font-display font-bold leading-none ${statusColor}`}>
          {statusText}
        </span>
      </button>

      {/* ── Divider ── */}
      <div className={`border-t mx-3 mb-2 ${disabled ? 'border-slate-100' : 'border-slate-200'}`} />

      {/* ── Bottom controls ── */}
      <div className="px-3 pb-2">
        {disabled ? (
          <p className="text-[9px] font-mono text-slate-200 text-center">upcoming</p>
        ) : isPresent ? (
          <div className="flex items-center justify-center gap-5">
            <button onClick={toggleTardy} title={tardy ? 'Remove tardy' : 'Mark tardy'}>
              <Clock className={`w-4 h-4 transition-colors ${tardy ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'}`} />
            </button>
            <button onClick={cycleVirtual} title={locationTitle}>
              <LocationIcon className={`w-4 h-4 transition-colors ${virtualMode !== 'none' ? 'text-blue-400' : 'text-emerald-500 hover:text-emerald-600'}`} />
            </button>
          </div>
        ) : isAbsent ? (
          <div className="flex bg-slate-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={setExcused(false)}
              className={`flex-1 text-[8px] font-bold font-mono px-1 py-1 rounded-full uppercase leading-none transition-all ${!excused ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Unexcused
            </button>
            <button
              onClick={setExcused(true)}
              className={`flex-1 text-[8px] font-bold font-mono px-1 py-1 rounded-full uppercase leading-none transition-all ${excused ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Excused
            </button>
          </div>
        ) : (
          <p className="text-[9px] font-mono text-slate-300 text-center">tap to record</p>
        )}
      </div>
    </div>
  );
}
