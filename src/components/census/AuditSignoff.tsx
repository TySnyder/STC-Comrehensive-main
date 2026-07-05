import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

/**
 * Weekly census audit sign-off (doc 01 Q7): "audited through [date] by [user]".
 * Audits are weekly; the log is kept so the owner (Amy) can review escalations.
 * No PHI — dates and staff names only.
 */

export interface CensusAudit {
  throughDate: string; // ISO — census is audited through this date (inclusive)
  by: string;
  at: string;          // ISO timestamp of the sign-off
}

const AUDIT_KEY = 'stc-census-audits';

export function loadAudits(): CensusAudit[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as CensusAudit[]) : [];
  } catch {
    return [];
  }
}

export function latestAudit(audits: CensusAudit[]): CensusAudit | undefined {
  return audits.reduce<CensusAudit | undefined>(
    (a, b) => (!a || b.throughDate > a.throughDate ? b : a),
    undefined
  );
}

interface AuditSignoffProps {
  /** Friday of the displayed week — default sign-off date. */
  weekEnd: string;
}

export default function AuditSignoff({ weekEnd }: AuditSignoffProps) {
  const [audits, setAudits] = useState<CensusAudit[]>(loadAudits);
  const [open, setOpen] = useState(false);
  const [by, setBy] = useState('');
  const [throughDate, setThroughDate] = useState(weekEnd);

  const latest = latestAudit(audits);

  const openForm = () => {
    setThroughDate(weekEnd);
    setOpen(true);
  };

  const signOff = () => {
    if (!by.trim() || !throughDate) return;
    const next = [...audits, { throughDate, by: by.trim(), at: new Date().toISOString() }];
    setAudits(next);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
    setOpen(false);
    setBy('');
  };

  return (
    <div className="relative flex items-center gap-2">
      {latest ? (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audited through <span className="font-bold">{latest.throughDate}</span> by{' '}
          <span className="font-bold">{latest.by}</span>
        </span>
      ) : (
        <span className="text-[11px] font-mono text-slate-400">No audit sign-off yet</span>
      )}
      <button
        onClick={openForm}
        className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-bold transition-colors"
      >
        Sign off
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Audit sign-off
            </h4>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Audited through
          </label>
          <input
            type="date"
            value={throughDate}
            onChange={e => setThroughDate(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
            Audited by
          </label>
          <input
            value={by}
            onChange={e => setBy(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && signOff()}
            placeholder="Your name"
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={signOff}
            disabled={!by.trim() || !throughDate}
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold transition-colors"
          >
            Confirm sign-off
          </button>
          {audits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 max-h-24 overflow-y-auto space-y-1">
              {[...audits].reverse().slice(0, 5).map((a, i) => (
                <p key={i} className="text-[10px] font-mono text-slate-400">
                  through {a.throughDate} · {a.by} · {a.at.slice(0, 10)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
