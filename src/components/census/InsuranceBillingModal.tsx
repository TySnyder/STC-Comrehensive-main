import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface InsuranceBillingModalProps {
  clientName: string;
  weekStart: string;       // YYYY-MM-DD (Monday)
  initialNotes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function InsuranceBillingModal({
  clientName,
  weekStart,
  initialNotes,
  onSave,
  onClose,
}: InsuranceBillingModalProps) {
  const [notes, setNotes] = useState(initialNotes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    onSave(notes.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleBackdrop}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              Insurance Billing Notes
            </p>
            <h2 className="text-base font-semibold text-slate-800 leading-tight">{clientName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Week of {formatWeekLabel(weekStart)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add billing notes for this week…"
            rows={6}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
          />
          {notes.trim() === '' && initialNotes !== '' && (
            <p className="text-[10px] text-amber-500 mt-1.5 font-mono">
              Saving with empty notes will remove the entry.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
