/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, AttendanceEntry, CensusEntry } from '../types';
import { estDischargeDate } from './dcDateHelpers';
import { isoDate, getMonday, weekDaysFrom } from './weekHelpers';

// ─────────────────────────────────────────────────────────────────────────────
// TempClient shape — consumed by analytics sub-views.
// Derived from the source-of-truth Client; never stored in main state.
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Absent' | 'Tardy' | 'Excused' | 'None';

export interface DailyAttendance {
  status: AttendanceStatus;
  virtual: boolean;
  tardyMinutes?: number;
}

export interface TempClient {
  id: string;
  name: string;
  initials: string;
  program: string;
  doctor: string;
  fullDaysAtt: number;
  excused: number;
  unexcused: number;
  halfDaysAtt: number;
  halfExc: number;
  halfUnexc: number;
  possible: number;
  virtualCount: number;
  tardyCount: number;
  dcProjectionDate: string;
  dcProjectionStatus: 'On Track' | 'Extended Care' | 'At Risk';
  clinicalRunwayDays: number;
  completedPercentage: number;
  currentPositionPercentage: number;
  stalled: boolean;
  avatarBg: string;
  weeklyAttendance: {
    Mon: DailyAttendance;
    Tue: DailyAttendance;
    Wed: DailyAttendance;
    Thu: DailyAttendance;
    Fri: DailyAttendance;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600',
  'bg-blue-600',   'bg-teal-600',    'bg-rose-600',
  'bg-amber-600',  'bg-cyan-600',
];

function deterministicColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function dailyFromHistory(history: AttendanceEntry[], date: string): DailyAttendance {
  const entries = history.filter(e => e.date === date);
  if (entries.length === 0) return { status: 'None', virtual: false };
  const primary = entries.find(e => e.block === 'A') ?? entries[0];
  const virtual = entries.some(e => e.virtual === true);
  if (primary.status === 'Present') {
    if (primary.tardy) return { status: 'Tardy', virtual, tardyMinutes: 10 };
    return { status: 'Present', virtual };
  }
  if (primary.excused) return { status: 'Excused', virtual: false };
  return { status: 'Absent', virtual: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main adapter — pure function, no side effects
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Internal computation — works on any history array
// ─────────────────────────────────────────────────────────────────────────────

function computeTempClient(client: Client, history: AttendanceEntry[]): TempClient {
  const isTwoBlock = client.program === 'EIOP' || client.program === 'DIOP';
  const uniqueDates = [...new Set(history.map(e => e.date))];

  let fullDaysAtt = 0;
  let excused = 0;
  let unexcused = 0;
  let halfDaysAtt = 0;
  let halfExc = 0;
  let halfUnexc = 0;
  let virtualCount = 0;
  let tardyCount = 0;

  for (const date of uniqueDates) {
    const dayEntries = history.filter(e => e.date === date);

    if (dayEntries.some(e => e.virtual)) virtualCount++;
    if (dayEntries.some(e => e.tardy)) tardyCount++;

    if (isTwoBlock) {
      const blockA = dayEntries.find(e => e.block === 'A');
      const blockB = dayEntries.find(e => e.block === 'B');
      const aPresent = blockA?.status === 'Present';
      const bPresent = blockB?.status === 'Present';

      if (aPresent && bPresent) {
        fullDaysAtt++;
      } else if (aPresent || bPresent) {
        halfDaysAtt++;
        const absentBlock = aPresent ? blockB : blockA;
        if (absentBlock?.excused) halfExc++;
        else halfUnexc++;
      } else {
        if (blockA?.excused || blockB?.excused) excused++;
        else unexcused++;
      }
    } else {
      const entry = dayEntries[0];
      if (!entry) continue;
      if (entry.status === 'Present') fullDaysAtt++;
      else if (entry.excused) excused++;
      else unexcused++;
    }
  }

  const possible = uniqueDates.length;
  const completedPercentage = possible > 0 ? Math.round((fullDaysAtt / possible) * 100) : 0;

  const dcProjectionStatus: TempClient['dcProjectionStatus'] =
    client.riskFlag?.severity === 'High'   ? 'At Risk' :
    client.riskFlag?.severity === 'Medium' ? 'Extended Care' :
    'On Track';

  const dischargeDate = new Date(estDischargeDate(client) + 'T12:00:00');
  const today = new Date();
  const clinicalRunwayDays = Math.max(
    0,
    Math.round((dischargeDate.getTime() - today.getTime()) / 86_400_000)
  );
  const dcProjectionDate = dischargeDate.toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });

  const [mon, tue, wed, thu, fri] = weekDaysFrom(getMonday(isoDate(today)));
  const weeklyAttendance = {
    Mon: dailyFromHistory(history, mon),
    Tue: dailyFromHistory(history, tue),
    Wed: dailyFromHistory(history, wed),
    Thu: dailyFromHistory(history, thu),
    Fri: dailyFromHistory(history, fri),
  };

  return {
    id: client.id,
    name: client.name,
    initials: deriveInitials(client.name),
    program: client.program,
    doctor: client.primaryTherapist,
    fullDaysAtt,
    excused,
    unexcused,
    halfDaysAtt,
    halfExc,
    halfUnexc,
    possible,
    virtualCount,
    tardyCount,
    dcProjectionDate,
    dcProjectionStatus,
    clinicalRunwayDays,
    completedPercentage,
    currentPositionPercentage: Math.min(95, completedPercentage + 5),
    stalled: client.riskFlag?.severity === 'High',
    avatarBg: deterministicColor(client.id),
    weeklyAttendance,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public adapters
// ─────────────────────────────────────────────────────────────────────────────

export function adaptClient(client: Client): TempClient {
  return computeTempClient(client, client.attendanceHistory);
}

/** Merges live CensusEntry records on top of historic AttendanceHistory so
 *  the Totals / Analytics views reflect attendance recorded in the census grid. */
export function adaptClientWithEntries(client: Client, allCensusEntries: CensusEntry[]): TempClient {
  const clientEntries = allCensusEntries.filter(e => e.clientId === client.id && e.status !== null);
  const censusDates   = new Set(clientEntries.map(e => e.date));

  // Keep historic entries only for dates not yet recorded in the census grid
  const historicBase = client.attendanceHistory.filter(e => !censusDates.has(e.date));

  // Map CensusEntry block names → AttendanceEntry block keys
  const blockMap: Partial<Record<string, 'A' | 'B'>> = {
    DIOP: 'A', EIOP: 'A',   // primary block
    DOP:  'B', EOP:  'B',   // auto-fill block
  };

  const censusAsHistory: AttendanceEntry[] = clientEntries.map(e => ({
    date:    e.date,
    block:   blockMap[e.block],
    status:  e.status as 'Present' | 'Absent',
    tardy:   e.tardy   ?? false,
    virtual: e.virtualMode !== 'none',
    excused: e.excused ?? false,
  }));

  return computeTempClient(client, [...historicBase, ...censusAsHistory]);
}
