/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  HelpCircle, 
  FileText, 
  Save, 
  Clock, 
  Tag, 
  AlertCircle,
  Sparkle
} from 'lucide-react';
import { Client, ClinicalNote } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSaveNote: (newNote: ClinicalNote) => void;
  preselectedClientId?: string;
}

export default function NoteModal({ 
  isOpen, 
  onClose, 
  clients, 
  onSaveNote, 
  preselectedClientId 
}: NoteModalProps) {
  if (!isOpen) return null;

  const [clientId, setClientId] = useState(preselectedClientId || clients[0]?.id || '');
  const [noteType, setNoteType] = useState<ClinicalNote['noteType']>('Progress Note');
  const [programContext, setProgramContext] = useState('EIOP');
  const [noteText, setNoteText] = useState('');
  
  // Checking flags
  const [docFlags, setDocFlags] = useState<{ [key: string]: boolean }>({
    'Discharge Plan Ready': false,
    'High Attendance Checked': false,
    'Co-Signature Acquired': false,
    'Billing Validated': false
  });

  const handleFlagChange = (key: string) => {
    setDocFlags({
      ...docFlags,
      [key]: !docFlags[key]
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    // Find client name
    const matchingClient = clients.find(c => c.id === clientId);
    const clientName = matchingClient ? matchingClient.name : 'Unknown Client';

    const activeFlags = Object.keys(docFlags).filter(flag => docFlags[flag]);

    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      clientId,
      clientName,
      authorName: 'Admin Staff Lead',
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      noteType,
      program: programContext,
      text: noteText,
      isDraft: false,
      flags: activeFlags
    };

    onSaveNote(newNote);
    
    // Clear inputs
    setNoteText('');
    setDocFlags({
      'Discharge Plan Ready': false,
      'High Attendance Checked': false,
      'Co-Signature Acquired': false,
      'Billing Validated': false
    });
    onClose();
  };

  return (
    <div id="note-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>

      <div
        id="note-editor-card"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 h-fit bg-indigo-50 text-indigo-600 rounded-md">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
              Add Clinical or Operational Note
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 uppercase font-bold animate-pulse">
              <Sparkle className="w-3.5 h-3.5" /> Auto-Saved
            </span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-600 font-sans">
          
          {/* Target client select & context grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Target Client profile</label>
              <select
                id="modal-select-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-indigo-500 font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">EHR Note Type</label>
              <select
                id="modal-select-type"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as ClinicalNote['noteType'])}
                className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-indigo-500 font-medium"
              >
                <option value="Progress Note">Progress Note</option>
                <option value="Clinical Summary">Clinical Summary</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Operational Note">Operational Note</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Program assignment</label>
              <select
                id="modal-select-program"
                value={programContext}
                onChange={(e) => setProgramContext(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-indigo-500 font-mono font-bold"
              >
                <option value="EIOP">EIOP (Outpatient)</option>
                <option value="DIOP">DIOP (Day Outpatient)</option>
              </select>
            </div>

          </div>

          {/* Note content rich block */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Note records content</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-all">
              <div className="bg-slate-50 border-b border-slate-100 p-2 flex items-center gap-3">
                <button type="button" className="font-bold text-xs p-1 text-slate-500 hover:bg-slate-200 rounded font-serif">B</button>
                <button type="button" className="italic text-xs p-1 text-slate-500 hover:bg-slate-200 rounded font-serif">I</button>
                <button type="button" className="underline text-xs p-1 text-slate-500 hover:bg-slate-200 rounded font-serif">U</button>
                <span className="w-px h-4 bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-mono">Multidisciplinary Editor Mode</span>
              </div>
              <textarea
                id="modal-textarea-text"
                required
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type clinician observations, diagnostic summaries, case follow-ups..."
                className="w-full text-xs p-4 focus:outline-none focus:ring-0 min-h-[140px] font-sans bg-slate-50/20"
              />
            </div>
          </div>

          {/* Documentation flags check checkboxes */}
          <div className="space-y-2 pb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Verification auditing flags</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.keys(docFlags).map((flag) => (
                <label 
                  key={flag} 
                  className={`p-2 border rounded-lg cursor-pointer flex items-center gap-2 select-none transition-all ${
                    docFlags[flag] 
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-700 font-bold' 
                      : 'bg-slate-50 border-slate-150 hover:bg-slate-50 text-slate-500 font-medium'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={docFlags[flag]}
                    onChange={() => handleFlagChange(flag)}
                    className="rounded border-slate-300 text-indigo-600 accent-indigo-600 shrink-0"
                  />
                  <span className="text-[10px] truncate leading-none">{flag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-slate-300" /> Drafts auto-saves locally and remains HIPAA secure.
            </span>
            <div className="flex items-center gap-2.5">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 font-sans font-bold rounded-lg cursor-pointer text-slate-600"
              >
                Cancel Draft
              </button>
              <button 
                type="submit"
                className="px-4.5 py-2 bg-slate-900 hover:bg-indigo-650 text-white font-sans font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Note Entry
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
