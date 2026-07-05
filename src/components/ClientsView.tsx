/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  Plus,
  Clock,
  Video,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { Client, ClinicalNote, AttendanceEntry, UaFrequency } from '../types';
import { estDischargeDate, DEFAULT_ENROLLMENT_DAYS, MIN_ENROLLMENT_DAYS } from '../utils/dcDateHelpers';
import AddClientModal from './AddClientModal';

interface ClientsViewProps {
  clients: Client[];
  notes: ClinicalNote[];
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  openNoteModal: (clientId?: string, clientName?: string) => void;
  onAddClient: (client: Client) => void;
  staffNames: string[];
  onUpdateAttendance?: (
    clientId: string,
    date: string,
    block: 'A' | 'B' | undefined,
    updates: { status?: 'Present' | 'Absent'; tardy?: boolean; virtual?: boolean; excused?: boolean }
  ) => void;
  onUpdateClient?: (clientId: string, updates: Partial<Client>) => void;
}

const UA_FREQUENCY_OPTIONS: { value: UaFrequency; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'twice-weekly', label: '2×/week' },
  { value: 'weekly', label: '1×/week' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'external', label: 'External (PCP)' },
];

// Single block cell used in the multi-block DIOP/EIOP calendar
function BlockCell({
  entry,
  label,
  date,
  block,
  clientId,
  onUpdate,
}: {
  entry: AttendanceEntry | undefined;
  label: string;
  date: string;
  block: 'A' | 'B';
  clientId: string;
  onUpdate?: ClientsViewProps['onUpdateAttendance'];
}) {
  const isAbsent = entry?.status === 'Absent';
  const hasEntry = !!entry;

  return (
    <div className={`rounded-xl border flex flex-col select-none transition-colors ${
      isAbsent
        ? 'bg-red-50/80 border-red-200'
        : hasEntry
        ? 'bg-emerald-50/80 border-emerald-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div
        onClick={() => onUpdate?.(clientId, date, block, { status: isAbsent ? 'Present' : 'Absent' })}
        title={`${label} — click to toggle`}
        className="px-2 pt-3 pb-2 text-center cursor-pointer active:opacity-70 transition-opacity"
      >
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block leading-none mb-1.5 tracking-wider">{label}</span>
        <span className={`font-bold text-xs block leading-none ${
          isAbsent ? 'text-red-700' : hasEntry ? 'text-emerald-700' : 'text-slate-400'
        }`}>
          {isAbsent ? 'Absent' : hasEntry ? 'Present' : '—'}
        </span>
      </div>
      <div className={`border-t mx-2 ${isAbsent ? 'border-red-200' : hasEntry ? 'border-emerald-200' : 'border-slate-200'}`} />
      <div className="flex justify-center items-center gap-3 h-9">
        {isAbsent ? (
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => onUpdate?.(clientId, date, block, { excused: false })}
              className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase transition-all ${
                !(entry?.excused) ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Unexcused
            </button>
            <button
              onClick={() => onUpdate?.(clientId, date, block, { excused: true })}
              className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase transition-all ${
                entry?.excused ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Excused
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => hasEntry && onUpdate?.(clientId, date, block, { tardy: !entry?.tardy })}
              disabled={!hasEntry}
              className={`transition-all ${!hasEntry ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-125'}`}
            >
              <Clock className={`w-5 h-5 ${entry?.tardy ? 'text-amber-500' : 'text-slate-400'}`} />
            </button>
            <button
              onClick={() => hasEntry && onUpdate?.(clientId, date, block, { virtual: !entry?.virtual })}
              disabled={!hasEntry}
              className={`transition-all ${!hasEntry ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-125'}`}
            >
              <Video className={`w-5 h-5 ${entry?.virtual ? 'text-blue-500' : 'text-slate-400'}`} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ClientsView({
  clients,
  notes,
  selectedClient,
  onSelectClient,
  openNoteModal,
  onAddClient,
  staffNames,
  onUpdateAttendance,
  onUpdateClient,
}: ClientsViewProps) {
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterInsurance, setFilterInsurance] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesProgram = filterProgram === 'All' || client.program === filterProgram;
    const matchesInsurance = filterInsurance === 'All' || client.insurance === filterInsurance;
    return matchesProgram && matchesInsurance;
  });

  const insuranceCategories = ['All', 'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare', 'Humana'];

  if (selectedClient) {
    const clientNotes = notes.filter(n => n.clientId === selectedClient.id);
    const isMultiBlock = ['DIOP', 'EIOP'].includes(selectedClient.program);

    // Block program labels per program
    const blockALabel = selectedClient.program; // e.g. 'DIOP' or 'EIOP'
    const blockBLabel = selectedClient.program === 'DIOP' ? 'DOP' : 'EOP';

    // Build date list: last 5 unique dates (ascending — oldest left, newest right)
    const uniqueDates = [...new Set(
      selectedClient.attendanceHistory.map(e => e.date)
    )].sort().slice(-5);

    // For multi-block: group entries by date
    const dateMap = new Map<string, { A?: AttendanceEntry; B?: AttendanceEntry; single?: AttendanceEntry }>();
    selectedClient.attendanceHistory.forEach(e => {
      if (!dateMap.has(e.date)) dateMap.set(e.date, {});
      const d = dateMap.get(e.date)!;
      if (e.block === 'A') d.A = e;
      else if (e.block === 'B') d.B = e;
      else d.single = e;
    });

    return (
      <div id="client-profile-workspace" className="space-y-6">

        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectClient(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-3xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Client Directory
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openNoteModal(selectedClient.id, selectedClient.name)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-medium text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Patient Note
            </button>
            <span className="text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Case
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Identity Card */}
          <div className="space-y-6 col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#f8fafc] border-b border-[#f1f5f9] p-6 text-center relative">
                <span className="absolute top-4 right-4 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {selectedClient.gender}
                </span>
                <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full mx-auto flex items-center justify-center font-bold text-3xl border-2 border-white shadow-xs">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-800 mt-3 leading-tight">{selectedClient.name}</h3>
                <p className="text-xs text-indigo-600 font-mono mt-1 font-bold uppercase tracking-wider">{selectedClient.program} Program</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-sans block mb-0.5">Age</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedClient.age} Years Old</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block mb-0.5">Insurance</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedClient.insurance}</span>
                  </div>
                </div>
                <div className="border-t border-[#f1f5f9] pt-4">
                  <span className="text-slate-400 text-xs font-sans block mb-1">Clinical Diagnoses (DSM-5)</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedClient.diagnoses.map((diag, idx) => (
                      <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-[10px] font-sans font-medium">
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#f1f5f9] pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-[#f1f5f9]">
                    <span className="text-slate-500 font-medium font-sans">Primary Clinician:</span>
                    <span className="font-bold text-slate-700">{selectedClient.primaryTherapist}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Admission Date:</span>
                    <span className="font-semibold text-slate-700 font-mono">{selectedClient.admissionDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Est. Discharge:</span>
                    <span className="font-semibold text-slate-700 font-mono">{estDischargeDate(selectedClient)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Enrollment:</span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-700">
                      <input
                        type="number"
                        min={MIN_ENROLLMENT_DAYS}
                        value={selectedClient.enrollmentDays ?? DEFAULT_ENROLLMENT_DAYS}
                        onChange={e => {
                          const n = Number(e.target.value);
                          onUpdateClient?.(selectedClient.id, { enrollmentDays: Number.isNaN(n) ? undefined : n });
                        }}
                        onBlur={e => {
                          const n = Number(e.target.value);
                          if (Number.isNaN(n) || n < MIN_ENROLLMENT_DAYS)
                            onUpdateClient?.(selectedClient.id, { enrollmentDays: MIN_ENROLLMENT_DAYS });
                        }}
                        className="w-14 font-semibold text-right border border-slate-200 rounded-md px-1.5 py-0.5 bg-white hover:border-slate-300 transition-colors"
                      />
                      days ·
                      <select
                        value={selectedClient.scheduleDaysPerWeek ?? 5}
                        onChange={e => onUpdateClient?.(selectedClient.id, { scheduleDaysPerWeek: Number(e.target.value) })}
                        className="font-semibold border border-slate-200 rounded-md px-1 py-0.5 bg-white hover:border-slate-300 transition-colors"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}/wk</option>)}
                      </select>
                    </span>
                  </div>
                  <input
                    value={selectedClient.dcDateNote ?? ''}
                    onChange={e => onUpdateClient?.(selectedClient.id, { dcDateNote: e.target.value })}
                    placeholder="DC date note (optional)"
                    className="w-full text-[11px] border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300"
                  />
                </div>
                <div className="border-t border-[#f1f5f9] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">UA Testing:</span>
                    <select
                      value={selectedClient.uaFrequency ?? 'none'}
                      onChange={e => onUpdateClient?.(selectedClient.id, { uaFrequency: e.target.value as UaFrequency })}
                      className="font-semibold text-slate-700 font-mono text-xs border border-slate-200 rounded-md px-2 py-1 bg-white hover:border-slate-300 transition-colors"
                    >
                      {UA_FREQUENCY_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  {selectedClient.uaFrequency && selectedClient.uaFrequency !== 'none' && (
                    <input
                      value={selectedClient.uaNote ?? ''}
                      onChange={e => onUpdateClient?.(selectedClient.id, { uaNote: e.target.value })}
                      placeholder="UA note (optional — e.g. special arrangement)"
                      className="w-full text-[11px] border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-indigo-300"
                    />
                  )}
                </div>
              </div>
            </div>

            {selectedClient.riskFlag && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex gap-3 shadow-3xs">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider font-display">High Severity Flag</h4>
                  <p className="text-[11px] text-red-600 font-sans mt-1.5 font-medium leading-relaxed">{selectedClient.riskFlag.reason}</p>
                  <span className="text-[10px] font-mono text-red-500 font-bold mt-2 inline-block">
                    PENDING REVIEW: {selectedClient.riskFlag.daysPending} DAYS
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Attendance + Notes */}
          <div className="space-y-6 lg:col-span-2">

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Attendance History</h3>
                  <p className="text-xs text-slate-400 font-sans">Last 5 sessions · {isMultiBlock ? 'Two blocks per day' : 'Single block'}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                    <span className="text-[11px] text-slate-400">Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full inline-block" />
                    <span className="text-[11px] text-slate-400">Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-[11px] text-slate-400">Tardy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-3 h-3 text-blue-500" />
                    <span className="text-[11px] text-slate-400">Virtual</span>
                  </div>
                </div>
              </div>

              {isMultiBlock ? (
                // Two sub-cells per day column for DIOP / EIOP
                <div className="grid grid-cols-5 gap-2.5 pt-2">
                  {uniqueDates.map(date => {
                    const { A, B } = dateMap.get(date) ?? {};
                    const dayNum = date.split('-')[2];
                    return (
                      <div key={date} className="flex flex-col gap-1">
                        <span className="text-[11px] font-mono font-bold text-slate-400 text-center block mb-1">
                          {dayNum}
                        </span>
                        <BlockCell
                          entry={A}
                          label={blockALabel}
                          date={date}
                          block="A"
                          clientId={selectedClient.id}
                          onUpdate={onUpdateAttendance}
                        />
                        <BlockCell
                          entry={B}
                          label={blockBLabel}
                          date={date}
                          block="B"
                          clientId={selectedClient.id}
                          onUpdate={onUpdateAttendance}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Single-block calendar for DOP / EOP / other programs
                <div className="grid grid-cols-5 gap-2.5 pt-2">
                  {uniqueDates.map(date => {
                    const entry = dateMap.get(date)?.single;
                    const isAbsent = entry?.status === 'Absent';
                    return (
                      <div
                        key={date}
                        className={`rounded-xl border flex flex-col select-none transition-colors ${
                          isAbsent ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/80 border-emerald-200'
                        }`}
                      >
                        <div
                          onClick={() => onUpdateAttendance?.(selectedClient.id, date, undefined, { status: isAbsent ? 'Present' : 'Absent' })}
                          title={`Click to mark ${isAbsent ? 'Present' : 'Absent'}`}
                          className="px-2 pt-3 pb-2 text-center cursor-pointer active:opacity-70 transition-opacity"
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block leading-none mb-1.5 tracking-wider">
                            {selectedClient.program}
                          </span>
                          <span className={`font-bold text-xs block leading-none ${isAbsent ? 'text-red-700' : 'text-emerald-700'}`}>
                            {isAbsent ? 'Absent' : 'Present'}
                          </span>
                        </div>
                        <div className={`border-t mx-2 ${isAbsent ? 'border-red-200' : 'border-emerald-200'}`} />
                        <div className="flex justify-center items-center gap-3 h-9">
                          {isAbsent ? (
                            <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
                              <button
                                onClick={() => onUpdateAttendance?.(selectedClient.id, date, undefined, { excused: false })}
                                className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase transition-all ${
                                  !(entry?.excused) ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                Unexcused
                              </button>
                              <button
                                onClick={() => onUpdateAttendance?.(selectedClient.id, date, undefined, { excused: true })}
                                className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase transition-all ${
                                  entry?.excused ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                Excused
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onUpdateAttendance?.(selectedClient.id, date, undefined, { tardy: !entry?.tardy })}
                                className="cursor-pointer hover:scale-125 active:scale-100 transition-all"
                              >
                                <Clock className={`w-5 h-5 transition-colors ${entry?.tardy ? 'text-amber-500' : 'text-slate-400'}`} />
                              </button>
                              <button
                                onClick={() => onUpdateAttendance?.(selectedClient.id, date, undefined, { virtual: !entry?.virtual })}
                                className="cursor-pointer hover:scale-125 active:scale-100 transition-all"
                              >
                                <Video className={`w-5 h-5 transition-colors ${entry?.virtual ? 'text-blue-500' : 'text-slate-400'}`} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clinical Notes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Clinical Notes & Audit Feed</h3>
              <p className="text-xs text-slate-400 font-sans mb-5">Psychiatry progress notes and multidisciplinary recordings</p>
              <div className="space-y-4">
                {clientNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No custom progress notes documented for this period.</p>
                ) : (
                  clientNotes.map(note => (
                    <div key={note.id} className="p-4 border border-slate-100 bg-[#fbfbfb] rounded-xl hover:bg-[#fafafa] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                              {note.noteType}
                            </span>
                            {note.isDraft && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold animate-pulse">
                                DRAFT
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-700 leading-tight mt-1.5">{note.authorName}</h4>
                          <span className="text-[10px] text-slate-400 mt-1 font-mono block">{note.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {note.flags.map((flag, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-medium font-sans">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-sans mt-3 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  return (
    <div id="client-directory-workspace" className="space-y-6">

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3.5 items-center">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Program Assignment</label>
            <select
              value={filterProgram}
              onChange={e => setFilterProgram(e.target.value)}
              className="text-xs font-sans border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus:outline-indigo-500 font-medium"
            >
              <option value="All">All Programs</option>
              <option value="DIOP">DIOP</option>
              <option value="DOP">DOP</option>
              <option value="EIOP">EIOP</option>
              <option value="EOP">EOP</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Insurance Provider</label>
            <select
              value={filterInsurance}
              onChange={e => setFilterInsurance(e.target.value)}
              className="text-xs font-sans border border-slate-200 rounded-lg px-3 py-1.5 w-48 focus:outline-indigo-500 font-medium"
            >
              {insuranceCategories.map((ins, idx) => (
                <option key={idx} value={ins}>{ins === 'All' ? 'All Insurance Carriers' : ins}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Cases Matching</span>
            <span className="text-lg font-bold text-indigo-600 font-display">{filteredClients.length} Patients found</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-450 text-[10px] font-bold font-mono uppercase tracking-wider">
                <th className="py-3.5 px-6">Client Name</th>
                <th className="py-3.5 px-6">Program</th>
                <th className="py-3.5 px-6">Date Admitted</th>
                <th className="py-3.5 px-6">Est. Discharge</th>
                <th className="py-3.5 px-6">Primary Therapist</th>
                <th className="py-3.5 px-6">Payer</th>
                <th className="py-3.5 px-6">Packet Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClients.map(client => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectClient(client)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-1 ring-slate-200 shrink-0">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-xs group-hover:text-indigo-600 transition-colors">{client.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">ID: #{client.id.substring(client.id.length - 4)} · Age {client.age}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] uppercase">
                      {client.program}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600">{client.admissionDate}</td>
                  <td className="py-4 px-6 font-mono text-slate-600">{estDischargeDate(client)}</td>
                  <td className="py-4 px-6 font-sans font-medium text-slate-700">{client.primaryTherapist}</td>
                  <td className="py-4 px-6 font-sans text-slate-500 font-medium">{client.insurance}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      client.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : client.status === 'Discharged'
                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 font-bold font-sans text-[11px] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5"
                      onClick={e => { e.stopPropagation(); onSelectClient(client); }}
                    >
                      Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={onAddClient}
        staffNames={staffNames}
      />
    </div>
  );
}
