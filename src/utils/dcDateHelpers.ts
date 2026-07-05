/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client } from '../types';
import { getCurrentEpisode } from './episodeHelpers';
import { isoDate } from './weekHelpers';

/**
 * Est. DC date is predicted, never free text (doc 02 Q7): default enrollment
 * is 85 treatment days (17 weeks), minimum 30, projected onto the calendar
 * honoring the client's days/week enrolled.
 */

export const DEFAULT_ENROLLMENT_DAYS = 85;
export const MIN_ENROLLMENT_DAYS = 30;

export function clampEnrollmentDays(n?: number): number {
  if (n === undefined || Number.isNaN(n)) return DEFAULT_ENROLLMENT_DAYS;
  return Math.max(MIN_ENROLLMENT_DAYS, Math.round(n));
}

/**
 * Calendar date of the Nth treatment day counting from admit (admit = day 1
 * when it's a treatment day). Treatment days are weekdays; a client enrolled
 * fewer than 5 days/week is credited the first `daysPerWeek` weekdays of each
 * Mon–Sun week. Closures/holidays are a later refinement (no registry yet).
 */
export function predictDischargeDate(
  admitIso: string,
  treatmentDays: number,
  daysPerWeek = 5
): string {
  const perWeek = Math.min(5, Math.max(1, Math.round(daysPerWeek)));
  const target = Math.max(1, Math.round(treatmentDays));
  const d = new Date(admitIso + 'T12:00:00');
  let counted = 0;
  let countedThisWeek = 0;
  for (;;) {
    const dow = d.getDay();
    if (dow === 1) countedThisWeek = 0;
    if (dow >= 1 && dow <= 5 && countedThisWeek < perWeek) {
      counted++;
      countedThisWeek++;
      if (counted === target) return isoDate(d);
    }
    d.setDate(d.getDate() + 1);
  }
}

/** Predicted DC date for the client's current episode. */
export function estDischargeDate(client: Client): string {
  const admit = getCurrentEpisode(client).admitDate || client.admissionDate;
  return predictDischargeDate(
    admit,
    clampEnrollmentDays(client.enrollmentDays),
    client.scheduleDaysPerWeek ?? 5
  );
}
