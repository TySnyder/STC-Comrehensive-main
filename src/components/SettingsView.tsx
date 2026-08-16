/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Workflow,
  Server,
  Award,
  FileSpreadsheet,
} from 'lucide-react';
import { SYSTEM_CONNECTIONS } from '../data';
import { Client, CensusEntry } from '../types';
import { ParsedRow } from '../utils/importParsers';
import FacilityProfileTab from './settings/FacilityProfileTab';
import ClinicalWorkflowsTab from './settings/ClinicalWorkflowsTab';
import SystemConnectionsTab from './settings/SystemConnectionsTab';
import DataImportTab, { ImportStep, ImportFileState } from './settings/DataImportTab';

interface SettingsViewProps {
  clients: Client[];
  censusEntries: CensusEntry[];
  onImportCensus: (entries: CensusEntry[]) => void;
  onUpdateDiagnoses: (updates: { clientId: string; diagnoses: string[] }[]) => void;
  onImportClients: (clients: Client[]) => void;
  emailSendMaster: boolean;
  setEmailSendMaster: (on: boolean) => void;
  emailSignature: string;
  setEmailSignature: (signature: string) => void;
}


// ── Main component ─────────────────────────────────────────────────────────────
// Each nav tab's markup lives in its own component under `./settings/`; this
// component owns the state (so it survives switching between tabs) and wires
// it down as props.

export default function SettingsView({ clients, censusEntries, onImportCensus, onUpdateDiagnoses, onImportClients, emailSendMaster, setEmailSendMaster, emailSignature, setEmailSignature }: SettingsViewProps) {
  const [activeSegment, setActiveSegment] = useState<'profile' | 'workflows' | 'integrations' | 'import'>('profile');

  // Facility profile
  const [facilityName, setFacilityName] = useState('STC Behavioral Health Complex');
  const [taxId, setTaxId] = useState('XX-XXXXXXX');
  const [npi, setNpi] = useState('1894029104');
  const [address, setAddress] = useState('1094 Clinic Road Dr, Austin, TX 78701');

  // Workflow rules
  const [requireCoSign, setRequireCoSign] = useState(true);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(5);
  const [enableVoiceDictation, setEnableVoiceDictation] = useState(false);

  // Integrations
  const [connections, setConnections] = useState(SYSTEM_CONNECTIONS);
  const toggleConnection = (name: string) => {
    setConnections(connections.map(c =>
      c.name === name ? { ...c, status: c.status === 'Connected' ? 'Idle' : 'Connected' } : c
    ));
  };

  // Import wizard
  const [importStep, setImportStep] = useState<ImportStep>('idle');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [importTotalCount, setImportTotalCount] = useState(0);
  const [fileState, setFileState] = useState<ImportFileState>(null);
  const pendingEntriesRef = useRef<CensusEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Sidebar nav
  const navItems = [
    { id: 'profile',      label: 'Facility Profile',     icon: Building2 },
    { id: 'workflows',    label: 'Clinical Workflows',    icon: Workflow },
    { id: 'integrations', label: 'System Connections',    icon: Server },
    { id: 'import',       label: 'Data Import',           icon: FileSpreadsheet },
  ] as const;

  return (
    <div id="settings-portal-wrapper" className="space-y-6">

      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
        <div className="flex gap-1.5 items-center">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 font-sans uppercase">Operations Office Configurator</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">NPI COMPLIANT SYSTEM</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSegment === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSegment(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-450'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-x-4 -translate-y-4" />
            <Award className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold font-display uppercase tracking-wide">Operational Excellence</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-w-[160px] mx-auto">
              This environment is fully HIPAA validated and meets EHR-S criteria.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3 space-y-6">

          {activeSegment === 'profile' && (
            <FacilityProfileTab
              facilityName={facilityName} setFacilityName={setFacilityName}
              taxId={taxId} setTaxId={setTaxId}
              npi={npi} setNpi={setNpi}
              address={address} setAddress={setAddress}
            />
          )}

          {activeSegment === 'workflows' && (
            <ClinicalWorkflowsTab
              requireCoSign={requireCoSign} setRequireCoSign={setRequireCoSign}
              autoSaveMinutes={autoSaveMinutes} setAutoSaveMinutes={setAutoSaveMinutes}
              enableVoiceDictation={enableVoiceDictation} setEnableVoiceDictation={setEnableVoiceDictation}
              emailSendMaster={emailSendMaster} setEmailSendMaster={setEmailSendMaster}
              emailSignature={emailSignature} setEmailSignature={setEmailSignature}
            />
          )}

          {activeSegment === 'integrations' && (
            <SystemConnectionsTab connections={connections} onToggleConnection={toggleConnection} />
          )}

          {activeSegment === 'import' && (
            <DataImportTab
              clients={clients}
              censusEntries={censusEntries}
              onImportCensus={onImportCensus}
              onUpdateDiagnoses={onUpdateDiagnoses}
              onImportClients={onImportClients}
              importStep={importStep} setImportStep={setImportStep}
              fileName={fileName} setFileName={setFileName}
              parsedRows={parsedRows} setParsedRows={setParsedRows}
              isDragging={isDragging} setIsDragging={setIsDragging}
              importedCount={importedCount} setImportedCount={setImportedCount}
              importTotalCount={importTotalCount} setImportTotalCount={setImportTotalCount}
              fileState={fileState} setFileState={setFileState}
              pendingEntriesRef={pendingEntriesRef}
              intervalRef={intervalRef}
              fileInputRef={fileInputRef}
            />
          )}

        </div>
      </div>
    </div>
  );
}
