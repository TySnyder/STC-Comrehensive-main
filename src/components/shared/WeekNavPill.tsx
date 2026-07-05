import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavPillProps {
  monthLabel: string;
  startLabel: string;
  endLabel: string;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNavPill({
  monthLabel,
  startLabel,
  endLabel,
  isToday,
  onPrev,
  onNext,
  onToday,
}: WeekNavPillProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{monthLabel}</span>

      <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-x divide-slate-100">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
          title="Previous"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{startLabel}</span>
        </button>

        <button
          onClick={onToday}
          className={`px-5 py-2.5 text-sm font-bold transition-colors ${
            isToday
              ? 'text-indigo-600 cursor-default'
              : 'text-slate-400 hover:bg-slate-50 cursor-pointer hover:text-slate-600'
          }`}
          title={isToday ? 'Current period' : 'Go to today'}
        >
          Today
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
          title="Next"
        >
          <span className="text-sm font-semibold text-slate-700">{endLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
