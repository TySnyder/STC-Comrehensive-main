/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Parses .planning/TASK-TRACK-TIMELINE.md into the Task Track right-rail
// timeline. Edit that file and the timeline picks it up on next reload —
// nothing to sync by hand. "Every Day" events appear on every weekday;
// a "## <Weekday>" section adds events specific to that day.

import timelineRaw from '../../.planning/TASK-TRACK-TIMELINE.md?raw';

export interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  state: 'past' | 'current' | 'future';
}

interface ParsedEvent {
  hour: number;
  minute: number;
  title: string;
  subtitle: string;
}

const EVENT_LINE = /^-?\s*(\d{1,2}):(\d{2})\s*([ap])m\s*[-—]\s*(.+)$/i;

function parseSections(raw: string): Record<string, ParsedEvent[]> {
  const sections: Record<string, ParsedEvent[]> = {};
  let current: string | null = null;

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = heading[1].trim();
      sections[current] = sections[current] || [];
      continue;
    }
    if (!current) continue;

    const m = line.match(EVENT_LINE);
    if (!m) continue;

    let hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const meridiem = m[3].toLowerCase();
    if (meridiem === 'p' && hour !== 12) hour += 12;
    if (meridiem === 'a' && hour === 12) hour = 0;

    const [titlePart, subtitlePart] = m[4].split('—').map(s => s.trim());
    sections[current].push({ hour, minute, title: titlePart, subtitle: subtitlePart || '' });
  }
  return sections;
}

const SECTIONS = parseSections(timelineRaw);
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getTodaysTimeline(now: Date = new Date()): TimelineEvent[] {
  const dayName = DAY_NAMES[now.getDay()];
  const combined = [...(SECTIONS['Every Day'] || []), ...(SECTIONS[dayName] || [])]
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  const withDates = combined.map(e => ({
    ...e,
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), e.hour, e.minute),
  }));

  let currentIdx = -1;
  withDates.forEach((e, i) => { if (e.date.getTime() <= now.getTime()) currentIdx = i; });

  return withDates.map((e, i) => ({
    time: e.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    title: e.title,
    subtitle: e.subtitle,
    state: i < currentIdx ? 'past' : i === currentIdx ? 'current' : 'future',
  }));
}
