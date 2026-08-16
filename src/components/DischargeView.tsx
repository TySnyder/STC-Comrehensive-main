/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileCheck, 
  Clock, 
  HelpCircle, 
  Coins, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Filter,
  BarChart,
  UserX,
  TrendingDown,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { Client, ClientStatus, Episode, OperationalRisk } from '../types';
import {
  getCurrentEpisode,
  getPaperworkItems,
  countOutstanding,
  chaseDeadline,
  PaperworkItem,
} from '../utils/episodeHelpers';
import { estDischargeDate } from '../utils/dcDateHelpers';

interface DischargeViewProps {
  clients: Client[];
  risks: OperationalRisk[];
  onSelectClient: (client: Client) => void;
  onClearRisk: (id: string) => void;
  onOpenDischarge: (client: Client) => void;
  onReverseDischarge: (clientId: string) => void;
  onReadmit: (clientId: string, admitDate: string) => void;
  onUpdateEpisode: (clientId: string, episodeId: string, updates: Partial<Episode>) => void;
}

const PAPERWORK_STATE_STYLES: Record<PaperworkItem['state'], string> = {
  'not-sent': 'bg-slate-100 text-slate-500',
  'sent': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'chasing': 'bg-amber-100 text-amber-700 border border-amber-200',
  'returned': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'closed': 'bg-red-50 text-red-500 border border-red-100',
  'n/a': 'bg-transparent text-slate-300',
};

