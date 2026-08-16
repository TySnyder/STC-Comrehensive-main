/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface Connection {
  name: string;
  status: string;
  delay: string;
  api: string;
}

interface SystemConnectionsTabProps {
  connections: Connection[];
  onToggleConnection: (name: string) => void;
}

export default function SystemConnectionsTab({ connections, onToggleConnection }: SystemConnectionsTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
        Secure API Gateway System Connections
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((c, idx) => (
          <div key={idx} className="p-4 border border-slate-100 bg-[#fbfbfb] rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{c.name}</h4>
                <span className="text-[10px] text-slate-400 mt-1 font-mono block">Gateway: {c.api}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                c.status === 'Connected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>{c.status}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-450 pt-2 border-t border-slate-100/50">
              <span>Sync frequency: <span className="font-bold font-mono text-slate-600">{c.delay}</span></span>
              <button onClick={() => onToggleConnection(c.name)}
                className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-md cursor-pointer ${
                  c.status === 'Connected' ? 'bg-red-50 text-red-650' : 'bg-indigo-50 text-indigo-700'
                }`}>
                {c.status === 'Connected' ? 'Disconnect' : 'Connect Link'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
