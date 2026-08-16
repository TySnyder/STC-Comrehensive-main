/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebaseClient';
import { signInWithGoogle, signOutUser } from '../utils/auth';

/** Raw signed-in identity only — no role. Role needs `staffList`, which only
 * exists inside `Portal` once Firestore data is available (see App.tsx). */
export interface RawUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: RawUser | null;
  loading: boolean;
  error: string;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RawUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(
        firebaseUser
          ? { id: firebaseUser.uid, name: firebaseUser.displayName ?? firebaseUser.email ?? '', email: firebaseUser.email ?? '' }
          : null
      );
      setLoading(false);
    });
  }, []);

  const login = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  };

  const logout = () => {
    signOutUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
