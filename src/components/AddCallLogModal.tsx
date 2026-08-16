/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, PhoneIncoming } from 'lucide-react';
import { CallLogEntry, CallFollowUpStatus } from '../types';

interface AddCallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: CallLogEntry) => void;
  intakeSpecialists: string[];
}

const FOLLOW_UP_OPTIONS: CallFollowUpStatus[] = ['New', 'Follow-Up Needed', 'Scheduled', 'No Action Needed', 'Closed'];

function generateId() {
  return `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyForm = (today: string) => ({
  date: today,
  time: '',
  intakeSpecialist: '',
  callerName: '',
  callerRelationship: '',
  callerPhone: '',
  callerEmail: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  location: 'SF' as 'SF' | 'ABQ',
  referralSource: '',
  referringProvider: '',
  insurance: '',
  issuesNotes: '',
  clinicianNotes: '',
  followUpStatus: 'New' as CallFollowUpStatus,
});

export default function AddCallLogModal({ isOpen, onClose, onSave, intakeSpecialists }: AddCallLogModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(emptyForm(today));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Required';
    if (!form.intakeSpecialist.trim()) e.intakeSpecialist = 'Required';
    if (!form.callerName.trim()) e.callerName = 'Required';
    if (!form.clientName.trim()) e.clientName = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const entry: CallLogEntry = {
      id: generateId(),
      date: form.date,
      time: form.time.trim() || undefined,
      intakeSpecialist: form.intakeSpecialist.trim(),
      callerName: form.callerName.trim(),
      callerRelationship: form.callerRelationship.trim() || undefined,
      callerPhone: form.callerPhone.trim() || undefined,
      callerEmail: form.callerEmail.trim() || undefined,
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim() || undefined,
      clientEmail: form.clientEmail.trim() || undefined,
      location: form.location,
      referralSource: form.referralSource.trim() || undefined,
      referringProvider: form.referringProvider.trim() || undefined,
      insurance: form.insurance.trim() || undefined,
      issuesNotes: form.issuesNotes.trim() || undefined,
      clinicianNotes: form.clinicianNotes.trim() || undefined,
      followUpStatus: form.followUpStatus,
    };
    onSave(entry);
    onClose();
    setForm(emptyForm(today));
    setErrors({});
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
              <PhoneIncoming className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Log Intake Call</h2>
              <p className="text-[10px] text-slate-400 font-mono">New inquiry / intake call</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

          {/* Date / Time / Location */}
          <div className="grid grid-cols-3 gap-3">
            {field('Date *', 'date',
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls('date')} />
            )}
            {field('Time', 'time',
              <input type="text" value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10:15 AM" className={inputCls('time')} />
            )}
            {field('Location *', 'location',
              <select value={form.location} onChange={e => set('location', e.target.value)} className={selectCls}>
                <option value="SF">Santa Fe</option>
                <option value="ABQ">Albuquerque</option>
              </select>
            )}
          </div>

          {/* Intake specialist */}
          {field('Intake Specialist *', 'intakeSpecialist',
            <input
              type="text"
              list="intake-specialist-options"
              value={form.intakeSpecialist}
              onChange={e => set('intakeSpecialist', e.target.value)}
              placeholder="Staff taking the call"
              className={inputCls('intakeSpecialist')}
            />
          )}
          <datalist id="intake-specialist-options">
            {intakeSpecialists.map(n => <option key={n} value={n} />)}
          </datalist>

          {/* Caller */}
          <div className="grid grid-cols-2 gap-3">
            {field('Caller Name *', 'callerName',
              <input type="text" value={form.callerName} onChange={e => set('callerName', e.target.value)} className={inputCls('callerName')} />
            )}
            {field('Relationship to Client', 'callerRelationship',
              <input type="text" value={form.callerRelationship} onChange={e => set('callerRelationship', e.target.value)} placeholder="e.g. Self, Parent, Spouse" className={inputCls('callerRelationship')} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('Caller Phone', 'callerPhone',
              <input type="text" value={form.callerPhone} onChange={e => set('callerPhone', e.target.value)} className={inputCls('callerPhone')} />
            )}
            {field('Caller Email', 'callerEmail',
              <input type="email" value={form.callerEmail} onChange={e => set('callerEmail', e.target.value)} className={inputCls('callerEmail')} />
            )}
          </div>

          {/* Prospective client */}
          {field('Client Name *', 'clientName',
            <input type="text" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Prospective client" className={inputCls('clientName')} />
          )}
          <div className="grid grid-cols-2 gap-3">
            {field('Client Phone', 'clientPhone',
              <input type="text" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} className={inputCls('clientPhone')} />
            )}
            {field('Client Email', 'clientEmail',
              <input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} className={inputCls('clientEmail')} />
            )}
          </div>

          {/* Referral / provider / insurance */}
          <div className="grid grid-cols-2 gap-3">
            {field('Referral Source', 'referralSource',
              <input type="text" value={form.referralSource} onChange={e => set('referralSource', e.target.value)} className={inputCls('referralSource')} />
            )}
            {field('Therapist / Prescriber', 'referringProvider',
              <input type="text" value={form.referringProvider} onChange={e => set('referringProvider', e.target.value)} className={inputCls('referringProvider')} />
            )}
          </div>
          {field('Insurance', 'insurance',
            <input type="text" value={form.insurance} onChange={e => set('insurance', e.target.value)} className={inputCls('insurance')} />
          )}

          {/* Notes */}
          {field('Issues / Notes', 'issuesNotes',
            <textarea value={form.issuesNotes} onChange={e => set('issuesNotes', e.target.value)} rows={2} className={inputCls('issuesNotes')} />
          )}
          {field('Clinician Notes', 'clinicianNotes',
            <textarea value={form.clinicianNotes} onChange={e => set('clinicianNotes', e.target.value)} rows={2} className={inputCls('clinicianNotes')} />
          )}

          {/* Follow-up status */}
          {field('Follow-up Status', 'followUpStatus',
            <select value={form.followUpStatus} onChange={e => set('followUpStatus', e.target.value as CallFollowUpStatus)} className={selectCls}>
              {FOLLOW_UP_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
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
            <PhoneIncoming className="w-3.5 h-3.5" />
            Log Call
          </button>
        </div>
      </div>
    </div>
  );
}
