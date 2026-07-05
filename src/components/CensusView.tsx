import React, { useState, useCallback, useEffect } from 'react';
import { LayoutGrid, BarChart3, Milestone, Activity } from 'lucide-react';
import { Client, CensusEntry, InsuranceBillingNote, ProgramBlock } from '../types';
import { adaptClientWithEntries, TempClient, DailyAttendance } from '../utils/clientAdapter';
import { getMonday, addDays, weekDaysFrom, weekNavLabel, formatWeekRange } from '../utils/weekHelpers';
import WeekNavPill from './shared/WeekNavPill';
import CensusGrid from './census/CensusGrid';
import InsuranceBillingModal from './census/InsuranceBillingModal';
import WeeklyCensusGrid from './census/WeeklyCensusGrid';
import AttendanceTotals from './census/AttendanceTotals';
import TemporalRunway from './census/TemporalRunway';
import BentoDashboard from './census/BentoDashboard';
import QuickAdmitCard from './census/QuickAdmitModal';
import AuditSignoff from './census/AuditSignoff';

// ─── Sub-tab config ──────────────────────────────────────────────────────────

type CensusSubTab = 'grid' | 'roster' | 'totals' | 'runway' | 'analytics';

const SUB_TABS: { id: CensusSubTab; label: string; icon: React.ReactNode }[] = [
  { id: 'grid',      label: 'Census Grid',   icon: <LayoutGrid  className="w-3.5 h-3.5" /> },
  { id: 'totals',    label: 'Totals',        icon: <BarChart3   className="w-3.5 h-3.5" /> },
  { id: 'runway',    label: 'Runway',        icon: <Milestone   className="w-3.5 h-3.5" /> },
  { id: 'analytics', label: 'Analytics',     icon: <Activity    className="w-3.5 h-3.5" /> },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface CensusViewProps {
  clients: Client[];
  censusEntries: CensusEntry[];
  billingNotes: InsuranceBillingNote[];
  onSaveCensusEntry: (entry: CensusEntry) => void;
  onRemoveCensusEntry: (entryId: string) => void;
  onUpdateBillingNote: (note: InsuranceBillingNote) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CensusView({
  clients,
  censusEntries,
  billingNotes,
  onSaveCensusEntry,
  onRemoveCensusEntry,
  onUpdateBillingNote,
}: CensusViewProps) {
  const todayMonday = getMonday(new Date().toISOString().slice(0, 10));

  const [censusSubTab,    setCensusSubTab]    = useState<CensusSubTab>('grid');
  const [tempClients,     setTempClients]     = useState<TempClient[]>(() => clients.map(c => adaptClientWithEntries(c, [])));
  const [quickAdmitOpen,  setQuickAdmitOpen]  = useState(false);
  const [weekStart,       setWeekStart]       = useState<string>(todayMonday);
  const [billingClientId, setBillingClientId] = useState<string | null>(null);

  useEffect(() => {
    setTempClients(clients.map(c => adaptClientWithEntries(c, censusEntries)));
  }, [clients, censusEntries]);

  const handleUpdateTempClient = useCallback((updated: TempClient) => {
    setTempClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const handleUpdateTempAttendance = useCallback((clientId: string, day: keyof TempClient['weeklyAttendance'], data: DailyAttendance) => {
    setTempClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return { ...c, weeklyAttendance: { ...c.weeklyAttendance, [day]: data } };
    }));
  }, []);

  const handleAdmitTempClient = useCallback((newClient: TempClient) => {
    setTempClients(prev => [...prev, newClient]);
  }, []);

  const weekDays = weekDaysFrom(weekStart);

  // Navigate weeks
  const prevWeek = () => setWeekStart(w => addDays(w, -7));
  const nextWeek = () => setWeekStart(w => addDays(w,  7));

  const handleGridCellUpdate = useCallback((
    clientId: string,
    date: string,
    block: ProgramBlock,
    existingEntry: CensusEntry | null,
    updates: Partial<CensusEntry>,
  ) => {
    const base: CensusEntry = existingEntry ?? {
      id: `ce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      date,
      block,
      status: null,
      excused: false,
      tardy: false,
      virtualMode: 'none',
      autoFilled: false,
    };
    const updated: CensusEntry = { ...base, ...updates };
    onSaveCensusEntry(updated);

    // Auto-fill: DIOP → DOP, EIOP → EOP
    if (updated.block === 'DIOP' || updated.block === 'EIOP') {
      const pairBlock: ProgramBlock = updated.block === 'DIOP' ? 'DOP' : 'EOP';
      const pairEntry = censusEntries.find(e =>
        e.clientId === updated.clientId &&
        e.date     === updated.date     &&
        e.block    === pairBlock
      );
      if (!pairEntry || pairEntry.autoFilled) {
        onSaveCensusEntry({
          id: pairEntry?.id ?? `ce-auto-${Date.now()}`,
          clientId: updated.clientId,
          date: updated.date,
          block: pairBlock,
          status: updated.status,
          excused: updated.excused,
          tardy: updated.tardy,
          virtualMode: updated.virtualMode,
          specialCode: updated.specialCode,
          autoFilled: true,
        });
      }
    }
  }, [censusEntries, onSaveCensusEntry]);

  const handleAddInd = useCallback((clientId: string, date: string) => {
    onSaveCensusEntry({
      id: `ce-ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      date,
      block: 'IND',
      status: null,
      excused: false,
      tardy: false,
      virtualMode: 'none',
      autoFilled: false,
    });
  }, [onSaveCensusEntry]);

  // Billing notes
  const billingClient = billingClientId ? clients.find(c => c.id === billingClientId) : null;
  const billingNote   = billingClientId
    ? billingNotes.find(n => n.clientId === billingClientId && n.weekStart === weekStart)
    : undefined;

  const handleSaveBillingNote = (notes: string) => {
    if (!billingClientId) return;
    onUpdateBillingNote({ clientId: billingClientId, weekStart, notes });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800 leading-tight">Weekly Census</h1>
          {censusSubTab === 'grid' && weekStart !== todayMonday && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">{formatWeekRange(weekStart)}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCensusSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                censusSubTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Week nav — only shown on the grid tab */}
      {censusSubTab === 'grid' && (() => {
        const { month, startDay, endDay } = weekNavLabel(weekStart);
        return (
          <div className="flex items-center justify-between gap-4">
            <AuditSignoff weekEnd={addDays(weekStart, 4)} />
            <WeekNavPill
              monthLabel={month}
              startLabel={startDay}
              endLabel={endDay}
              isToday={weekStart === todayMonday}
              onPrev={prevWeek}
              onNext={nextWeek}
              onToday={() => setWeekStart(todayMonday)}
            />
          </div>
        );
      })()}

      {/* Sub-tab content */}
      {censusSubTab === 'grid' && (
        <CensusGrid
          clients={clients}
          weekDays={weekDays}
          weekStart={weekStart}
          censusEntries={censusEntries.filter(e => weekDays.includes(e.date))}
          billingNotes={billingNotes}
          onCellUpdate={handleGridCellUpdate}
          onRemoveInd={onRemoveCensusEntry}
          onAddInd={handleAddInd}
          onBillingCogClick={setBillingClientId}
        />
      )}

      {censusSubTab === 'roster' && (
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <WeeklyCensusGrid
              clients={tempClients}
              onUpdateAttendance={handleUpdateTempAttendance}
              onQuickAdmit={() => setQuickAdmitOpen(true)}
            />
          </div>
          {quickAdmitOpen && (
            <div className="shrink-0">
              <QuickAdmitCard
                onClose={() => setQuickAdmitOpen(false)}
                onAdmit={handleAdmitTempClient}
              />
            </div>
          )}
        </div>
      )}

      {censusSubTab === 'totals' && (
        <AttendanceTotals
          clients={tempClients}
          onUpdateClient={handleUpdateTempClient}
        />
      )}

      {censusSubTab === 'runway' && (
        <TemporalRunway clients={tempClients} />
      )}

      {censusSubTab === 'analytics' && (
        <BentoDashboard
          clients={tempClients}
          onSelectSubTab={(tab) => setCensusSubTab(tab as CensusSubTab)}
        />
      )}

      {/* Insurance Billing Modal */}
      {billingClientId && billingClient && (
        <InsuranceBillingModal
          clientName={billingClient.name}
          weekStart={weekStart}
          initialNotes={billingNote?.notes ?? ''}
          onSave={handleSaveBillingNote}
          onClose={() => setBillingClientId(null)}
        />
      )}

    </div>
  );
}
