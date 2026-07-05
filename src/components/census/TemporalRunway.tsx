/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Rocket,
  ArrowUpDown,
  Share2,
} from 'lucide-react';
import { TempClient } from '../../utils/clientAdapter';

interface TemporalRunwayProps {
  clients: TempClient[];
}

export default function TemporalRunway({ clients }: TemporalRunwayProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Current Treatment Period');

  const runwayClients = [...clients]
    .map(client => {
      const possible = client.possible || 15;
      const attended = client.fullDaysAtt + client.halfDaysAtt * 0.5;
      const completedPercentage = client.completedPercentage || (possible > 0 ? Math.round((attended / possible) * 100) : 50);
      const currentPositionPercentage = client.currentPositionPercentage || Math.min(95, completedPercentage + 5);
      return { ...client, completedPercentage, currentPositionPercentage };
    })
    .sort((a, b) => (b.fullDaysAtt + b.excused + b.unexcused) - (a.fullDaysAtt + a.excused + a.unexcused));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Clinical Runway Tracking</h2>
          <p className="text-sm text-slate-500 mt-1">Journey-focused attendance mapping from intake to discharge.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
          <Rocket className="text-slate-400 w-4 h-4 ml-1" />
          <div className="flex flex-col pr-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Discharge Period</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer outline-none"
            >
              <option>Current Treatment Period</option>
              <option>Upcoming Quarter</option>
            </select>
          </div>
          <button className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded border border-slate-100">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Swimlanes canvas */}
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 px-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200 pb-2">
          <div className="col-span-4">Client &amp; Clinical Runway</div>
          <div className="col-span-8 flex justify-between px-6">
            <span>Intake</span>
            <span>30%</span>
            <span>Current Position</span>
            <span>80%</span>
            <span>Discharge Projection</span>
          </div>
        </div>

        {runwayClients.map(client => {
          const isAtRisk   = client.dcProjectionStatus === 'At Risk';
          const isExtended = client.dcProjectionStatus === 'Extended Care';

          // X = countable days (present + excused) as % of 85-day program
          const inPersonPresent = Math.max(0, client.fullDaysAtt - client.virtualCount);
          const X = ((client.fullDaysAtt + client.excused) / 85) * 100;

          // segments, each expressed as % of 85 days, sorted largest → smallest
          const metrics = [
            { key: 'present',   label: 'In-Person',  value: inPersonPresent,                       bg: 'bg-emerald-500', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            { key: 'absent',    label: 'Absent',     value: client.excused + client.unexcused,     bg: 'bg-slate-400',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
            { key: 'excused',   label: 'Excused',    value: client.excused,                        bg: 'bg-amber-400',   text: 'text-amber-600',   dot: 'bg-amber-400'   },
            { key: 'unexcused', label: 'Unexcused',  value: client.unexcused,                      bg: 'bg-red-500',     text: 'text-red-600',     dot: 'bg-red-500'     },
            { key: 'tardy',     label: 'Tardy',      value: client.tardyCount,                     bg: 'bg-orange-400',  text: 'text-orange-600',  dot: 'bg-orange-400'  },
            { key: 'virtual',   label: 'Virtual',    value: client.virtualCount,                   bg: 'bg-sky-400',     text: 'text-sky-600',     dot: 'bg-sky-400'     },
          ].filter(m => m.value > 0).sort((a, b) => b.value - a.value);

          return (
            <div
              key={client.id}
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden group hover:shadow-md ${isAtRisk ? 'border-red-300 shadow-xs' : 'border-slate-200'}`}
            >
              <div className="grid grid-cols-12 min-h-[90px]">
                {/* Client identity */}
                <div className="col-span-3 p-4 border-r border-slate-100 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded ${client.avatarBg} text-white font-bold flex items-center justify-center text-[11px] shadow-xs shrink-0`}>
                      {client.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight truncate">{client.name}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${isAtRisk ? 'text-red-500' : isExtended ? 'text-blue-500' : 'text-emerald-600'}`}>
                        {client.dcProjectionStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Runway</span>
                      <span className={`font-bold ${isAtRisk ? 'text-red-500' : 'text-slate-600'}`}>{client.clinicalRunwayDays}d</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isAtRisk ? 'bg-red-400' : isExtended ? 'bg-indigo-400' : 'bg-emerald-500'}`}
                        style={{ width: `${client.completedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Totals breakdown bar */}
                <div className="col-span-9 flex flex-col justify-center px-5 gap-2.5 py-4">
                  {/* Bar: 100% = 85 program days. Each segment = value/85 * 100%, sorted desc. */}
                  <div className="relative h-7 rounded-lg overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 flex">
                      {metrics.map(m => {
                        const w = (m.value / 85) * 100;
                        return (
                          <div
                            key={m.key}
                            className={`${m.bg} relative h-full flex items-center justify-center group/seg cursor-default shrink-0`}
                            style={{ width: `${w}%` }}
                          >
                            {w > 7 && (
                              <span className="text-[10px] font-bold text-white/90 font-mono select-none">{m.value}</span>
                            )}
                            <div className="absolute bottom-full mb-1.5 hidden group-hover/seg:flex flex-col items-center z-40 pointer-events-none">
                              <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap shadow-lg">
                                {m.value} {m.label} — {Math.round((m.value / 85) * 100)}% of 85 days
                              </div>
                              <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* X marker: countable days (present+excused) as % of 85 */}
                    {X > 0 && X <= 100 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
                        style={{ left: `${Math.min(X, 99.5)}%` }}
                        title={`${Math.round(X)}% countable (${client.fullDaysAtt + client.excused} of 85 days)`}
                      />
                    )}
                  </div>
                  {/* X label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400">
                      <span className="font-bold text-slate-600">{Math.round(X)}%</span> of 85-day program
                    </span>
                    <span className="text-[9px] font-mono text-slate-300">{client.fullDaysAtt + client.excused} countable days</span>
                  </div>

                  {/* Legend pills */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {metrics.map(m => (
                      <span key={m.key} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${m.dot}`} />
                        <span className={`text-[10px] font-bold font-mono ${m.text}`}>{m.value}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">{m.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { color: 'bg-indigo-500', label: 'Present Baseline',     value: `${clients.length > 0 ? Math.round((clients.reduce((s, c) => s + c.fullDaysAtt, 0) / Math.max(1, clients.reduce((s, c) => s + c.possible, 0))) * 100) : 0}%` },
          { color: 'bg-amber-400',  label: 'Excused Variance',     value: `${clients.length > 0 ? Math.round((clients.reduce((s, c) => s + c.excused, 0) / Math.max(1, clients.reduce((s, c) => s + c.possible, 0))) * 100) : 0}%` },
          { color: 'bg-red-500',    label: 'Non-Compliance Drift', value: `${clients.length > 0 ? Math.round((clients.reduce((s, c) => s + c.unexcused, 0) / Math.max(1, clients.reduce((s, c) => s + c.possible, 0))) * 100) : 0}%`, red: true },
        ].map(({ color, label, value, red }) => (
          <div key={label} className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 ${color} rounded-full`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-2xl font-bold font-display ${red ? 'text-red-600' : 'text-primary'}`}>{value}</p>
          </div>
        ))}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Runway</span>
            <p className="text-2xl font-bold text-primary font-display">
              {clients.length > 0
                ? `${Math.round(clients.reduce((s, c) => s + c.clinicalRunwayDays, 0) / clients.length)}d`
                : '—'}
            </p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }}
            className="bg-slate-50 hover:bg-primary hover:text-white p-2.5 rounded-lg border border-slate-100 text-slate-500 transition-all cursor-pointer"
            title="Share Projections"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
