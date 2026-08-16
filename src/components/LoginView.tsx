/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    setSigningIn(true);
    await login();
    setSigningIn(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-8">
        <img
          src="/stc-logo-horizontal-v2.webp"
          alt="Solutions Treatment Center"
          className="h-12 w-auto object-contain mb-6"
        />
        <h1 className="text-lg font-bold text-slate-800 mb-1">Sign in</h1>
        <p className="text-xs text-slate-400 mb-6">
          Sign in with your <code className="bg-slate-100 px-1 rounded">treatmentconsultants.net</code> Google account.
        </p>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
