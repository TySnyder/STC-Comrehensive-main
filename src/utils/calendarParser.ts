/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Ported (pure-function subset) from stc_dashboard_v4/CalendarParser.js —
// title-based detection used when pulling IND sessions off a therapist's
// Google Calendar. Only the IND-relevant pieces are ported; the v4 file also
// handles group/UA title parsing and roster matching this app doesn't need.

export function detectProgramFromTitle(eventTitle: string): '' | 'DIOP' | 'DOP' | 'EIOP' | 'EOP' | 'IND' {
  const title = String(eventTitle || '').toUpperCase();
  if (/\bDIOP\b/.test(title)) return 'DIOP';
  if (/\bDOP\b/.test(title)) return 'DOP';
  if (/\bEIOP\b/.test(title)) return 'EIOP';
  if (/\bEOP\b/.test(title)) return 'EOP';
  if (/\bIND\b|\bINDIVIDUAL\b|\b1:1\b/.test(title)) return 'IND';
  return '';
}

export function extractClientNameFromIndTitle(eventTitle: string): string {
  const raw = String(eventTitle || '').trim().replace(/[-–—]+$/, '').trim();
  if (!raw) return '';

  const patterns = [
    // Standard IND-first formats (with optional one-word prefix like "Last", "Final")
    /^\s*(?:\w+\s+)?(?:IND|Individual|1:1)\s+Session\s+w\/\s+(.+)$/i,
    /^\s*(?:\w+\s+)?(?:IND|Individual|1:1)\s+Session\s+with\s+(.+)$/i,
    /^\s*(?:\w+\s+)?(?:IND|Individual|1:1)\s+w\/\s+(.+)$/i,
    /^\s*(?:\w+\s+)?(?:IND|Individual|1:1)\s+with\s+(.+)$/i,
    /^\s*(?:\w+\s+)?(?:IND|Individual|1:1)\s+Session\s+(.+)$/i,
    /^\s*Session\s+(.+?)\s*(?:IND|Individual|1:1)\s*$/i,
    /^\s*(?:IND|Individual|1:1)\s*[:-]\s*(.+)$/i,
    /^\s*(.+?)\s*[:-]\s*(?:IND|Individual|1:1)\s*$/i,
    /^\s*(.+?)\s*\((?:IND|Individual|1:1)\)\s*$/i,
    // Therapist-first "w/ client Individual" format.
    // Handles: "MJ w Damian S Individual", "MJ w/ Joshua R Individual"
    /^\s*\w+\s+w\/?\s+(.+?)\s+(?:IND|Individual|1:1)\s*$/i,
    // "Therapist/Client IND" format — IND at end, client name is right of the slash
    // Handles: "Amy/Hugh IND", "Amy/Carlos V IND", 'Amy/Danielle "Ashley" IND'
    /^\s*\w+\/(.+?)\s+(?:"[^"]+"\s+)?(?:IND|Individual|1:1)\s*$/i,
    // Bare "IND Name" format — IND keyword immediately followed by the client name
    // Handles: "IND Autumn Segfried", "Individual Carlos V"
    /^\s*(?:IND|Individual|1:1)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match && match[1]) {
      return String(match[1] || '').replace(/[.!,;:\s]+$/g, '').trim();
    }
  }

  return '';
}
