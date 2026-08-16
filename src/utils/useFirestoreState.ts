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
 * TODO(PHI): Firestore rules are open for now (demo data only) — see
 * firebaseClient.ts and HANDOFF.md.
 */
export function useFirestoreState<T>(
  collectionName: string,
  initial: T[],
  getId: (item: T) => string
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [value, setValue] = useState<T[]>(initial);
  const seededRef = useRef(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(colRef, snapshot => {
      if (snapshot.empty && !seededRef.current) {
        seededRef.current = true;
        const batch = writeBatch(db);
        initialRef.current.forEach(item => batch.set(doc(colRef, getId(item)), item as Record<string, unknown>));
        batch.commit();
        return; // onSnapshot fires again once the seed writes land
      }
      setValue(snapshot.docs.map(d => d.data() as T));
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  const setFirestoreValue: Dispatch<SetStateAction<T[]>> = useCallback(updater => {
    setValue(prev => {
      const next = typeof updater === 'function' ? (updater as (p: T[]) => T[])(prev) : updater;

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
      batch.commit();

      return next;
    });
  }, [collectionName]);

  return [value, setFirestoreValue];
}
