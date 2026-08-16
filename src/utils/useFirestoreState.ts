/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from './firebaseClient';

/**
 * useState backed by a Firestore collection, one document per array item
 * (keyed by `getId(item)`). Drop-in replacement for useLocalStorageState's
 * [value, setValue] shape — every existing setter call (functional updates
 * included) keeps working unchanged; this hook diffs the before/after array
 * itself and writes only what changed.
 *
 * Real-time: subscribes via onSnapshot, so edits made in one tab/device show
 * up in others. First load seeds the collection from `initial` if empty —
 * idempotent (keyed writes), safe even if two clients race to seed at once.
 *
 * Writes happen as a side effect outside React's state updater (never inside
 * the setValue callback itself — that must stay pure) and are wrapped so a
 * failed write logs instead of throwing into the render tree and blanking
 * the whole app (see firebaseClient.ts's ignoreUndefinedProperties for the
 * specific failure mode this guards against).
 *
 * TODO(PHI): Firestore rules are open for now (demo data only) — see
 * firebaseClient.ts and HANDOFF.md.
 */
export function useFirestoreState<T>(
  collectionName: string,
  initial: T[],
  getId: (item: T) => string
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [value, setValue] = useState<T[]>(initial);
  const valueRef = useRef<T[]>(initial);
  const seededRef = useRef(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      snapshot => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          const batch = writeBatch(db);
          initialRef.current.forEach(item => batch.set(doc(colRef, getId(item)), item as Record<string, unknown>));
          batch.commit().catch(err => console.error(`[useFirestoreState:${collectionName}] seed failed:`, err));
          return; // onSnapshot fires again once the seed writes land
        }
        const docs = snapshot.docs.map(d => d.data() as T);
        valueRef.current = docs;
        setValue(docs);
      },
      err => console.error(`[useFirestoreState:${collectionName}] snapshot error:`, err)
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  const setFirestoreValue: Dispatch<SetStateAction<T[]>> = useCallback(updater => {
    const prev = valueRef.current;
    const next = typeof updater === 'function' ? (updater as (p: T[]) => T[])(prev) : updater;
    valueRef.current = next;
    setValue(next);

    try {
      const colRef = collection(db, collectionName);
      const batch = writeBatch(db);
      const nextIds = new Set(next.map(getId));

      for (const item of next) {
        const prevItem = prev.find(p => getId(p) === getId(item));
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
          batch.set(doc(colRef, getId(item)), item as Record<string, unknown>);
        }
      }
      for (const item of prev) {
        if (!nextIds.has(getId(item))) batch.delete(doc(colRef, getId(item)));
      }
      batch.commit().catch(err => console.error(`[useFirestoreState:${collectionName}] write failed:`, err));
    } catch (err) {
      console.error(`[useFirestoreState:${collectionName}] write failed:`, err);
    }
  }, [collectionName]);

  return [value, setFirestoreValue];
}
