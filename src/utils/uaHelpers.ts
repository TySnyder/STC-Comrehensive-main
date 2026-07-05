import { Client, CensusEntry, UaAssignment, UaFrequency } from '../types';
import { addDays, weekDaysFrom } from './weekHelpers';

/** Frequencies that get in-house weekly assignments. */
export function needsAssignment(freq: UaFrequency | undefined): boolean {
  return freq === 'twice-weekly' || freq === 'weekly' || freq === 'monthly';
}

export function assignmentsPerWeek(freq: UaFrequency): number {
  return freq === 'twice-weekly' ? 2 : 1;
}

function pickDistinct(days: string[], n: number, rand: () => number): string[] {
  const pool = [...days];
  const picked: string[] = [];
  while (picked.length < n && pool.length > 0) {
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort();
}

/**
 * Randomize this week's UA assignments for every client whose frequency calls
 * for one. Clients who already have an assignment this week are skipped;
 * monthly clients are skipped if they already have an assignment in the
 * calendar month of `weekStart`.
 */
export function generateWeekAssignments(
  clients: Client[],
  weekStart: string,
  existing: UaAssignment[],
  rand: () => number = Math.random
): UaAssignment[] {
  const days = weekDaysFrom(weekStart);
  const month = weekStart.slice(0, 7);
  const created: UaAssignment[] = [];

  for (const client of clients) {
    const freq = client.uaFrequency;
    if (!needsAssignment(freq)) continue;
    const mine = existing.filter(a => a.clientId === client.id);
    if (mine.some(a => a.weekStart === weekStart)) continue;
    if (freq === 'monthly' && mine.some(a => a.assignedDate.slice(0, 7) === month)) continue;

    const dates = pickDistinct(days, assignmentsPerWeek(freq!), rand);
    dates.forEach((date, i) => created.push({
      id: `ua-${client.id}-${weekStart}-${i}`,
      clientId: client.id,
      weekStart,
      assignedDate: date,
      status: 'pending',
      billed: false,
    }));
  }
  return created;
}

/** Pick a new random weekday for one assignment, avoiding its current day and any sibling days. */
export function rerollDate(
  assignment: UaAssignment,
  siblings: UaAssignment[],
  rand: () => number = Math.random
): string {
  const taken = new Set([
    assignment.assignedDate,
    ...siblings.filter(a => a.clientId === assignment.clientId && a.weekStart === assignment.weekStart && a.id !== assignment.id)
      .map(a => a.assignedDate),
  ]);
  const options = weekDaysFrom(assignment.weekStart).filter(d => !taken.has(d));
  if (options.length === 0) return assignment.assignedDate;
  return options[Math.floor(rand() * options.length)];
}

function nextWeekday(iso: string): string {
  let d = addDays(iso, 1);
  const dow = new Date(d + 'T12:00:00').getDay();
  if (dow === 6) d = addDays(d, 2);      // Sat → Mon
  else if (dow === 0) d = addDays(d, 1); // Sun → Mon
  return d;
}

/** A client is absent for UA purposes when census has entries that day and none are Present. */
export function isAbsentOn(censusEntries: CensusEntry[], clientId: string, date: string): boolean {
  const dayEntries = censusEntries.filter(e => e.clientId === clientId && e.date === date && e.status !== null);
  if (dayEntries.length === 0) return false;
  return dayEntries.every(e => e.status === 'Absent');
}

/**
 * Automatic absent-day rollover: if the census shows the client absent on the
 * assigned day, the UA rolls to the next program weekday (repeatedly, capped).
 */
export function effectiveUaDate(
  assignment: UaAssignment,
  censusEntries: CensusEntry[]
): { date: string; rolledFrom?: string } {
  if (assignment.status === 'completed') return { date: assignment.assignedDate };
  let date = assignment.assignedDate;
  for (let hops = 0; hops < 10 && isAbsentOn(censusEntries, assignment.clientId, date); hops++) {
    date = nextWeekday(date);
  }
  return date === assignment.assignedDate ? { date } : { date, rolledFrom: assignment.assignedDate };
}
