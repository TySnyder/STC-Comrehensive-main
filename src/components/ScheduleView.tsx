import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Info, Shuffle, BookOpen, Pencil } from 'lucide-react';
import { Staff, SessionType, GridSlot, TimeOffRequest } from '../types';
import { getMonday, addDays, weekNavLabel } from '../utils/weekHelpers';
import { ThemeAnchor, themeWeekFor } from '../utils/themeHelpers';
import { THEMES, THEME_CYCLE_LENGTH } from '../themes';
import WeekNavPill from './shared/WeekNavPill';

const THEME_ANCHOR_KEY = 'stc-theme-anchor';

function loadThemeAnchor(): ThemeAnchor | null {
  try {
    const saved = localStorage.getItem(THEME_ANCHOR_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (typeof parsed?.mondayIso === 'string' && typeof parsed?.themeWeek === 'number') return parsed;
  } catch { /* fall through */ }
  return null;
}

interface ScheduleViewProps {
  staff: Staff[];
  sessions: SessionType[];
  slots: GridSlot[];
  setSlots: React.Dispatch<React.SetStateAction<GridSlot[]>>;
  searchTerm: string;
  timeOffRequests: TimeOffRequest[];
}

type ViewMode = '1week' | '4week';

const DAY_IDS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
type DayId = typeof DAY_IDS[number];

const STAFF_COLORS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
];

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

const getStaffColor = (staffId: string, allStaff: Staff[]) => {
  const idx = allStaff.findIndex(s => s.id === staffId);
  return STAFF_COLORS[Math.max(0, idx) % STAFF_COLORS.length];
};

