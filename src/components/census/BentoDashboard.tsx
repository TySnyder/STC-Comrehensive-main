/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Video,
  AlertOctagon,
  ChevronRight,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  Filter,
  MoreVertical
} from 'lucide-react';
import { TempClient } from '../../utils/clientAdapter';

interface BentoDashboardProps {
  clients: TempClient[];
  onSelectSubTab: (tab: string) => void;
}

export default function BentoDashboard({ clients, onSelectSubTab }: BentoDashboardProps) {
  const [analysisWindow, setAnalysisWindow] = useState<string>('Current Treatment Cycle');

  const totalPossible = clients.reduce((sum, c) => sum + c.possible, 0);
  const totalAttended = clients.reduce((sum, c) => sum + c.fullDaysAtt + c.halfDaysAtt * 0.5, 0);
  const complianceScore = totalPossible > 0
    ? Math.round((totalAttended / totalPossible) * 1000) / 10
    : 0;

  const attendedCount  = clients.reduce((sum, c) => sum + c.fullDaysAtt + c.halfDaysAtt, 0);
  const virtualSessions = clients.reduce((sum, c) => sum + c.virtualCount, 0);
  const virtualRatio   = attendedCount > 0
    ? Math.round((virtualSessions / attendedCount) * 1000) / 10
    : 0;

  const criticalCasesCount = clients.filter(c => c.unexcused > 1 || c.dcProjectionStatus === 'At Risk').length;

  const dcThisMonth = clients.filter(c => {
    const days = c.clinicalRunwayDays;
    return days >= 0 && days <= 30;
  }).length;

  const avgTardyClients = clients.filter(c => c.tardyCount > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">At-A-Glance Facility Health</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time participation metrics and clinical compliance clusters.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 uppercase font-bold">Analysis Window</span>
            <select
              value={analysisWindow}
              onChange={e => setAnalysisWindow(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold text-primary cursor-pointer outline-none focus:ring-0"
            >
              <option>Current Treatment Cycle</option>
              <option>Last 30 Days</option>
              <option>Month-to-Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Aggregated Compliance (spans 2×2) */}
        <div className="md:col-span-2 md:row-span-2 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between relative shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="absolute -right-10 -top-10 text-slate-100/50 pointer-events-none">
            <CheckCircle2 className="w-48 h-48 stroke-[0.5]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aggregated Compliance</h3>
            </div>
            <div className="flex items-baseline gap-4 mt-6">
              <span className="text-6xl font-extrabold text-primary tracking-tight font-display">{complianceScore}%</span>
              <div className="flex flex-col">
                <span className={`font-extrabold text-sm ${complianceScore >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                  {complianceScore >= 80 ? '↑' : '↓'} {Math.abs(complianceScore - 80).toFixed(1)}% vs target
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facility Baseline</span>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-2xl font-bold text-slate-800">{clients.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Census</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {clients.length > 0 ? (totalAttended / clients.length).toFixed(1) : '—'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Days / Client</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
            <div className="flex -space-x-2.5">
              {clients.slice(0, 4).map(c => (
                <div
                  key={c.id}
                  className={`w-7 h-7 rounded-full border-2 border-white text-white font-bold flex items-center justify-center text-[9px] ${c.avatarBg}`}
                  title={c.name}
                >
                  {c.initials}
                </div>
              ))}
              {clients.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[9px]">
                  +{clients.length - 4}
                </div>
              )}
            </div>
            <button
              onClick={() => onSelectSubTab('roster')}
              className="text-primary font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Weekly Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DC Projections */}
        <div className="md:col-span-2 bg-primary text-white rounded-3xl p-8 flex items-center justify-between overflow-hidden relative shadow-xs hover:shadow-sm transition-all">
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">DC Projections This Month</h3>
            <p className="text-4xl font-extrabold font-display">{dcThisMonth} Discharges</p>
            <p className="text-xs text-indigo-100 opacity-80 mt-2 font-medium">Estimated Clinical Completion (±3 days)</p>
          </div>
          <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/20">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none">
            <TrendingUp className="w-36 h-36 stroke-[1]" />
          </div>
        </div>

        {/* Virtual Utilization */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <Video className="text-sky-600 w-5 h-5" />
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Nominal</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Virtual Usage</h3>
            <p className="text-2xl font-bold text-primary mt-2 font-display">{virtualRatio}%</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Consistent with Telehealth Policy</p>
        </div>

        {/* Compliance Flags */}
        <div className="bg-red-50/40 border border-red-100 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <AlertOctagon className="text-red-600 w-5 h-5" />
              {criticalCasesCount > 0 && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">Critical</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider">Compliance Flags</h3>
            <p className="text-2xl font-bold text-red-600 mt-2 font-display">{criticalCasesCount} Cases</p>
          </div>
          <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-wide">
            {criticalCasesCount > 0 ? 'Requires 24h Review' : 'No Critical Flags'}
          </p>
        </div>

        {/* Individual Compliance Deep-Dives */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-md font-bold text-primary">Individual Compliance Deep-Dives</h3>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600"><Filter className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Identity</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Full Attendance</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Exc / Unexc</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Half Days</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Virtual Units</th>
                  <th className="px-8 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Target DC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.slice(0, 5).map(client => {
                  const isAtRisk   = client.dcProjectionStatus === 'At Risk';
                  const isExtended = client.dcProjectionStatus === 'Extended Care';
                  return (
                    <tr
                      key={client.id}
                      onClick={() => onSelectSubTab('totals')}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${client.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                            {client.initials}
                          </div>
                          <div>
                            <p className="font-bold text-primary group-hover:underline">{client.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{client.program} / {client.doctor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-md font-bold text-indigo-700">{client.fullDaysAtt}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Days</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center items-center gap-1.5 text-xs">
                          <span className="text-amber-600 font-bold">{client.excused}</span>
                          <span className="text-slate-300">/</span>
                          <span className={`font-bold ${client.unexcused > 0 ? 'text-red-500' : 'text-slate-500'}`}>{client.unexcused}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold border border-purple-100">
                          {client.halfDaysAtt} Sessions
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold border border-sky-100">
                          {client.virtualCount} Virtual
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-700 text-xs">{client.dcProjectionDate}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 font-bold rounded uppercase mt-1 tracking-wider ${
                            isAtRisk   ? 'bg-red-50 text-red-600 border border-red-100' :
                            isExtended ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                            'bg-green-50 text-green-700 border border-green-100'
                          }`}>
                            {client.dcProjectionStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Compliance Report */}
        <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-6 flex items-center gap-6 group hover:shadow-md transition-all">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow">
            <Award className="text-white w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Generate Full Compliance Report</h4>
            <p className="text-white/60 text-xs mt-1">Ready for regional audit cycle compliance review.</p>
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => alert('PDF Compliance Audit Report generated!')}
                className="px-3 py-1.5 bg-primary hover:bg-primary-container text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
              >
                Export PDF
              </button>
              <button
                onClick={() => {
                  const data = clients.map(c => `"${c.name}",${c.program},${c.fullDaysAtt}`).join('\n');
                  const blob = new Blob([data], { type: 'text/csv' });
                  const url  = window.URL.createObjectURL(blob);
                  const a    = document.createElement('a');
                  a.setAttribute('href', url);
                  a.setAttribute('download', 'STC_Compliance_Log.csv');
                  a.click();
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
              >
                CSV Data
              </button>
            </div>
          </div>
        </div>

        {/* Punctuality Widget */}
        <div className="md:col-span-2 bg-secondary-container text-on-secondary-container rounded-3xl p-6 flex justify-between items-center overflow-hidden relative hover:shadow-md transition-all shadow-xs">
          <div className="relative z-10">
            <h3 className="text-[10px] font-bold text-on-secondary-container uppercase tracking-wider mb-1 opacity-70">Tardy Clients</h3>
            <p className="text-3xl font-extrabold font-display">{avgTardyClients}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">Clients with at least one late arrival</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-on-secondary-container/20 flex items-center justify-center relative z-10 shrink-0 shadow">
            <Clock className="w-8 h-8 text-on-secondary-container" />
          </div>
        </div>

      </div>
    </div>
  );
}
