/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Read-only Google Calendar connect via Google Identity Services (GIS) token
// client — no backend, no client secret. Token lives in memory only (never
// localStorage) and expires with the browser session; user reconnects next visit.

const READONLY_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export interface GCalEvent {
  id: string;
  title: string;
  start: string; // display time, e.g. "9:00 AM" or "All day"
  end: string;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

function waitForGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(poll);
        resolve();
      } else if (Date.now() - start > 10000) {
        clearInterval(poll);
        reject(new Error('Google Identity Services failed to load.'));
      }
    }, 100);
  });
}

export async function requestGoogleCalendarToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not configured (see .env.example).');
  }
  await waitForGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: READONLY_SCOPE,
      callback: (resp) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error || 'Google sign-in was cancelled or denied.'));
      },
    });
    client.requestAccessToken();
  });
}

export async function fetchTodaysCalendarEvents(accessToken: string): Promise<GCalEvent[]> {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const params = new URLSearchParams({
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Google Calendar session expired — reconnect.');
    throw new Error(`Google Calendar request failed (${res.status}).`);
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((ev: any): GCalEvent => {
    const startRaw = ev.start?.dateTime ?? ev.start?.date;
    const endRaw = ev.end?.dateTime ?? ev.end?.date;
    const allDay = !ev.start?.dateTime;
    return {
      id: ev.id,
      title: ev.summary || '(No title)',
      start: allDay ? 'All day' : new Date(startRaw).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      end: allDay ? '' : new Date(endRaw).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    };
  });
}
