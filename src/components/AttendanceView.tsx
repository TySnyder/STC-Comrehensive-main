/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Filter,
  AlertTriangle,
  Smile,
  Clock,
  Video,
  CheckCircle,
  Layers,
  Plus,
  Phone
} from 'lucide-react';
import { Client, IndSession, AttendanceEntry } from '../types';
import { CLINICAL_AUDIT_LOG_ITEMS } from '../data';

interface AttendanceViewProps {
  clients: Client[];
  indSessions: IndSession[];
  onSelectClient: (client: Client) => void;
  onUpdateAttendance?: (
    clientId: string,
    date: string,
    block: 'A' | 'B' | undefined,
    updates: { status?: 'Present' | 'Absent'; tardy?: boolean; virtual?: boolean; excused?: boolean }
  ) => void;
  onUpdateIndSession?: (
    sessionId: string,
    updates: { attendanceStatus?: IndSession['attendanceStatus']; tardy?: boolean; virtual?: boolean }
  ) => void;
  onAddIndSession?: (session: IndSession) => void;
}

function ClientAttendanceCard({
  client,
  entry,
  date,
  block,
  onSelectClient,
  onUpdateAttendance,
}: {
  client: Client;
  entry: AttendanceEntry | undefined;
  date: string;
  block: 'A' | 'B' | undefined;
  onSelectClient: (c: Client) => void;
  onUpdateAttendance?: AttendanceViewProps['onUpdateAttendance'];
}) {
  const status = entry?.status ?? 'Present';
  const isAbsent = status === 'Absent';
  const isExcused = entry?.excused ?? false;

  return (
    <div
      onClick={() => onSelectClient(client)}
      className="p-3 border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isAbsent ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-700 block truncate">{client.name}</span>
          <span className="text-[10px] text-slate-400 block truncate">{client.primaryTherapist}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
        <span
          onClick={() => onUpdateAttendance?.(client.id, date, block, { status: isAbsent ? 'Present' : 'Absent' })}
          title={`Click to mark ${isAbsent ? 'Present' : 'Absent'}`}
          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase transition-all active:scale-95 cursor-pointer ${
            isAbsent
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          {isAbsent ? 'Absent' : 'Present'}
        </span>
        {isAbsent ? (
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => onUpdateAttendance?.(client.id, date, block, { excused: false })}
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase transition-all ${
                !isExcused ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Unexcused
            </button>
            <button
              onClick={() => onUpdateAttendance?.(client.id, date, block, { excused: true })}
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase transition-all ${
                isExcused ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Excused
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onUpdateAttendance?.(client.id, date, block, { tardy: !entry?.tardy })}
              title={entry?.tardy ? 'Remove tardy' : 'Mark tardy'}
              className="cursor-pointer hover:scale-125 active:scale-100 transition-all"
            >
              <Clock className={`w-5 h-5 transition-colors ${entry?.tardy ? 'text-amber-500' : 'text-slate-300'}`} />
            </button>
            <button
              onClick={() => onUpdateAttendance?.(client.id, date, block, { virtual: !entry?.virtual })}
              title={entry?.virtual ? 'Remove virtual' : 'Mark virtual'}
              className="cursor-pointer hover:scale-125 active:scale-100 transition-all"
            >
              <Video className={`w-5 h-5 transition-colors ${entry?.virtual ? 'text-blue-500' : 'text-slate-300'}`} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AttendanceView({
  clients,
  indSessions,
  onSelectClient,
  onUpdateAttendance,
  onUpdateIndSession,
  onAddIndSession,
}: AttendanceViewProps) {
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('2026-06-15');
  const [showAddInd, setShowAddInd] = useState(false);
  const [newInd, setNewInd] = useState({ clientName: '', therapist: '', time: '', location: '' });
  const [auditLogs, setAuditLogs] = useState(CLINICAL_AUDIT_LOG_ITEMS);
  const [newLogAction, setNewLogAction] = useState('');

  const handleAddAuditLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim()) return;
    setAuditLogs([{
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      action: newLogAction,
      user: 'Clinical Lead',
      program: 'All Programs'
    }, ...auditLogs]);
    setNewLogAction('');
  };

  const handleSubmitIndSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInd.clientName.trim()) return;
    onAddIndSession?.({
      id: `ind-manual-${Date.now()}`,
      clientId: '',
      clientName: newInd.clientName,
      phone: '—',
      therapist: newInd.therapist,
      time: newInd.time,
      location: newInd.location,
      date: selectedDateFilter,
      attendanceStatus: 'Unconfirmed',
      isManual: true
    });
    setNewInd({ clientName: '', therapist: '', time: '', location: '' });
    setShowAddInd(false);
  };

  const getEntry = (client: Client, block: 'A' | 'B' | undefined): AttendanceEntry | undefined =>
    client.attendanceHistory.find(e => e.date === selectedDateFilter && e.block === block);

  const matchesStatus = (entry: AttendanceEntry | undefined): boolean => {
    if (selectedStatusFilter === 'All') return true;
    if (selectedStatusFilter === 'Present') return !entry || entry.status === 'Present';
    if (selectedStatusFilter === 'Absent') return entry?.status === 'Absent';
    if (selectedStatusFilter === 'Late') return entry?.tardy === true;
    return true;
  };

  const diop = clients.filter(c => c.program === 'DIOP');
  const dop = clients.filter(c => c.program === 'DOP');
  const eiop = clients.filter(c => c.program === 'EIOP');
  const eop = clients.filter(c => c.program === 'EOP');

  const filteredDiop = diop.filter(c => matchesStatus(getEntry(c, 'A')));
  const filteredDopClients = dop.filter(c => matchesStatus(getEntry(c, undefined)));
  const filteredDiopInDop = diop.filter(c => matchesStatus(getEntry(c, 'B')));
  const filteredEiop = eiop.filter(c => matchesStatus(getEntry(c, 'A')));
  const filteredEopClients = eop.filter(c => matchesStatus(getEntry(c, undefined)));
  const filteredEiopInEop = eiop.filter(c => matchesStatus(getEntry(c, 'B')));
  const todayIndSessions = indSessions.filter(s => s.date === selectedDateFilter);

  const showDiop = selectedProgramFilter === 'All' || selectedProgramFilter === 'DIOP';
  const showDop  = selectedProgramFilter === 'All' || selectedProgramFilter === 'DOP';
  const showEiop = selectedProgramFilter === 'All' || selectedProgramFilter === 'EIOP';
  const showEop  = selectedProgramFilter === 'All' || selectedProgramFilter === 'EOP';
  const showInd  = selectedProgramFilter === 'All' || selectedProgramFilter === 'IND';

  const totalCensus = 142;
  const presentCount = 128;
  const absentCount = 14;

  return (
    <div id="attendance-census-portal" className="space-y-6">

      {/* Census metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Total Census today</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-1">{totalCensus} Clients</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Checked In (Active)</span>
            <h3 className="text-xl font-bold text-emerald-600 font-display mt-1">{presentCount} Present</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Absence rate</span>
            <h3 className="text-xl font-bold text-red-600 font-display mt-1">{absentCount} Call-Outs</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Clinical Attendance</span>
            <h3 className="text-xl font-bold text-indigo-600 font-display mt-1">
              {((presentCount / totalCensus) * 100).toFixed(0)}% Utilized
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left: Filters */}
        <div className="space-y-6 col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Filter className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Filters</h3>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Program Block</label>
              <select
                value={selectedProgramFilter}
                onChange={e => setSelectedProgramFilter(e.target.value)}
                className="w-full text-xs font-sans border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-indigo-500 font-medium"
              >
                <option value="All">All Programs</option>
                <option value="DIOP">DIOP — 11:45 AM Block</option>
                <option value="DOP">DOP — 1:45 PM Block</option>
                <option value="EIOP">EIOP — 3:45 PM Block</option>
                <option value="EOP">EOP — 5:45 PM Block</option>
                <option value="IND">IND — Individual Therapy</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Reporting Date</label>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={e => setSelectedDateFilter(e.target.value)}
                className="w-full text-xs font-sans border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Absence / Presence</label>
              {[
                { label: 'Show All', value: 'All' },
                { label: 'Present Today', value: 'Present' },
                { label: 'Absences Today', value: 'Absent' },
                { label: 'Tardy Arrivals', value: 'Late' }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setSelectedStatusFilter(f.value)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                    selectedStatusFilter === f.value ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 p-5 rounded-2xl space-y-3 shadow-3xs">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider font-display">Absence Alerts</h4>
            </div>
            <p className="text-[10px] text-red-600 font-sans leading-relaxed">
              Clients exceeding 2 unexcused absences this week — insurance auth impact:
            </p>
            <div className="divide-y divide-red-100 font-sans">
              <div className="py-2 flex justify-between items-center text-[11px] font-bold text-red-900">
                <span>Liam Sterling</span>
                <span className="font-mono text-red-600">3 Absences</span>
              </div>
              <div className="py-2 flex justify-between items-center text-[11px] font-bold text-red-900">
                <span>Sarah Jenkins</span>
                <span className="font-mono text-red-600">1 Absence, 1 Late</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Time-block roster */}
        <div className="space-y-5 lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-7">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800">Daily Clinic Roster</h3>
              <p className="text-xs text-slate-400 font-sans">Organized by time block — DIOP/EIOP clients appear in both of their blocks independently</p>
            </div>

            {/* DIOP Block A — 11:45 AM */}
            {showDiop && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">11:45 AM – 1:30 PM</span>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">DIOP — Day Intensive Outpatient · Block A</h4>
                </div>
                {filteredDiop.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDiop.map(c => (
                      <ClientAttendanceCard key={c.id} client={c} entry={getEntry(c, 'A')} date={selectedDateFilter} block="A" onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">No DIOP clients match current filters.</p>
                )}
              </section>
            )}

            {/* DOP Block B — 1:45 PM */}
            {showDop && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded uppercase tracking-wider">1:45 PM – 3:00 PM</span>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">DOP — Day Outpatient + DIOP Block B</h4>
                </div>
                {(filteredDopClients.length + filteredDiopInDop.length) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDopClients.map(c => (
                      <ClientAttendanceCard key={c.id} client={c} entry={getEntry(c, undefined)} date={selectedDateFilter} block={undefined} onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                    {filteredDiopInDop.map(c => (
                      <ClientAttendanceCard key={`${c.id}-B`} client={c} entry={getEntry(c, 'B')} date={selectedDateFilter} block="B" onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">No DOP clients match current filters.</p>
                )}
              </section>
            )}

            {/* EIOP Block A — 3:45 PM */}
            {showEiop && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">3:45 PM – 5:30 PM</span>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">EIOP — Evening Intensive Outpatient · Block A</h4>
                </div>
                {filteredEiop.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredEiop.map(c => (
                      <ClientAttendanceCard key={c.id} client={c} entry={getEntry(c, 'A')} date={selectedDateFilter} block="A" onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">No EIOP clients match current filters.</p>
                )}
              </section>
            )}

            {/* EOP Block B — 5:45 PM */}
            {showEop && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">5:45 PM – 7:00 PM</span>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">EOP — Evening Outpatient + EIOP Block B</h4>
                </div>
                {(filteredEopClients.length + filteredEiopInEop.length) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredEopClients.map(c => (
                      <ClientAttendanceCard key={c.id} client={c} entry={getEntry(c, undefined)} date={selectedDateFilter} block={undefined} onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                    {filteredEiopInEop.map(c => (
                      <ClientAttendanceCard key={`${c.id}-B`} client={c} entry={getEntry(c, 'B')} date={selectedDateFilter} block="B" onSelectClient={onSelectClient} onUpdateAttendance={onUpdateAttendance} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">No EOP clients match current filters.</p>
                )}
              </section>
            )}

            {/* IND Section */}
            {showInd && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">Varies</span>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">IND — Individual Therapy Sessions</h4>
                  </div>
                  <button
                    onClick={() => setShowAddInd(v => !v)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Session
                  </button>
                </div>

                {showAddInd && (
                  <form onSubmit={handleSubmitIndSession} className="p-3 border border-indigo-100 bg-indigo-50/40 rounded-xl grid grid-cols-2 gap-2">
                    <input placeholder="Client name *" value={newInd.clientName} onChange={e => setNewInd(p => ({ ...p, clientName: e.target.value }))} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 bg-white" required />
                    <input placeholder="Therapist" value={newInd.therapist} onChange={e => setNewInd(p => ({ ...p, therapist: e.target.value }))} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 bg-white" />
                    <input placeholder="Time (e.g. 2:00 PM)" value={newInd.time} onChange={e => setNewInd(p => ({ ...p, time: e.target.value }))} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 bg-white" />
                    <input placeholder="Location / Room" value={newInd.location} onChange={e => setNewInd(p => ({ ...p, location: e.target.value }))} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 bg-white" />
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowAddInd(false)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">Cancel</button>
                      <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg">Add</button>
                    </div>
                  </form>
                )}

                {todayIndSessions.length > 0 ? (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 grid grid-cols-12 px-3 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <span className="col-span-1">Time</span>
                      <span className="col-span-2">Client</span>
                      <span className="col-span-2">Phone</span>
                      <span className="col-span-2">Therapist</span>
                      <span className="col-span-2">Location</span>
                      <span className="col-span-3 text-right">Status</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {todayIndSessions.map(session => {
                        const isAbsent = session.attendanceStatus === 'Absent';
                        const isUnconfirmed = session.attendanceStatus === 'Unconfirmed';
                        return (
                          <div key={session.id} className="grid grid-cols-12 px-3 py-2.5 items-center hover:bg-slate-50/50 transition-colors">
                            <span className="col-span-1 font-mono text-[11px] text-slate-500 font-semibold">{session.time}</span>
                            <div className="col-span-2 min-w-0">
                              <span className="text-xs font-bold text-slate-700 block truncate">{session.clientName}</span>
                              {session.isManual && <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-1 rounded">manual</span>}
                            </div>
                            <span className="col-span-2 text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 shrink-0" />{session.phone}
                            </span>
                            <span className="col-span-2 text-[11px] text-slate-600 font-sans truncate">{session.therapist}</span>
                            <span className="col-span-2 text-[11px] text-slate-500 font-sans truncate">{session.location}</span>
                            <div className="col-span-3 flex items-center justify-end gap-2">
                              <span
                                onClick={() => {
                                  const next: IndSession['attendanceStatus'] = isAbsent ? 'Unconfirmed' : isUnconfirmed ? 'Present' : 'Absent';
                                  onUpdateIndSession?.(session.id, { attendanceStatus: next });
                                }}
                                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase cursor-pointer active:scale-95 transition-all ${
                                  isAbsent ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : isUnconfirmed ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {session.attendanceStatus}
                              </span>
                              <button
                                onClick={() => !isAbsent && onUpdateIndSession?.(session.id, { tardy: !session.tardy })}
                                disabled={isAbsent}
                                className={`transition-all ${isAbsent ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-125'}`}
                              >
                                <Clock className={`w-3.5 h-3.5 ${session.tardy && !isAbsent ? 'text-amber-500' : 'text-slate-300'}`} />
                              </button>
                              <button
                                onClick={() => !isAbsent && onUpdateIndSession?.(session.id, { virtual: !session.virtual })}
                                disabled={isAbsent}
                                className={`transition-all ${isAbsent ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-125'}`}
                              >
                                <Video className={`w-3.5 h-3.5 ${session.virtual && !isAbsent ? 'text-blue-500' : 'text-slate-300'}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">No individual sessions scheduled for this date.</p>
                )}
              </section>
            )}

          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Attendance Notes & Audit Log</h3>
        <p className="text-xs text-slate-400 font-sans mb-4">Operations sign-in registry and daily compliance milestones</p>
        <form onSubmit={handleAddAuditLog} className="relative mb-5 flex gap-3 max-w-2xl">
          <input
            type="text"
            value={newLogAction}
            onChange={e => setNewLogAction(e.target.value)}
            placeholder="Type comment or action to log in the clinical daybook..."
            className="flex-1 text-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans bg-slate-50"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1 shadow-2xs leading-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Log Event
          </button>
        </form>
        <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
          <div className="bg-slate-50 border-b border-slate-100 grid grid-cols-4 p-3 font-semibold text-slate-400 font-mono tracking-wider text-[10px] uppercase">
            <span>Timestamp</span>
            <span className="col-span-2">Verification Action</span>
            <span>Credential User</span>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log, i) => (
              <div key={i} className="grid grid-cols-4 p-3 hover:bg-slate-50/40 transition-colors bg-white font-sans text-slate-600">
                <span className="font-mono text-slate-400 font-medium text-[11px]">{log.date}</span>
                <span className="col-span-2 font-semibold text-slate-750">{log.action}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="font-semibold text-slate-600 text-[11px]">{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
