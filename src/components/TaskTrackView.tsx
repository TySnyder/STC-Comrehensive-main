/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Mail,
  Phone,
  CheckSquare,
  Square,
  ListTodo,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { Client, IndSession, UaAssignment, CallResult } from '../types';

// Seed data is dated 2026-06-15 (see data.ts); Task Track reads "today" against
// that same reference so the framework demonstrates populated content out of the box.
const TODAY = '2026-06-15';

const CALL_RESULT_OPTIONS: CallResult[] = ['Pending', 'Confirmed', 'No Answer', 'Left Voicemail', 'Rescheduled', 'Cancelled'];

const TICKER_MESSAGES = [
  'URGENT: Complete UA logs for morning block by 12:00 PM.',
  'NOTICE: Staff meeting moved to Conference Room B at 2:00 PM.',
  'SYSTEM: Scheduled maintenance on patient portal tonight at 2:00 AM.',
];

interface TaskItem {
  id: string;
  text: string;
  detail?: string;
  done: boolean;
  time?: string;
}

interface UaDocTab {
  id: string;
  clientName: string;
  results: string;
  notes: string;
}

interface TimelineEvent {
  time: string;
  title: string;
  subtitle: string;
  state: 'past' | 'current' | 'future';
}

// Placeholder daily agenda — no "today's schedule" data model exists yet to derive this from.
const TIMELINE_EVENTS: TimelineEvent[] = [
  { time: '08:00 AM', title: 'Staff Huddle', subtitle: 'Conference Rm A', state: 'past' },
  { time: '09:00 AM', title: 'IOP Group Therapy', subtitle: 'Lead: Dr. Smith', state: 'current' },
  { time: '11:30 AM', title: '1:1 Session', subtitle: 'Office 4', state: 'future' },
  { time: '01:00 PM', title: 'Clinical Review Board', subtitle: 'Directors Only', state: 'future' },
  { time: '03:30 PM', title: 'Discharge Planning', subtitle: '', state: 'future' },
];

// Placeholder — no "today's groups" data model exists yet to derive this from.
const GROUPS_TODAY = [
  { name: 'Relapse Prevention', therapist: 'Dr. Sarah M.', time: '09:00 AM' },
  { name: 'Mindfulness & CBT', therapist: 'Therapist J.', time: '11:00 AM' },
  { name: 'Family Systems', therapist: 'Kirsten', time: '02:00 PM' },
];

const INITIAL_ONGOING_TASKS: TaskItem[] = [
  { id: 'ong-1', text: 'Initial Assessment - D. Carter', detail: 'Complete bio-psycho-social intake forms.', done: false },
  { id: 'ong-2', text: 'Review UA Lab Panel', detail: 'Results pending from external lab.', done: false },
];

const INITIAL_UPCOMING_TASKS: TaskItem[] = [
  { id: 'up-1', text: 'Prepare Discharge Plan', detail: 'Review finalized forms before next meeting.', done: false },
];

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function programLabel(client: Client | undefined): string {
  if (!client) return '—';
  return `${client.program} - ${client.location === 'SF' ? 'Santa Fe' : 'Albuquerque'}`;
}

