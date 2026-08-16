/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRole, AuthUser } from '../types';

/**
 * Demo/local auth backend — one hardcoded account per role, shared demo
 * password. Swap-in target is Firebase Auth (blocked on a GCP org IAM issue,
 * see HANDOFF.md) once available; AuthContext is the only file that should
 * need to change to point at a real backend — this module is the part that
 * gets replaced.
 *
 * TODO(PHI): demo-only, not real credentials. No real staff accounts here.
 */
interface DemoAccount extends AuthUser {
  password: string;
}

const DEMO_PASSWORD = 'demo';

const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'demo-admin', name: 'Casey Admin', email: 'admin@stc.demo', role: 'admin', password: DEMO_PASSWORD },
  { id: 'demo-therapist', name: 'Taylor Therapist', email: 'therapist@stc.demo', role: 'therapist', password: DEMO_PASSWORD },
  { id: 'demo-intake', name: 'Jordan Intake', email: 'intake@stc.demo', role: 'intake', password: DEMO_PASSWORD },
  { id: 'demo-supervisor', name: 'Riley Supervisor', email: 'supervisor@stc.demo', role: 'supervisor', password: DEMO_PASSWORD },
];

export const DEMO_LOGIN_OPTIONS: { email: string; role: AppRole; name: string }[] =
  DEMO_ACCOUNTS.map(({ email, role, name }) => ({ email, role, name }));

/** Resolves email + password against the demo account list. Null = invalid. */
export function authenticate(email: string, password: string): AuthUser | null {
  const match = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );
  if (!match) return null;
  const { password: _password, ...user } = match;
  return user;
}
