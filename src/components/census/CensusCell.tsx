import React, { useRef } from 'react';
import { Clock, Home, Car } from 'lucide-react';
import { CensusEntry, ProgramBlock } from '../../types';
import { BLOCK_TAG } from './blockStyles';

interface CensusCellProps {
  block: ProgramBlock;
  entry: CensusEntry | null;
  onClick: (rect: DOMRect) => void;
}

function statusLabel(entry: CensusEntry | null): string {
  if (!entry || entry.status === null) return '—';
  if (entry.status === 'Present') return 'Present';
  if (entry.status === 'Special') return entry.specialCode ?? 'Special';
  if (entry.status === 'Absent') return entry.excused ? 'Excused' : 'Unexcused';
  return '—';
}

function dotClass(entry: CensusEntry | null): string {
  if (!entry || entry.status === null) return 'bg-slate-200';
  if (entry.status === 'Present') return 'bg-emerald-500';
  if (entry.status === 'Special') return 'bg-slate-400';
  if (entry.status === 'Absent') return entry.excused ? 'bg-amber-400' : 'bg-red-500';
  return 'bg-slate-200';
}

function statusTextClass(entry: CensusEntry | null): string {
  if (!entry || entry.status === null) return 'text-slate-300';
  if (entry.status === 'Present') return 'text-slate-700';
  if (entry.status === 'Special') return 'text-slate-500';
  if (entry.status === 'Absent') return entry.excused ? 'text-amber-600' : 'text-red-600';
  return 'text-slate-300';
}

export default function CensusCell({ block, entry, onClick }: CensusCellProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (ref.current) onClick(ref.current.getBoundingClientRect());
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors text-left group"
    >
      {/* Block tag */}
      <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase shrink-0 leading-none ${BLOCK_TAG[block]}`}>
        {block}
      </span>

      {/* Status dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(entry)}`} />

      {/* Status label */}
      <span className={`text-[10px] font-medium truncate flex-1 ${statusTextClass(entry)}`}>
        {statusLabel(entry)}
      </span>

      {/* Badges */}
      {entry?.tardy && (
        <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
      )}
      {entry?.virtualMode === 'residence' && (
        <Home className="w-2.5 h-2.5 text-blue-400 shrink-0" />
      )}
      {entry?.virtualMode === 'away' && (
        <Car className="w-2.5 h-2.5 text-blue-400 shrink-0" />
      )}

      {/* Auto-fill indicator */}
      {entry?.autoFilled && (
        <span className="text-[7px] font-mono text-slate-300 shrink-0 leading-none">auto</span>
      )}
    </button>
  );
}
