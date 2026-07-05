/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Staff } from '../../types';

export interface StaffFormValues {
  name: string;
  role: string;
  credentials: string;
  programs: string[];
  hireDate: string;
  email: string;
  phone: string;
  maxCaseload: number;
}

const DEFAULT_VALUES: StaffFormValues = {
  name: '',
  role: 'Senior Clinical Therapist',
  credentials: 'LCSW, PhD',
  programs: ['EIOP'],
  hireDate: '2026-06-15',
  email: '',
  phone: '',
  maxCaseload: 25,
};

interface OnboardStaffFormProps {
  /** Prefill for the "Edit Professional Profile" flow; omit for a blank form. */
  initialValues?: Partial<StaffFormValues>;
  onCancel: () => void;
  onSubmit: (staff: Staff) => void;
}

export default function OnboardStaffForm({ initialValues, onCancel, onSubmit }: OnboardStaffFormProps) {
  const [values, setValues] = useState<StaffFormValues>({ ...DEFAULT_VALUES, ...initialValues });

  const set = <K extends keyof StaffFormValues>(key: K, value: StaffFormValues[K]) =>
    setValues(prev => ({ ...prev, [key]: value }));

  const toggleProgram = (program: string) =>
    set('programs', values.programs.includes(program)
      ? values.programs.filter(p => p !== program)
      : [...values.programs, program]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name) return;

    onSubmit({
      id: `staff-${Date.now()}`,
      name: values.name,
      role: values.role,
      assignedProgram: values.programs,
      currentCaseload: 0,
      maxCaseload: values.maxCaseload,
      credentials: values.credentials,
      hireDate: values.hireDate,
      email: values.email || `${values.name.toLowerCase().replace(' ', '.')}@clinicalops.org`,
      phone: values.phone || '(512) 555-0100',
      attendanceStatus: 'Present',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    });
  };

  return (
    <div id="onboard-clinical-staff-grid" className="space-y-6">

      {/* Back header navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-3xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cancel and Back
        </button>

        <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-md">
          WORKFORCE ONBOARDING FORM
        </span>
      </div>

      {/* Grid Form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns - Inputs */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">

          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Add New Behavioral Health Provider
          </h3>

          {/* Part 1: Personal Identity */}
          <div className="space-y-4 pt-1">
            <h4 className="text-[11px] uppercase font-bold text-indigo-600 font-mono tracking-wider">1. Clinical Identity</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Full Legal Name</label>
                <input
                  id="onboard-name-input"
                  type="text"
                  required
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Dr. Jane Foster"
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all bg-slate-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Role Designation</label>
                <select
                  id="onboard-role-select"
                  value={values.role}
                  onChange={(e) => set('role', e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-indigo-500 transition-all bg-slate-50 font-medium"
                >
                  <option value="Lead Clinical Psychologist">Lead Clinical Psychologist</option>
                  <option value="Senior Clinical Therapist">Senior Clinical Therapist</option>
                  <option value="Licensed Family Therapist">Licensed Family Therapist</option>
                  <option value="Clinical Case Counselor">Clinical Case Counselor</option>
                  <option value="Psychiatric Registered Nurse">Psychiatric Registered Nurse</option>
                </select>
              </div>
            </div>
          </div>

          {/* Part 2: Clinical Assignment */}
          <div className="space-y-4 border-t border-[#f1f5f9] pt-5">
            <h4 className="text-[11px] uppercase font-bold text-indigo-600 font-mono tracking-wider">2. Licensing &amp; Assignment</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Professional Board Credentials</label>
                <input
                  id="onboard-credentials-input"
                  type="text"
                  required
                  value={values.credentials}
                  onChange={(e) => set('credentials', e.target.value)}
                  placeholder="e.g. PhD, LPC, LCSW-S"
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Hire Date Assignment</label>
                <input
                  id="onboard-hire-date-input"
                  type="date"
                  required
                  value={values.hireDate}
                  onChange={(e) => set('hireDate', e.target.value)}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono"
                />
              </div>
            </div>

            {/* Assignment Programs - Multi selection using custom checkboxes */}
            <div>
              <label className="text-xs font-semibold text-slate-500 font-sans block mb-2">Program Assignments</label>
              <div className="flex flex-wrap gap-4 font-sans text-xs">
                {['EIOP', 'DIOP'].map((program) => (
                  <label key={program} className="flex items-center gap-2 cursor-pointer p-2 border border-slate-150 rounded-lg bg-slate-50/50 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={values.programs.includes(program)}
                      onChange={() => toggleProgram(program)}
                      className="rounded border-slate-300 text-indigo-600 accent-indigo-600"
                    />
                    <span className="font-bold text-slate-700 font-mono text-[11px]">{program}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Part 3: Capacity management & Contacts */}
          <div className="space-y-4 border-t border-[#f1f5f9] pt-5">
            <h4 className="text-[11px] uppercase font-bold text-indigo-600 font-mono tracking-wider">3. Communication &amp; Capacity Limit</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Corporate Email Address</label>
                <input
                  id="onboard-email-input"
                  type="email"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="jane.foster@clinicalops.org"
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Direct Ringing/Phone Number</label>
                <input
                  id="onboard-phone-input"
                  type="text"
                  value={values.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(512) 555-0103"
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono"
                />
              </div>
            </div>

            {/* Caseload limit slide */}
            <div className="flex flex-col pt-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center text-xs font-sans font-bold text-slate-700 mb-2">
                <span>Max Caseload Capacity Target</span>
                <span className="font-mono text-indigo-700 text-xs bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-3xs">{values.maxCaseload} Clients Limit</span>
              </div>
              <input
                id="onboard-capacity-slider"
                type="range"
                min="0"
                max="40"
                value={values.maxCaseload}
                onChange={(e) => set('maxCaseload', Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-slate-400 font-medium font-sans mt-2">
                This sets automated system thresholds for patient scheduling alerts. Recommended limit is 25 cases.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#f1f5f9]">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs py-2.5 px-6 rounded-lg shadow-xs cursor-pointer"
            >
              Create Staff Member
            </button>
          </div>

        </form>

        {/* Right Column: Dynamic Preview Card */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

            <div>
              <h4 className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider mb-4">Profile Card Preview</h4>

              <div className="text-center py-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-700 font-bold font-display text-xl rounded-full flex items-center justify-center mx-auto border-2 border-white shadow-3xs">
                  {values.name ? values.name.split(' ').map(n => n[0]).join('') : 'PV'}
                </div>
                <h3 className="font-display font-bold text-sm text-slate-800 mt-3">{values.name || 'New Behavioral Professional'}</h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{values.role}</p>
              </div>

              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Credentials</span>
                  <span className="font-bold text-slate-700 font-mono text-[10px] uppercase">{values.credentials || 'None Declared'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Max Caseload</span>
                  <span className="font-bold text-slate-700 font-mono text-[11px]">{values.maxCaseload} Patients</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Assigned Program</span>
                  <span className="font-mono text-indigo-600 font-semibold text-[10px] uppercase truncate max-w-[120px]">{values.programs.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Corporate Email</span>
                  <span className="font-mono text-slate-600 truncate max-w-[140px] text-[10px]">{values.email || 'Awaiting entry'}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mt-4 text-[10px] font-sans text-amber-700 leading-normal flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block">Operational Density Alert</span>
                Assigning programs without credentials verification triggers an automatic HR auditing checklist flag on launch.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
