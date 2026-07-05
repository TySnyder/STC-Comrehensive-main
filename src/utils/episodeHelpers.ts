/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Episode, DcStatus } from '../types';

/**
 * Episode materialization: `Client.episodes` absent/empty means one implicit
 * episode starting at `admissionDate`. These helpers make that explicit so
 * discharge actions always have a concrete episode to write to.
 */

export function getEpisodes(client: Client): Episode[] {
  if (client.episodes && client.episodes.length > 0) return client.episodes;
  return [{
    id: `${client.id}-ep1`,
    episodeNumber: 1,
    admitDate: client.admissionDate,
  }];
}

export function getCurrentEpisode(client: Client): Episode {
  return getEpisodes(client).reduce((a, b) => (b.episodeNumber > a.episodeNumber ? b : a));
}

export interface DischargeInput {
  iopDcDate?: string;
  stcDcDate?: string;
  dcStatus?: DcStatus[];
  graduated?: boolean;
  note?: string;
}

/**
 * Apply a discharge (or IOP step-down) to the client's current episode,
 * materializing episodes if still implicit. Setting `stcDcDate` is the full
 * discharge and flips lifecycle status; an IOP-only date leaves the client
 * Active (step-down: left IOP, still at STC).
 */
export function applyDischarge(client: Client, input: DischargeInput): Client {
  const episodes = getEpisodes(client);
  const current = getCurrentEpisode(client);
  const updated = episodes.map(ep =>
    ep.id === current.id ? { ...ep, ...input } : ep
  );
  return {
    ...client,
    episodes: updated,
    status: input.stcDcDate ? 'Discharged' : client.status,
  };
}

/**
 * Void the current episode's discharge fields (spreadsheet behavior: the
 * tracker row is deleted). Paperwork stamps are cleared too — a reversed
 * discharge never happened. The episode note is kept.
 */
export function reverseDischarge(client: Client): Client {
  const episodes = getEpisodes(client);
  const current = getCurrentEpisode(client);
  const updated = episodes.map(ep => {
    if (ep.id !== current.id) return ep;
    const {
      iopDcDate, stcDcDate, dcStatus, graduated,
      gradCertSentAt, exitInterviewSentAt, exitInterviewReturnedAt,
      dcFormSentAt, dcFormReturnedAt,
      ...kept
    } = ep;
    return kept;
  });
  return { ...client, episodes: updated, status: 'Active' };
}

/**
 * Readmission = new episode (locked decision): a fully discharged client
 * returning gets episodeNumber+1 (BestNotes appends " 2", " 3" to the name)
 * and goes back to Active. No-op unless the current episode is fully
 * discharged (stcDcDate set) — an active client can't be readmitted.
 */
export function readmitClient(client: Client, admitDate: string): Client {
  const episodes = getEpisodes(client);
  const current = getCurrentEpisode(client);
  if (!current.stcDcDate) return client;
  const nextNumber = current.episodeNumber + 1;
  return {
    ...client,
    episodes: [...episodes, {
      id: `${client.id}-ep${nextNumber}`,
      episodeNumber: nextNumber,
      admitDate,
    }],
    status: 'Active',
  };
}

export function updateEpisode(client: Client, episodeId: string, updates: Partial<Episode>): Client {
  const episodes = getEpisodes(client).map(ep =>
    ep.id === episodeId ? { ...ep, ...updates } : ep
  );
  return { ...client, episodes };
}

// ---------------------------------------------------------------------------
// Paperwork checklist (doc 08): sent → returned | still chasing | chase closed
// ---------------------------------------------------------------------------

export type PaperworkState =
  | 'not-sent'   // nothing sent yet
  | 'sent'       // send-only item (grad cert) completed
  | 'chasing'    // sent, awaiting return, within the one-month chase window
  | 'returned'   // sent and returned
  | 'closed'     // chase window over (1 month post STC DC), never returned
  | 'n/a';       // item doesn't apply (grad cert for non-graduates)

export interface PaperworkItem {
  key: 'gradCert' | 'exitInterview' | 'dcForm';
  label: string;
  sentField: keyof Episode;
  returnedField?: keyof Episode;
  sentAt?: string;
  returnedAt?: string;
  state: PaperworkState;
}

export function chaseDeadline(stcDcDate: string): string {
  const d = new Date(stcDcDate + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function isChaseClosed(stcDcDate: string, today: string): boolean {
  return today > chaseDeadline(stcDcDate);
}

function itemState(
  sentAt: string | undefined,
  returnedAt: string | undefined,
  needsReturn: boolean,
  stcDcDate: string,
  today: string
): PaperworkState {
  if (!needsReturn) return sentAt ? 'sent' : 'not-sent';
  if (returnedAt) return 'returned';
  if (isChaseClosed(stcDcDate, today)) return 'closed';
  return sentAt ? 'chasing' : 'not-sent';
}

/** Checklist for a discharged episode. Returns [] until stcDcDate is set. */
export function getPaperworkItems(episode: Episode, today: string): PaperworkItem[] {
  if (!episode.stcDcDate) return [];
  const dc = episode.stcDcDate;
  const items: PaperworkItem[] = [];

  items.push({
    key: 'gradCert',
    label: 'Grad Cert',
    sentField: 'gradCertSentAt',
    sentAt: episode.gradCertSentAt,
    state: episode.graduated
      ? itemState(episode.gradCertSentAt, undefined, false, dc, today)
      : 'n/a',
  });
  items.push({
    key: 'exitInterview',
    label: 'Exit Interview',
    sentField: 'exitInterviewSentAt',
    returnedField: 'exitInterviewReturnedAt',
    sentAt: episode.exitInterviewSentAt,
    returnedAt: episode.exitInterviewReturnedAt,
    state: itemState(episode.exitInterviewSentAt, episode.exitInterviewReturnedAt, true, dc, today),
  });
  items.push({
    key: 'dcForm',
    label: 'DC Form',
    sentField: 'dcFormSentAt',
    returnedField: 'dcFormReturnedAt',
    sentAt: episode.dcFormSentAt,
    returnedAt: episode.dcFormReturnedAt,
    state: itemState(episode.dcFormSentAt, episode.dcFormReturnedAt, true, dc, today),
  });
  return items;
}

/** Count of items still actively being chased (drives the view badge). */
export function countOutstanding(episode: Episode, today: string): number {
  return getPaperworkItems(episode, today)
    .filter(i => i.state === 'not-sent' || i.state === 'chasing')
    .length;
}
