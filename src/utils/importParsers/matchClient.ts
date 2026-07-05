import { Client } from '../../types';

/**
 * Match a spreadsheet name to a system client id.
 * Returns '' when no confident match exists — callers treat '' as "skip"
 * so unmatched names are never silently attached to the wrong client.
 */
export function matchClientByName(xlsxName: string, clients: Client[]): string {
  const lower = xlsxName.toLowerCase();
  const exact = clients.find(c => c.name.toLowerCase() === lower);
  if (exact) return exact.id;
  const lastName = lower.split(/\s+/).pop() ?? '';
  if (lastName.length > 2) {
    const byLast = clients.find(c => c.name.toLowerCase().includes(lastName));
    if (byLast) return byLast.id;
  }
  return '';
}
