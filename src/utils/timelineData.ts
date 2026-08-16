/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Parses .planning/TASK-TRACK-TIMELINE.md into the Task Track right-rail
// timeline. Edit that file and the timeline picks it up on next reload —
// nothing to sync by hand. "Every Day" events appear on every weekday;
// a "## <Weekday>" section adds timed events specific to that day, and a
// "## <Weekday> Priorities" section adds that day's un-timed must-dos.

import timelineRaw from '../../.planning/TASK-TRACK-TIMELINE.md?raw';

export type Priority = 'P1' | 'P2';

export interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  state: 'past' | 'current' | 'future';
  priority?: Priority;
}

export interface PriorityItem {
  title: string;
  subtitle: string;
  priority: Priority;
}

interface ParsedEvent {
  hour: number;
  minute: number;
  title: string;
  subtitle: string;
  priority?: Priority;
}

const EVENT_LINE = /^-?\s*(?:\[(P[12])\]\s*)?(\d{1,2}):(\d{2})\s*([ap])m\s*[-—]\s*(.+)$/i;
const PRIORITY_LINE = /^-?\s*\[(P[12])\]\s*(.+)$/i;

function splitTitleSubtitle(text: string): [string, string] {
  const dashIdx = text.indexOf('—');
  if (dashIdx === -1) return [text.trim(), ''];
  return [text.slice(0, dashIdx).trim(), text.slice(dashIdx + 1).trim()];
}

const EVENT_SECTIONS: Record<string, ParsedEvent[]> = {};
const PRIORITY_SECTIONS: Record<string, PriorityItem[]> = {};

function parseTimelineMd(raw: string): void {
  let current: string | null = null;
  let isPrioritySection = false;

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const name = heading[1].trim();
      isPrioritySection = name.endsWith(' Priorities');
      current = isPrioritySection ? name.slice(0, -' Priorities'.length) : name;
      if (isPrioritySection) PRIORITY_SECTIONS[current] = PRIORITY_SECTIONS[current] || [];
      else EVENT_SECTIONS[current] = EVENT_SECTIONS[current] || [];
      continue;
    }
    if (!current) continue;

    if (isPrioritySection) {
      const m = line.match(PRIORITY_LINE);
      if (!m) continue;
      const [title, subtitle] = splitTitleSubtitle(m[2]);
      if (!title) continue;
      PRIORITY_SECTIONS[current].push({ priority: m[1].toUpperCase() as Priority, title, subtitle });
      continue;
    }

    const m = line.match(EVENT_LINE);
    if (!m) continue;

    let hour = parseInt(m[2], 10);
    const minute = parseInt(m[3], 10);
    const meridiem = m[4].toLowerCase();
    if (meridiem === 'p' && hour !== 12) hour += 12;
    if (meridiem === 'a' && hour === 12) hour = 0;

    const [title, subtitle] = splitTitleSubtitle(m[5]);
    EVENT_SECTIONS[current].push({
      hour,
      minute,
      title,
      subtitle,
      priority: m[1] ? (m[1].toUpperCase() as Priority) : undefined,
    });
  }
}

parseTimelineMd(timelineRaw);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function hasContent(dayName: string): boolean {
  return Boolean(EVENT_SECTIONS[dayName]?.length || PRIORITY_SECTIONS[dayName]?.length);
}

// Weekends (and any weekday left blank) have no section of their own — fall
// forward to the next day that does have content and show it as a preview,
// rather than rendering an empty rail.
export interface ScheduleDay {
  dayName: string;
  isPreview: boolean;
}

export function getScheduleDay(now: Date = new Date()): ScheduleDay {
  const todayName = DAY_NAMES[now.getDay()];
  if (hasContent(todayName)) return { dayName: todayName, isPreview: false };

  for (let offset = 1; offset <= 6; offset++) {
    const name = DAY_NAMES[(now.getDay() + offset) % 7];
    if (hasContent(name)) return { dayName: name, isPreview: true };
  }
  return { dayName: todayName, isPreview: false };
}

export function getTodaysTimeline(now: Date = new Date()): TimelineEvent[] {
  const { dayName, isPreview } = getScheduleDay(now);
  const combined = [...(EVENT_SECTIONS['Every Day'] || []), ...(EVENT_SECTIONS[dayName] || [])]
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  const withDates = combined.map(e => ({
    ...e,
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), e.hour, e.minute),
  }));

  let currentIdx = -1;
  if (!isPreview) {
    withDates.forEach((e, i) => { if (e.date.getTime() <= now.getTime()) currentIdx = i; });
  }

  return withDates.map((e, i) => ({
    time: e.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    title: e.title,
    subtitle: e.subtitle,
    state: isPreview ? 'future' : i < currentIdx ? 'past' : i === currentIdx ? 'current' : 'future',
    priority: e.priority,
  }));
}

export function getTodaysPriorities(now: Date = new Date()): PriorityItem[] {
  const { dayName } = getScheduleDay(now);
  return PRIORITY_SECTIONS[dayName] || [];
}
