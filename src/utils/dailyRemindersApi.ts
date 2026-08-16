/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Triggers the stc-backend Apps Script's sendDailyReminders action: it reads
// recipients + therapist calendars + the client contact sheet server-side and
// sends the summary email itself — this call just fires the trigger.

import type { EmailDeliveryMode } from '../types';

// Same stc-backend deployment as uaAssignmentsApi.ts, despite the UA-specific env var name.
const API_URL = import.meta.env.VITE_UA_API_URL;

export async function sendDailyReminders(
  mode: EmailDeliveryMode
): Promise<{ ok: boolean; sent: boolean; drafted: boolean; count: number }> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'sendDailyReminders', mode }),
  });
  if (!res.ok) throw new Error(`Daily reminders send failed: ${res.status}`);
  return res.json();
}