export default function ScheduleView({ staff, sessions, slots, setSlots, searchTerm, timeOffRequests }: ScheduleViewProps) {
  const todayMonday = getMonday(new Date().toISOString().slice(0, 10));

  const [weekStart, setWeekStart] = useState<string>(todayMonday);
  const [viewMode, setViewMode] = useState<ViewMode>('1week');
  const [assigningSlot, setAssigningSlot] = useState<{ sessionId: string; dayId: DayId } | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedProgramType, setSelectedProgramType] = useState<string>('CBT Intensive');
  const [themeAnchor, setThemeAnchor] = useState<ThemeAnchor | null>(loadThemeAnchor);
  const [editingTheme, setEditingTheme] = useState(false);
  const [themeDetailOpen, setThemeDetailOpen] = useState(false);

  const displayedThemeWeek = themeAnchor ? themeWeekFor(weekStart, themeAnchor) : null;
  const displayedTheme = displayedThemeWeek ? THEMES[displayedThemeWeek - 1] : null;

  const setThemeForDisplayedWeek = (themeWeek: number) => {
    const anchor: ThemeAnchor = { mondayIso: weekStart, themeWeek };
    setThemeAnchor(anchor);
    localStorage.setItem(THEME_ANCHOR_KEY, JSON.stringify(anchor));
    setEditingTheme(false);
  };

  const { month, startDay, endDay } = weekNavLabel(weekStart);
  const isToday = weekStart === todayMonday;

  const prevWeek = () => setWeekStart(w => addDays(w, -7));
  const nextWeek = () => setWeekStart(w => addDays(w, 7));
  const goToToday = () => setWeekStart(todayMonday);

  // In 4-week mode, every assignment writes to all 4 weekIndices (0–3).
  // The grid always displays weekIndex 0.
  const activeWeekIndices = viewMode === '4week' ? [0, 1, 2, 3] : [0];

  const getSlot = (sessionId: string, dayId: string) =>
    slots.find(s => s.sessionId === sessionId && s.dayId === dayId && s.weekIndex === 0);

  const isOnLeave = (staffId: string, isoDate: string) =>
    timeOffRequests.some(r => r.staffId === staffId && isoDate >= r.startDate && isoDate <= r.endDate);

  const assignToSlot = (sessionId: string, dayId: string, staffId: string, programType: string) => {
    setSlots(prev => {
      let result = [...prev];
      for (const w of activeWeekIndices) {
        const idx = result.findIndex(s => s.sessionId === sessionId && s.dayId === dayId && s.weekIndex === w);
        const entry: GridSlot = { id: `${sessionId}-W${w}-${dayId}`, sessionId, dayId, weekIndex: w, therapistId: staffId, programType };
        if (idx >= 0) result[idx] = entry;
        else result.push(entry);
      }
      return result;
    });
  };

  const handleRemoveAssignment = (sessionId: string, dayId: string) => {
    setSlots(prev =>
      prev.map(s =>
        s.sessionId === sessionId && s.dayId === dayId && activeWeekIndices.includes(s.weekIndex)
          ? { ...s, therapistId: null }
          : s
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, staffId: string) => {
    e.dataTransfer.setData('text/plain', staffId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, sessionId: string, dayId: string) => {
    e.preventDefault();
    const staffId = e.dataTransfer.getData('text/plain');
    if (!staffId || !staff.find(s => s.id === staffId)) return;
    assignToSlot(sessionId, dayId, staffId, 'CBT Intensive');
  };

  const handleAssignClick = (sessionId: string, dayId: DayId) => {
    setAssigningSlot({ sessionId, dayId });
    setSelectedStaffId(staff.length > 0 ? staff[0].id : '');
    setSelectedProgramType('CBT Intensive');
  };

  const handleConfirmAssignment = () => {
    if (assigningSlot && selectedStaffId) {
      assignToSlot(assigningSlot.sessionId, assigningSlot.dayId, selectedStaffId, selectedProgramType);
      setAssigningSlot(null);
    }
  };

  const handleAutoAssign = () => {
    const available = staff.filter(s => s.status === 'Active');
    if (available.length === 0) return;
    setSlots(prev => {
      let result = [...prev];
      for (const session of sessions) {
        for (let i = 0; i < DAY_IDS.length; i++) {
          const dayId = DAY_IDS[i];
          const colIso = addDays(weekStart, i);
          const eligible = available.filter(s => !isOnLeave(s.id, colIso));
          const pool = eligible.length > 0 ? eligible : available;
          const picked = pool[Math.floor(Math.random() * pool.length)];
          for (const w of activeWeekIndices) {
            const idx = result.findIndex(s => s.sessionId === session.id && s.dayId === dayId && s.weekIndex === w);
            const entry: GridSlot = { id: `${session.id}-W${w}-${dayId}`, sessionId: session.id, dayId, weekIndex: w, therapistId: picked.id, programType: 'CBT Intensive' };
            if (idx >= 0) result[idx] = entry;
            else result.push(entry);
          }
        }
      }
      return result;
    });
  };

  const isSearchMatch = (text: string) =>
    !!searchTerm && text.toLowerCase().includes(searchTerm.toLowerCase());

  // Build day columns for the displayed week
  const columns = DAY_IDS.map((dayId, i) => {
    const iso = addDays(weekStart, i);
    const date = new Date(iso + 'T12:00:00');
    return { dayId, iso, dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 leading-tight">Program Schedule Builder</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional coverage and session allocation for Behavioral Health Programs.
          </p>
        </div>

        {/* 1-week / 4-week toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {(['1week', '4week'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {mode === '1week' ? '1 Week' : '4 Week'}
            </button>
          ))}
        </div>
      </div>

      {/* 4-week mode notice */}
      {viewMode === '4week' && (
        <div className="flex items-center gap-2 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 font-medium">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Every assignment you make here will repeat for 4 consecutive weeks starting from the selected week.
        </div>
      )}

      {/* Week nav pill */}
      <div className="flex justify-end">
        <WeekNavPill
          monthLabel={month}
          startLabel={startDay}
          endLabel={endDay}
          isToday={isToday}
          onPrev={prevWeek}
          onNext={nextWeek}
          onToday={goToToday}
        />
      </div>

      {/* Theme week banner — facility-wide 17-week Solutions Method® cycle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          {displayedTheme && displayedThemeWeek ? (
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Theme Week {displayedThemeWeek} of {THEME_CYCLE_LENGTH}
                {isToday && <span className="ml-1.5 text-violet-600">· Current</span>}
              </p>
              <button
                onClick={() => setThemeDetailOpen(true)}
                className="text-base font-extrabold text-slate-800 hover:text-violet-700 transition-colors truncate block"
                title="View theme description"
              >
                {displayedTheme.name}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Theme cycle not set</p>
              <p className="text-sm font-semibold text-slate-600">Select this week's theme to anchor the 17-week cycle.</p>
            </div>
          )}
        </div>

        {/* 17-week cycle strip */}
        {displayedThemeWeek && (
          <div className="flex items-center gap-1" title={`Week ${displayedThemeWeek} of ${THEME_CYCLE_LENGTH}`}>
            {THEMES.map((t, i) => (
              <div
                key={t.name}
                title={`Wk ${i + 1}: ${t.name}`}
                className={`h-2 rounded-full transition-all ${
                  i + 1 === displayedThemeWeek ? 'w-4 bg-violet-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {editingTheme || !themeAnchor ? (
            <select
              autoFocus={editingTheme}
              className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              value={displayedThemeWeek ?? ''}
              onChange={e => e.target.value && setThemeForDisplayedWeek(Number(e.target.value))}
            >
              <option value="" disabled>Theme this week…</option>
              {THEMES.map((t, i) => (
                <option key={t.name} value={i + 1}>Wk {i + 1} — {t.name}</option>
              ))}
            </select>
          ) : (
            <>
              <button
                onClick={() => setThemeDetailOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
              <button
                onClick={() => setEditingTheme(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                title="Re-anchor the cycle by setting the displayed week's theme"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Set theme</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 bg-slate-50">
          <div className="p-4 flex items-center justify-center font-bold text-xs tracking-wider text-slate-500 border-r border-slate-200 h-16 uppercase">
            Session
          </div>
          {columns.map(col => (
            <div key={col.dayId} className="p-3 text-center h-16 flex flex-col justify-center border-r last:border-r-0 border-slate-200">
              <span className="block font-bold text-xs text-indigo-600">{col.dayId}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">{col.dateLabel}</span>
            </div>
          ))}
        </div>

        {/* Session rows */}
        <div className="divide-y divide-slate-100">
          {sessions.map(session => (
            <div key={session.id} className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_1fr] group">
              <div className="p-4 bg-white border-r border-slate-200 flex flex-col justify-center items-center text-center group-hover:bg-slate-50/50 transition-colors duration-150">
                <span className="font-extrabold text-base text-indigo-600">{session.name}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">{session.timeRange}</span>
              </div>

              {columns.map(col => {
                const slot = getSlot(session.id, col.dayId);
                const assignedStaff = slot?.therapistId ? staff.find(s => s.id === slot.therapistId) : null;
                const onLeave = assignedStaff ? isOnLeave(assignedStaff.id, col.iso) : false;
                const highlighted = assignedStaff
                  ? isSearchMatch(assignedStaff.name) || isSearchMatch(slot!.programType) || isSearchMatch(session.name)
                  : false;
                const colors = assignedStaff ? getStaffColor(assignedStaff.id, staff) : null;

                return (
                  <div
                    key={col.dayId}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, session.id, col.dayId)}
                    className={`p-3 border-r last:border-r-0 border-slate-200 min-h-[110px] flex flex-col justify-center transition-all bg-white ${
                      highlighted ? 'ring-2 ring-inset ring-indigo-600 bg-blue-50/30' : ''
                    } ${onLeave ? 'bg-amber-50/40' : ''}`}
                  >
                    {assignedStaff ? (
                      <motion.div
                        layoutId={`slot-${session.id}-${col.dayId}`}
                        className={`bg-white rounded-lg p-2.5 shadow-sm transition-all relative flex flex-col justify-between h-full ${
                          onLeave
                            ? 'border-2 border-amber-400 hover:border-amber-500'
                            : 'border border-slate-200 hover:border-indigo-500 hover:shadow'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {assignedStaff.photo ? (
                              <img
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                src={assignedStaff.photo}
                                alt={assignedStaff.name}
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full ${colors!.bg} ${colors!.text} flex items-center justify-center text-[9px] font-extrabold flex-shrink-0`}>
                                {getInitials(assignedStaff.name)}
                              </div>
                            )}
                            <p className="text-xs font-bold text-slate-800 truncate">{assignedStaff.name}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(session.id, col.dayId)}
                            className="p-0.5 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                            title="Unassign"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate">
                            {slot!.programType}
                          </p>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">
                            {assignedStaff.credentials}
                          </span>
                        </div>
                        {onLeave && (
                          <div className="mt-1.5 text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 text-center">
                            ⚠ On Approved Leave
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => handleAssignClick(session.id, col.dayId)}
                        className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-lg p-3 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer h-full group/add"
                      >
                        <UserPlus className="w-5 h-5 text-slate-400 group-hover/add:text-indigo-600 transition-colors" />
                        <span className="text-[11px] mt-1.5 font-bold tracking-wide">Assign Slot</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Staff Shelf */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-base text-indigo-600">Staff Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop any clinician into grid cells to build schedule coverage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAssign}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
              title="Randomly assign all sessions to active staff"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Auto Assign</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-150">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Drag & Drop Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {staff.map(member => {
            const colors = getStaffColor(member.id, staff);
            return (
              <div
                key={member.id}
                draggable
                onDragStart={e => handleDragStart(e, member.id)}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-indigo-500 cursor-grab active:cursor-grabbing hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
              >
                {member.photo ? (
                  <img
                    className="w-12 h-12 rounded-full object-cover mb-3 border-2 border-indigo-500/10 group-hover:border-indigo-500/40 transition-colors"
                    src={member.photo}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-extrabold text-sm mb-3`}>
                    {getInitials(member.name)}
                  </div>
                )}
                <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{member.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{member.role}</p>
                <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 font-medium">
                  {member.credentials}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Detail Modal */}
      <AnimatePresence>
        {themeDetailOpen && displayedTheme && displayedThemeWeek && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={() => setThemeDetailOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start p-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                    The Solutions Method® · Theme Week {displayedThemeWeek} of {THEME_CYCLE_LENGTH}
                  </p>
                  <h3 className="font-extrabold text-xl text-slate-800 mt-0.5">{displayedTheme.name}</h3>
                </div>
                <button
                  onClick={() => setThemeDetailOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 pt-4 overflow-y-auto space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{displayedTheme.description}</p>
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1.5">Clinical techniques this week</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{displayedTheme.techniques}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigningSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAssigningSlot(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-lg text-indigo-600">Assign Clinic Slot</h3>
                <button
                  onClick={() => setAssigningSlot(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Target Slot</p>
                  <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{sessions.find(s => s.id === assigningSlot.sessionId)?.name}</span>
                    <span className="flex items-center gap-1.5">
                      {assigningSlot.dayId}
                      {viewMode === '4week' && (
                        <span className="text-[9px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                          × 4 weeks
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Select Clinician
                  </label>
                  <select
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    value={selectedStaffId}
                    onChange={e => setSelectedStaffId(e.target.value)}
                  >
                    {staff.map(s => {
                      const colIdx = DAY_IDS.indexOf(assigningSlot!.dayId as DayId);
                      const slotIso = colIdx >= 0 ? addDays(weekStart, colIdx) : '';
                      const onLeaveForSlot = slotIso ? isOnLeave(s.id, slotIso) : false;
                      return (
                        <option key={s.id} value={s.id} disabled={onLeaveForSlot}>
                          {onLeaveForSlot ? `⚠ ${s.name} (On Approved Leave)` : `${s.name} (${s.credentials})`}
                        </option>
                      );
                    })}
                  </select>
                  {selectedStaffId && (() => {
                    const colIdx = DAY_IDS.indexOf(assigningSlot!.dayId as DayId);
                    const slotIso = colIdx >= 0 ? addDays(weekStart, colIdx) : '';
                    return slotIso && isOnLeave(selectedStaffId, slotIso) ? (
                      <p className="mt-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                        ⚠ This clinician has approved time off on this date. Assignment is blocked.
                      </p>
                    ) : null;
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Program / Session Focus
                  </label>
                  <select
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    value={selectedProgramType}
                    onChange={e => setSelectedProgramType(e.target.value)}
                  >
                    <option value="CBT Intensive">CBT Intensive</option>
                    <option value="DBT Skills Group">DBT Skills Group</option>
                    <option value="ACT Mindful Workshop">ACT Mindful Workshop</option>
                    <option value="Somatic Trauma Release">Somatic Trauma Release</option>
                    <option value="Addiction Support Group">Addiction Support Group</option>
                    <option value="Creative Art Therapy">Creative Art Therapy</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setAssigningSlot(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssignment}
                  disabled={(() => {
                    if (!assigningSlot || !selectedStaffId) return true;
                    const colIdx = DAY_IDS.indexOf(assigningSlot.dayId as DayId);
                    const slotIso = colIdx >= 0 ? addDays(weekStart, colIdx) : '';
                    return slotIso ? isOnLeave(selectedStaffId, slotIso) : false;
                  })()}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
