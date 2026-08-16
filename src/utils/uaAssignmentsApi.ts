/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Proof-of-life client for the stc-backend Apps Script Web App (see HANDOFF.md
// "Google Sheets + Apps Script walking skeleton"). Not yet wired into any view —
// this is the fetch layer the next increment will call in place of
// useLocalStorageState for UA assignments.

import type { UaAssignment } from '../types';

const API_URL = import.meta.env.VITE_UA_API_URL;

export async function listUaAssignments(): Promise<UaAssignment[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`UA assignments fetch failed: ${res.status}`);
  return res.json();
}

export async function upsertUaAssignment(assignment: UaAssignment): Promise<void> {
  // Content-Type left as text/plain: Apps Script Web Apps don't support the
  // CORS preflight (OPTIONS) that application/json triggers from a browser.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(assignment),
  });
  if (!res.ok) throw new Error(`UA assignment upsert failed: ${res.status}`);
}
