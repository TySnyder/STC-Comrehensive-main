/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Clock, Calendar, CheckCircle, AlertCircle, User, Users, Fingerprint, Send, PenLine } from 'lucide-react';
import { Client, Staff, EmailDeliveryMode, AuthUser } from '../types';
import { CLOCK_IN_RECIPIENTS } from '../data';
import { requestGmailToken } from '../utils/gmail';
import { ROLE_LABELS } from './Sidebar';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openNoteModal: () => void;
  clients: Client[];
  staff: Staff[];
  user: AuthUser;
  onSelectClient: (client: Client) => void;
  onNavigateToStaff: () => void;
  emailDeliveryMode: EmailDeliveryMode;
  setEmailDeliveryMode: (mode: EmailDeliveryMode) => void;
  emailSendMaster: boolean;
  onDispatchEmail: (token: string, opts: { to: string[]; subject: string; body: string }) => Promise<void>;
}

export default function Header({ title, searchQuery, setSearchQuery, openNoteModal, clients, staff, user, onSelectClient, onNavigateToStaff, emailDeliveryMode, setEmailDeliveryMode, emailSendMaster, onDispatchEmail }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInStatus, setClockInStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const searchRef = useRef<HTMLDivElement>(null);

  const query = searchQuery.trim().toLowerCase();
  const matchedClients = query.length > 0
    ? clients.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.program.toLowerCase().includes(query) ||
        c.insurance.toLowerCase().includes(query)
      ).slice(0, 5)
    : [];
  const matchedStaff = query.length > 0
    ? staff.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.role.toLowerCase().includes(query) ||
        s.credentials.toLowerCase().includes(query)
      ).slice(0, 4)
    : [];
  const showDropdown = query.length > 0 && (matchedClients.length > 0 || matchedStaff.length > 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchQuery]);

  const handleSelectClient = (client: Client) => {
    setSearchQuery('');
    onSelectClient(client);
  };

  const handleSelectStaff = () => {
    setSearchQuery('');
    onNavigateToStaff();
  };

  const handleToggleClockIn = async () => {
    const nextClockedIn = !clockedIn;
    setClockedIn(nextClockedIn);
    if (!nextClockedIn) return; // only clocking IN sends a notification

    setClockInStatus('sending');
    try {
      const token = await requestGmailToken();
      const mmddyy = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      await onDispatchEmail(token, {
        to: CLOCK_IN_RECIPIENTS,
        subject: `STC SF Office Tyler Snyder SOS/EOS - ${mmddyy}`,
        body: 'Clocking in',
      });
      setClockInStatus('idle');
    } catch {
      setClockInStatus('error');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, type: 'critical', text: 'Sarah Jenkins: Authorization expires in 48 hours!', time: '10m ago' },
    { id: 2, type: 'warning', text: 'Liam Sterling: Intake release signatures still missing.', time: '1h ago' },
    { id: 3, type: 'info', text: 'Case compliance audit completes in 3 days.', time: '4h ago' },
    { id: 4, type: 'success', text: 'Dr. Thorne completed Sarah Jenkins weekly summary.', time: '1d ago' },
  ];

  return (
    <header id="portal-header" className="h-16 border-b border-[#e2e8f0] bg-white px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
      
      {/* Title & Path Breadcrumbs */}
      <div id="header-breadcrumbs" className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400">
          <span>Portal</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">{title}</span>
        </div>
        <h1 className="font-display font-bold text-lg text-slate-900 leading-tight">
          {title}
        </h1>
      </div>

      {/* Global Search Bar */}
      <div id="header-search-facility" ref={searchRef} className="max-w-md w-full md:w-80 relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          id="header-search-input"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
          placeholder="Search clients, staff credentials, IDs..."
          className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
        />

        {showDropdown && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {matchedClients.length > 0 && (
              <>
                <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-50 border-b border-slate-100">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clients</span>
                </div>
                {matchedClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b border-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold shrink-0">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{client.program} · {client.location} · {client.insurance}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
            {matchedStaff.length > 0 && (
              <>
                <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-50 border-b border-slate-100">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff</span>
                </div>
                {matchedStaff.map(member => (
                  <button
                    key={member.id}
                    onClick={handleSelectStaff}
                    className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b border-slate-50 transition-colors"
                  >
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{member.role} · {member.credentials}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Operations Controls & Indicators */}
      <div id="header-controls" className="flex items-center gap-3">
        
        {/* Live Clinic Time */}
        <div id="clinic-running-indicator" className="hidden lg:flex items-center gap-2.5 font-mono text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-[#f1f5f9]">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-bold text-slate-700">CLINIC ACTIVE:</span>
          <span>{time.toLocaleTimeString()}</span>
          <span className="text-slate-300">|</span>
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{time.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Clock In / Out */}
        <button
          id="btn-header-clock-in"
          onClick={handleToggleClockIn}
          title={
            clockInStatus === 'error'
              ? 'Clock-in email failed to send — click to retry'
              : clockedIn ? 'Clocked in — click to clock out' : 'Click to clock in'
          }
          className={`relative p-1.5 rounded-full transition-colors cursor-pointer ${
            clockInStatus === 'error'
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : clockedIn ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Fingerprint className="w-5 h-5" />
          {clockInStatus === 'sending' && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white animate-pulse"></span>
          )}
        </button>

        {/* Notifications and Alerts Bell */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 relative hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-slate-700"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div id="notifications-overlay-box" className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden divide-y divide-slate-100">
              <div className="px-4 py-3 bg-[#f8fafc] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Clinical Alerts & Risks</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">2 Critical</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-slate-50 flex gap-3 transition-colors">
                    {notif.type === 'critical' || notif.type === 'warning' ? (
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${notif.type === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                    ) : (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-sans leading-tight font-medium">
                        {notif.text}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center bg-slate-50">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-sans text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Dismiss Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Delivery Mode — Draft vs Send, cross-fades in place */}
        <button
          id="header-email-mode-toggle"
          disabled={emailSendMaster}
          onClick={() => setEmailDeliveryMode(emailDeliveryMode === 'draft' ? 'send' : 'draft')}
          title={
            emailSendMaster
              ? 'Locked to SEND by the Settings master switch — turn it off in Settings'
              : emailDeliveryMode === 'draft' ? 'Emails are saved as drafts — click to send the next one instead' : 'Sending the next email immediately. Click to switch back to drafts.'
          }
          className={`relative w-7 h-7 rounded-full transition-colors ${emailSendMaster ? 'cursor-not-allowed' : 'cursor-pointer'} ${
            emailDeliveryMode === 'send' ? 'text-red-600 bg-red-50 hover:bg-red-100 ring-2 ring-red-200 animate-pulse' : 'text-indigo-600 hover:bg-slate-100'
          }`}
        >
          <PenLine className={`w-4 h-4 absolute inset-0 m-auto transition-opacity duration-200 ${emailDeliveryMode === 'draft' ? 'opacity-100' : 'opacity-0'}`} />
          <Send className={`w-4 h-4 absolute inset-0 m-auto transition-opacity duration-200 ${emailDeliveryMode === 'send' ? 'opacity-100' : 'opacity-0'}`} />
        </button>

        {/* Separator */}
        <span className="w-px h-6 bg-slate-200" />

        {/* Signed-in user */}
        <div id="header-user-badge" className="flex items-center gap-2.5">
          {(() => {
            const matchedStaff = staff.find(s => s.email.toLowerCase() === user.email.toLowerCase());
            const initials = user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
            const subtitle = matchedStaff?.role
              ? `${matchedStaff.role} and ${ROLE_LABELS[user.role]}`
              : ROLE_LABELS[user.role];
            return (
              <>
                {matchedStaff?.photo ? (
                  <img
                    src={matchedStaff.photo}
                    alt={user.name}
                    className="w-8.5 h-8.5 rounded-full border border-slate-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8.5 h-8.5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs border border-indigo-200">
                    {initials}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{user.name}</h4>
                  <p className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider leading-none">{subtitle}</p>
                </div>
              </>
            );
          })()}
        </div>

      </div>
    </header>
  );
}
