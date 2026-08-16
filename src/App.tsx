/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import { useAuth } from './context/AuthContext';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import AttendanceView from './components/AttendanceView';
import DischargeView from './components/DischargeView';
import ReportsView from './components/ReportsView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';
import NoteModal from './components/NoteModal';
import CensusView from './components/CensusView';
import ScheduleView from './components/ScheduleView';
import UaTrackingView from './components/UaTrackingView';
import TaskTrackView, { TaskTrackTicker } from './components/TaskTrackView';
import CallTrackingView from './components/CallTrackingView';
import DischargeClientModal from './components/DischargeClientModal';
import { applyDischarge, reverseDischarge, updateEpisode, readmitClient, DischargeInput } from './utils/episodeHelpers';
import { useLocalStorageState } from './utils/useLocalStorageState';
import { dispatchEmail } from './utils/gmail';
import { listUaAssignments } from './utils/uaAssignmentsApi';

import {
  INITIAL_CLIENTS,
  INITIAL_STAFF,
  INITIAL_RISKS,
  INITIAL_NOTES,
  INITIAL_IND_SESSIONS,
  INITIAL_CENSUS_ENTRIES,
  INITIAL_INSURANCE_BILLING_NOTES,
  INITIAL_SESSIONS,
  INITIAL_SLOTS,
  DEFAULT_EMAIL_SIGNATURE,
  INITIAL_CALL_LOG,
} from './data';
import { IndSession, CensusEntry, InsuranceBillingNote, GridSlot, TimeOffRequest, UaAssignment, Episode, CallResult, EmailDeliveryMode, AttendanceUpdate, CallLogEntry } from './types';
import { Client, Staff, ClinicalNote, OperationalRisk } from './types';

