/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  ListRestart, 
  Workflow, 
  Server, 
  BellRing, 
  Check, 
  Plus, 
  Cpu, 
  Award,
  ToggleLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SYSTEM_CONNECTIONS } from '../data';

export default function SettingsView() {
  const [activeSegment, setActiveSegment] = useState<'profile' | 'workflows' | 'integrations'>('profile');

  // Interactive settings state
  const [facilityName, setFacilityName] = useState('STC Behavioral Health Complex');
  const [taxId, setTaxId] = useState('XX-XXXXXXX');
  const [npi, setNpi] = useState('1894029104');
  const [address, setAddress] = useState('1094 Clinic Road Dr, Austin, TX 78701');

  const [requireCoSign, setRequireCoSign] = useState(true);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(5);
  const [enableVoiceDictation, setEnableVoiceDictation] = useState(false);

  const [connections, setConnections] = useState(SYSTEM_CONNECTIONS);

  const toggleConnection = (name: string) => {
    setConnections(
      connections.map((c) =>
        c.name === name ? { ...c, status: c.status === 'Connected' ? 'Idle' : 'Connected' } : c
      )
    );
  };

  const navItems = [
    { id: 'profile', label: 'Facility Profile', icon: Building2 },
    { id: 'workflows', label: 'Clinical Workflows', icon: Workflow },
    { id: 'integrations', label: 'System Connections', icon: Server },
  ];

  return (
    <div id="settings-portal-wrapper" className="space-y-6">
      
      {/* Settings layout header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs">
        <div className="flex gap-1.5 items-center">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 font-sans uppercase">Operations Office Configurator</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
          NPI COMPLIANT SYSTEM
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Settings Sidebar navigation */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSegment === item.id;
              return (
                <button
                  key={item.id}
                  id={`btn-setting-sub-${item.id}`}
                  onClick={() => setActiveSegment(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-450'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-x-4 -translate-y-4" />
            <Award className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold font-display uppercase tracking-wide">Operational Excellence</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-w-[160px] mx-auto">
              This environment is fully HIPAA validated and meets EHR-S criteria.
            </p>
          </div>
        </div>

        {/* Right Side: Tab Specific layout panels */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Facility Profile form */}
          {activeSegment === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Facility demographics & Corporate parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">EHR Registered Facility Name</label>
                  <input
                    id="settings-facility-name"
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">Tax Identification Number (TID)</label>
                  <input
                    id="settings-tax-id"
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb] font-mono"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5">National Provider Identifier (NPI-10)</label>
                  <input
                    id="settings-npi"
                    type="text"
                    value={npi}
                    onChange={(e) => setNpi(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb] font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 font-sans mb-1.5 font-sans">Clinical Facility Address</label>
                  <input
                    id="settings-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb]"
                  />
                </div>

              </div>
              
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-semibold py-2.5 px-6 rounded-lg shadow-2xs mt-4 hover:shadow cursor-pointer">
                Save Facility Demographics
              </button>
            </div>
          )}

          {/* TAB 2: Clinical Workflows Checklist */}
          {activeSegment === 'workflows' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Clinical Workflow Automation Rules
              </h3>

              <div className="space-y-4">
                
                {/* Rule check 1 */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setRequireCoSign(!requireCoSign)}>
                  <div className="max-w-md space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 font-sans">Require clinical co-signature for Interns</h4>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Automatically queues all psychiatric and diagnostic sheets produced by clinical interns in the Clinical Lead signoff bucket.
                    </p>
                  </div>
                  <button className="text-indigo-600">
                    <input type="checkbox" checked={requireCoSign} onChange={() => {}} className="w-4 h-4 text-indigo-600 accent-indigo-600" />
                  </button>
                </div>

                {/* Rule check 2 */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="max-w-md space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 font-sans font-sans">Automatic drafting of progress sheets</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Automatically backs up partial notes to system drafts to prevent electronic loss. Period interval:
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={autoSaveMinutes}
                        onChange={(e) => setAutoSaveMinutes(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border border-slate-200 bg-white rounded font-mono text-center font-bold"
                      />
                      <span className="text-[11px] text-slate-500 font-medium font-sans">Minutes frequency</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>

                {/* Rule check 3 */}
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setEnableVoiceDictation(!enableVoiceDictation)}>
                  <div className="max-w-md space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 font-sans">Enable Clinic-wide Voice Transcription dictations</h4>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Integrates browser-native speech-to-text directly in clinical note modals to speed up multidisciplinary reports.
                    </p>
                  </div>
                  <button className="text-indigo-600">
                    <input type="checkbox" checked={enableVoiceDictation} onChange={() => {}} className="w-4 h-4 text-indigo-600 accent-indigo-600" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Integrations & Gateway system connections */}
          {activeSegment === 'integrations' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                Secure API Gateway System Connections
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((c, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 bg-[#fbfbfb] rounded-xl flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight font-sans">{c.name}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono block">Gateway: {c.api}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                        c.status === 'Connected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-sans text-slate-450 pt-2 border-t border-slate-100/50">
                      <span>Sync frequency: <span className="font-bold font-mono text-slate-600">{c.delay}</span></span>
                      
                      <button
                        onClick={() => toggleConnection(c.name)}
                        className={`text-[10px] font-bold font-sans cursor-pointer uppercase py-1 px-2.5 rounded-md ${
                          c.status === 'Connected' ? 'bg-red-50 text-red-650' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {c.status === 'Connected' ? 'Disconnect' : 'Connect Link'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
