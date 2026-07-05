import React, { useState, useMemo } from 'react';
import { Settings, Clock, Video, MapPin, Palmtree } from 'lucide-react';
import { Client, CensusEntry, InsuranceBillingNote, ProgramBlock } from '../../types';
import { clientBlocks } from './blockStyles';
import CensusCell from './CensusCell';

const TODAY = new Date().toISOString().slice(0, 10);
const DAY_ABBR = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const PROGRAM_LABELS: Record<string, string> = {
  DIOP: 'DIOP — Intensive Outpatient Program (Dual)',
  DOP:  'DOP — Outpatient Program (Dual)',
  EIOP: 'EIOP — Evening Intensive Outpatient',
  EOP:  'EOP — Evening Outpatient Program',
  IND:  'IND — Individual Therapy',
};

const PROGRAM_ORDER = ['DIOP', 'DOP', 'EIOP', 'EOP', 'IND'];

const AVATAR_PALETTE = [
  'bg-indigo-500', 'bg-blue-500',   'bg-violet-500',
  'bg-teal-500',   'bg-emerald-500','bg-rose-500',
];

function avatarBg(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDayHeader(isoDate: string, i: number): string {
  const d = new Date(isoDate + 'T12:00:00');
  return `${DAY_ABBR[i]} ${d.getDate()}`;
}

interface CensusGridProps {
  clients:        Client[];
  weekDays:       string[];
  weekStart:      string;
  censusEntries:  CensusEntry[];
  billingNotes:   InsuranceBillingNote[];
  onCellUpdate:   (clientId: string, date: string, block: ProgramBlock, entry: CensusEntry | null, updates: Partial<CensusEntry>) => void;
  onRemoveInd:    (entryId: string) => void;
  onAddInd:       (clientId: string, date: string) => void;
  onBillingCogClick: (clientId: string) => void;
}

export default function CensusGrid({
  clients, weekDays, weekStart, censusEntries, billingNotes,
  onCellUpdate, onRemoveInd, onAddInd, onBillingCogClick,
}: CensusGridProps) {
  const [locationFilter, setLocationFilter] = useState<'both' | 'SF' | 'ABQ'>('both');
  const [programFilter,  setProgramFilter]  = useState<string>('All');

  // Dates marked as holidays come only from imports (specialCode 'H') — never set manually
  const holidayDates = useMemo(() =>
    new Set(censusEntries.filter(e => e.specialCode === 'H').map(e => e.date)),
    [censusEntries]
  );

  const getEntry = (clientId: string, date: string, block: ProgramBlock): CensusEntry | null =>
    censusEntries.find(e => e.clientId === clientId && e.date === date && e.block === block) ?? null;

  const getIndEntries = (clientId: string, date: string): CensusEntry[] =>
    censusEntries.filter(e => e.clientId === clientId && e.date === date && e.block === 'IND');

  const hasNotes = (clientId: string): boolean => {
    const n = billingNotes.find(b => b.clientId === clientId && b.weekStart === weekStart);
    return !!(n?.notes.trim());
  };

  const filtered = clients.filter(c => {
    if (locationFilter !== 'both' && c.location !== locationFilter) return false;
    if (programFilter  !== 'All'  && c.program  !== programFilter)  return false;
    return true;
  });

  const programs = PROGRAM_ORDER.filter(p => filtered.some(c => c.program === p));

  return (
    <div className="flex flex-col gap-4">

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5 shadow-xs">
            {(['both', 'SF', 'ABQ'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  locationFilter === loc ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {loc === 'both' ? 'Both' : loc === 'SF' ? 'Santa Fe' : 'Albuquerque'}
              </button>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Programs:
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5 shadow-xs flex-wrap">
          {['All', ...PROGRAM_ORDER].map(p => (
            <button
              key={p}
              onClick={() => setProgramFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                programFilter === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-5 text-[11px] font-medium text-slate-500 px-1">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Present</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Absent</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" />Tardy</span>
        <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-blue-400" />Virtual</span>
      </div>

      {/* ── Table ── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">

            {/* Column headers */}
            <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
              <div className="w-52 shrink-0 sticky left-0 bg-slate-50 border-r border-slate-200 px-4 py-3 z-30">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Client / Program
                </span>
              </div>
              <div className="flex-1 flex">
                {weekDays.map((day, i) => {
                  const isHoliday = holidayDates.has(day);
                  return (
                    <div
                      key={day}
                      className={`flex-1 px-3 py-3 text-center ${i < 4 ? 'border-r border-slate-100' : ''} ${day > TODAY ? 'opacity-40' : ''} ${isHoliday ? 'bg-amber-50/60' : ''}`}
                    >
                      <p className="text-[12px] font-bold text-slate-600 font-mono">{formatDayHeader(day, i)}</p>
                      {isHoliday && (
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Holiday</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="w-10 shrink-0 sticky right-0 bg-slate-50 border-l border-slate-100 z-30" />
            </div>

            {/* Program groups */}
            {programs.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">No clients match the selected filters.</div>
            ) : programs.map(prog => {
              const groupClients = filtered.filter(c => c.program === prog);
              return (
                <React.Fragment key={prog}>
                  {/* Section header */}
                  <div className="flex bg-slate-50/80 border-y border-slate-100">
                    <div className="w-52 shrink-0 sticky left-0 bg-slate-50/80 px-4 py-2 z-10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        {PROGRAM_LABELS[prog] ?? prog}
                      </span>
                    </div>
                    <div className="flex-1" />
                    <div className="w-10 shrink-0" />
                  </div>

                  {/* Client rows */}
                  {groupClients.map(client => {
                    const blocks    = clientBlocks(client.program);
                    const cogActive = hasNotes(client.id);
                    const av        = avatarBg(client.id);
                    const ini       = initials(client.name);

                    return (
                      <div key={client.id} className="flex border-b border-slate-100 group hover:bg-slate-50/40 transition-colors">
                        {/* Client column */}
                        <div className="w-52 shrink-0 sticky left-0 bg-white group-hover:bg-slate-50/40 border-r border-slate-100 px-4 py-3 z-10 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${av} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                            {ini}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{client.name}</p>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">{client.program}</span>
                          </div>
                        </div>

                        {/* Day cells */}
                        <div className="flex-1 flex">
                          {weekDays.map((day, dayIdx) => {
                            const isFuture   = day > TODAY;
                            const isHoliday  = holidayDates.has(day);
                            const indEntries = getIndEntries(client.id, day);

                            return (
                              <div
                                key={day}
                                className={`flex-1 min-w-[130px] p-2 flex flex-col gap-1.5 ${dayIdx < 4 ? 'border-r border-slate-100' : ''} ${isHoliday ? 'bg-amber-50/40' : ''}`}
                              >
                                {isHoliday ? (
                                  <div className="flex-1 flex items-center justify-center min-h-[60px]">
                                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full justify-center">
                                      <Palmtree className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="text-[11px] font-bold text-amber-600 font-mono uppercase tracking-wide">Holiday</span>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {blocks.map(block => {
                                      const entry = getEntry(client.id, day, block);
                                      return (
                                        <CensusCell
                                          key={block}
                                          block={block}
                                          entry={entry}
                                          disabled={isFuture}
                                          onUpdate={updates => onCellUpdate(client.id, day, block, entry, updates)}
                                        />
                                      );
                                    })}

                                    {indEntries.map(entry => (
                                      <CensusCell
                                        key={entry.id}
                                        block="IND"
                                        entry={entry}
                                        disabled={isFuture}
                                        onUpdate={updates => onCellUpdate(client.id, day, 'IND', entry, updates)}
                                        onRemove={() => onRemoveInd(entry.id)}
                                      />
                                    ))}

                                    {!isFuture && (
                                      <button
                                        onClick={() => onAddInd(client.id, day)}
                                        className="w-full text-[9px] font-mono font-bold text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 rounded-lg px-2 py-0.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        tabIndex={-1}
                                      >
                                        + IND
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Billing cog */}
                        <div className="w-10 shrink-0 sticky right-0 bg-white group-hover:bg-slate-50/40 border-l border-slate-100 z-10 flex items-center justify-center">
                          <button
                            onClick={() => onBillingCogClick(client.id)}
                            title="Insurance Billing Notes"
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Settings
                              className="w-3.5 h-3.5 transition-colors"
                              style={{ color: cogActive ? '#9901ff' : '#cbd5e1' }}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
