/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Sliders,
  Download,
  RefreshCw,
  Video,
  Clock,
  UserPlus,
  Check,
  HelpCircle,
  AlertCircle,
  Undo2
} from 'lucide-react';
import { TempClient, AttendanceStatus, DailyAttendance } from '../../utils/clientAdapter';

interface WeeklyCensusGridProps {
  clients: TempClient[];
  onUpdateAttendance: (clientId: string, day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri', data: DailyAttendance) => void;
  onQuickAdmit: () => void;
}

export default function WeeklyCensusGrid({ clients, onUpdateAttendance, onQuickAdmit }: WeeklyCensusGridProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('All Behavioral Programs');
  const [selectedLocation, setSelectedLocation] = useState<string>('North Wing Facility');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Current Week');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [editingCell, setEditingCell] = useState<{
    clientId: string;
    clientName: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
    currentStatus: AttendanceStatus;
    currentVirtual: boolean;
  } | null>(null);

  const filteredClients = clients.filter(client => {
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedProgram !== 'All Behavioral Programs' && client.program !== selectedProgram) return false;
    if (selectedLocation === 'South Wing Annex') return false;
    if (selectedLocation === 'Outpatient Center') return client.program === 'IND' || client.program === 'IOP';
    return true;
  });

  const diopClients  = filteredClients.filter(c => c.program === 'DIOP');
  const eiopClients  = filteredClients.filter(c => c.program === 'EIOP');
  const indClients   = filteredClients.filter(c => c.program === 'IND');
  const otherClients = filteredClients.filter(c => !['DIOP','EIOP','IND'].includes(c.program));

  const daysList: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const handleCellClick = (client: TempClient, day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri') => {
    const daily = client.weeklyAttendance[day];
    setEditingCell({ clientId: client.id, clientName: client.name, day, currentStatus: daily.status, currentVirtual: daily.virtual });
  };

  const handleSaveCell = (status: AttendanceStatus, virtual: boolean) => {
    if (editingCell) {
      onUpdateAttendance(editingCell.clientId, editingCell.day, { status, virtual });
      setEditingCell(null);
    }
  };

  const handleResetFilters = () => {
    setSelectedProgram('All Behavioral Programs');
    setSelectedLocation('North Wing Facility');
    setSearchQuery('');
  };

  const getCellStyles = (daily: DailyAttendance) => {
    switch (daily.status) {
      case 'Present':  return 'border-green-300 bg-green-50/70 text-green-700 hover:bg-green-100/70';
      case 'Excused':  return 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100/50';
      case 'Absent':   return 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100/50';
      case 'Tardy':    return 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100/50';
      default:         return 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100/50';
    }
  };

  const renderClientRow = (client: TempClient) => (
    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded ${client.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-sm`}>
            {client.initials}
          </div>
          <div>
            <p className="font-semibold text-primary hover:underline cursor-pointer">{client.name}</p>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tight mt-1 inline-block">
              {client.program}
            </span>
          </div>
        </div>
      </td>
      {daysList.map(day => {
        const daily = client.weeklyAttendance[day];
        return (
          <td key={day} className="px-2 py-3 text-center">
            <button
              onClick={() => handleCellClick(client, day)}
              className={`w-full max-w-[120px] mx-auto p-2 border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 ${getCellStyles(daily)}`}
            >
              <span className="text-xs font-bold block">{daily.status === 'None' ? '—' : daily.status}</span>
              <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                {daily.tardyMinutes ? <Clock className="w-3 h-3 text-purple-600" /> : <Clock className="w-3 h-3" />}
                {daily.virtual && <Video className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </button>
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Weekly Roster</h2>
          <p className="text-sm text-slate-500 mt-1">Review facility occupancy and mark patient attendance parameters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            <Sliders className="w-4 h-4" />
            Reset Filters
          </button>
          <button
            onClick={onQuickAdmit}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-white font-semibold rounded-lg hover:shadow-sm transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add New Admission
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Program Type</span>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option>All Behavioral Programs</option>
            <option value="DIOP">DIOP</option>
            <option value="EIOP">EIOP</option>
            <option value="IND">IND</option>
            <option value="DOP">DOP</option>
            <option value="EOP">EOP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Date Range</span>
          <select
            value={selectedDateRange}
            onChange={e => setSelectedDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option>Current Week</option>
            <option>Last Week</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Location</span>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option>North Wing Facility</option>
            <option>South Wing Annex</option>
            <option>Outpatient Center</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 max-w-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Search Patient</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => alert('Synchronizing census with regional database...')}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
            title="Refresh Census"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const header = 'Client ID,Name,Program,Doctor\n';
              const rows = filteredClients.map(c => `${c.id},"${c.name}",${c.program},"${c.doctor}"`).join('\n');
              const blob = new Blob([header + rows], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('download', 'STC_Weekly_Roster.csv');
              a.click();
            }}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
            title="Export Roster"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid canvas */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
            <div className="mb-8 w-64 h-64 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl shadow-md flex flex-col p-5 transform -rotate-3">
                <div className="h-4 w-2/3 bg-slate-100 rounded mb-4"></div>
                <div className="h-28 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                  <AlertCircle className="text-slate-300 w-12 h-12" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No census data found for this period</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We couldn't find any active patient enrollments matching your current filters.
            </p>
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={onQuickAdmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-container text-white text-sm font-semibold rounded-lg hover:shadow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Admit New Patient
              </button>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
              >
                <Undo2 className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50/70 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[280px]">Client / Program</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">MON</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">TUE</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">WED</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">THU</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">FRI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diopClients.length > 0 && (
                  <>
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                        DIOP — Intensive Outpatient Program (Dual)
                      </td>
                    </tr>
                    {diopClients.map(renderClientRow)}
                  </>
                )}
                {eiopClients.length > 0 && (
                  <>
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                        EIOP — Evening Intensive Outpatient
                      </td>
                    </tr>
                    {eiopClients.map(renderClientRow)}
                  </>
                )}
                {indClients.length > 0 && (
                  <>
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                        IND — Individual Therapy
                      </td>
                    </tr>
                    {indClients.map(renderClientRow)}
                  </>
                )}
                {otherClients.length > 0 && (
                  <>
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                        Other Behavioral Treatments
                      </td>
                    </tr>
                    {otherClients.map(renderClientRow)}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-400">Legend:</span>
              {[
                { color: 'bg-green-500', label: 'Present' },
                { color: 'bg-red-500',   label: 'Absent' },
                { color: 'bg-amber-400', label: 'Excused' },
                { color: 'bg-purple-500',label: 'Tardy' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                  <span>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-500" />
                <span>Virtual</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-primary text-xs">
              <HelpCircle className="w-4 h-4" />
              <span>How to manage census lists</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-slate-500 px-4">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            <span>Total Capacity: 48 Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Current Occupancy: {Math.round((filteredClients.length / 48) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Cell editor modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setEditingCell(null)}>
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Update Attendance Cell</h3>
              <p className="text-xs text-slate-500 mt-1">
                Patient: <span className="font-semibold text-primary">{editingCell.clientName}</span> | Day: <span className="font-semibold uppercase text-primary">{editingCell.day}</span>
              </p>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Status</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { status: 'Present' as AttendanceStatus,  label: 'Present',    color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300' },
                  { status: 'Absent' as AttendanceStatus,   label: 'Absent',     color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
                  { status: 'Tardy' as AttendanceStatus,    label: 'Tardy',      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                  { status: 'Excused' as AttendanceStatus,  label: 'Excused',    color: 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200' },
                  { status: 'None' as AttendanceStatus,     label: 'No Session', color: 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200' },
                ] as const).map(opt => (
                  <button
                    key={opt.status}
                    onClick={() => setEditingCell(prev => prev ? { ...prev, currentStatus: opt.status } : null)}
                    className={`p-2.5 border rounded-lg text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-between ${opt.color} ${
                      editingCell.currentStatus === opt.status ? 'ring-2 ring-primary ring-offset-1 border-primary font-bold shadow-sm' : ''
                    }`}
                  >
                    <span>{opt.label}</span>
                    {editingCell.currentStatus === opt.status && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Virtual Care</span>
                  <p className="text-[10px] text-slate-400">Mark session as delivered via Telehealth</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCell(prev => prev ? { ...prev, currentVirtual: !prev.currentVirtual } : null)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${editingCell.currentVirtual ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-150 ${editingCell.currentVirtual ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setEditingCell(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleSaveCell(editingCell.currentStatus, editingCell.currentVirtual)}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold hover:shadow transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
