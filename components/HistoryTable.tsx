
import React from 'react';
import { SpinResult } from '../types';

interface HistoryTableProps {
  history: SpinResult[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-300">Recent History</h3>
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Last 10 Spins</span>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {history.length === 0 ? (
          <div className="p-8 text-center text-zinc-600 italic">No spins recorded yet</div>
        ) : (
          history.slice(0, 10).map((spin) => (
            <div key={spin.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  spin.color === 'RED' ? 'bg-red-500' : 
                  spin.color === 'BLACK' ? 'bg-zinc-400' : 'bg-green-500'
                }`} />
                <span className="mono font-bold text-lg">{spin.value}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${
                  spin.color === 'RED' ? 'text-red-400' : 
                  spin.color === 'BLACK' ? 'text-zinc-400' : 'text-green-400'
                }`}>
                  {spin.color}
                </div>
                <div className="text-[10px] text-zinc-600">
                  {new Date(spin.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
