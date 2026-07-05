import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Client } from '../types';
import { predictDischargeDate, DEFAULT_ENROLLMENT_DAYS, MIN_ENROLLMENT_DAYS } from '../utils/dcDateHelpers';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  staffNames: string[];
}

const PROGRAMS = ['DIOP', 'DOP', 'EIOP', 'EOP'] as const;
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

function generateId() {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AddClientModal({ isOpen, onClose, onSave, staffNames }: AddClientModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    program: 'DIOP' as typeof PROGRAMS[number],
    location: 'SF' as 'SF' | 'ABQ',
    admissionDate: today,
    insurance: '',
    age: '',
    gender: 'Male',
    diagnosisInput: '',
    diagnoses: [] as string[],
    primaryTherapist: '',
    status: 'Pending Admit' as Client['status'],
    followUpNeeded: false,
    enrollmentDays: String(DEFAULT_ENROLLMENT_DAYS),
    scheduleDaysPerWeek: 5,
    dcDateNote: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const set = (field: string, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const addDiagnosis = () => {
    const trimmed = form.diagnosisInput.trim();
    if (!trimmed || form.diagnoses.includes(trimmed)) return;
    setForm(f => ({ ...f, diagnoses: [...f.diagnoses, trimmed], diagnosisInput: '' }));
  };

  const removeDiagnosis = (d: string) =>
    setForm(f => ({ ...f, diagnoses: f.diagnoses.filter(x => x !== d) }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.insurance.trim()) e.insurance = 'Required';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1) e.age = 'Enter a valid age';
    if (!form.primaryTherapist.trim()) e.primaryTherapist = 'Required';
    if (!form.admissionDate) e.admissionDate = 'Required';
    const days = Number(form.enrollmentDays);
    if (isNaN(days) || days < MIN_ENROLLMENT_DAYS) e.enrollmentDays = `Minimum ${MIN_ENROLLMENT_DAYS} treatment days`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const newClient: Client = {
      id: generateId(),
      name: form.name.trim(),
      program: form.program,
      location: form.location,
      admissionDate: form.admissionDate,
      enrollmentDays: Number(form.enrollmentDays),
      scheduleDaysPerWeek: form.scheduleDaysPerWeek,
      dcDateNote: form.dcDateNote.trim() || undefined,
      status: form.status,
      followUpNeeded: form.followUpNeeded,
      insurance: form.insurance.trim(),
      age: Number(form.age),
      gender: form.gender,
      diagnoses: form.diagnoses,
      primaryTherapist: form.primaryTherapist.trim(),
      episodes: [{ id: `${generateId()}-ep1`, episodeNumber: 1, admitDate: form.admissionDate }],
      attendanceHistory: [],
    };
    onSave(newClient);
    onClose();
    setForm({
      name: '', program: 'DIOP', location: 'SF', admissionDate: today,
      insurance: '', age: '', gender: 'Male', diagnosisInput: '',
      diagnoses: [], primaryTherapist: '', status: 'Pending Admit', followUpNeeded: false,
      enrollmentDays: String(DEFAULT_ENROLLMENT_DAYS), scheduleDaysPerWeek: 5, dcDateNote: '',
    });
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

  const selectCls = (key: string) =>
    `w-full text-xs font-sans border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
      errors[key] ? 'border-red-400' : 'border-slate-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Add New Client</h2>
              <p className="text-[10px] text-slate-400 font-mono">New intake enrollment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">

          {/* Name */}
          {field('Full Name *', 'name',
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="First Last"
              className={inputCls('name')}
            />
          )}

          {/* Program + Location */}
          <div className="grid grid-cols-2 gap-3">
            {field('Program *', 'program',
              <select value={form.program} onChange={e => set('program', e.target.value)} className={selectCls('program')}>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>
            )}
            {field('Location *', 'location',
              <select value={form.location} onChange={e => set('location', e.target.value)} className={selectCls('location')}>
                <option value="SF">Santa Fe</option>
                <option value="ABQ">Albuquerque</option>
              </select>
            )}
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-3">
            {field('Age *', 'age',
              <input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="e.g. 34"
                className={inputCls('age')}
              />
            )}
            {field('Gender *', 'gender',
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectCls('gender')}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            )}
          </div>

          {/* Admission Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            {field('Admission Date *', 'admissionDate',
              <input
                type="date"
                value={form.admissionDate}
                onChange={e => set('admissionDate', e.target.value)}
                className={inputCls('admissionDate')}
              />
            )}
            {field('Status *', 'status',
              <select value={form.status} onChange={e => set('status', e.target.value as Client['status'])} className={selectCls('status')}>
                <option value="Inquiry">Inquiry</option>
                <option value="Pending Admit">Pending Admit</option>
                <option value="Active">Active</option>
                <option value="Discharged">Discharged</option>
              </select>
            )}
          </div>

          {/* Enrollment length → predicted DC date */}
          <div className="grid grid-cols-2 gap-3">
            {field(`Enrollment (Treatment Days, min ${MIN_ENROLLMENT_DAYS}) *`, 'enrollmentDays',
              <input
                type="number"
                min={MIN_ENROLLMENT_DAYS}
                value={form.enrollmentDays}
                onChange={e => set('enrollmentDays', e.target.value)}
                className={inputCls('enrollmentDays')}
              />
            )}
            {field('Days / Week', 'scheduleDaysPerWeek',
              <select
                value={form.scheduleDaysPerWeek}
                onChange={e => set('scheduleDaysPerWeek', Number(e.target.value))}
                className={selectCls('scheduleDaysPerWeek')}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} days/week</option>)}
              </select>
            )}
          </div>
          {form.admissionDate && !isNaN(Number(form.enrollmentDays)) && Number(form.enrollmentDays) >= MIN_ENROLLMENT_DAYS && (
            <p className="text-[10px] text-slate-400 font-mono -mt-2">
              Predicted DC date:{' '}
              <span className="font-bold text-indigo-600">
                {predictDischargeDate(form.admissionDate, Number(form.enrollmentDays), form.scheduleDaysPerWeek)}
              </span>
            </p>
          )}
          {field('DC Date Note (optional)', 'dcDateNote',
            <input
              type="text"
              value={form.dcDateNote}
              onChange={e => set('dcDateNote', e.target.value)}
              placeholder="e.g. pending insurance reauthorization"
              className={inputCls('dcDateNote')}
            />
          )}

          {/* Insurance */}
          {field('Insurance *', 'insurance',
            <input
              type="text"
              value={form.insurance}
              onChange={e => set('insurance', e.target.value)}
              placeholder="e.g. Blue Cross Blue Shield"
              className={inputCls('insurance')}
            />
          )}

          {/* Primary Therapist */}
          {field('Primary Therapist *', 'primaryTherapist',
            staffNames.length > 0
              ? <select value={form.primaryTherapist} onChange={e => set('primaryTherapist', e.target.value)} className={selectCls('primaryTherapist')}>
                  <option value="">Select therapist…</option>
                  {staffNames.map(n => <option key={n}>{n}</option>)}
                </select>
              : <input
                  type="text"
                  value={form.primaryTherapist}
                  onChange={e => set('primaryTherapist', e.target.value)}
                  placeholder="Therapist name"
                  className={inputCls('primaryTherapist')}
                />
          )}

          {/* Diagnoses */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block font-sans">
              Diagnoses
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.diagnosisInput}
                onChange={e => set('diagnosisInput', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDiagnosis())}
                placeholder="Type a diagnosis and press Enter"
                className="flex-1 text-xs font-sans border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={addDiagnosis}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {form.diagnoses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.diagnoses.map(d => (
                  <span key={d} className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                    {d}
                    <button onClick={() => removeDiagnosis(d)} className="hover:text-indigo-900 ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.followUpNeeded}
              onChange={e => set('followUpNeeded', e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs text-slate-600 font-medium">Follow-up needed</span>
          </label>
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
            <UserPlus className="w-3.5 h-3.5" />
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
}
