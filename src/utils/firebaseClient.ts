/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// TODO(PHI): Firestore rules are open/permissive for now (demo data only, no
// real Firebase Auth wired in yet). Must be locked down before any real
// client data flows through this — see HANDOFF.md.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Every entity type has optional (`?`) fields that are commonly `undefined`
// (e.g. CensusEntry.specialCode) — the app's object literals include them as
// explicit `undefined` properties, same as they always did for JSON.stringify
// (which silently drops them). Firestore's default behavior instead throws on
// `undefined`, so without this the very first optional-field write crashes.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
