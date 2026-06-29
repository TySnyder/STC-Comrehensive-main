import React from 'react';
import { Settings } from 'lucide-react';
import { Client, CensusEntry, InsuranceBillingNote, ProgramBlock } from '../../types';
import { clientBlocks } from './blockStyles';
import CensusCell from './CensusCell';

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface CensusGridProps {
  clients: Client[];
  weekDays: string[];          // 5 YYYY-MM-DD strings, Mon–Fri
  weekStart: string;           // YYYY-MM-DD Monday
  censusEntries: CensusEntry[];
  billingNotes: InsuranceBillingNote[];
  onCellClick: (
    clientId: string,
    date: string,
    block: ProgramBlock,
    entry: CensusEntry | null,
    rect: DOMRect
  ) => void;
  onAddInd: (clientId: string, date: string) => void;
  onBillingCogClick: (clientId: string) => void;
}

function formatDayHeader(isoDate: string, i: number): { abbr: string; dateLabel: string } {
  const d = new Date(isoDate + 'T12:00:00');
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return { abbr: DAY_ABBR[i], dateLabel: `${month} ${d.getDate()}` };
}

export default function CensusGrid({
  clients,
  weekDays,
  weekStart,
  censusEntries,
  billingNotes,
  onCellClick,
  onAddInd,
  onBillingCogClick,
}: CensusGridProps) {
  const sfClients  = clients.filter(c => c.location === 'SF');
  const abqClients = clients.filter(c => c.location === 'ABQ');

  const getEntry = (clientId: string, date: string, block: ProgramBlock): CensusEntry | null =>
    censusEntries.find(e => e.clientId === clientId && e.date === date && e.block === block) ?? null;

  const getIndEntries = (clientId: string, date: string): CensusEntry[] =>
    censusEntries.filter(e => e.clientId === clientId && e.date === date && e.block === 'IND');

  const hasNotes = (clientId: string): boolean => {
    const n = billingNotes.find(b => b.clientId === clientId && b.weekStart === weekStart);
    return !!(n && n.notes.trim());
  };

  function renderGroup(groupClients: Client[], location: 'SF' | 'ABQ') {
    const locationLabel = location === 'SF' ? 'SF — San Francisco' : 'ABQ — Albuquerque';

    return (
      <React.Fragment key={location}>
        {/* Location section header */}
        <div className="flex bg-slate-50 border-y border-slate-200">
          <div className="w-[216px] shrink-0 sticky left-0 bg-slate-50 px-4 py-2 z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              {locationLabel}
            </span>
          </div>
          <div className="flex-1" />
          <div className="w-12 shrink-0 sticky right-0 bg-slate-50" />
        </div>

        {/* Client rows */}
        {groupClients.map(client => {
          const blocks = clientBlocks(client.program);
          const cogActive = hasNotes(client.id);

          return (
            <div key={client.id} className="flex border-b border-slate-100 group hover:bg-slate-50/60 transition-colors">
              {/* Sticky client name column */}
              <div className="w-[216px] shrink-0 sticky left-0 bg-white group-hover:bg-slate-50/60 border-r border-slate-100 px-4 py-3 z-10 flex flex-col justify-start">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{client.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{client.program}</p>
              </div>

              {/* Day cells */}
              <div className="flex-1 flex">
                {weekDays.map((day, dayIdx) => {
                  const indEntries = getIndEntries(client.id, day);

                  return (
                    <div
                      key={day}
                      className={`flex-1 min-w-[140px] px-1.5 py-2 flex flex-col gap-0.5 ${
                        dayIdx < 4 ? 'border-r border-slate-100' : ''
                      }`}
                    >
                      {/* Program block chips */}
                      {blocks.map(block => {
                        const entry = getEntry(client.id, day, block);
                        return (
                          <CensusCell
                            key={block}
                            block={block}
                            entry={entry}
                            onClick={rect => onCellClick(client.id, day, block, entry, rect)}
                          />
                        );
                      })}

                      {/* IND session chips */}
                      {indEntries.map(entry => (
                        <CensusCell
                          key={entry.id}
                          block="IND"
                          entry={entry}
                          onClick={rect => onCellClick(client.id, day, 'IND', entry, rect)}
                        />
                      ))}

                      {/* + IND hover button */}
                      <button
                        onClick={() => onAddInd(client.id, day)}
                        className="w-full text-left text-[9px] font-mono font-bold text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 rounded px-2 py-0.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        tabIndex={-1}
                      >
                        + IND
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sticky billing cog column */}
              <div className="w-12 shrink-0 sticky right-0 bg-white group-hover:bg-slate-50/60 border-l border-slate-100 z-10 flex items-center justify-center">
                <button
                  onClick={() => onBillingCogClick(client.id)}
                  title="Insurance Billing Notes"
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Settings
                    className="w-4 h-4 transition-colors"
                    style={{ color: cogActive ? '#9901ff' : '#94a3b8' }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </React.Fragment>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[916px]">

          {/* Column header row */}
          <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20">
            <div className="w-[216px] shrink-0 sticky left-0 bg-white border-r border-slate-100 px-4 py-3 z-30">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Client
              </span>
            </div>
            <div className="flex-1 flex">
              {weekDays.map((day, i) => {
                const { abbr, dateLabel } = formatDayHeader(day, i);
                return (
                  <div key={day} className={`flex-1 min-w-[140px] px-3 py-3 ${i < 4 ? 'border-r border-slate-100' : ''}`}>
                    <p className="text-[11px] font-bold text-slate-600">{abbr}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{dateLabel}</p>
                  </div>
                );
              })}
            </div>
            <div className="w-12 shrink-0 sticky right-0 bg-white border-l border-slate-100 z-30 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>

          {sfClients.length > 0  && renderGroup(sfClients, 'SF')}
          {abqClients.length > 0 && renderGroup(abqClients, 'ABQ')}

        </div>
      </div>
    </div>
  );
}
