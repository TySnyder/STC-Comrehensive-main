# HANDOFF-1 — Real Auth + Role-Based Access (IN PROGRESS)
**Started:** 2026-08-16. Paused mid-implementation for a context handoff — see exact state below.

## What was decided (confirmed with user, don't re-litigate)

1. **Domain is `treatmentconsultants.net`** — user initially said ".com" but every real credential
   used all session (Firebase login, Google Calendar OAuth, Google Sheets/Apps Script, and Google
   Groups visible in the Firebase console: `Allstaff@treatmentconsultants.net`,
   `Timesheets@treatmentconsultants.net`, etc.) confirms `.net`. User confirmed `.net` explicitly.
2. **Login = Google Sign-In, domain-restricted** (not email/password) — staff use the same Google
   account they already use for Calendar/Sheets.
3. **5 roles:** Intern, Admin, Intake, Therapist, Master (replaces the old 4-role demo scaffold:
   admin/therapist/intake/**supervisor** — supervisor is gone, Intern and Master are new).
4. **Role differences = nav visibility only, for now** — not full distinct dashboard layouts. Which
   tabs each role sees is a **provisional first-pass default** (see step (f) below), explicitly
   flagged to the user as needing confirmation/correction, not confirmed.
5. Firestore rules currently open (`allow read, write: if true`) — this work is what finally gives
   rules something to key off, they get locked down to require auth + domain match (step (g)).

## Already done in Google Cloud / Firebase Console (no code needed, already live)

- Firebase Authentication → Google sign-in provider **enabled** on project `stc-operations-portal`.
  Public-facing name set to "STC Operations Portal", support email
  `tyler@treatmentconsultants.net`.
- Authorized domains for Firebase Auth: added `stc-comprehensive.vercel.app` (localhost and the
  default `*.firebaseapp.com`/`*.web.app` domains were already present).
- (Separate, unrelated system) Google Calendar OAuth client's Authorized JavaScript origins fixed —
  see `HANDOFF-COMPLETED.md`, this was a different bug, already closed out.

## Current code state — DO NOT ASSUME GREEN

Only `src/types.ts` is modified and **uncommitted**. This alone currently breaks the gate:
```
src/components/Sidebar.tsx(39,3): 'supervisor' does not exist in type 'Record<AppRole, string>'
src/utils/auth.ts(27,84): Type '"supervisor"' is not assignable to type 'AppRole'
```
This is expected and known — both files are about to be replaced/edited per the plan below. Last
commit (`1609b54`) is green and is what's live on `origin/master` and Vercel production right now.

Changes already made to `src/types.ts`:
- `AppRole` → `'intern' | 'admin' | 'intake' | 'therapist' | 'master'`
- `Staff` gained `appRole?: AppRole` — role is resolved by matching the signed-in Google account's
  email against a `Staff.email`, reading that record's `appRole`. Unmatched or unset → `'intern'`
  (least privilege), never guessed toward more access.

## Exact remaining steps, in order

**(a) `src/utils/firebaseClient.ts`** — add `export const auth = getAuth(app);` (import `getAuth`
from `'firebase/auth'`, alongside the existing Firestore init).

**(b) `src/utils/auth.ts`** — replace entirely (delete `DEMO_ACCOUNTS`/`DEMO_LOGIN_OPTIONS`/
`authenticate`). New content:
```ts
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebaseClient';

const ALLOWED_DOMAIN = 'treatmentconsultants.net';

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
```
`hd` restricts Google's account chooser but isn't a hard guarantee — the post-signin email check +
forced sign-out is the real enforcement.

**(c) `src/context/AuthContext.tsx`** — replace to use `onAuthStateChanged(auth, ...)`. Exposes RAW
user only (`{id: uid, name: displayName ?? email, email}`) — **no role field here**, role needs
`staffList` which isn't available until inside `Portal` (see (e)). Shape:
`{ user: {id,name,email} | null, loading: boolean, error: string, login: () => Promise<void>,
logout: () => void }`. `login` calls `signInWithGoogle()` wrapped in try/catch setting `error`.

**(d) `src/components/LoginView.tsx`** — replace the demo dropdown with a single "Sign in with
Google" button. Show a spinner while `loading`, show `error` text if present (e.g. wrong-domain
rejection message from step (b)).

**(e) `src/App.tsx` — SPLIT into two components. This is the part most likely to be gotten wrong,
read carefully:**

Firestore rules are about to require `request.auth != null` (step (g)). Today, all the
`useFirestoreState` hooks (clients, staffList, etc.) run unconditionally at the top of `App()`,
*before* the `if (!user) return <LoginView/>` check. If rules require auth, those `onSnapshot`
listeners subscribe while still logged out, get `permission-denied`, and **do not automatically
retry once the user later signs in** — the listener already failed and isn't recreated just because
`onAuthStateChanged` fires again. Result: sign in successfully, app stays empty forever.

Fix: split so the data hooks only mount *after* auth resolves.
- Outer `export default function App()`: calls `useAuth()` for `{user: rawUser, loading, logout}`
  only. `if (loading) return <spinner>`. `if (!rawUser) return <LoginView/>`. Else
  `return <Portal rawUser={rawUser} logout={logout} />`.
- Inner `function Portal({ rawUser, logout }: {...})`: everything currently in `App()` **except**
  the `useAuth()` call and the `if (!user) return <LoginView/>` line. After the `staffList` hook,
  add:
  ```ts
  const effectiveUser: AuthUser = {
    id: rawUser.id, name: rawUser.name, email: rawUser.email,
    role: staffList.find(s => s.email.toLowerCase() === rawUser.email.toLowerCase())?.appRole
      ?? 'intern',
  };
  ```
  Pass `user={effectiveUser}` to `<Sidebar>` (replaces the old `user` variable everywhere it was
  used — should just be that one prop).

**(f) `src/components/Sidebar.tsx`** — update `ROLE_LABELS` for the 5 roles, and filter `navItems`
by role. **Provisional default, flag it to the user as a first pass, not confirmed:**
- `master`: all 13 nav items
- `admin`: all except `settings` (Settings holds the email-send master switch — reserved for Master)
- `therapist`: dashboard, tasktrack, clients, attendance, ua, discharge, reports, schedule
- `intake`: dashboard, tasktrack, clients, calltracking, virtualrequests
- `intern`: dashboard, tasktrack, clients, attendance (most restricted)

**(g) `firestore.rules`** — replace the open rule:
```
match /{document=**} {
  allow read, write: if request.auth != null
    && request.auth.token.email.matches('.*@treatmentconsultants[.]net$');
}
```
Redeploy: `firebase deploy --only firestore:rules --project stc-operations-portal`.

**(h) No role-assignment UI exists yet.** Until one is built, `Staff.appRole` must be set by hand in
the Firebase console (Firestore → `staff` collection → find/create the record → set `appRole`
field). **First real login will default to `'intern'`** (safe, but means whoever signs in first
needs to manually promote their own Staff record to `'master'` via the console to unlock full
access) — call this out to the user explicitly when this phase is being tested, don't let them
think they're locked out.

**(i) Gate + deploy:** `tsc --noEmit`, `npm run test`, `npm run build`, commit, `git push`,
`vercel deploy --prod --yes`. Real Google sign-in **cannot be tested by an agent** — a human must
click through the actual OAuth popup. Ask the user to test after deploying.

## Also pending, unstarted (separate small request, don't lose it)

User asked: "I want this on top of the Program Schedule Builder" — referring to a "Theme Week"
banner (screenshot showed "THEME WEEK 6 OF 17 · CURRENT — Boundaries" with a progress-dot strip and
Details/Set theme buttons). `ScheduleView.tsx` already has the underlying state for this (`
displayedTheme`, `displayedThemeWeek`, `THEME_CYCLE_LENGTH`, `themeDetailOpen` — used by the
existing Theme Detail *modal*, which this session already touched for backdrop-click-close). Task:
build/place a compact banner version of that same data at the top of `ScheduleView.tsx`'s render
(Program Schedule Builder page). Not started — check whether this banner already exists somewhere
else in the app first (the screenshot's styling suggests it might already exist on Dashboard or
elsewhere and just needs relocating, rather than building fresh — verify before assuming either way).
