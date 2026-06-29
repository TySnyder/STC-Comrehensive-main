import React, { useState } from 'react';
import { Clock, Video, Home, Car, ChevronDown } from 'lucide-react';
import { CensusEntry, ProgramBlock, VirtualMode, SpecialCode } from '../../types';
import { BLOCK_TAG, BLOCK_HEADER_BG } from './blockStyles';

const SPECIAL_CODES: { code: SpecialCode; label: string }[] = [
  { code: 'L', label: 'Last Day' },
  { code: 'D', label: 'Discharge Date' },
  { code: 'H', label: 'Holiday' },
  { code: 'C', label: 'Closed' },
];

interface CellCardProps {
  block: ProgramBlock;
  entry: CensusEntry | null;
  onUpdate: (updates: Partial<CensusEntry>) => void;
}

export default function CellCard({ block, entry, onUpdate }: CellCardProps) {
  const [showSpecial, setShowSpecial] = useState(false);

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

  const VirtualIcon = virtualMode === 'residence' ? Home : virtualMode === 'away' ? Car : Video;
  const virtualTitle =
    virtualMode === 'none' ? 'In person (click to mark virtual)' :
    virtualMode === 'residence' ? 'Virtual — at residence (click to change)' :
    'Virtual — away from residence (click to change)';

  const headerBg = isPresent ? 'bg-emerald-50' : isAbsent ? 'bg-red-50' : isSpecial ? 'bg-slate-100' : BLOCK_HEADER_BG[block];
  const statusColor = isPresent ? 'text-emerald-600' : isAbsent ? 'text-red-500' : isSpecial ? 'text-slate-600' : 'text-slate-300';

  return (
    <div className="w-52 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Tinted header with block label + status toggle */}
      <div className={`px-5 pt-3 pb-4 ${headerBg} transition-colors`}>
        <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${BLOCK_TAG[block]} px-1.5 py-0.5 rounded`}>
          {block}
        </span>
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
              title={virtualTitle}
              className="hover:scale-125 active:scale-100 transition-transform"
            >
              <VirtualIcon className={`w-7 h-7 transition-colors ${virtualMode !== 'none' ? 'text-blue-500' : 'text-slate-300'}`} />
            </button>
          </div>
        ) : (
          <p className="text-center text-[10px] text-slate-400 font-mono">tap status above to begin</p>
        )}
      </div>

      {/* Special codes */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setShowSpecial(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <span>Special</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showSpecial ? 'rotate-180' : ''}`} />
        </button>
        {showSpecial && (
          <div className="grid grid-cols-4 gap-1 px-3 pb-3">
            {SPECIAL_CODES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => onUpdate({ status: 'Special', specialCode: code, tardy: false, virtualMode: 'none' })}
                title={label}
                className={`text-[11px] font-mono font-bold py-1.5 rounded-lg text-center transition-all ${
                  isSpecial && entry?.specialCode === code
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
