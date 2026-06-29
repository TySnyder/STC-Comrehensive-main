import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Client, CensusEntry, InsuranceBillingNote, ProgramBlock } from '../types';
import CensusGrid from './census/CensusGrid';
import CellCard from './census/CellCard';
import InsuranceBillingModal from './census/InsuranceBillingModal';

// ─── Week helpers ────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMonday(fromIso: string): Date {
  const d = new Date(fromIso + 'T12:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return isoDate.slice(0, 4) + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function weekDaysFrom(monday: string): string[] {
  return [0, 1, 2, 3, 4].map(n => addDays(monday, n));
}

function formatWeekRange(monday: string): string {
  const fri = addDays(monday, 4);
  const monD = new Date(monday + 'T12:00:00');
  const friD = new Date(fri    + 'T12:00:00');
  const monLabel = monD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const friLabel = friD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Mon ${monLabel} – Fri ${friLabel}`;
}

// ─── Popover positioning ─────────────────────────────────────────────────────

const CARD_W = 208;  // w-52
const CARD_H = 300;  // approx, card shrinks with content

function computePos(rect: DOMRect): { top: number; left: number } {
  const margin = 8;
  let left = rect.right + margin;
  let top  = rect.top + rect.height / 2 - CARD_H / 2;

  if (left + CARD_W > window.innerWidth - margin) {
    left = rect.left - CARD_W - margin;
  }
  if (top + CARD_H > window.innerHeight - margin) {
    top = window.innerHeight - CARD_H - margin;
  }
  if (top < margin) top = margin;
  if (left < margin) left = margin;

  return { top, left };
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PopoverState {
  clientId: string;
  date: string;
  block: ProgramBlock;
  entry: CensusEntry | null;
  top: number;
  left: number;
}

interface CensusViewProps {
  clients: Client[];
  censusEntries: CensusEntry[];
  billingNotes: InsuranceBillingNote[];
  onSaveCensusEntry: (entry: CensusEntry) => void;
  onUpdateBillingNote: (note: InsuranceBillingNote) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CensusView({
  clients,
  censusEntries,
  billingNotes,
  onSaveCensusEntry,
  onUpdateBillingNote,
}: CensusViewProps) {
  const todayMonday = isoDate(getMonday(new Date().toISOString().slice(0, 10)));

  const [weekStart, setWeekStart] = useState<string>(todayMonday);
  const [popover, setPopover]     = useState<PopoverState | null>(null);
  const [billingClientId, setBillingClientId] = useState<string | null>(null);

  const weekDays = weekDaysFrom(weekStart);

  // Navigate weeks
  const prevWeek = () => setWeekStart(w => addDays(w, -7));
  const nextWeek = () => setWeekStart(w => addDays(w,  7));

  // Open the edit card
  const handleCellClick = useCallback((
    clientId: string,
    date: string,
    block: ProgramBlock,
    entry: CensusEntry | null,
    rect: DOMRect,
  ) => {
    // Toggle off if same cell re-clicked
    if (
      popover &&
      popover.clientId === clientId &&
      popover.date === date &&
      popover.block === block &&
      popover.entry?.id === entry?.id
    ) {
      setPopover(null);
      return;
    }
    const { top, left } = computePos(rect);
    setPopover({ clientId, date, block, entry, top, left });
  }, [popover]);

  // Save an entry update from CellCard
  const handleCellUpdate = useCallback((updates: Partial<CensusEntry>) => {
    if (!popover) return;

    // Build or reuse the base entry
    const base: CensusEntry = popover.entry ?? {
      id: `ce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId: popover.clientId,
      date: popover.date,
      block: popover.block,
      status: null,
      excused: false,
      tardy: false,
      virtualMode: 'none',
      autoFilled: false,
    };

    const updated: CensusEntry = { ...base, ...updates };

    // Track entry in popover state so re-clicks reuse the same ID
    setPopover(s => s ? { ...s, entry: updated } : null);

    onSaveCensusEntry(updated);

    // Auto-fill: DIOP → DOP, EIOP → EOP
    if (updated.block === 'DIOP' || updated.block === 'EIOP') {
      const pairBlock: ProgramBlock = updated.block === 'DIOP' ? 'DOP' : 'EOP';
      const pairEntry = censusEntries.find(e =>
        e.clientId === updated.clientId &&
        e.date    === updated.date    &&
        e.block   === pairBlock
      );
      // Only auto-fill if pair is absent or was previously auto-filled
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
  }, [popover, censusEntries, onSaveCensusEntry]);

  // Add a new IND session entry and open the popover
  const handleAddInd = useCallback((clientId: string, date: string) => {
    // Create a blank entry immediately so it shows in the grid
    const newEntry: CensusEntry = {
      id: `ce-ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      clientId,
      date,
      block: 'IND',
      status: null,
      excused: false,
      tardy: false,
      virtualMode: 'none',
      autoFilled: false,
    };
    onSaveCensusEntry(newEntry);
    // The grid will re-render with the new entry; open popover for it
    // Use a small timeout so the DOM cell renders before getBoundingClientRect is needed
    // (popover position isn't critical here — open it near the top of screen as fallback)
    setPopover({
      clientId,
      date,
      block: 'IND',
      entry: newEntry,
      top: window.innerHeight / 2 - CARD_H / 2,
      left: window.innerWidth  / 2 - CARD_W / 2,
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
      {/* Week navigation bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800 leading-tight">Weekly Census</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(todayMonday)}
            className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-lg transition-colors ${
              weekStart === todayMonday
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <CensusGrid
        clients={clients}
        weekDays={weekDays}
        weekStart={weekStart}
        censusEntries={censusEntries.filter(e => weekDays.includes(e.date))}
        billingNotes={billingNotes}
        onCellClick={handleCellClick}
        onAddInd={handleAddInd}
        onBillingCogClick={setBillingClientId}
      />

      {/* Floating CellCard popover */}
      {popover && (
        <>
          {/* Invisible backdrop to close on click-outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopover(null)}
          />
          <div
            className="fixed z-50"
            style={{ top: popover.top, left: popover.left }}
          >
            <CellCard
              block={popover.block}
              entry={popover.entry}
              onUpdate={handleCellUpdate}
            />
          </div>
        </>
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
