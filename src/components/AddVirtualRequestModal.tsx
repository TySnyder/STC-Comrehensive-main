/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Video, LinkIcon, Loader2 } from 'lucide-react';
import { Client, VirtualRequestEntry } from '../types';
import { GCalEvent, requestGoogleCalendarToken, fetchTodaysCalendarEvents } from '../utils/googleCalendar';
import { detectProgramFromTitle } from '../utils/calendarParser';

interface AddVirtualRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: VirtualRequestEntry) => void;
  clients: Client[];
  staffNames: string[];
}

function generateId() {
  return `vreq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyForm = (today: string) => ({
  clientId: '',
  date: today,
  block: 'A' as 'A' | 'B',
  reason: '',
  loggedBy: '',
  meetLink: '',
});

export default function AddVirtualRequestModal({ isOpen, onClose, onSave, clients, staffNames }: AddVirtualRequestModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(emptyForm(today));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Meet-link lookup: pull the existing hangoutLink off the client's block's
  // recurring calendar event — never creates a new event/link (write scope
  // not needed, existing read-only Calendar connect is reused as-is).
  const [gcalStatus, setGcalStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const [gcalError, setGcalError] = useState('');

  if (!isOpen) return null;

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const selectedClient = clients.find(c => c.id === form.clientId);

  // Only events whose title maps to the requesting client's program — the
  // integration fetches "today's" events (existing API limit, see
  // googleCalendar.ts), so this is most useful when logging a same-day call-out.
  const matchingEvents = selectedClient
    ? gcalEvents.filter(ev => detectProgramFromTitle(ev.title) === selectedClient.program)
    : [];

  const lookupMeetLink = async () => {
    setGcalStatus('connecting');
    setGcalError('');
    try {
      const token = await requestGoogleCalendarToken();
      const events = await fetchTodaysCalendarEvents(token);
      setGcalEvents(events);
      setGcalStatus('connected');
    } catch (err) {
      setGcalError(err instanceof Error ? err.message : 'Could not connect to Google Calendar.');
      setGcalStatus('error');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.reason.trim()) e.reason = 'Required';
    if (!form.loggedBy.trim()) e.loggedBy = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !selectedClient) return;
    const entry: VirtualRequestEntry = {
      id: generateId(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: form.date,
      block: form.block,
      reason: form.reason.trim(),
      loggedBy: form.loggedBy.trim(),
      loggedAt: new Date().toISOString(),
      meetLink: form.meetLink.trim() || undefined,
    };
    onSave(entry);
    onClose();
    setForm(emptyForm(today));
    setErrors({});
    setGcalStatus('idle');
    setGcalEvents([]);
  };

  const field = (label: string, key: string, el: React.ReactNode) => (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block font-sans">
        {label}
      </label>
      {el}
      {errors[key] && <p className="text-[10px] text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  const inputCls = (key: string) =>
    `w-full text-xs font-sans border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
    }`;

  const selectCls = 'w-full text-xs font-sans border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Log Virtual Attendance Request</h2>
              <p className="text-[10px] text-slate-400 font-mono">Client called out — attending virtually instead</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

          {field('Client *', 'clientId',
            <select value={form.clientId} onChange={e => set('clientId', e.target.value)} className={selectCls}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.program}</option>)}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3">
            {field('Date *', 'date',
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls('date')} />
            )}
            {field('Program Block', 'block',
              <select value={form.block} onChange={e => set('block', e.target.value as 'A' | 'B')} className={selectCls}>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
              </select>
            )}
          </div>

          {field('Reason *', 'reason',
            <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={2} placeholder="Why the client can't attend in person" className={inputCls('reason')} />
          )}

          {field('Logged By *', 'loggedBy',
            <input
              type="text"
              list="vreq-staff-options"
              value={form.loggedBy}
              onChange={e => set('loggedBy', e.target.value)}
              placeholder="Staff member taking this call"
              className={inputCls('loggedBy')}
            />
          )}
          <datalist id="vreq-staff-options">
            {staffNames.map(n => <option key={n} value={n} />)}
          </datalist>

          {/* Meet link lookup */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-sans">Meet Link</label>
              <button
                type="button"
                onClick={lookupMeetLink}
                disabled={!selectedClient || gcalStatus === 'connecting'}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed"
              >
                {gcalStatus === 'connecting' ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3" />}
                {gcalStatus === 'connecting' ? 'Connecting…' : 'Look up from Google Calendar'}
              </button>
            </div>

            {!selectedClient && (
              <p className="text-[10px] text-slate-400">Select a client first to look up their block's Meet link.</p>
            )}

            {gcalStatus === 'error' && <p className="text-[10px] text-red-500">{gcalError}</p>}

            {gcalStatus === 'connected' && selectedClient && (
              matchingEvents.length === 0 ? (
                <p className="text-[10px] text-amber-600">No {selectedClient.program} event found on today's calendar — enter the link manually below if you have it.</p>
              ) : (
                <div className="space-y-1">
                  {matchingEvents.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between gap-2 text-[11px] bg-white border border-slate-200 rounded px-2 py-1">
                      <span className="text-slate-600 truncate">{ev.title} <span className="text-slate-400 font-mono">({ev.start})</span></span>
                      {ev.hangoutLink ? (
                        <button
                          type="button"
                          onClick={() => set('meetLink', ev.hangoutLink)}
                          className="shrink-0 text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Use this link
                        </button>
                      ) : (
                        <span className="shrink-0 text-slate-400">No Meet link on this event</span>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            <input
              type="text"
              value={form.meetLink}
              onChange={e => set('meetLink', e.target.value)}
              placeholder="https://meet.google.com/…"
              className={inputCls('meetLink')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            Log Request
          </button>
        </div>
      </div>
    </div>
  );
}
