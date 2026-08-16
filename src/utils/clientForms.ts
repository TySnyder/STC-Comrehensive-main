/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Parses .planning/CLIENT-FORMS.md into the "Client Form" picker modal.
// Edit that file and the list picks it up on next reload — nothing to sync
// by hand. Will eventually move to the Google Sheet (see HANDOFF.md).

import clientFormsRaw from '../../.planning/CLIENT-FORMS.md?raw';

export interface ClientFormEntry {
  name: string;
  url: string;
}

const FORM_LINE = /^-\s*(.+?)\s*—\s*(https?:\/\/\S+)\s*$/;

export function getClientForms(): ClientFormEntry[] {
  const lines = clientFormsRaw.split('\n');
  const startIdx = lines.findIndex(l => l.trim() === '## Forms');
  if (startIdx === -1) return [];

  const forms: ClientFormEntry[] = [];
  for (const rawLine of lines.slice(startIdx + 1)) {
    const line = rawLine.trim();
    if (line.startsWith('## ')) break; // stop at the next section
    const m = line.match(FORM_LINE);
    if (!m) continue;
    forms.push({ name: m[1].trim(), url: m[2].trim() });
  }
  return forms;
}
