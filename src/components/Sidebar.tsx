/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  Settings,
  Activity,
  Calendar,
  AlertTriangle,
  CalendarDays,
  FlaskConical,
  Phone,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  openNoteModal: () => void;
}

export default function Sidebar({ currentTab, setTab, openNoteModal }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'census', label: 'Weekly Census', icon: CalendarDays },
    { id: 'ua', label: 'UA Tracking', icon: FlaskConical },
    { id: 'calltracking', label: 'Call Tracking', icon: Phone },
    { id: 'schedule', label: 'Program Schedule', icon: Calendar },
    { id: 'discharge', label: 'Discharge Planning', icon: TrendingUp },
    { id: 'reports', label: 'Clinical Analytics', icon: FileSpreadsheet },
    { id: 'staff', label: 'Staff Management', icon: Activity },
    { id: 'settings', label: 'Settings & Preferences', icon: Settings },
  ];

  return (
    <aside id="portal-sidebar" className="w-68 bg-white border-r border-[#e2e8f0] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Branding Header Area */}
      <div id="sidebar-logo-area" className="px-5 py-4 border-b border-[#f1f5f9] flex flex-col gap-1.5 shrink-0 bg-[#f8fafc]/50">
        <img
          src="/stc-logo-horizontal-v2.webp"
          alt="Solutions Treatment Center"
          className="h-[60px] w-auto object-contain"
        />

      </div>

      {/* Navigation Items */}
      <nav id="sidebar-nav" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold border-l-2 border-indigo-600 pl-2.5'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon 
                className={`w-4 h-4 transition-colors duration-150 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Fast Action Prompt / Note Creator */}
      <div id="sidebar-actions" className="p-4 border-t border-[#f1f5f9] shrink-0 bg-[#fafafa]">
        <button
          id="btn-fast-add-note"
          onClick={openNoteModal}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-lg font-sans font-medium text-xs tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow"
        >
          <span className="text-lg font-mono leading-none">+</span> Add Clinical Note
        </button>
        <div id="sidebar-footer-credentials" className="mt-4 flex items-center gap-2.5 px-1.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs border border-indigo-200">
            CL
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-700 truncate leading-none mb-1">
              Clinical Lead
            </p>
            <p className="text-[10px] text-slate-400 truncate leading-none">
              Admin Staff Access
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
