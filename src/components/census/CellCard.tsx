import React from 'react';
import { Clock, User, Home, Car } from 'lucide-react';
import { CensusEntry, ProgramBlock, VirtualMode, SpecialCode } from '../../types';
import { BLOCK_TAG, BLOCK_HEADER_BG } from './blockStyles';

interface CellCardProps {
  block: ProgramBlock;
  entry: CensusEntry | null;
  onUpdate: (updates: Partial<CensusEntry>) => void;
}

export default function CellCard({ block, entry, onUpdate }: CellCardProps) {

  const status = entry?.status ?? null;
  const excused = entry?.excused ?? false;
  const tardy = entry?.tardy ?? false;
  const virtualMode: VirtualMode = entry?.virtualMode ?? 'none';

  const isPresent = status === 'Present';
  const isAbsent  = status === 'Absent';
  const isSpecial = status === 'Special';

  const toggleStatus = () => {
    if (isPresent || isSpecial) {
      onUpdate({ status: 'Absent', tardy: false, virtualMode: 'none', specialCode: undefined });
    } else {
      onUpdate({ status: 'Present', excused: false, specialCode: undefined });
    }
  };

  const cycleVirtual = () => {
    const next: VirtualMode =
      virtualMode === 'none' ? 'residence' : virtualMode === 'residence' ? 'away' : 'none';
    onUpdate({ virtualMode: next });
  };

  const LocationIcon = virtualMode === 'residence' ? Home : virtualMode === 'away' ? Car : User;
  const locationTitle =
    virtualMode === 'none' ? 'In person — click for virtual (home)' :
    virtualMode === 'residence' ? 'Virtual — at residence — click for virtual (away)' :
    'Virtual — away from residence — click for in person';

  const headerBg = isPresent ? 'bg-emerald-50' : isAbsent ? 'bg-red-50' : isSpecial ? 'bg-slate-100' : BLOCK_HEADER_BG[block];
  const statusColor = isPresent ? 'text-emerald-600' : isAbsent ? 'text-red-500' : isSpecial ? 'text-slate-600' : 'text-slate-300';

  return (
    <div className="w-52 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Tinted header with block label + status toggle */}
      <div className={`px-5 pt-3 pb-4 ${headerBg} transition-colors`}>
        <div className="flex items-start justify-between">
          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${BLOCK_TAG[block]} px-1.5 py-0.5 rounded`}>
            {block}
          </span>
          {/* D / L corner badges */}
          <div className="flex gap-1">
            {(['D', 'L'] as SpecialCode[]).map(code => (
              <button
                key={code}
                onClick={() => onUpdate({ status: 'Special', specialCode: code, tardy: false, virtualMode: 'none' })}
                title={code === 'D' ? 'Discharge Date' : 'Last Day'}
                className={`text-[9px] font-mono font-bold w-5 h-5 rounded flex items-center justify-center transition-all ${
                  isSpecial && entry?.specialCode === code
                    ? 'bg-slate-800 text-white'
                    : 'bg-white/60 text-slate-400 hover:text-slate-600 hover:bg-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={toggleStatus}
          className={`block w-full text-left text-[1.6rem] font-display font-bold mt-1.5 transition-colors leading-none ${statusColor} hover:opacity-80`}
        >
          {isPresent ? 'Present'
           : isAbsent ? 'Absent'
           : isSpecial ? (entry?.specialCode ?? 'Special')
           : '—'}
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Controls area */}
      <div className="px-4 py-4">
        {isAbsent ? (
          <div className="flex bg-slate-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => onUpdate({ excused: false })}
              className={`flex-1 text-[10px] font-bold font-mono px-2 py-1.5 rounded-full uppercase transition-all ${
                !excused ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Unexcused
            </button>
            <button
              onClick={() => onUpdate({ excused: true })}
              className={`flex-1 text-[10px] font-bold font-mono px-2 py-1.5 rounded-full uppercase transition-all ${
                excused ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Excused
            </button>
          </div>
        ) : isPresent ? (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => onUpdate({ tardy: !tardy })}
              title={tardy ? 'Remove tardy' : 'Mark tardy'}
              className="hover:scale-125 active:scale-100 transition-transform"
            >
              <Clock className={`w-7 h-7 transition-colors ${tardy ? 'text-amber-500' : 'text-slate-300'}`} />
            </button>
            <button
              onClick={cycleVirtual}
              title={locationTitle}
              className="hover:scale-125 active:scale-100 transition-transform"
            >
              <LocationIcon className={`w-7 h-7 transition-colors ${virtualMode !== 'none' ? 'text-blue-500' : 'text-emerald-500'}`} />
            </button>
          </div>
        ) : (
          <p className="text-center text-[10px] text-slate-400 font-mono">tap status above to begin</p>
        )}
      </div>

    </div>
  );
}
