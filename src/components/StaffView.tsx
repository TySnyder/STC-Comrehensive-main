/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Plus, 
  FileText, 
  Trash2, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Staff, Client } from '../types';

interface StaffViewProps {
  staffList: Staff[];
  clients: Client[];
  onAddStaff: (newStaff: Staff) => void;
  onSelectClient: (client: Client) => void;
}

export default function StaffView({ staffList, clients, onAddStaff, onSelectClient }: StaffViewProps) {
  // Navigation internal mode: 'directory' | 'onboard' | 'profile'
  const [viewMode, setViewMode] = useState<'directory' | 'onboard' | 'profile'>('directory');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('staff-1'); // Dr. Aris Thorne defaults

  // Onboard Staff Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Senior Clinical Therapist');
  const [formCredentials, setFormCredentials] = useState('LCSW, PhD');
  const [formPrograms, setFormPrograms] = useState<string[]>(['EIOP']);
  const [formHireDate, setFormHireDate] = useState('2026-06-15');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMaxCaseload, setFormMaxCaseload] = useState(25);

  const handleProgramCheckbox = (prog: string) => {
    if (formPrograms.includes(prog)) {
      setFormPrograms(formPrograms.filter(p => p !== prog));
    } else {
      setFormPrograms([...formPrograms, prog]);
    }
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: formName,
      role: formRole,
      assignedProgram: formPrograms,
      currentCaseload: 0,
      maxCaseload: formMaxCaseload,
      credentials: formCredentials,
      hireDate: formHireDate,
      email: formEmail || `${formName.toLowerCase().replace(' ', '.')}@clinicalops.org`,
      phone: formPhone || '(512) 555-0100',
      attendanceStatus: 'Present',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'
    };

    onAddStaff(newStaff);
    setViewMode('directory');

    // Reset Form
    setFormName('');
    setFormRole('Clinical Case Counselor');
    setFormCredentials('');
    setFormPrograms(['EIOP']);
    setFormMaxCaseload(25);
    setFormEmail('');
    setFormPhone('');
  };

  // Find selected staff
  const activeStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  // Specific check list for Dr Thorne
  const complianceChecklist = [
    { label: 'State License Check (LCSW-S Active)', status: 'Approved', daysLeft: 420 },
    { label: 'OIG Background Sanctions Clearance', status: 'Approved', daysLeft: 180 },
    { label: 'Malpractice Liability Insurance Audit', status: 'Approved', daysLeft: 45 }
  ];

  // Handle clinic schedule blocks
  const weeklySchedule = [
    { day: 'Monday', time: '09:00 AM - 11:30 AM', event: 'EIOP Morning Assessment Group' },
    { day: 'Tuesday', time: '01:00 PM - 02:30 PM', event: 'EIOP Cognitive Behavioral Core' },
    { day: 'Wednesday', time: '10:00 AM - 12:00 PM', event: 'Multidisciplinary Staff Case Round' },
    { day: 'Thursday', time: '03:00 PM - 04:30 PM', event: 'DIOP Relapse Prevention Therapy' },
    { day: 'Friday', time: '09:00 AM - 11:00 AM', event: 'Outpatient Exit Planning & Co-signs' }
  ];

  // Map clients supervised by active staff
  const staffClients = clients.filter(c => c.primaryTherapist === activeStaff.name);

  // VIEW 1: Directory List of Staff
  if (viewMode === 'directory') {
    return (
      <div id="staff-directory" className="space-y-6">
        
        {/* Metric summary top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Active Core Providers</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-1">{staffList.length} Headcount</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">On Duty Today</span>
            <h3 className="text-xl font-bold text-emerald-600 font-display mt-1">{staffList.filter(s=>s.attendanceStatus==='Present').length} Active</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">On Leave (FMLA/Vacation)</span>
            <h3 className="text-xl font-bold text-amber-600 font-display mt-1">{staffList.filter(s=>s.status==='On Leave').length} Staff</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Allocated Caseload Capacity</span>
            <h3 className="text-xl font-bold text-indigo-650 font-display mt-1">
              {(staffList.reduce((acc,s)=>acc+s.currentCaseload, 0) / staffList.reduce((acc,s)=>acc + (s.maxCaseload || 1), 0) * 100).toFixed(0)}%
            </h3>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
          <span className="text-xs font-bold text-slate-500 font-sans uppercase">Staff Directory Register</span>
          <button
            id="btn-trigger-onboard"
            onClick={() => setViewMode('onboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Staff Member
          </button>
        </div>

        {/* Directory table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                  <th className="py-3 px-6">Therapist Clinician</th>
                  <th className="py-3 px-6">Assigned Programs</th>
                  <th className="py-3 px-6">Direct Email</th>
                  <th className="py-3 px-6">Clinical Caseload Status</th>
                  <th className="py-3 px-6">Today's Check-in</th>
                  <th className="py-3 px-6">HR Status</th>
                  <th className="py-3 px-6 text-right font-display text-[11px]">Inspect Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {staffList.map((st) => (
                  <tr 
                    key={st.id} 
                    onClick={() => {
                      setSelectedStaffId(st.id);
                      setViewMode('profile');
                    }}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img src={st.photo} alt={st.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs group-hover:text-indigo-600 transition-colors">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-slate-450 block font-mono font-bold uppercase">
                            {st.credentials} • {st.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6">
                      <div className="flex gap-1">
                        {st.assignedProgram.map((p, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-6 text-slate-500 font-medium font-mono text-[11px]">{st.email}</td>

                    <td className="py-3 px-6">
                      {st.maxCaseload > 0 ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="font-mono text-[11px] font-bold text-slate-700 shrink-0">
                            {st.currentCaseload} / {st.maxCaseload}
                          </span>
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                st.currentCaseload / st.maxCaseload > 0.85 ? 'bg-amber-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${(st.currentCaseload / st.maxCaseload) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Non-Caseload Track</span>
                      )}
                    </td>

                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center gap-1.5 font-bold font-mono text-[10px]`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          st.attendanceStatus === 'Present' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {st.attendanceStatus}
                      </span>
                    </td>

                    <td className="py-3 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                        st.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {st.status}
                      </span>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // VIEW 2: Onboard New Clinical Staff Form
  if (viewMode === 'onboard') {
    return (
      <div id="onboard-clinical-staff-grid" className="space-y-6">
        
        {/* Back header navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('directory')}
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
          <form onSubmit={handleCreateStaff} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            
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
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Jane Foster"
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all bg-slate-50"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Role Designation</label>
                  <select
                    id="onboard-role-select"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
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
              <h4 className="text-[11px] uppercase font-bold text-indigo-600 font-mono tracking-wider">2. Licensing & Assignment</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Professional Board Credentials</label>
                  <input
                    id="onboard-credentials-input"
                    type="text"
                    required
                    value={formCredentials}
                    onChange={(e) => setFormCredentials(e.target.value)}
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
                    value={formHireDate}
                    onChange={(e) => setFormHireDate(e.target.value)}
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
                        checked={formPrograms.includes(program)}
                        onChange={() => handleProgramCheckbox(program)}
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
              <h4 className="text-[11px] uppercase font-bold text-indigo-600 font-mono tracking-wider">3. Communication & Capacity Limit</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Corporate Email Address</label>
                  <input
                    id="onboard-email-input"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane.foster@clinicalops.org"
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Direct Ringing/Phone Number</label>
                  <input
                    id="onboard-phone-input"
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(512) 555-0103"
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Caseload limit slide */}
              <div className="flex flex-col pt-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center text-xs font-sans font-bold text-slate-700 mb-2">
                  <span>Max Caseload Capacity Target</span>
                  <span className="font-mono text-indigo-700 text-xs bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-3xs">{formMaxCaseload} Clients Limit</span>
                </div>
                <input
                  id="onboard-capacity-slider"
                  type="range"
                  min="0"
                  max="40"
                  value={formMaxCaseload}
                  onChange={(e) => setFormMaxCaseload(Number(e.target.value))}
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
                    {formName ? formName.split(' ').map(n=>n[0]).join('') : 'PV'}
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-800 mt-3">{formName || 'New Behavioral Professional'}</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">{formRole}</p>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Credentials</span>
                    <span className="font-bold text-slate-700 font-mono text-[10px] uppercase">{formCredentials || 'None Declared'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Max Caseload</span>
                    <span className="font-bold text-slate-700 font-mono text-[11px]">{formMaxCaseload} Patients</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Assigned Program</span>
                    <span className="font-mono text-indigo-600 font-semibold text-[10px] uppercase truncate max-w-[120px]">{formPrograms.join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Corporate Email</span>
                    <span className="font-mono text-slate-600 truncate max-w-[140px] text-[10px]">{formEmail || 'Awaiting entry'}</span>
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

  // VIEW 3: Dr. Aris Thorne Profile (Detailed screen 4)
  if (viewMode === 'profile') {
    return (
      <div id="staff-profile-workspace" className="space-y-6">
        
        {/* Back and Edit */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('directory')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-3xs cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Workforce Register
          </button>
          
          <button
            onClick={() => {
              // Edit Profile defaults to Onboarding form values for demonstration
              setFormName(activeStaff.name);
              setFormRole(activeStaff.role);
              setFormCredentials(activeStaff.credentials);
              setFormPrograms(activeStaff.assignedProgram);
              setFormMaxCaseload(activeStaff.maxCaseload);
              setFormEmail(activeStaff.email);
              setFormPhone(activeStaff.phone);
              setViewMode('onboard');
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors"
          >
            Edit Professional Profile
          </button>
        </div>

        {/* Big Header Identity Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-center">
          <img 
            src={activeStaff.photo} 
            alt={activeStaff.name} 
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100 shadow-3xs shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
              <h2 className="font-display font-bold text-xl text-slate-800 leading-none">{activeStaff.name}</h2>
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">
                {activeStaff.credentials}
              </span>
            </div>
            <p className="text-xs text-slate-450 font-sans tracking-wide leading-none">{activeStaff.role}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-sans text-slate-500 pt-1.5 border-t border-slate-100 max-w-lg">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-500 shrink-0" /> {activeStaff.email}</span>
              <span className="flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-indigo-500 shrink-0" /> {activeStaff.phone}</span>
            </div>
          </div>

          <div className="text-center md:text-right bg-slate-50 p-4 rounded-xl border border-[#f1f5f9] shrink-0 self-stretch flex flex-col justify-center gap-1 min-w-[140px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Caseload limit</span>
            <span className="text-2xl font-bold font-display text-indigo-650 block">
              {activeStaff.currentCaseload} <span className="text-slate-400 text-sm font-sans font-normal">/ {activeStaff.maxCaseload}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 block font-bold leading-none uppercase">
              {activeStaff.maxCaseload - activeStaff.currentCaseload} Spots Available
            </span>
          </div>
        </div>

        {/* Bento Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Caseload list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Caseload list widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Active Managed Caseload</h3>
                  <p className="text-xs text-slate-400 font-sans">Patients assigned directly to {activeStaff.name}</p>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono font-bold">{staffClients.length} Patients Active</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                      <th className="py-2 px-4">Client Name</th>
                      <th className="py-2 px-4">Program</th>
                      <th className="py-2 px-4">Target Discharge</th>
                      <th className="py-2 px-4">Daily Attendance</th>
                      <th className="py-2 px-4 text-right">Task</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-slate-600">
                    {staffClients.map((client) => {
                      const todayAtt = client.attendanceHistory[0]?.status || 'Present';
                      return (
                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{client.name}</td>
                          <td className="py-3 px-4 font-bold font-mono text-indigo-700">{client.program}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{client.expectedDischargeDate}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                              todayAtt === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'
                            }`}>
                              {todayAtt}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                onSelectClient(client);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                            >
                              Check-In
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {staffClients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-400 py-8">
                          No active clinical caseload assigned to this provider.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly calendar Course schedule */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-display font-bold text-base text-slate-900 leading-snug mb-1">Weekly Course & Clinic Calendar</h3>
              <p className="text-xs text-slate-400 font-sans mb-4">Therapy panels, roundtables, and co-signature windows</p>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden font-sans">
                {weeklySchedule.map((sched, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50/50 transition-colors flex justify-between items-center bg-white text-xs">
                    <span className="font-bold text-slate-800 w-24 block">{sched.day}</span>
                    <span className="font-mono text-indigo-650 bg-indigo-50/50 px-2.5 py-1 rounded border border-indigo-100 shrink-0 font-bold max-w-xs">{sched.time}</span>
                    <span className="font-medium text-slate-500 flex-1 pl-4 truncate text-right">{sched.event}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Performance and compliance checklists */}
          <div className="space-y-6">
            
            {/* Dr Thorne Performance Cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Clinical Outcome Indicators</h3>

              <div className="space-y-4">
                {[
                  { name: 'Average Attendance Rate', pct: '94%', color: 'w-[94%] bg-indigo-600' },
                  { name: 'Discharge Summaries Completion', pct: '98.5%', color: 'w-[98%] bg-emerald-500' },
                  { name: 'Patient Stay Compliance', pct: '100%', color: 'w-[100%] bg-sky-400' }
                ].map((ind, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-sans font-medium">{ind.name}</span>
                      <span className="font-mono font-bold text-slate-700">{ind.pct}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ind.color}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Status Checklist checklist */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Compliance & Licensing</h3>

              <div className="space-y-4 text-xs font-sans">
                {complianceChecklist.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 truncate pr-2">{comp.label}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                        {comp.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Days to audits renewal:</span>
                      <span className="font-mono font-bold text-slate-600">{comp.daysLeft} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  return null;
}
