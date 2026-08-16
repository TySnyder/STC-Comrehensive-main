/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Gmail send/draft via Google Identity Services (same pattern as
// googleCalendar.ts) — no backend, no client secret. Token lives in memory
// only, requested fresh per action.

import { EmailDeliveryMode } from '../types';

const COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';

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

export async function requestGmailToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not configured (see .env.example).');
  }
  await waitForGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: COMPOSE_SCOPE,
      callback: (resp) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error || 'Google sign-in was cancelled or denied.'));
      },
    });
    client.requestAccessToken();
  });
}

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildRawMessage(to: string[], subject: string, body: string): string {
  const message = [
    `To: ${to.join(', ')}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n');
  return base64UrlEncode(message);
}

// Single choke point for every email-producing feature: checks
// EmailDeliveryMode and either sends immediately or leaves a Gmail draft.
export async function dispatchEmail(
  accessToken: string,
  { to, subject, body, mode }: { to: string[]; subject: string; body: string; mode: EmailDeliveryMode }
): Promise<void> {
  const raw = buildRawMessage(to, subject, body);
  const endpoint = mode === 'send'
    ? 'https://www.googleapis.com/gmail/v1/users/me/messages/send'
    : 'https://www.googleapis.com/gmail/v1/users/me/drafts';
  const payload = mode === 'send' ? { raw } : { message: { raw } };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Gmail ${mode === 'send' ? 'send' : 'draft'} failed (${res.status}).`);
  }
}
