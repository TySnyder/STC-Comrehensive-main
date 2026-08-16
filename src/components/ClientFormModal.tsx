/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';
import { getClientForms } from '../utils/clientForms';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export default function ClientFormModal({ isOpen, onClose, clientName }: ClientFormModalProps) {
  if (!isOpen) return null;

  const forms = getClientForms();

  return (
    <div id="client-form-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Client Forms</h3>
            {clientName && <p className="text-[11px] text-slate-400 mt-0.5">{clientName}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {forms.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-slate-400 italic">
              No forms configured yet — add them to .planning/CLIENT-FORMS.md.
            </p>
          ) : (
            forms.map(form => (
              <a
                key={form.url}
                href={form.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate">{form.name}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
