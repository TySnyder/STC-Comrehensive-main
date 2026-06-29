/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import AttendanceView from './components/AttendanceView';
import DischargeView from './components/DischargeView';
import ReportsView from './components/ReportsView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';
import NoteModal from './components/NoteModal';

import {
  INITIAL_CLIENTS,
  INITIAL_STAFF,
  INITIAL_RISKS,
  INITIAL_NOTES,
  INITIAL_IND_SESSIONS
} from './data';
import { IndSession } from './types';
import { Client, Staff, ClinicalNote, OperationalRisk } from './types';

export default function App() {
  // Navigation & Workspace states
  const [currentTab, setTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // EHR persistent client-side database
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [risks, setRisks] = useState<OperationalRisk[]>(INITIAL_RISKS);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>(INITIAL_NOTES);
  const [indSessions, setIndSessions] = useState<IndSession[]>(INITIAL_IND_SESSIONS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Notes Modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);

  // Actions
  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    setTab('clients');
  };

  const handleClearRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
    // Optionally also remove riskFlag from matching client
    setClients(clients.map(c => {
      if (c.riskFlag && c.name === risks.find(r => r.id === id)?.entityName) {
        return { ...c, riskFlag: undefined };
      }
      return c;
    }));
  };

  const handleSaveNote = (newNote: ClinicalNote) => {
    setClinicalNotes([newNote, ...clinicalNotes]);
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaffList([...staffList, newStaff]);
  };

  const handleUpdateClientAttendance = (
    clientId: string,
    date: string,
    block: 'A' | 'B' | undefined,
    updates: { status?: 'Present' | 'Absent'; tardy?: boolean; virtual?: boolean; excused?: boolean }
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
        history = [{ date, block, status: 'Present' as const, ...updates }, ...c.attendanceHistory];
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
    updates: { attendanceStatus?: 'Present' | 'Absent' | 'Unconfirmed'; tardy?: boolean; virtual?: boolean }
  ) => {
    setIndSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, ...updates } : s)
    );
  };

  const handleAddIndSession = (session: IndSession) => {
    setIndSessions(prev => [...prev, session]);
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
      case 'dashboard': return 'Operations Dashboard';
      case 'clients': return selectedClient ? `Client Profile: ${selectedClient.name}` : 'Client Directory';
      case 'attendance': return 'Attendance & Census Overview';
      case 'discharge': return 'Discharge Planning & Workspace';
      case 'reports': return 'Clinical Analytics & Outcomes';
      case 'staff': return 'Staff Management';
      case 'settings': return 'Settings & Preferences';
      default: return 'Clinical Portal';
    }
  };

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
      />

      {/* 2. Scrollable Workspace & Top Toolbar */}
      <div id="portal-workspace-section" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Toolbar */}
        <Header 
          title={getTabTitle()} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openNoteModal={() => openNoteModalWithContext()}
        />

        {/* Dynamic central viewport */}
        <main id="portal-viewport" className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full pb-12">
            
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
                onUpdateAttendance={handleUpdateClientAttendance}
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

            {currentTab === 'discharge' && (
              <DischargeView 
                clients={clients}
                risks={risks}
                onSelectClient={handleSelectClient}
                onClearRisk={handleClearRisk}
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
                onAddStaff={handleAddStaff}
                onSelectClient={handleSelectClient}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView />
            )}

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
