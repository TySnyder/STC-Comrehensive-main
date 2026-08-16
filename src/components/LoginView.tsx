/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_LOGIN_OPTIONS } from '../utils/auth';

/**
 * Demo/local login gate. Picking a demo account fills the email so staff
 * don't need to memorize the four addresses; password is the same shared
 * demo value for all of them (see utils/auth.ts). Swap target: real backend
 * login, once available — this form and AuthContext are the only pieces
 * that change.
 */
export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(email, password);
    if (!ok) setError('Invalid demo email or password.');
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
          Demo auth — pick a role below, password is <code className="bg-slate-100 px-1 rounded">demo</code>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Demo account</label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a role…</option>
              {DEMO_LOGIN_OPTIONS.map((opt) => (
                <option key={opt.email} value={opt.email}>
                  {opt.name} — {opt.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email || !password}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" /> Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
