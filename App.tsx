import React, { useState, useCallback, useMemo } from 'react';
// Zmiana dla Tauri v2 - importujemy invoke do komunikacji z Rustem
import { invoke } from '@tauri-apps/api/core';
import { SpinResult, RouletteStats, RouletteColor } from './types';
import { spinWheel } from './utils/random';
import { HistoryTable } from './components/HistoryTable';
import { StatsPanel } from './components/StatsPanel';

const App: React.FC = () => {
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSpin, setLastSpin] = useState<SpinResult | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualValue, setManualValue] = useState<string>('');

  const stats = useMemo<RouletteStats>(() => {
    const s = { redCount: 0, blackCount: 0, greenCount: 0, totalSpins: history.length };
    history.forEach(spin => {
      if (spin.color === 'RED') s.redCount++;
      if (spin.color === 'BLACK') s.blackCount++;
      if (spin.color === 'GREEN') s.greenCount++;
    });
    return s;
  }, [history]);

  // --- NOWA FUNKCJA PREDYKCJI (RUST BACKEND) ---
  const getAiPrediction = async (currentHistory: SpinResult[]) => {
    // Nie analizujemy, jeśli już liczy lub jest za mało danych
    if (isAnalyzing || currentHistory.length < 3) return;
    
    setIsAnalyzing(true);
    
    try {
      // Wywołujemy funkcję "predict_next_move" zdefiniowaną w main.rs
      // Przekazujemy historię jako argument
      const prediction = await invoke<string>('predict_next_move', { 
        history: currentHistory 
      });

      setAiPrediction(prediction);
    } catch (err) {
      console.error("Rust communication error:", err);
      setAiPrediction("Error: Could not calculate prediction. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpin = useCallback(() => {
    setIsSpinning(true);
    // Symulujemy czas kręcenia koła
    setTimeout(() => {
      const result = spinWheel();
      setLastSpin(result);
      
      const newHistory = [result, ...history];
      setHistory(newHistory);
      setIsSpinning(false);
      
      // Wywołujemy predykcję co spin (jeśli mamy dość danych)
      if (newHistory.length >= 3) {
        getAiPrediction(newHistory);
      }
    }, 1200);
  }, [history]);

  const handleManualEntry = (color: RouletteColor) => {
    const val = parseInt(manualValue);
    // Logika przypisania wartości dla przycisków kolorów
    const finalValue = isNaN(val) ? (color === 'GREEN' ? 0 : color === 'RED' ? 1 : 2) : val;
    
    const result: SpinResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      value: finalValue,
      color: color,
    };

    const newHistory = [result, ...history];
    setHistory(newHistory);
    setLastSpin(result);
    setManualValue('');
    
    // Automatyczna predykcja po dodaniu ręcznym
    if (newHistory.length >= 3) {
      getAiPrediction(newHistory);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setLastSpin(null);
    setAiPrediction(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          Advanced RNG System v2025.2
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          IDLE SLAYER PREDICTOR
        </h1>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          High-fidelity simulation & manual game syncing for the ultimate roulette strategy.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
        {/* Left Column: Controls */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Wheel Visual */}
          <div className="relative aspect-square w-full max-w-[340px] mx-auto bg-zinc-900 border-4 border-zinc-800 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
            <div className={`absolute inset-0 border-[12px] border-zinc-950 rounded-full transition-all duration-[1200ms] ${isSpinning ? 'rotate-[720deg]' : 'rotate-0'}`} />
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isSpinning ? (
                <div className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Spinning...</div>
              ) : lastSpin ? (
                <>
                  <div className={`text-6xl md:text-7xl font-black mono drop-shadow-lg ${
                    lastSpin.color === 'RED' ? 'text-red-500' : 
                    lastSpin.color === 'BLACK' ? 'text-zinc-300' : 'text-green-500'
                  }`}>
                    {lastSpin.value}
                  </div>
                  <div className={`text-xs font-bold mt-1 uppercase tracking-widest opacity-60 ${
                    lastSpin.color === 'RED' ? 'text-red-400' : 
                    lastSpin.color === 'BLACK' ? 'text-zinc-400' : 'text-green-400'
                  }`}>
                    {lastSpin.color}
                  </div>
                </>
              ) : (
                <div className="text-zinc-700 font-bold text-center px-8 uppercase text-xs tracking-widest">Awaiting Data</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg border-b-4 ${
                isSpinning 
                  ? 'bg-zinc-800 text-zinc-600 border-zinc-900 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800 shadow-indigo-500/20'
              }`}
            >
              {isSpinning ? 'SPINNING...' : 'SIMULATE SPIN'}
            </button>

            {/* Manual Entry Section */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sync Game Data</h3>
                <button onClick={clearHistory} className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors uppercase font-bold">Clear All</button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Val (0-36)" 
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm mono text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleManualEntry('RED')}
                      className="w-10 h-10 rounded-lg bg-red-600 hover:bg-red-500 border-b-2 border-red-800 flex items-center justify-center text-white transition-all active:translate-y-0.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-white/20" />
                    </button>
                    <button 
                      onClick={() => handleManualEntry('BLACK')}
                      className="w-10 h-10 rounded-lg bg-zinc-700 hover:bg-zinc-600 border-b-2 border-zinc-900 flex items-center justify-center text-white transition-all active:translate-y-0.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-black/40" />
                    </button>
                    <button 
                      onClick={() => handleManualEntry('GREEN')}
                      className="w-10 h-10 rounded-lg bg-green-600 hover:bg-green-500 border-b-2 border-green-800 flex items-center justify-center text-white transition-all active:translate-y-0.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-white/30" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-600 leading-tight">
                  Enter the last results from your Idle Slayer session to calibrate the algorithm.
                </p>
              </div>
            </div>
          </div>

          {/* Statistical Analysis Output (Zmienione na styl terminalowy) */}
          <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-4 min-h-[90px] flex flex-col justify-center relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-10 -mt-10 blur-3xl" />
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-ping' : aiPrediction ? 'bg-green-500' : 'bg-zinc-600'}`} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                  RUST STATISTICAL CORE
                </span>
              </div>
              {aiPrediction && <span className="text-[9px] text-zinc-600 font-mono">LATENCY: &lt;1ms</span>}
            </div>

            <div className="relative z-10 font-mono">
              {isAnalyzing ? (
                <div className="text-zinc-500 text-xs animate-pulse">
                  &gt; CALCULATING PROBABILITIES...
                </div>
              ) : (
                <p className={`text-sm leading-relaxed ${aiPrediction ? 'text-zinc-100' : 'text-zinc-600'}`}>
                  {aiPrediction ? (
                      <><span className="text-green-500 mr-2">&gt;</span>{aiPrediction}</>
                  ) : (
                      `Waiting for data stream. Add ${Math.max(0, 3 - history.length)} more spins to calibrate.`
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <section>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Live Session Stats</span>
              <span className="text-zinc-700 mono">{history.length} SPINS</span>
            </h2>
            <StatsPanel stats={stats} />
          </section>

          <section className="flex-1">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Audit Log</h2>
            <HistoryTable history={history} />
          </section>
        </div>
      </div>

      {/* Footer info */}
      <footer className="mt-12 w-full border-t border-zinc-900 pt-8 pb-12 text-center text-zinc-700">
        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <span className="text-red-700/80">Red ~48.6%</span>
          <span className="text-zinc-600">Black ~48.6%</span>
          <span className="text-green-700/80">Green ~2.7%</span>
        </div>
        <p className="text-[10px] max-w-xs mx-auto opacity-40 leading-relaxed italic">
          Optimized for Idle Slayer mechanics. The Local Rust Algorithm analyzes local entropy patterns.
        </p>
      </footer>
    </div>
  );
};

export default App;
