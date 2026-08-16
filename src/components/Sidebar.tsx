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
  ListChecks,
  LogOut,
  Phone,
  Video,
} from 'lucide-react';
import { AuthUser } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  openNoteModal: () => void;
  user: AuthUser;
  onLogout: () => void;
}

export const ROLE_LABELS: Record<AuthUser['role'], string> = {
  master: 'Master Admin',
  admin: 'Admin Staff Access',
  therapist: 'Therapist Access',
  intake: 'Intake Staff Access',
  intern: 'Intern Access',
};

// Provisional first-pass nav visibility per role — nav visibility only, not
// confirmed with the user yet. See HANDOFF-1.md step (f).
const ROLE_NAV_IDS: Record<AuthUser['role'], string[] | null> = {
  master: null, // null = all nav items
  admin: ['dashboard', 'tasktrack', 'clients', 'attendance', 'census', 'ua', 'calltracking', 'virtualrequests', 'schedule', 'discharge', 'reports', 'staff'],
  therapist: ['dashboard', 'tasktrack', 'clients', 'attendance', 'ua', 'discharge', 'reports', 'schedule'],
  intake: ['dashboard', 'tasktrack', 'clients', 'calltracking', 'virtualrequests'],
  intern: ['dashboard', 'tasktrack', 'clients', 'attendance'],
};

export default function Sidebar({ currentTab, setTab, openNoteModal, user, onLogout }: SidebarProps) {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasktrack', label: 'Task Track', icon: ListChecks },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'census', label: 'Weekly Census', icon: CalendarDays },
    { id: 'ua', label: 'UA Tracking', icon: FlaskConical },
    { id: 'calltracking', label: 'Call Tracking', icon: Phone },
    { id: 'virtualrequests', label: 'Virtual Requests', icon: Video },
    { id: 'schedule', label: 'Program Schedule', icon: Calendar },
    { id: 'discharge', label: 'Discharge Planning', icon: TrendingUp },
    { id: 'reports', label: 'Clinical Analytics', icon: FileSpreadsheet },
    { id: 'staff', label: 'Staff Management', icon: Activity },
    { id: 'settings', label: 'Settings & Preferences', icon: Settings },
  ];
  const allowedIds = ROLE_NAV_IDS[user.role];
  const navItems = allowedIds ? allNavItems.filter(item => allowedIds.includes(item.id)) : allNavItems;

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
        <button
          id="btn-logout"
          onClick={onLogout}
          className="mt-4 w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
