/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AttendanceEntry, Client } from '../types';

// Sourced from doc 02 (running-attendance): a full TX day = both blocks of a
// two-block program attended; a half day = only one of the two blocks (the
// spreadsheet's rare ".5T" case). Single-block programs (DOP/EOP/other) count
// 1 for any Present entry. Grouping by block presence (not client.program) so
// this stays correct across a program step-down mid-history.
export const DEFAULT_GRADUATION_TRACK = 85;

// Per-client TX-day target — clients choose a 30- or 85-day track at
// admission (types.ts: Client.graduationTrack); undefined = not yet set.
export function graduationTarget(client: Client): number {
  return client.graduationTrack ?? DEFAULT_GRADUATION_TRACK;
}

export function computeTxDaysAttended(client: Client): number {
  const byDate = new Map<string, AttendanceEntry[]>();
  for (const e of client.attendanceHistory) {
    const arr = byDate.get(e.date) ?? [];
    arr.push(e);
    byDate.set(e.date, arr);
  }
  let total = 0;
  for (const entries of byDate.values()) {
    const blockEntries = entries.filter(e => e.block === 'A' || e.block === 'B');
    if (blockEntries.length > 0) {
      const presentCount = blockEntries.filter(e => e.status === 'Present').length;
      total += presentCount >= 2 ? 1 : presentCount === 1 ? 0.5 : 0;
    } else if (entries.some(e => e.status === 'Present')) {
      total += 1;
    }
  }
  return total;
}

export interface AttendanceCounts {
  present: number;
  absent: number;
  tardy: number;
  virtual: number;
  excused: number;
  total: number;
}

// Roster convention (see ClientAttendanceCard/BlockCell): no entry yet today
// defaults to Present.
export function summarizeAttendance(entries: (AttendanceEntry | undefined)[]): AttendanceCounts {
  const counts: AttendanceCounts = { present: 0, absent: 0, tardy: 0, virtual: 0, excused: 0, total: entries.length };
  for (const e of entries) {
    if (e?.status === 'Absent') {
      counts.absent++;
      if (e.excused) counts.excused++;
    } else {
      counts.present++;
    }
    if (e?.tardy) counts.tardy++;
    if (e?.virtual) counts.virtual++;
  }
  return counts;
}

// Reason templates pulled from real seed/history notes — not invented copy.
export const ATTENDANCE_NOTE_TEMPLATES = [
  'Medical appointment',
  'Traffic delays',
  'Public transit delays',
  'Left early',
  'Left after first block',
  'Symptom flare-up',
  'Work conflict',
  'Transportation issue',
];
