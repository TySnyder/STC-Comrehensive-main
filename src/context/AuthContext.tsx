/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { AuthUser } from '../types';
import { useLocalStorageState } from '../utils/useLocalStorageState';
import { authenticate } from '../utils/auth';

/**
 * Minimal swappable auth surface: current user, login, logout. Backed by the
 * demo/local implementation in `utils/auth.ts` for now — this is the file to
 * update when a real backend (Firebase Auth, currently blocked, see
 * HANDOFF.md) becomes available; consumers only ever see this interface.
 */
interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorageState<AuthUser | null>('stc-auth-user', null);

  const login = (email: string, password: string): boolean => {
    const resolved = authenticate(email, password);
    if (!resolved) return false;
    setUser(resolved);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
