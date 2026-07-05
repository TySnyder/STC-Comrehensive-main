/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * useState persisted to localStorage under `key`. Falls back to `initial`
 * when the key is missing or unparseable.
 *
 * TODO(PHI): localStorage is demo-only persistence. Anything referencing real
 * client records (e.g. UA assignments) must move to a proper backend before
 * live data is ever loaded — no PHI in localStorage.
 */
export function useLocalStorageState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved) as T;
    } catch { /* ignore */ }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
