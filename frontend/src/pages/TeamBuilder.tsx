import { useState } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import type { PlayerItem } from '../store/auctionStore';
import { fetchWithAuth } from '../lib/apiClient';

import { Users, Sparkles, Plus, Trash2, Zap, ShieldCheck } from 'lucide-react';

export default function TeamBuilder() {
  const { squad, shortlist, removeFromSquad, addToSquad, setSquad } = useAuctionStore();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<string | null>(null);

  const playingXI: (PlayerItem | null)[] = Array(11).fill(null);
  squad.slice(0, 11).forEach((p, idx) => {
    playingXI[idx] = p;
  });

  const batsmenCount = squad.filter(p => p.role === 'Batsman').length;
  const bowlersCount = squad.filter(p => p.role === 'Bowler').length;
  const allRoundersCount = squad.filter(p => p.role === 'All-Rounder').length;
  const keepersCount = squad.filter(p => p.role === 'Wicket-Keeper').length;

  const topOrderCoverage = Math.min(100, (batsmenCount + keepersCount) * 25);
  const middleOrderCoverage = Math.min(100, (batsmenCount + allRoundersCount) * 20);
  const paceCoverage = Math.min(100, (bowlersCount + allRoundersCount) * 25);
  const spinCoverage = Math.min(100, bowlersCount * 25);

  const chemistryScore = squad.length > 0
    ? Math.min(98, 65 + (squad.length * 3) + (allRoundersCount * 4))
    : 0;

  const handleRunSimulation = async () => {
    setSimulationRunning(true);
    setSimulationResults(null);
    try {
      const availablePlayers = [...squad, ...shortlist];
      if (availablePlayers.length < 11) {
        setSimulationResults("Error: Need at least 11 players in Squad + Shortlist to build a Playing XI.");
        setSimulationRunning(false);
        return;
      }

      const response = await fetchWithAuth('/teams/best-xi', {
        method: 'POST',
        body: JSON.stringify(availablePlayers)
      });

      if (response.error) {
        setSimulationResults(`Error: ${response.error}`);
      } else {
        const { selected_ids, total_score, win_probability } = response;
        
        const first11 = availablePlayers.filter(p => selected_ids.includes(p.id));
        const rest = availablePlayers.filter(p => !selected_ids.includes(p.id));
        
        // Make the top 11 players the start of the squad
        setSquad([...first11, ...rest]);

        setSimulationResults(`Optimal XI Found! Synergy: ${total_score.toFixed(1)} | Win Probability: ${win_probability.toFixed(1)}%`);
      }
    } catch (e: any) {
      setSimulationResults("Failed to run scenario simulation.");
      console.error(e);
    } finally {
      setSimulationRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Squad Builder & AI Chemistry Engine</h1>
          <p className="text-sm text-muted">Optimize Playing XI synergies and team balance using OR-Tools</p>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={simulationRunning}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          {simulationRunning ? 'Running OR-Tools Optimizer...' : 'Auto-Build Best XI'}
        </button>
      </div>

      {simulationResults && (
        <div className={`p-4 border rounded-xl text-sm font-semibold flex items-center justify-between animate-fade-in ${simulationResults.startsWith('Error') ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>
          <span>{simulationResults}</span>
          <button onClick={() => setSimulationResults(null)} className={simulationResults.startsWith('Error') ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>✕</button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: 11 Player Layout */}
        <div className="lg:col-span-3 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Playing XI Lineup ({squad.length}/11 Filled)
            </h2>
            <span className="text-xs text-muted">Click an empty slot to add from Shortlist</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {playingXI.map((player, i) => (
              <div
                key={i}
                onClick={() => !player && setSelectedSlotIndex(i)}
                className={`aspect-[3/4] rounded-xl border p-4 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all ${
                  player
                    ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-surface/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 cursor-pointer'
                }`}
              >
                <div className="text-[10px] font-mono text-muted uppercase tracking-wider font-bold">Slot {i + 1}</div>

                {player ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-base">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{player.name}</p>
                      <p className="text-xs text-secondary mt-0.5">{player.role}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromSquad(player.id); }}
                      className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Remove from squad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-muted">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-muted">Empty Slot</p>
                    <div className="text-[10px] text-primary underline">Assign Player</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chemistry & Role Balance */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Synergy Engine
            </h3>
            <div className="flex flex-col items-center justify-center p-6 border border-white/5 rounded-xl bg-black/20 text-center">
              <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                {chemistryScore > 0 ? `${chemistryScore}%` : '--'}
              </div>
              <p className="text-xs text-muted mt-2">Squad Synergy Index</p>
              <p className="text-[10px] text-emerald-400 mt-1">{chemistryScore >= 80 ? 'Optimal Lineup Balance' : 'Add All-Rounders for higher synergy'}</p>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role Coverage Matrix
            </h3>
            <div className="space-y-4">
              <ProgressBar label="Top Order Batting" value={topOrderCoverage} color="bg-blue-500" />
              <ProgressBar label="Middle Order / Finishing" value={middleOrderCoverage} color="bg-amber-500" />
              <ProgressBar label="Pace Attack" value={paceCoverage} color="bg-emerald-500" />
              <ProgressBar label="Spin Department" value={spinCoverage} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Shortlist Selection Modal */}
      {selectedSlotIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Select Player for Slot {selectedSlotIndex + 1}</h3>
              <button onClick={() => setSelectedSlotIndex(null)} className="text-muted hover:text-white font-bold">✕</button>
            </div>

            {shortlist.length === 0 ? (
              <div className="text-center py-6 text-muted text-sm">
                No players in shortlist yet. Go to Player Analysis or Live Auction to add players!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {shortlist.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      addToSquad(player, player.base_price);
                      setSelectedSlotIndex(null);
                    }}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-white">{player.name}</p>
                      <p className="text-xs text-muted">{player.role} • {player.specialization}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-400">₹{(player.base_price / 10000000).toFixed(2)} Cr</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setSelectedSlotIndex(null)} className="w-full btn-primary py-2 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 text-muted">
        <span>{label}</span>
        <span className="font-mono text-white font-semibold">{value}%</span>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