export default function App() {
  const { user, logout } = useAuth();

  // Navigation & Workspace states
  const [currentTab, setTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // EHR persistent client-side database
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [risks, setRisks] = useState<OperationalRisk[]>(INITIAL_RISKS);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>(INITIAL_NOTES);
  const [indSessions, setIndSessions] = useState<IndSession[]>(INITIAL_IND_SESSIONS);
  const [censusEntries, setCensusEntries] = useState<CensusEntry[]>(INITIAL_CENSUS_ENTRIES);
  const [billingNotes, setBillingNotes] = useState<InsuranceBillingNote[]>(INITIAL_INSURANCE_BILLING_NOTES);
  const [scheduleSlots, setScheduleSlots] = useLocalStorageState<GridSlot[]>('stc-schedule-slots', INITIAL_SLOTS);
  const [uaAssignments, setUaAssignments] = useLocalStorageState<UaAssignment[]>('stc-ua-assignments', []);

  // Proof-of-life: stc-backend walking skeleton (see HANDOFF.md). Not wired
  // into uaAssignments state yet — just confirms the browser can reach the
  // Apps Script Web App without a CORS failure.
  useEffect(() => {
    listUaAssignments()
      .then((data) => console.log('[stc-backend proof-of-life] UA assignments:', data))
      .catch((err) => console.error('[stc-backend proof-of-life] failed:', err));
  }, []);
  const [timeOffRequests, setTimeOffRequests] = useLocalStorageState<TimeOffRequest[]>('stc-time-off', []);
  const [emailDeliveryMode, setEmailDeliveryModeRaw] = useLocalStorageState<EmailDeliveryMode>('stc-email-delivery-mode', 'draft');
  // Settings' master switch: while on, every email sends and STAYS in send
  // mode — no auto-revert. The header icon is the lighter one-shot control,
  // only meaningful while the master is off.
  const [emailSendMaster, setEmailSendMasterRaw] = useLocalStorageState<boolean>('stc-email-send-master', false);
  const effectiveEmailMode: EmailDeliveryMode = emailSendMaster ? 'send' : emailDeliveryMode;

  // Header icon's one-shot toggle. No-op while the Settings master is on —
  // that's the only thing governing send behavior at that point.
  const setEmailDeliveryMode = (mode: EmailDeliveryMode) => {
    if (emailSendMaster) return;
    if (mode === 'send' && emailDeliveryMode !== 'send') {
      const confirmed = window.confirm(
        'Switch to SEND mode for the next email? Reverts to Draft automatically right after it goes out.'
      );
      if (!confirmed) return;
    }
    setEmailDeliveryModeRaw(mode);
  };

  // Settings' master switch. Sticky on purpose — arming it requires
  // confirmation, and turning it off is always immediate/unconfirmed.
  const setEmailSendMaster = (on: boolean) => {
    if (on && !emailSendMaster) {
      const confirmed = window.confirm(
        'Turn ON the Send master switch? Every email-producing action will send immediately from now on, and will NOT revert automatically — you have to come back here to turn it off.'
      );
      if (!confirmed) return;
    }
    setEmailSendMasterRaw(on);
    setEmailDeliveryModeRaw(on ? 'send' : 'draft');
  };

  // Single choke point for every email-producing feature. Auto-reverts the
  // one-shot header toggle back to Draft right after a real send — but only
  // when the Settings master isn't the one holding it open.
  const handleDispatchEmail = async (
    token: string,
    opts: { to: string[]; subject: string; body: string }
  ) => {
    await dispatchEmail(token, { ...opts, mode: effectiveEmailMode });
    if (effectiveEmailMode === 'send' && !emailSendMaster) setEmailDeliveryModeRaw('draft');
  };
  const [emailSignature, setEmailSignature] = useLocalStorageState<string>('stc-email-signature', DEFAULT_EMAIL_SIGNATURE);
  const [callLog, setCallLog] = useLocalStorageState<CallLogEntry[]>('stc-call-log', INITIAL_CALL_LOG);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dischargingClient, setDischargingClient] = useState<Client | null>(null);

  // Notes Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);

  // Actions
  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    setTab('clients');
  };

  const handleClearRisk = (id: string) => {
    const risk = risks.find(r => r.id === id);
    setRisks(prev => prev.filter(r => r.id !== id));
    if (!risk) return;
    setClients(prev => prev.map(c => {
      if (c.riskFlag && (risk.clientId ? c.id === risk.clientId : c.name === risk.entityName)) {
        return { ...c, riskFlag: undefined };
      }
      return c;
    }));
  };

  const handleSaveNote = (newNote: ClinicalNote) => {
    setClinicalNotes([newNote, ...clinicalNotes]);
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
    setSelectedClient(prev => prev && prev.id === clientId ? { ...prev, ...updates } : prev);
  };

  const applyClientTransform = (clientId: string, transform: (c: Client) => Client) => {
    setClients(prev => prev.map(c => c.id === clientId ? transform(c) : c));
    setSelectedClient(prev => prev && prev.id === clientId ? transform(prev) : prev);
  };

  const handleDischargeClient = (clientId: string, input: DischargeInput) => {
    applyClientTransform(clientId, c => applyDischarge(c, input));
  };

  const handleReverseDischarge = (clientId: string) => {
    applyClientTransform(clientId, reverseDischarge);
  };

  const handleUpdateEpisode = (clientId: string, episodeId: string, updates: Partial<Episode>) => {
    applyClientTransform(clientId, c => updateEpisode(c, episodeId, updates));
  };

  const handleReadmitClient = (clientId: string, admitDate: string) => {
    applyClientTransform(clientId, c => readmitClient(c, admitDate));
  };

  const handleImportClients = (newClients: Client[]) => {
    setClients(prev => [...newClients, ...prev]);
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaffList([...staffList, newStaff]);
  };

  const handleUpdateClientAttendance = (
    clientId: string,
    date: string,
    block: 'A' | 'B' | undefined,
    updates: AttendanceUpdate
  ) => {
    const updated = clients.map(c => {
      if (c.id !== clientId) return c;
      const existingIdx = c.attendanceHistory.findIndex(
        e => e.date === date && e.block === block
      );
      let history;
      if (existingIdx >= 0) {
        history = c.attendanceHistory.map((entry, i) =>
          i === existingIdx ? { ...entry, ...updates } : entry
        );
      } else {
        // New entries are labeled with the client's program at time of entry (doc 02).
        history = [{ date, block, status: 'Present' as const, program: c.program, ...updates }, ...c.attendanceHistory];
      }
      return { ...c, attendanceHistory: history };
    });
    setClients(updated);
    if (selectedClient?.id === clientId) {
      setSelectedClient(updated.find(c => c.id === clientId)!);
    }
  };

  const handleUpdateIndSession = (
    sessionId: string,
    updates: { attendanceStatus?: 'Present' | 'Absent' | 'Unconfirmed'; tardy?: boolean; virtual?: boolean; callResult?: CallResult }
  ) => {
    setIndSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, ...updates } : s)
    );
  };

  const handleAddIndSession = (session: IndSession) => {
    setIndSessions(prev => [...prev, session]);
  };

  const handleAddCallLogEntry = (entry: CallLogEntry) => {
    setCallLog(prev => [entry, ...prev]);
  };

  const handleUpdateCallLogEntry = (id: string, updates: Partial<CallLogEntry>) => {
    setCallLog(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleSaveCensusEntry = (entry: CensusEntry) => {
    setCensusEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      return idx >= 0
        ? prev.map(e => e.id === entry.id ? entry : e)
        : [...prev, entry];
    });
  };

  const handleUpdateDiagnoses = (updates: { clientId: string; diagnoses: string[] }[]) => {
    setClients(prev => prev.map(c => {
      const update = updates.find(u => u.clientId === c.id);
      if (!update) return c;
      const merged = Array.from(new Set([...c.diagnoses, ...update.diagnoses]));
      return { ...c, diagnoses: merged };
    }));
  };

  const handleImportCensus = (entries: CensusEntry[]) => {
    setCensusEntries(prev => {
      let result = [...prev];
      for (const entry of entries) {
        const idx = result.findIndex(e => e.id === entry.id);
        if (idx >= 0) result[idx] = entry;
        else result.push(entry);
      }
      return result;
    });
  };

  const handleRemoveCensusEntry = (entryId: string) => {
    setCensusEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const handleUpdateBillingNote = (note: InsuranceBillingNote) => {
    setBillingNotes(prev => {
      const idx = prev.findIndex(n => n.clientId === note.clientId && n.weekStart === note.weekStart);
      if (note.notes.trim() === '') {
        return prev.filter((_, i) => i !== idx);
      }
      return idx >= 0
        ? prev.map(n => n.clientId === note.clientId && n.weekStart === note.weekStart ? note : n)
        : [...prev, note];
    });
  };

  const openNoteModalWithContext = (clientId?: string, clientName?: string) => {
    setPreselectedClientId(clientId);
    setNoteModalOpen(true);
  };

  // Quick navigation shortcut from metrics or child triggers
  const handleNavigateToTab = (tab: string) => {
    setTab(tab);
  };

  // Dynamic Page titles mapping
  const getTabTitle = () => {
    switch (currentTab) {
      case 'tasktrack': return 'Task Track';
      case 'dashboard': return 'Operations Dashboard';
      case 'clients': return selectedClient ? `Client Profile: ${selectedClient.name}` : 'Client Directory';
      case 'attendance': return 'Attendance Overview';
      case 'census': return 'Weekly Census';
      case 'ua': return 'UA Tracking';
      case 'calltracking': return 'Call Tracking';
      case 'schedule': return 'Program Schedule Builder';
      case 'discharge': return 'Discharge Planning & Workspace';
      case 'reports': return 'Clinical Analytics & Outcomes';
      case 'staff': return 'Staff Management';
      case 'settings': return 'Settings & Preferences';
      default: return 'Clinical Portal';
    }
  };

  if (!user) return <LoginView />;

  return (
    <div id="portal-root-layout" className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none antialiased">

      {/* 1. Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setTab={(tabId) => {
          setTab(tabId);
          // If moving between tabs, clear transient profile selections to return to directories
          if (tabId !== 'clients') {
            setSelectedClient(null);
          }
        }}
        openNoteModal={() => openNoteModalWithContext()}
        user={user}
        onLogout={logout}
      />

      {/* 2. Scrollable Workspace & Top Toolbar */}
      <div id="portal-workspace-section" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Toolbar */}
        <Header
          title={getTabTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openNoteModal={() => openNoteModalWithContext()}
          clients={clients}
          staff={staffList}
          onSelectClient={handleSelectClient}
          onNavigateToStaff={() => setTab('staff')}
          emailDeliveryMode={effectiveEmailMode}
          setEmailDeliveryMode={setEmailDeliveryMode}
          emailSendMaster={emailSendMaster}
          onDispatchEmail={handleDispatchEmail}
        />

        {/* Dynamic central viewport */}
        <main id="portal-viewport" className="flex-1 overflow-y-auto flex flex-col">
          {currentTab === 'tasktrack' && <TaskTrackTicker />}
          <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full pb-12">

            {currentTab === 'tasktrack' && (
              <TaskTrackView
                clients={clients}
                indSessions={indSessions}
                onUpdateIndSession={handleUpdateIndSession}
                uaAssignments={uaAssignments}
                emailDeliveryMode={effectiveEmailMode}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardView
                clients={clients} 
                staff={staffList}
                onNavigateToTab={handleNavigateToTab}
                onSelectClient={handleSelectClient}
              />
            )}

            {currentTab === 'clients' && (
              <ClientsView
                clients={clients}
                notes={clinicalNotes}
                selectedClient={selectedClient}
                onSelectClient={setSelectedClient}
                openNoteModal={openNoteModalWithContext}
                onAddClient={handleAddClient}
                staffNames={staffList.map(s => s.name)}
                onUpdateAttendance={handleUpdateClientAttendance}
                onUpdateClient={handleUpdateClient}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView
                clients={clients}
                indSessions={indSessions}
                onSelectClient={handleSelectClient}
                onUpdateAttendance={handleUpdateClientAttendance}
                onUpdateIndSession={handleUpdateIndSession}
                onAddIndSession={handleAddIndSession}
              />
            )}

            {currentTab === 'census' && (
              <CensusView
                clients={clients}
                censusEntries={censusEntries}
                billingNotes={billingNotes}
                onSaveCensusEntry={handleSaveCensusEntry}
                onRemoveCensusEntry={handleRemoveCensusEntry}
                onUpdateBillingNote={handleUpdateBillingNote}
              />
            )}

            {currentTab === 'ua' && (
              <UaTrackingView
                clients={clients}
                censusEntries={censusEntries}
                assignments={uaAssignments}
                setAssignments={setUaAssignments}
              />
            )}

            {currentTab === 'calltracking' && (
              <CallTrackingView
                callLog={callLog}
                onAddEntry={handleAddCallLogEntry}
                onUpdateEntry={handleUpdateCallLogEntry}
              />
            )}

            {currentTab === 'schedule' && (
              <ScheduleView
                staff={staffList}
                sessions={INITIAL_SESSIONS}
                slots={scheduleSlots}
                setSlots={setScheduleSlots}
                searchTerm={searchQuery}
                timeOffRequests={timeOffRequests}
              />
            )}

            {currentTab === 'discharge' && (
              <DischargeView
                clients={clients}
                risks={risks}
                onSelectClient={handleSelectClient}
                onClearRisk={handleClearRisk}
                onOpenDischarge={setDischargingClient}
                onReverseDischarge={handleReverseDischarge}
                onReadmit={handleReadmitClient}
                onUpdateEpisode={handleUpdateEpisode}
              />
            )}

            {dischargingClient && (
              <DischargeClientModal
                client={dischargingClient}
                onClose={() => setDischargingClient(null)}
                onDischarge={handleDischargeClient}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView 
                staff={staffList}
              />
            )}

            {currentTab === 'staff' && (
              <StaffView
                staffList={staffList}
                clients={clients}
                slots={scheduleSlots}
                setSlots={setScheduleSlots}
                sessions={INITIAL_SESSIONS}
                timeOffRequests={timeOffRequests}
                setTimeOffRequests={setTimeOffRequests}
                onAddStaff={handleAddStaff}
                onSelectClient={handleSelectClient}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                clients={clients}
                censusEntries={censusEntries}
                onImportCensus={handleImportCensus}
                onUpdateDiagnoses={handleUpdateDiagnoses}
                onImportClients={handleImportClients}
                emailSendMaster={emailSendMaster}
                setEmailSendMaster={setEmailSendMaster}
                emailSignature={emailSignature}
                setEmailSignature={setEmailSignature}
              />
            )}

          </div>
          </div>
        </main>

      </div>

      {/* 3. Global Multi-disciplinary Notes Modal */}
      <NoteModal 
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        clients={clients}
        onSaveNote={handleSaveNote}
        preselectedClientId={preselectedClientId}
      />

    </div>
  );
}
