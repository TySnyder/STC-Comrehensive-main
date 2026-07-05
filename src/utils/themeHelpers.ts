import { THEME_CYCLE_LENGTH } from '../themes';

// Facility-wide 17-week theme cycle. The anchor pins one Monday to a theme
// week (set in the Schedule view); every other week derives from it by
// modular arithmetic — clients admit rolling and join wherever the cycle is.
export interface ThemeAnchor {
  /** Monday (ISO date) of the week the anchor was set for. */
  mondayIso: string;
  /** Theme week (1–17) in effect that week. */
  themeWeek: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Theme week (1–17) for the week starting at `mondayIso`, given the anchor. */
export function themeWeekFor(mondayIso: string, anchor: ThemeAnchor): number {
  const from = new Date(anchor.mondayIso + 'T12:00:00').getTime();
  const to = new Date(mondayIso + 'T12:00:00').getTime();
  const weeksApart = Math.round((to - from) / WEEK_MS);
  const zeroBased = anchor.themeWeek - 1 + weeksApart;
  return ((zeroBased % THEME_CYCLE_LENGTH) + THEME_CYCLE_LENGTH) % THEME_CYCLE_LENGTH + 1;
}
