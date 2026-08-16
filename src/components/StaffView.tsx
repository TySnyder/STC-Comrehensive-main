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
  TrendingDown,
  X
} from 'lucide-react';
import { Staff, Client, GridSlot, SessionType, TimeOffRequest } from '../types';
import { estDischargeDate } from '../utils/dcDateHelpers';
import TimeOffModal from './staff/TimeOffModal';
import OnboardStaffForm, { StaffFormValues } from './staff/OnboardStaffForm';

interface StaffViewProps {
  staffList: Staff[];
  clients: Client[];
  slots: GridSlot[];
  setSlots: React.Dispatch<React.SetStateAction<GridSlot[]>>;
  sessions: SessionType[];
  timeOffRequests: TimeOffRequest[];
  setTimeOffRequests: React.Dispatch<React.SetStateAction<TimeOffRequest[]>>;
  onAddStaff: (newStaff: Staff) => void;
  onSelectClient: (client: Client) => void;
}

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const DAY_LABELS: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday',
};

export default function StaffView({ staffList, clients, slots, setSlots, sessions, timeOffRequests, setTimeOffRequests, onAddStaff, onSelectClient }: StaffViewProps) {
  // Navigation internal mode: 'directory' | 'onboard' | 'profile'
  const [viewMode, setViewMode] = useState<'directory' | 'onboard' | 'profile'>('directory');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('staff-1'); // Dr. Aris Thorne defaults

  // Prefill for the onboarding form when editing an existing profile
  const [editPrefill, setEditPrefill] = useState<Partial<StaffFormValues> | undefined>(undefined);

  // Time Off modal state
  const [showTimeOff, setShowTimeOff] = useState(false);

  // Sub coverage modal state
  const [subModalSlot, setSubModalSlot] = useState<GridSlot | null>(null);
  const [subPickedId, setSubPickedId]   = useState<string>('');

  const openSubModal = (slot: GridSlot) => {
    setSubModalSlot(slot);
    const others = staffList.filter(s => s.id !== slot.therapistId);
    setSubPickedId(others[0]?.id ?? '');
  };

  const confirmSub = () => {
    if (!subModalSlot || !subPickedId) return;
    setSlots(prev => prev.map(s =>
      s.id === subModalSlot.id ? { ...s, substituteId: subPickedId } : s
    ));
    setSubModalSlot(null);
  };

  const removeSub = (slotId: string) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, substituteId: null } : s
    ));
  };

  // Find selected staff
  const activeStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  // Specific check list for Dr Thorne
  const complianceChecklist = [
    { label: 'State License Check (LCSW-S Active)', status: 'Approved', daysLeft: 420 },
    { label: 'OIG Background Sanctions Clearance', status: 'Approved', daysLeft: 180 },
    { label: 'Malpractice Liability Insurance Audit', status: 'Approved', daysLeft: 45 }
  ];

  // Derive schedule rows — own assignments and coverage slots
  const weeklySchedule = slots
    .filter(s => s.therapistId === activeStaff?.id && s.weekIndex === 0)
    .sort((a, b) => DAY_ORDER.indexOf(a.dayId) - DAY_ORDER.indexOf(b.dayId))
    .map(s => {
      const session = sessions.find(sess => sess.id === s.sessionId);
      const sub = s.substituteId ? staffList.find(st => st.id === s.substituteId) : null;
      return {
        slot: s,
        day: DAY_LABELS[s.dayId] ?? s.dayId,
        time: session?.timeRange ?? '—',
        event: `${session?.name ?? s.sessionId} — ${s.programType}`,
        sub,
      };
    });

  // Slots where this staff is covering for someone else
  const coverageSlots = slots
    .filter(s => s.substituteId === activeStaff?.id && s.weekIndex === 0)
    .sort((a, b) => DAY_ORDER.indexOf(a.dayId) - DAY_ORDER.indexOf(b.dayId))
    .map(s => {
      const session = sessions.find(sess => sess.id === s.sessionId);
      const original = staffList.find(st => st.id === s.therapistId);
      return {
        slot: s,
        day: DAY_LABELS[s.dayId] ?? s.dayId,
        time: session?.timeRange ?? '—',
        event: `${session?.name ?? s.sessionId} — ${s.programType}`,
        original,
      };
    });

  // Map clients supervised by active staff
  const staffClients = clients.filter(c => c.primaryTherapist === activeStaff.name);

  // VIEW 1: Directory List of Staff
  if (viewMode === 'directory') {
    return (
      <>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTimeOff(true)}
              className="border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-sans font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Calendar className="w-3.5 h-3.5" /> Approved Schedule Requests
            </button>
            <button
              id="btn-trigger-onboard"
              onClick={() => { setEditPrefill(undefined); setViewMode('onboard'); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Staff Member
            </button>
          </div>
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

      {showTimeOff && (
        <TimeOffModal
          staffList={staffList}
          requests={timeOffRequests}
          onAdd={req => setTimeOffRequests(prev => [...prev, req])}
          onRemove={id => setTimeOffRequests(prev => prev.filter(r => r.id !== id))}
          onClose={() => setShowTimeOff(false)}
        />
      )}
      </>
    );
  }

  // VIEW 2: Onboard New Clinical Staff Form
  if (viewMode === 'onboard') {
    return (
      <OnboardStaffForm
        initialValues={editPrefill}
        onCancel={() => setViewMode('directory')}
        onSubmit={newStaff => {
          onAddStaff(newStaff);
          setViewMode('directory');
        }}
      />
    );
  }

  // VIEW 3: Dr. Aris Thorne Profile (Detailed screen 4)
  if (viewMode === 'profile') {
    return (
      <>
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
              setEditPrefill({
                name: activeStaff.name,
                role: activeStaff.role,
                credentials: activeStaff.credentials,
                programs: activeStaff.assignedProgram,
                maxCaseload: activeStaff.maxCaseload,
                email: activeStaff.email,
                phone: activeStaff.phone,
              });
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
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono font-bold">
                  {staffClients.length} active / {clients.length} total
                </span>
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
                          <td className="py-3 px-4 font-mono text-slate-400">{estDischargeDate(client)}</td>
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
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Weekly Course & Clinic Calendar</h3>
                <div className="flex items-baseline gap-1 shrink-0 ml-4">
                  <span className="font-display font-bold text-lg text-slate-800 leading-none">{weeklySchedule.length}</span>
                  <span className="text-xs text-slate-400 font-sans leading-none">/ 20</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans mb-4">Therapy panels, roundtables, and co-signature windows</p>

              {weeklySchedule.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden font-sans">
                  {weeklySchedule.map((sched) => (
                    <div key={sched.slot.id} className="p-3.5 hover:bg-slate-50/50 transition-colors flex items-center gap-3 bg-white text-xs">
                      <span className="font-bold text-slate-800 w-24 shrink-0">{sched.day}</span>
                      <span className="font-mono text-indigo-650 bg-indigo-50/50 px-2.5 py-1 rounded border border-indigo-100 shrink-0 font-bold">{sched.time}</span>
                      <span className="font-medium text-slate-500 flex-1 truncate">{sched.event}</span>

                      {sched.sub ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg font-mono text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            Covered · {sched.sub.name.split(' ')[0]} {sched.sub.name.split(' ').slice(-1)[0]}
                          </span>
                          <button
                            onClick={() => removeSub(sched.slot.id)}
                            className="text-[10px] text-slate-400 hover:text-red-500 font-bold transition-colors px-1"
                            title="Remove coverage"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSubModal(sched.slot)}
                          className="shrink-0 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Set Cover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400 font-sans">
                  No sessions assigned in the Program Schedule yet.
                </div>
              )}

              {/* Coverage assignments — slots this staff is subbing for someone else */}
              {coverageSlots.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 mb-2">
                    Coverage Assignments
                  </h4>
                  <div className="divide-y divide-slate-100 border border-amber-100 rounded-xl overflow-hidden font-sans">
                    {coverageSlots.map((sched) => (
                      <div key={sched.slot.id} className="p-3.5 bg-amber-50/40 flex items-center gap-3 text-xs">
                        <span className="font-bold text-slate-800 w-24 shrink-0">{sched.day}</span>
                        <span className="font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-100 shrink-0 font-bold">{sched.time}</span>
                        <span className="font-medium text-slate-500 flex-1 truncate">{sched.event}</span>
                        <span className="shrink-0 text-[10px] font-bold text-amber-700 font-mono">
                          Sub for {sched.original?.name ?? 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Sub coverage modal */}
      {subModalSlot && (() => {
        const session  = sessions.find(s => s.id === subModalSlot.sessionId);
        const others   = staffList.filter(s => s.id !== subModalSlot.therapistId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSubModalSlot(null)}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-base text-slate-900">Set Coverage</h3>
                <button onClick={() => setSubModalSlot(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 mb-4">
                <span className="font-bold text-indigo-600">{session?.name}</span>
                {' · '}
                <span>{DAY_LABELS[subModalSlot.dayId]}</span>
                {' · '}
                <span>{session?.timeRange}</span>
              </div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Covering Clinician
              </label>
              <select
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none mb-5"
                value={subPickedId}
                onChange={e => setSubPickedId(e.target.value)}
              >
                {others.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.credentials})</option>
                ))}
              </select>

              <p className="text-[10px] text-slate-400 font-sans mb-4">
                This substitution will be recorded on the slot. Only one level of coverage is allowed — the covering clinician cannot be further subbed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubModalSlot(null)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSub}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow transition-colors"
                >
                  Confirm Coverage
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </>
    );
  }

  return null;
}
