/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Video, Search, ExternalLink } from 'lucide-react';
import { Client, VirtualRequestEntry } from '../types';
import AddVirtualRequestModal from './AddVirtualRequestModal';

// Same DIOP/DOP (day) and EIOP/EOP (evening) block-naming convention as
// AttendanceView's section headers and AddVirtualRequestModal's picker.
const BLOCK_LABELS: Record<string, [string, string]> = {
  DIOP: ['DIOP', 'DOP'],
  DOP: ['DIOP', 'DOP'],
  EIOP: ['EIOP', 'EOP'],
  EOP: ['EIOP', 'EOP'],
};

function blockLabel(program: string | undefined, block: 'A' | 'B' | undefined): string {
  if (!block) return '—';
  const [a, b] = BLOCK_LABELS[program ?? ''] ?? ['Block A', 'Block B'];
  return block === 'A' ? a : b;
}

interface VirtualRequestsViewProps {
  requests: VirtualRequestEntry[];
  clients: Client[];
  staffNames: string[];
  onAddEntry: (entry: VirtualRequestEntry) => void;
}

export default function VirtualRequestsView({ requests, clients, staffNames, onAddEntry }: VirtualRequestsViewProps) {
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState<'All' | 'A' | 'B'>('All');
  const [modalOpen, setModalOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...requests]
      .filter(r => blockFilter === 'All' || r.block === blockFilter)
      .filter(r => !q || r.clientName.toLowerCase().includes(q))
      .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  }, [requests, search, blockFilter]);

  const missingLinkCount = requests.filter(r => !r.meetLink).length;

  return (
    <div className="space-y-6">

      {/* Header row: search + filters + add */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search client…"
              className="text-xs font-sans border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-56"
            />
          </div>
          <select
            value={blockFilter}
            onChange={e => setBlockFilter(e.target.value as typeof blockFilter)}
            className="text-xs font-sans border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All blocks</option>
            <option value="A">1st block (DIOP / EIOP)</option>
            <option value="B">2nd block (DOP / EOP)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {missingLinkCount > 0 && (
            <span className="text-xs font-mono text-amber-600">{missingLinkCount} missing a Meet link</span>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Video className="w-4 h-4" />
            Log Virtual Request
          </button>
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Video className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No virtual attendance requests match these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="py-3 px-5 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Date</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Client</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Block</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Reason</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Logged By</th>
                  <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Meet Link</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="py-3 px-5">
                      <p className="font-medium text-slate-700 whitespace-nowrap">{r.date}</p>
                      <p className="text-[10px] font-mono text-slate-400">{new Date(r.loggedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-700">{r.clientName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-slate-500">
                        {blockLabel(clients.find(c => c.id === r.clientId)?.program, r.block)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-slate-500 max-w-64">{r.reason}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-500">{r.loggedBy}</span>
                    </td>
                    <td className="py-3 px-4">
                      {r.meetLink ? (
                        <a
                          href={r.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Join <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 border bg-amber-50 text-amber-700 border-amber-200">
                          No link found
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddVirtualRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddEntry}
        clients={clients}
        staffNames={staffNames}
      />
    </div>
  );
}
