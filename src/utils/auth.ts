/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebaseClient';

const ALLOWED_DOMAIN = 'treatmentconsultants.net';

/**
 * `hd` restricts Google's account chooser to the domain but isn't a hard
 * guarantee — the post-signin email check + forced sign-out below is the
 * real enforcement.
 */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: ALLOWED_DOMAIN });
  const result = await signInWithPopup(auth, provider);
  const email = result.user.email ?? '';
  if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    await signOut(auth);
    throw new Error(`Only @${ALLOWED_DOMAIN} accounts can sign in.`);
  }
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
