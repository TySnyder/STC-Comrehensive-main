/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Sliders,
  Video,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { TempClient } from '../../utils/clientAdapter';

interface AttendanceTotalsProps {
  clients: TempClient[];
  onUpdateClient: (updated: TempClient) => void;
}

export default function AttendanceTotals({ clients, onUpdateClient }: AttendanceTotalsProps) {
  const [selectedCycle, setSelectedCycle] = useState<string>('Current Treatment Cycle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingClient, setEditingClient] = useState<TempClient | null>(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPossible  = filteredClients.reduce((sum, c) => sum + c.possible, 0);
  const totalAttended  = filteredClients.reduce((sum, c) => sum + c.fullDaysAtt + c.halfDaysAtt * 0.5, 0);
  const avgParticipation = totalPossible > 0
    ? Math.round((totalAttended / totalPossible) * 1000) / 10
    : 0;

  const totalAttFull = filteredClients.reduce((sum, c) => sum + c.fullDaysAtt + c.halfDaysAtt, 0);
  const totalVirtual = filteredClients.reduce((sum, c) => sum + c.virtualCount, 0);
  const virtualUtilization = totalAttFull > 0
    ? Math.round((totalVirtual / totalAttFull) * 1000) / 10
    : 0;

  const nonComplianceCases = filteredClients.filter(c => c.unexcused > 1).length;

  const handleExportCSV = () => {
    const header = 'Client,Program,Doctor,Full Days,Excused,Unexcused,Half Days,Possible,Virtual,Tardy,Projection\n';
    const rows = filteredClients.map(c =>
      `"${c.name}",${c.program},"${c.doctor}",${c.fullDaysAtt},${c.excused},${c.unexcused},${c.halfDaysAtt},${c.possible},${c.virtualCount},${c.tardyCount},"${c.dcProjectionStatus}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'STC_Attendance_Totals.csv');
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Attendance Totals Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time clinical compliance tracking and participation metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
          <Calendar className="text-slate-400 w-4 h-4 ml-1" />
          <div className="flex flex-col pr-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Treatment Cycle</span>
            <select
              value={selectedCycle}
              onChange={e => setSelectedCycle(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer outline-none"
            >
              <option>Current Treatment Cycle</option>
              <option>Previous Cycle</option>
              <option>Custom Range</option>
            </select>
          </div>
          <button className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded border border-slate-100">
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search running totals by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing {filteredClients.length} of {clients.length} active patients
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50/70 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Identity</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Full Days</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Excused</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unexcused</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Half Days</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">½ Exc</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">½ Unexc</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Possible</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Virtual</th>
                <th className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tardy</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Est. DC Projection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => {
                const hasAlert = client.unexcused > 1;
                return (
                  <tr
                    key={client.id}
                    onClick={() => setEditingClient({ ...client })}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    title="Click to fine-tune running sums"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${client.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                          {client.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-primary group-hover:underline">{client.name}</p>
                            {hasAlert && (
                              <span className="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />Review
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{client.doctor} / {client.program}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded text-xs">{client.fullDaysAtt}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded text-xs">{client.excused}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 font-bold rounded text-xs ${client.unexcused > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {client.unexcused}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded text-xs">{client.halfDaysAtt}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-amber-50/50 text-amber-500 rounded text-[11px] font-medium">{client.halfExc}</span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-[11px] font-medium">{client.halfUnexc}</span>
                    </td>
                    <td className="px-3 py-4 text-center font-bold text-slate-700 text-xs">{client.possible}</td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sky-600 font-semibold text-xs">
                        <Video className="w-3.5 h-3.5" /><span>{client.virtualCount}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-600 font-semibold text-xs">
                        <Clock className="w-3.5 h-3.5" /><span>{client.tardyCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{client.dcProjectionDate}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wide mt-1 inline-block ${
                          client.dcProjectionStatus === 'On Track'       ? 'text-green-600' :
                          client.dcProjectionStatus === 'At Risk'        ? 'text-red-500'   :
                          'text-indigo-500'
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

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-sm"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alert threshold: &gt;1 unexcused absence</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />Export CSV
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-slate-400" />Print Detail
            </button>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Participation</h4>
            <TrendingUp className="text-secondary w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-primary font-display">{avgParticipation}%</p>
          <p className="text-xs text-secondary font-bold mt-2">Based on full + half-day attendances</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Virtual Utilization</h4>
            <Video className="text-sky-600 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-primary font-display">{virtualUtilization}%</p>
          <p className="text-xs text-slate-500 font-medium mt-2">Consistent with Telehealth Policy</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Non-Compliance Flags</h4>
            <AlertTriangle className="text-red-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-red-600 font-display">{nonComplianceCases} Cases</p>
          <p className="text-xs text-red-500 font-bold mt-2">Requires clinical compliance review</p>
        </div>
      </div>

      {/* Fine-tune modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setEditingClient(null)}>
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Fine-Tune Running Attendance Sums</h3>
              <p className="text-xs text-slate-500 mt-1">
                Editing: <span className="font-semibold text-primary">{editingClient.name}</span> ({editingClient.program})
              </p>
            </div>
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
              {([
                { label: 'Full Days Attended',   field: 'fullDaysAtt' as const, min: 0 },
                { label: 'Excused Days',          field: 'excused'     as const, min: 0 },
                { label: 'Unexcused Absences',    field: 'unexcused'   as const, min: 0 },
                { label: 'Half Days Attended',    field: 'halfDaysAtt' as const, min: 0 },
                { label: 'Total Possible Days',   field: 'possible'    as const, min: 1 },
                { label: 'Virtual Count',         field: 'virtualCount'as const, min: 0 },
              ] as const).map(({ label, field, min }) => (
                <div key={field} className="flex justify-between items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingClient(p => p ? { ...p, [field]: Math.max(min, (p[field] as number) - 1) } : null)}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded flex items-center justify-center cursor-pointer"
                    >−</button>
                    <span className="w-10 text-center text-sm font-bold">{editingClient[field]}</span>
                    <button
                      onClick={() => setEditingClient(p => p ? { ...p, [field]: (p[field] as number) + 1 } : null)}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded flex items-center justify-center cursor-pointer"
                    >+</button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700">Clinical Runway Status</label>
                <select
                  value={editingClient.dcProjectionStatus}
                  onChange={e => setEditingClient(p => p ? { ...p, dcProjectionStatus: e.target.value as TempClient['dcProjectionStatus'] } : null)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none"
                >
                  <option value="On Track">On Track</option>
                  <option value="Extended Care">Extended Care</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setEditingClient(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { if (editingClient) { onUpdateClient(editingClient); setEditingClient(null); } }}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold hover:shadow transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
