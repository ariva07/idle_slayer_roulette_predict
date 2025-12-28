import React, { useState } from 'react';
import { SpinResult } from '../types';

interface HistoryTableProps {
  history: SpinResult[];
  onUpdate: (id: string, newValue: number) => void;
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (spin: SpinResult) => {
    setEditingId(spin.id);
    setEditValue(spin.value.toString());
  };

  const saveEdit = () => {
    if (editingId) {
      const val = parseInt(editValue);
      if (!isNaN(val) && val >= 0 && val <= 36) {
        onUpdate(editingId, val);
      }
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-zinc-300">Recent History</h3>
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Last 10 Spins</span>
      </div>
      <div className="divide-y divide-zinc-800/50 overflow-y-auto max-h-[400px]">
        {history.length === 0 ? (
          <div className="p-8 text-center text-zinc-600 italic">No spins recorded yet</div>
        ) : (
          history.map((spin) => (
            <div key={spin.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30 transition-colors group">

              {editingId === spin.id ? (
                // TRYB EDYCJI
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    min="0" max="36"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-16 bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-sm text-white font-mono"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded hover:bg-green-900">Save</button>
                  <button onClick={cancelEdit} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-700">Cancel</button>
                </div>
              ) : (
                // TRYB WYŚWIETLANIA
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      spin.color === 'RED' ? 'bg-red-500' :
                      spin.color === 'BLACK' ? 'bg-zinc-400' : 'bg-green-500'
                    }`} />
                    <span className="mono font-bold text-lg w-8 text-center">{spin.value}</span>
                  </div>

                  <div className="flex items-center gap-4">
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

                    {/* Przyciski akcji (widoczne po najechaniu) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(spin)}
                        className="p-1 hover:bg-indigo-900/30 rounded text-indigo-400 hover:text-indigo-300"
                        title="Correct Value"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button
                        onClick={() => onDelete(spin.id)}
                        className="p-1 hover:bg-red-900/30 rounded text-red-900 hover:text-red-500"
                        title="Delete Entry"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
