/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  UserPlus, 
  ShieldAlert, 
  ArrowUpRight, 
  Calendar, 
  CheckSquare, 
  Square,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Client, Staff } from '../types';

interface DashboardViewProps {
  clients: Client[];
  staff: Staff[];
  onNavigateToTab: (tab: string) => void;
  onSelectClient: (client: Client) => void;
}

export default function DashboardView({ clients, staff, onNavigateToTab, onSelectClient }: DashboardViewProps) {
  // Checklist state
  const [checklist, setChecklist] = useState([
    { id: 'item-1', label: 'Verify Insurance eligibility for upcoming admissions', done: true, time: '08:30 AM' },
    { id: 'item-2', label: 'Co-sign clinical summaries for Dr. Thorne\'s interns', done: false },
    { id: 'item-3', label: 'Review expiring authorizations with Case Management', done: true, time: '10:15 AM' },
    { id: 'item-4', label: 'Validate Discharge Packets for Liam Sterling', done: false },
    { id: 'item-5', label: 'Send weekend clinical caseload balance sheets to HR', done: false },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((item) => 
        item.id === id ? { ...item, done: !item.done, time: !item.done ? new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : undefined } : item
      )
    );
  };

  // Calculations
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status !== 'Completed' && c.status !== 'Graduated');
  const countActive = activeClients.length;
  const presentTodayCount = clients.filter(c => c.attendanceHistory[0]?.status === 'Present').length;
  const pendingAdmissionsCount = clients.filter(c => c.status === 'Upcoming').length;
  const expiringAuthsCount = clients.filter(c => c.riskFlag?.reason.toLowerCase().includes('auth') || c.riskFlag?.reason.toLowerCase().includes('expires')).length;

  // Let's filter clients for "Needs Attention" & "Upcoming Discharges"
  const needsAttentionClients = clients.filter(c => c.riskFlag);
  const upcomingDischarges = clients.filter(c => {
    const discharge_ms = new Date(c.expectedDischargeDate).getTime();
    const today_ms = new Date('2026-06-15').getTime();
    const diff_days = (discharge_ms - today_ms) / (1000 * 3600 * 24);
    return diff_days > 0 && diff_days <= 14;
  });

  return (
    <div id="ops-dashboard-wrapper" className="space-y-6">
      
      {/* 1. Quick Stats Metric Cards */}
      <div id="dashboard-metric-grids" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Active Clients */}
        <div id="metric-card-active-clients" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-sans">Active Clients</span>
            <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><Users className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-slate-800">{countActive}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-0.5">
              <span className="text-emerald-500 font-bold font-mono">+{totalClients - countActive}</span> inactive/completed
            </p>
          </div>
        </div>

        {/* Present Today */}
        <div id="metric-card-present-today" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-sans">Present Today</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CalendarCheck className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-slate-800">{presentTodayCount} <span className="text-slate-400 text-sm font-sans font-normal">/ {totalClients}</span></h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Active Attendance Rate: <span className="font-bold font-mono text-slate-600">{(presentTodayCount / totalClients * 100).toFixed(0)}%</span>
            </p>
          </div>
        </div>

        {/* Pending Admissions */}
        <div id="metric-card-pending-admissions" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-sans">Pending Admissions</span>
            <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600"><UserPlus className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-slate-800">{pendingAdmissionsCount}</h3>
            <p className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 cursor-pointer" onClick={() => onNavigateToTab('clients')}>
              View intake funnel <span className="text-xs">→</span>
            </p>
          </div>
        </div>

        {/* Expiring Authorizations */}
        <div id="metric-card-expiring-auths" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-500 font-sans">Expiring Auths</span>
            <span className="p-1.5 bg-red-50 rounded-lg text-red-600"><ShieldAlert className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-red-600">{expiringAuthsCount}</h3>
            <p className="text-[10px] text-red-400 mt-1 font-bold font-mono">
              CRITICAL ACTION NEEDED
            </p>
          </div>
        </div>

        {/* Upcoming Discharges */}
        <div id="metric-card-upcoming-discharges" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 font-sans">Days to Discharge</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Calendar className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-slate-700">{upcomingDischarges.length}</h3>
            <p className="text-[10px] text-amber-600 font-semibold mt-1 cursor-pointer" onClick={() => onNavigateToTab('discharge')}>
              Packet summaries <span className="text-sm">→</span>
            </p>
          </div>
        </div>

      </div>

      {/* 2. Middle Grid: Weekly Trend & Urgent Risks */}
      <div id="dashboard-middle-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Attendance Rate Chart */}
        <div id="widget-attendance-trend" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Attendance & Trend Analytics</h3>
              <p className="text-xs text-slate-400 font-sans">Rolling 5-day client check-in details (Present vs Late)</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> EIOP / DIOP
            </span>
          </div>

          {/* Handcrafted Interactive SVG Chart Representation */}
          <div id="attendance-handcrafted-chart" className="h-56 flex flex-col justify-between mt-6">
            <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
              
              {/* Mon */}
              <div className="flex flex-col items-center gap-2 group w-12">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-4 bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all h-[80%]" title="Present: 80%"></div>
                  <div className="w-4 bg-amber-400 rounded-t-xs hover:bg-amber-500 transition-all h-[12%]" title="Late: 12%"></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Mon</span>
              </div>

              {/* Tue */}
              <div className="flex flex-col items-center gap-2 group w-12">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-4 bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all h-[85%]" title="Present: 85%"></div>
                  <div className="w-4 bg-amber-400 rounded-t-xs hover:bg-amber-500 transition-all h-[8%]" title="Late: 8%"></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Tue</span>
              </div>

              {/* Wed */}
              <div className="flex flex-col items-center gap-2 group w-12">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-4 bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all h-[76%]" title="Present: 76%"></div>
                  <div className="w-4 bg-amber-400 rounded-t-xs hover:bg-amber-500 transition-all h-[18%]" title="Late: 18%"></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Wed</span>
              </div>

              {/* Thu */}
              <div className="flex flex-col items-center gap-2 group w-12">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-4 bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all h-[92%]" title="Present: 92%"></div>
                  <div className="w-4 bg-amber-400 rounded-t-xs hover:bg-amber-500 transition-all h-[4%]" title="Late: 4%"></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Thu</span>
              </div>

              {/* Today */}
              <div className="flex flex-col items-center gap-2 group w-12">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-4 bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all h-[90%]" title="Present: 90%"></div>
                  <div className="w-4 bg-amber-400 rounded-t-xs hover:bg-amber-500 transition-all h-[6%]" title="Late: 6%"></div>
                </div>
                <span className="text-xs font-bold text-indigo-600">Today</span>
              </div>

            </div>

            {/* Chart Legend */}
            <div id="chart-legend" className="flex items-center gap-6 mt-3 text-[11px] font-sans text-slate-500 self-center">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-indigo-600 rounded-xs inline-block"></span>
                <span>Normal Attendance (Present)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-amber-400 rounded-xs inline-block"></span>
                <span>Late Arrivals / Delays</span>
              </div>
            </div>
          </div>
        </div>

        {/* Needs Attention Sidebar list */}
        <div id="widget-cases-attention" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Required Actions</h3>
            <p className="text-xs text-slate-400 font-sans">Active risk markers & compliance issues</p>
          </div>

          <div id="dashboard-attention-list" className="space-y-3 mt-4 flex-1">
            {needsAttentionClients.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelectClient(item)}
                className="p-3 border border-red-100 hover:border-red-200 bg-red-50/30 hover:bg-red-50/65 rounded-xl transition-all cursor-pointer flex gap-2.5 group"
              >
                <div className="p-1 h-fit bg-red-100 text-red-600 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-700 truncate">{item.name}</span>
                    <span className="text-[10px] font-bold font-mono text-red-600 uppercase tracking-widest">{item.program}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{item.riskFlag?.reason}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 self-center text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigateToTab('discharge')}
            className="w-full mt-4 text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 hover:bg-indigo-50 py-2 rounded-lg cursor-pointer"
          >
            Review all active flags
          </button>
        </div>

      </div>

      {/* 3. Bottom Grid: Admissions, Discharges & Operational Checklist */}
      <div id="dashboard-bottom-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Admissions & Referrals */}
        <div id="widget-recent-admissions" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-900 leading-snug mb-3">Admission Funnel Activity</h3>
          <p className="text-xs text-slate-400 font-sans mb-4">Admissions slated for clinical assessment</p>

          <div className="space-y-3.5">
            {clients.filter(c => c.status === 'Upcoming').slice(0, 3).map(client => (
              <div 
                key={client.id} 
                onClick={() => onSelectClient(client)}
                className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{client.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{client.program}</span>
                    <span>•</span>
                    <span>Admin: {client.admissionDate}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                  Pending Intake
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Discharges Within 14 Days */}
        <div id="widget-upcoming-discharges" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-900 leading-snug mb-3">Upcoming Discharges</h3>
          <p className="text-xs text-slate-400 font-sans mb-4">Target days to complete discharge summaries</p>

          <div className="space-y-3.5">
            {upcomingDischarges.slice(0, 3).map(client => (
              <div 
                key={client.id} 
                onClick={() => onSelectClient(client)}
                className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{client.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold">{client.program}</span>
                    <span>•</span>
                    <span>Target: {client.expectedDischargeDate}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  client.status === 'Needs Packet' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {client.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Status Daily Checklist */}
        <div id="widget-daily-checklist" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-900 leading-snug mb-1">Operational Checklist</h3>
          <p className="text-xs text-slate-400 font-sans mb-4">Urgent daily compliance items for Lead</p>

          <div id="checklist-scroll-items" className="space-y-3">
            {checklist.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleChecklist(item.id)}
                className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
              >
                <button className="text-slate-400 group-hover:text-indigo-600 transition-colors mt-0.5 shrink-0">
                  {item.done ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 group-hover:border-indigo-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-sans leading-tight ${item.done ? 'line-through text-slate-400' : 'text-slate-600 font-medium'}`}>
                    {item.label}
                  </p>
                  {item.done && item.time && (
                    <span className="text-[9px] font-mono text-emerald-600 font-bold block mt-0.5 uppercase">
                      Cleared at {item.time}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
