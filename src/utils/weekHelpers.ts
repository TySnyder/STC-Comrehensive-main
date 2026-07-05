export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getMonday(fromIso: string): string {
  const d = new Date(fromIso + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return isoDate(d);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function weekDaysFrom(monday: string): string[] {
  return [0, 1, 2, 3, 4].map(n => addDays(monday, n));
}

export function ordinal(n: number): string {
  const v = n % 100;
  const suffix = (v >= 11 && v <= 13) ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix}`;
}

export function weekNavLabel(monday: string): { month: string; startDay: string; endDay: string } {
  const fri  = addDays(monday, 4);
  const monD = new Date(monday + 'T12:00:00');
  const friD = new Date(fri    + 'T12:00:00');
  const monMonth = monD.toLocaleDateString('en-US', { month: 'long' });
  const friMonth = friD.toLocaleDateString('en-US', { month: 'long' });
  const month = monMonth === friMonth ? monMonth : `${monMonth.slice(0, 3)} / ${friMonth.slice(0, 3)}`;
  return { month, startDay: ordinal(monD.getDate()), endDay: ordinal(friD.getDate()) };
}

// 4-week block: Mon of week 0 → Fri of week 3 (25 days later)
export function fourWeekNavLabel(monday: string): { month: string; startDay: string; endDay: string } {
  const endFri = addDays(monday, 25);
  const monD   = new Date(monday  + 'T12:00:00');
  const endD   = new Date(endFri  + 'T12:00:00');
  const monMonth = monD.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = endD.toLocaleDateString('en-US', { month: 'long' });
  const month = monMonth === endMonth ? monMonth : `${monMonth.slice(0, 3)} / ${endMonth.slice(0, 3)}`;
  return { month, startDay: ordinal(monD.getDate()), endDay: ordinal(endD.getDate()) };
}

export function formatWeekRange(monday: string): string {
  const fri  = addDays(monday, 4);
  const monD = new Date(monday + 'T12:00:00');
  const friD = new Date(fri    + 'T12:00:00');
  const monLabel = monD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const friLabel = friD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Mon ${monLabel} – Fri ${friLabel}`;
}
