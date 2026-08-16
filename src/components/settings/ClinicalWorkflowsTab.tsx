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
}

export default function ClinicalWorkflowsTab({
  requireCoSign, setRequireCoSign,
  autoSaveMinutes, setAutoSaveMinutes,
  enableVoiceDictation, setEnableVoiceDictation,
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
      </div>
    </div>
  );
}