// Full-bleed banner — rendered by App.tsx outside the padded/max-width content
// wrapper so it can dock flush to the top edge, full width of the workspace.
export function TaskTrackTicker() {
  return (
    <div id="task-track-ticker" className="w-full h-12 bg-slate-900 flex items-center px-6 overflow-hidden shrink-0">
      <Megaphone className="w-4 h-4 text-indigo-300 mr-3 shrink-0" />
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-marquee">
          {[0, 1].map(dup => (
            <span key={dup} className="inline-flex items-center font-mono text-xs text-slate-200 tracking-wide">
              {TICKER_MESSAGES.map((msg, i) => (
                <span key={i} className="mx-8">{msg}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TaskTrackViewProps {
  clients: Client[];
  indSessions: IndSession[];
  onUpdateIndSession: (sessionId: string, updates: { callResult?: CallResult }) => void;
  uaAssignments: UaAssignment[];
}

export default function TaskTrackView({ clients, indSessions, onUpdateIndSession, uaAssignments }: TaskTrackViewProps) {
  const todaysReminders = indSessions.filter(s => s.date === TODAY);

  const [uaTabs, setUaTabs] = useState<UaDocTab[]>(() =>
    uaAssignments
      .filter(a => a.assignedDate === TODAY)
      .map(a => ({
        id: a.id,
        clientName: clients.find(c => c.id === a.clientId)?.name ?? 'Unknown Client',
        results: '',
        notes: '',
      }))
  );
  const [activeTabId, setActiveTabId] = useState('reminders');

  const addUaTab = () => {
    const id = `ua-manual-${Date.now()}`;
    setUaTabs(prev => [...prev, { id, clientName: 'New Client', results: '', notes: '' }]);
    setActiveTabId(id);
  };

  const updateUaTab = (id: string, updates: Partial<UaDocTab>) => {
    setUaTabs(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const activeUaTab = uaTabs.find(t => t.id === activeTabId);

  // TODO: wire actual reminder-draft generation — deferred per user, button just needs to exist.
  const handleSendDailyReminders = () => {};
  // TODO: wire the two-email generation flow — deferred per user, button just needs to exist.
  const handleGenerateEmails = () => {};

  const [taskView, setTaskView] = useState<'ongoing' | 'upcoming'>('ongoing');
  const [ongoingTasks, setOngoingTasks] = useState<TaskItem[]>(INITIAL_ONGOING_TASKS);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>(INITIAL_UPCOMING_TASKS);
  const [newTaskText, setNewTaskText] = useState('');

  const activeTasks = taskView === 'ongoing' ? ongoingTasks : upcomingTasks;
  const setActiveTasks = taskView === 'ongoing' ? setOngoingTasks : setUpcomingTasks;

  const toggleTask = (id: string) => {
    setActiveTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, done: !t.done, time: !t.done ? new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : undefined }
          : t
      )
    );
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setActiveTasks(prev => [...prev, { id: `task-${Date.now()}`, text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const [railView, setRailView] = useState<'timeline' | 'calendar'>('timeline');

  return (
    <div id="task-track-wrapper" className="space-y-6">
      {/* Main grid: left 9/12, right 3/12 */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          {/* Daily Reminders / UA tabbed panel — height follows content, no forced scroll */}
          <div id="widget-daily-reminders-ua" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-3 pt-3 border-b border-slate-200 bg-[#f8fafc] flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                <button
                  onClick={() => setActiveTabId('reminders')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                    activeTabId === 'reminders' ? 'bg-white text-indigo-600 border border-b-0 border-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daily Reminders
                </button>
                {uaTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer truncate max-w-[160px] ${
                      activeTabId === tab.id ? 'bg-white text-indigo-600 border border-b-0 border-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.clientName} (UA)
                  </button>
                ))}
                <button
                  onClick={addUaTab}
                  title="Add UA tab"
                  className="w-8 h-8 mb-1 flex items-center justify-center rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSendDailyReminders}
                className="mb-2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" /> Send Daily Reminders
              </button>
            </div>

            <div className="p-4">
              {activeTabId === 'reminders' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[70px]">Time</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[150px]">Client Name</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[130px]">Phone Number</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">Therapist</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[140px]">Program / Location</th>
                        <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[130px]">Call Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {todaysReminders.map(session => {
                        const client = clients.find(c => c.id === session.clientId);
                        return (
                          <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-3 font-mono text-slate-800">{session.time}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {initials(session.clientName)}
                                </div>
                                <span className="font-semibold text-slate-800">{session.clientName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                {session.phone}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-700">{session.therapist}</td>
                            <td className="px-3 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                                {programLabel(client)}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <select
                                value={session.callResult ?? 'Pending'}
                                onChange={e => onUpdateIndSession(session.id, { callResult: e.target.value as CallResult })}
                                className="w-[118px] text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                              >
                                {CALL_RESULT_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                      {todaysReminders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">
                            No individual sessions scheduled for today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeUaTab ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">UA Results</label>
                    <textarea
                      value={activeUaTab.results}
                      onChange={e => updateUaTab(activeUaTab.id, { results: e.target.value })}
                      rows={3}
                      placeholder="Enter UA panel results…"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Notes While Talking to Client</label>
                    <textarea
                      value={activeUaTab.notes}
                      onChange={e => updateUaTab(activeUaTab.id, { notes: e.target.value })}
                      rows={3}
                      placeholder="Targeting / conversation notes…"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleGenerateEmails}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" /> Generate Emails
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Groups Today + Tasks (Ongoing/Completed <-> Upcoming toggle) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-[#f8fafc]">
                <h3 className="text-sm font-bold text-slate-800">Groups Today</h3>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[560px]">
                {GROUPS_TODAY.map(g => (
                  <div key={g.name} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{g.name}</div>
                      <div className="text-[11px] text-slate-400">Therapist: {g.therapist}</div>
                    </div>
                    <div className="text-[11px] font-mono text-indigo-600">{g.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  {taskView === 'ongoing' ? 'Ongoing / Completed Tasks' : 'Upcoming Tasks'}
                </h3>
                <div className="flex bg-slate-100 border border-slate-200 rounded-md p-0.5">
                  <button
                    onClick={() => setTaskView('ongoing')}
                    title="Ongoing / Completed"
                    className={`px-1.5 py-1 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                      taskView === 'ongoing' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTaskView('upcoming')}
                    title="Upcoming"
                    className={`px-1.5 py-1 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                      taskView === 'upcoming' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[560px]">
                {activeTasks.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    className="flex items-start gap-2.5 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <button className="text-slate-300 group-hover:text-indigo-600 transition-colors mt-0.5 shrink-0">
                      {item.done ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-tight ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.text}
                      </p>
                      {item.detail && <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>}
                      {item.done && item.time && (
                        <span className="text-[9px] font-mono text-emerald-600 font-bold block mt-0.5 uppercase">Cleared at {item.time}</span>
                      )}
                    </div>
                  </div>
                ))}
                {activeTasks.length === 0 && (
                  <p className="px-4 py-6 text-center text-slate-400 italic text-xs">No tasks here yet.</p>
                )}
              </div>
              <div className="p-3 border-t border-slate-200 bg-[#f8fafc]">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Enter new task…"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: Timeline <-> Google Calendar toggle */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">{railView === 'timeline' ? "Today's Schedule" : 'Google Calendar'}</h3>
              <div className="flex bg-slate-100 border border-slate-200 rounded-md p-0.5">
                <button
                  onClick={() => setRailView('timeline')}
                  title="Timeline"
                  className={`px-1.5 py-1 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                    railView === 'timeline' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRailView('calendar')}
                  title="Google Calendar"
                  className={`px-1.5 py-1 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                    railView === 'calendar' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {railView === 'timeline' ? (
              <div className="flex-1 p-4 overflow-y-auto max-h-[720px] relative">
                <div className="absolute left-[54px] top-4 bottom-4 w-px bg-slate-200" />
                <div className="flex flex-col gap-5 relative">
                  {TIMELINE_EVENTS.map((ev, i) => (
                    <div key={i} className={`flex gap-3 ${ev.state === 'past' ? 'opacity-50' : ''}`}>
                      <div className={`font-mono w-11 text-right pt-0.5 text-[10px] ${ev.state === 'current' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                        {ev.time}
                      </div>
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 border-2 border-white ${
                          ev.state === 'current' ? 'bg-indigo-600 ring-2 ring-indigo-100' : ev.state === 'past' ? 'bg-slate-300' : 'bg-white border-slate-300'
                        }`}
                      />
                      <div className="flex-1 pb-1">
                        <h4 className="text-xs font-semibold text-slate-800">{ev.title}</h4>
                        {ev.subtitle && <p className="text-[11px] text-slate-400">{ev.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-2">
                <CalendarDays className="w-6 h-6 text-slate-300" />
                <p className="text-xs text-slate-400">Google Calendar isn't connected yet.</p>
                <p className="text-[11px] text-slate-300">Read-only calendar sync is a planned follow-up.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