function PaperworkCell({
  item,
  onStamp,
}: {
  item: PaperworkItem;
  onStamp: (field: keyof Episode) => void;
}) {
  if (item.state === 'n/a') return <span className="text-slate-300 font-mono">—</span>;

  const label =
    item.state === 'not-sent' ? 'Mark sent' :
    item.state === 'sent'     ? `Sent ${item.sentAt}` :
    item.state === 'chasing'  ? `Sent ${item.sentAt} · returned?` :
    item.state === 'returned' ? `Returned ${item.returnedAt}` :
    `Unreceived (chase closed)`;

  const nextField: keyof Episode | null =
    item.state === 'not-sent' ? item.sentField :
    item.state === 'chasing' && item.returnedField ? item.returnedField :
    null;

  return (
    <button
      disabled={!nextField}
      onClick={() => nextField && onStamp(nextField)}
      title={nextField ? 'Click to stamp today' : undefined}
      className={`font-mono text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${PAPERWORK_STATE_STYLES[item.state]} ${
        nextField ? 'cursor-pointer hover:opacity-75 transition-opacity' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  );
}

export default function DischargeView({
  clients,
  risks,
  onSelectClient,
  onClearRisk,
  onOpenDischarge,
  onReverseDischarge,
  onReadmit,
  onUpdateEpisode,
}: DischargeViewProps) {
  const [activeTab, setActiveTab] = useState<ClientStatus>('Active');
  const [readmitTarget, setReadmitTarget] = useState<Client | null>(null);
  const [readmitDate, setReadmitDate] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const confirmReadmit = () => {
    if (!readmitTarget || !readmitDate) return;
    onReadmit(readmitTarget.id, readmitDate);
    setReadmitTarget(null);
  };

  // Filter clients by lifecycle status
  const tabClients = clients.filter(c => c.status === activeTab);

  // Quick stats calculations
  const packetsNeededCount = clients.filter(c => c.status === 'Discharged' && c.followUpNeeded).length;
  const avgStayDays = '24.2 Days';
  const authRiskRate = '14%';

  // Insurance counts for graphic visualization
  const insuranceData = [
    { name: 'BCBS', percent: '40%', color: 'bg-indigo-600' },
    { name: 'Cigna', percent: '25%', color: 'bg-emerald-500' },
    { name: 'Aetna', percent: '20%', color: 'bg-sky-400' },
    { name: 'Other', percent: '15%', color: 'bg-slate-300' }
  ];

  return (
    <div id="discharge-planning-portal" className="space-y-6">
      
      {/* 1. Quick Metrics Cards */}
      <div id="discharge-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Upcoming */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active Clients</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-0.5">{clients.filter(c => c.status === 'Active').length} Active</h3>
          </div>
        </div>

        {/* Discharge Packets Needed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
            <FileCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider block">PACKETS URGENT REVIEW</span>
            <h3 className="text-xl font-bold text-red-650 font-display mt-0.5">{packetsNeededCount} Critical</h3>
          </div>
        </div>

        {/* Average stay length */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Avg. Stay Duration</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-0.5">{avgStayDays}</h3>
          </div>
        </div>

        {/* Authorization Risk rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Auth Risk Score</span>
            <h3 className="text-xl font-bold text-amber-700 font-display mt-0.5">{authRiskRate} Expiring</h3>
          </div>
        </div>

      </div>

      {/* 2. Graphical Grid Analytics */}
      <div id="discharge-analytics-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Census & Insurance demographic blocks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Census & Admissions Demographics</h3>
              <p className="text-xs text-slate-400 font-sans">Insurance payers representation and pipeline distributions</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">2026 AUDIT ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Payer segmentation block */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase font-sans tracking-wide">Clients by Insurance Carrier</h4>
              
              <div className="flex h-5 rounded-lg overflow-hidden border border-slate-100">
                {insuranceData.map((ins, idx) => (
                  <div 
                    key={idx} 
                    className={`${ins.color} h-full text-white flex items-center justify-center`} 
                    style={{ width: ins.percent }}
                    title={`${ins.name}: ${ins.percent}`}
                  >
                    <span className="text-[9px] font-mono font-bold">{ins.name}</span>
                  </div>
                ))}
              </div>

              {/* Legends list */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-slate-500">
                {insuranceData.map((ins, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${ins.color} inline-block`} />
                    <span className="font-semibold text-slate-700">{ins.name}:</span>
                    <span>{ins.percent}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Stage Funnel Block */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase font-sans tracking-wide">Admissions Pipeline Progress</h4>
              
              <div className="space-y-2.5">
                {[
                  { stage: 'Intake Assessment', count: 18, pct: '100%', color: 'bg-indigo-600' },
                  { stage: 'Clinical Handshake', count: 12, pct: '67%', color: 'bg-indigo-500' },
                  { stage: 'Vouch Signatures', count: 8, pct: '44%', color: 'bg-indigo-400' },
                  { stage: 'Slated Intake Board', count: 4, pct: '22%', color: 'bg-indigo-300' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-sans font-medium text-slate-500">
                      <span>{item.stage}</span>
                      <span className="font-bold font-mono text-slate-700">{item.count} Cases ({item.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Operational Efficiency indicators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 leading-snug mb-1">Stay Threshold Limits</h3>
            <p className="text-xs text-slate-400 font-sans">Active parameters checked by Facility Lead</p>
          </div>

          <div className="space-y-4 mt-4 flex-1 justify-center flex flex-col">
            <div className="border border-slate-100 bg-[#fbfbfb] p-3.5 rounded-xl text-center space-y-1">
              <h4 className="text-2xl font-bold font-display text-indigo-650 leading-none">94.8%</h4>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Clinical Safety Rate</span>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">Completed discharges without readmission in 30 days</p>
            </div>
            
            <div className="border border-slate-100 bg-[#fbfbfb] p-3.5 rounded-xl text-center space-y-1">
              <h4 className="text-2xl font-bold font-display text-emerald-600 leading-none">2.4 Days</h4>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Packet Speed Average</span>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">Average time elapsed between discharge summary request and completion</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Discharge Planning Workspace Tab Table */}
      <div id="widget-discharge-workspace" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Workspace tabs bar */}
        <div id="workspace-table-header" className="px-6 py-4 bg-[#f8fafc] border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['Inquiry', 'Pending Admit', 'Active', 'Discharged'] as const).map((tab) => (
              <button
                key={tab}
                id={`btn-tab-discharge-${tab.replace(' ', '-')}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab} ({clients.filter(c => c.status === tab).length})
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            OPERATIONAL STAGE WORKSPACE
          </span>
        </div>

        {/* Client results dynamic table */}
        {activeTab !== 'Discharged' ? (
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafafa] border-b border-slate-200 text-slate-450 text-[10px] font-bold font-mono uppercase tracking-wider">
                <th className="py-3 px-6">Client Name</th>
                <th className="py-3 px-6">Program</th>
                <th className="py-3 px-6">Admission Date</th>
                <th className="py-3 px-6">Target Discharge</th>
                <th className="py-3 px-6">Therapist Clinician</th>
                <th className="py-3 px-6">Follow-Up Action</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {tabClients.map((client) => {
                const episode = getCurrentEpisode(client);
                return (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-800">
                    {client.name}
                    {episode.iopDcDate && !episode.stcDcDate && (
                      <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-200 px-1.5 py-0.5 rounded">
                        IOP DC {episode.iopDcDate}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 font-bold font-mono text-[11px] text-indigo-700">{client.program}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-450">{client.admissionDate}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-450">{estDischargeDate(client)}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-700">{client.primaryTherapist}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      client.followUpNeeded
                        ? 'bg-amber-150 text-amber-600 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {client.followUpNeeded ? 'Co-Signature Needed' : 'Vouched Complete'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    {activeTab === 'Active' && (
                      <button
                        onClick={() => onOpenDischarge(client)}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 mr-4"
                      >
                        <UserX className="w-3 h-3" /> Discharge
                      </button>
                    )}
                    <button
                      onClick={() => onSelectClient(client)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                    >
                      Inspect Profile <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
                );
              })}

              {tabClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-12">
                    No cases on file match the '{activeTab}' operational status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
        /* Discharged tab — paperwork tracker (mirrors Admin Discharges workbook) */
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafafa] border-b border-slate-200 text-slate-450 text-[10px] font-bold font-mono uppercase tracking-wider">
                <th className="py-3 px-6">Client Name</th>
                <th className="py-3 px-4">Admit</th>
                <th className="py-3 px-4">IOP DC</th>
                <th className="py-3 px-4">STC DC</th>
                <th className="py-3 px-4">DC Status</th>
                <th className="py-3 px-4">Grad Cert</th>
                <th className="py-3 px-4">Exit Interview</th>
                <th className="py-3 px-4">DC Form</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {tabClients.map((client) => {
                const episode = getCurrentEpisode(client);
                const items = getPaperworkItems(episode, today);
                const outstanding = countOutstanding(episode, today);
                const stamp = (field: keyof Episode) =>
                  onUpdateEpisode(client.id, episode.id, { [field]: today });
                const cell = (key: PaperworkItem['key']) => {
                  const item = items.find(i => i.key === key);
                  return item ? <PaperworkCell item={item} onStamp={stamp} /> : <span className="text-slate-300 font-mono">—</span>;
                };
                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      {client.name}
                      {episode.episodeNumber > 1 && (
                        <span
                          className="ml-2 font-mono text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded"
                          title={`Episode ${episode.episodeNumber} — readmitted client (BestNotes "${client.name} ${episode.episodeNumber}")`}
                        >
                          Ep {episode.episodeNumber}
                        </span>
                      )}
                      {episode.graduated && (
                        <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded">Grad</span>
                      )}
                      {outstanding > 0 && episode.stcDcDate && (
                        <span
                          className="ml-2 font-mono text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded"
                          title={`Chase until ${chaseDeadline(episode.stcDcDate)}`}
                        >
                          {outstanding} outstanding
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-450 whitespace-nowrap">{episode.admitDate}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-450 whitespace-nowrap">{episode.iopDcDate ?? '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-450 whitespace-nowrap">{episode.stcDcDate ?? '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(episode.dcStatus ?? []).map(s => (
                          <span key={s} className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            s === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : s === 'ASA'    ? 'bg-amber-100 text-amber-700 border-amber-200'
                            :                  'bg-red-50 text-red-500 border-red-100'
                          }`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{cell('gradCert')}</td>
                    <td className="py-3.5 px-4">{cell('exitInterview')}</td>
                    <td className="py-3.5 px-4">{cell('dcForm')}</td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => onReverseDischarge(client.id)}
                        title="Void this discharge — client returns to Active; paperwork stamps are cleared"
                        className="text-slate-400 hover:text-red-600 font-bold hover:underline cursor-pointer mr-4"
                      >
                        Reverse DC
                      </button>
                      {episode.stcDcDate && (
                        <button
                          onClick={() => { setReadmitTarget(client); setReadmitDate(today); }}
                          title="Client is returning — start a new episode"
                          className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline cursor-pointer mr-4"
                        >
                          Readmit
                        </button>
                      )}
                      <button
                        onClick={() => onSelectClient(client)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {tabClients.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 py-12">
                    No discharged clients on file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 4. High Severity Operational Risk Flags table */}
      <div id="widget-high-risk-overview" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">High Severity Operational Risk Flags</h3>
            <p className="text-xs text-slate-400 font-sans">Active administrative blockers with aging analysis</p>
          </div>
          <span className="text-[10px] font-mono text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-100">
            {risks.length} Unresolved Blockers
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Severity Status</th>
                <th className="py-3 px-6">Client Entity</th>
                <th className="py-3 px-6">Document Blocker details</th>
                <th className="py-3 px-6">Days Pending Blocker</th>
                <th className="py-3 px-6 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-50/50 transition-colors text-slate-650">
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1.5 font-bold font-mono uppercase text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${
                        risk.severity === 'High' ? 'bg-red-500' : risk.severity === 'Medium' ? 'bg-amber-400' : 'bg-slate-400'
                      }`} />
                      {risk.severity} Severity
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">{risk.entityName}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-600 leading-tight">{risk.flagReason}</td>
                  <td className="py-3.5 px-6 font-mono font-semibold text-slate-500">{risk.daysPending} business days</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      id={`btn-clear-risk-${risk.id}`}
                      onClick={() => onClearRisk(risk.id)}
                      className="bg-slate-900 shadow-3xs text-white hover:bg-indigo-650 font-sans font-bold text-[10px] py-1.5 px-3 rounded-md transition-colors cursor-pointer"
                    >
                      Clear Flag
                    </button>
                  </td>
                </tr>
              ))}

              {risks.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-12 bg-slate-50/25">
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-600">All risk flags cleared!</span>
                      <p className="text-[10px] text-slate-400">All clinical tasks are compliant and documented.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Readmit confirmation — new episode, back to Active */}
      {readmitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setReadmitTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800">Readmit {readmitTarget.name}</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Starts episode {getCurrentEpisode(readmitTarget).episodeNumber + 1} and returns the
              client to Active. Prior episodes and paperwork are kept.
            </p>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-4 mb-1">
              New admit date *
            </label>
            <input
              type="date"
              value={readmitDate}
              onChange={e => setReadmitDate(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setReadmitTarget(null)}
                className="text-xs px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReadmit}
                disabled={!readmitDate}
                className="text-xs px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold transition-colors"
              >
                Readmit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
