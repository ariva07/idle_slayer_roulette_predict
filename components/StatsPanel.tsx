
import React from 'react';
import { RouletteStats } from '../types';

interface StatsPanelProps {
  stats: RouletteStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const getPercent = (count: number) => {
    if (stats.totalSpins === 0) return '0%';
    return `${((count / stats.totalSpins) * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
        <div className="text-red-500 text-2xl font-bold mono">{getPercent(stats.redCount)}</div>
        <div className="text-zinc-500 text-xs uppercase tracking-tighter mt-1">Red</div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
        <div className="text-zinc-300 text-2xl font-bold mono">{getPercent(stats.blackCount)}</div>
        <div className="text-zinc-500 text-xs uppercase tracking-tighter mt-1">Black</div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center">
        <div className="text-green-500 text-2xl font-bold mono">{getPercent(stats.greenCount)}</div>
        <div className="text-zinc-500 text-xs uppercase tracking-tighter mt-1">Green</div>
      </div>
    </div>
  );
};
