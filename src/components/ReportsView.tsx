/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Tv2, 
  Users, 
  Award, 
  ArrowUpRight, 
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  Sparkle
} from 'lucide-react';
import { Staff } from '../types';

interface ReportsViewProps {
  staff: Staff[];
}

export default function ReportsView({ staff }: ReportsViewProps) {
  // Outcomes metrics baseline vs discharge
  const outcomeData = [
    { domain: 'Mental Health Severity', baseline: 42, discharge: 88, color: 'bg-indigo-600' },
    { domain: 'Social Functioning', baseline: 35, discharge: 79, color: 'bg-emerald-500' },
    { domain: 'Coping Skills Adaptation', baseline: 20, discharge: 85, color: 'bg-sky-400' },
    { domain: 'Daily Life Integration', baseline: 50, discharge: 92, color: 'bg-amber-400' },
    { domain: 'Overall Physical Health', baseline: 64, discharge: 89, color: 'bg-rose-500' }
  ];

  // Census vs Capacity indicators across programs
  const censusComparison = [
    { program: 'EIOP (Enhanced Outpatient)', census: 48, capacity: 55, color: 'bg-indigo-500' },
    { program: 'DIOP (Day Outpatient)', census: 42, capacity: 45, color: 'bg-indigo-400' }
  ];

  return (
    <div id="reports-analytics-panel" className="space-y-6">
      
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Completed Audits</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-0.5">84 Metrics</h3>
            <p className="text-[10px] text-emerald-600 font-bold font-mono mt-1">100% HIPAA COMPLIANT</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Average Patient Growth</span>
            <h3 className="text-xl font-bold text-indigo-600 font-display mt-0.5">+4.2% Monthly</h3>
            <p className="text-[10px] text-slate-400 mt-1">Consistent clinician ratio</p>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-500 shrink-0" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Overall Facility Grade</span>
            <h3 className="text-xl font-bold text-slate-800 font-display mt-0.5">Grade A (98/100)</h3>
            <p className="text-[10px] text-indigo-650 font-bold font-mono mt-1 flex items-center gap-0.5">
              <Sparkle className="w-3.5 h-3.5" /> EXCELLENCE RATED
            </p>
          </div>
          <Award className="w-8 h-8 text-amber-500 shrink-0" />
        </div>

      </div>

      {/* 2. Grouped Outcome Scores Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Baseline vs Discharge Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Patient Outcomes Analysis Scale</h3>
              <p className="text-xs text-slate-400 font-sans">Grouped clinical assessments comparison (Admissions Baseline vs. Discharged Score)</p>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-200 rounded-sm inline-block"></span>
                <span>Baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block"></span>
                <span>Discharge</span>
              </div>
            </div>
          </div>

          {/* Grouped responsive bars layout */}
          <div className="space-y-4 pt-2">
            {outcomeData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 block font-sans">{item.domain}</span>
                <div className="relative pt-1">
                  
                  {/* Baseline bar (light gray) */}
                  <div className="w-full bg-slate-100 h-6 rounded-md relative overflow-hidden flex items-center">
                    <div 
                      className="bg-slate-200 h-full rounded-l-md" 
                      style={{ width: `${item.baseline}%` }}
                    ></div>
                    <span className="absolute left-3.5 font-mono text-[10px] font-bold text-slate-500">
                      Baseline: {item.baseline}%
                    </span>

                    {/* Overlay discharge bar */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-indigo-600/20" 
                      style={{ width: `${item.discharge}%` }}
                    >
                      <div 
                        className="bg-indigo-600 h-full rounded-l-md flex items-center justify-end pr-3.5" 
                        style={{ width: `${item.discharge}%` }}
                      >
                        <span className="font-mono text-[10px] font-bold text-white leading-none">
                          Discharge: {item.discharge}%
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Overviews details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 leading-snug">Census vs Capacity ratio</h3>
            <p className="text-xs text-slate-400 font-sans">EHR real-time bed & session utilization</p>
          </div>

          <div className="space-y-4 mt-4 flex-1 justify-center flex flex-col">
            {censusComparison.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold font-sans text-slate-600">
                  <span>{item.program}</span>
                  <span className="font-mono text-slate-800">{item.census} / {item.capacity} Beds</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${(item.census / item.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Clinician High Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Clinical Performance & Auditing Ranking</h3>
          <p className="text-xs text-slate-400 font-sans">Ranking based on discharge timely packet completion, compliance co-signs, and clinical attendance</p>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                <th className="py-3 px-6">Therapist Clinician</th>
                <th className="py-3 px-6">Current active caseload</th>
                <th className="py-3 px-6">Timely documents rating</th>
                <th className="py-3 px-6">Audits status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {staff.filter(st => st.maxCaseload > 0).map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors text-slate-650">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-450 mr-1">#0{idx + 1}</span>
                      <img src={st.photo} alt={st.name} className="w-7 h-7 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-slate-800 block">{st.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">{st.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-mono font-medium">{st.currentCaseload} Managed patients</td>
                  <td className="py-3.5 px-6">
                    <span className="text-xs font-bold text-slate-700">98.{5 - idx}%</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      PASSED AUDIT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
