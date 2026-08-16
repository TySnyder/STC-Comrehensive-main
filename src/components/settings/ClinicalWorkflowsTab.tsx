/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck } from 'lucide-react';

interface ClinicalWorkflowsTabProps {
  requireCoSign: boolean;
  setRequireCoSign: (v: boolean) => void;
  autoSaveMinutes: number;
  setAutoSaveMinutes: (v: number) => void;
  enableVoiceDictation: boolean;
  setEnableVoiceDictation: (v: boolean) => void;
  emailSendMaster: boolean;
  setEmailSendMaster: (on: boolean) => void;
  emailSignature: string;
  setEmailSignature: (signature: string) => void;
}

export default function ClinicalWorkflowsTab({
  requireCoSign, setRequireCoSign,
  autoSaveMinutes, setAutoSaveMinutes,
  enableVoiceDictation, setEnableVoiceDictation,
  emailSendMaster, setEmailSendMaster,
  emailSignature, setEmailSignature,
}: ClinicalWorkflowsTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
        Clinical Workflow Automation Rules
      </h3>
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setRequireCoSign(!requireCoSign)}>
          <div className="max-w-md space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Require clinical co-signature for Interns</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Automatically queues all psychiatric and diagnostic sheets produced by clinical interns in the Clinical Lead signoff bucket.</p>
          </div>
          <input type="checkbox" checked={requireCoSign} onChange={() => {}} className="w-4 h-4 text-indigo-600 accent-indigo-600 mt-0.5" />
        </div>
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="max-w-md space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Automatic drafting of progress sheets</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Automatically backs up partial notes to system drafts. Period interval:</p>
            <div className="flex items-center gap-2 mt-2">
              <input type="number" min="1" max="30" value={autoSaveMinutes} onChange={e => setAutoSaveMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs border border-slate-200 bg-white rounded font-mono text-center font-bold" />
              <span className="text-[11px] text-slate-500 font-medium">Minutes frequency</span>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setEnableVoiceDictation(!enableVoiceDictation)}>
          <div className="max-w-md space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Enable Clinic-wide Voice Transcription dictations</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Integrates browser-native speech-to-text directly in clinical note modals to speed up multidisciplinary reports.</p>
          </div>
          <input type="checkbox" checked={enableVoiceDictation} onChange={() => {}} className="w-4 h-4 text-indigo-600 accent-indigo-600 mt-0.5" />
        </div>
        <div className={`p-4 rounded-xl border space-y-2 ${emailSendMaster ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-start justify-between">
            <div className="max-w-md space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Email Delivery Mode — Master Switch</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Governs every feature that produces an email (Daily Reminders, UA-generated emails, clock-in, etc.).
                Draft leaves messages for review. Turning Send on here is sticky — it stays on until you turn
                it off here, unlike the header icon's one-shot toggle.
              </p>
            </div>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setEmailSendMaster(false)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  !emailSendMaster ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setEmailSendMaster(true)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  emailSendMaster ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Send
              </button>
            </div>
          </div>
          {emailSendMaster && (
            <p className="text-[10px] font-bold text-red-600">
              LIVE SEND is armed and locked on — every email-producing action sends immediately and stays
              that way until you switch this back to Draft. The header icon is disabled while this is on.
            </p>
          )}
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Email Signature</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Appended to every app-generated email once sending is wired up.</p>
          </div>
          <textarea
            value={emailSignature}
            onChange={e => setEmailSignature(e.target.value)}
            rows={4}
            className="w-full text-[10px] font-mono px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Paste signature HTML…"
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preview</p>
            <div
              className="text-xs bg-white border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: emailSignature }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
