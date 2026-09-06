import { useEffect, useState } from 'react';
import { Activity, Play, Plus, Clock, Filter, Trash2, ArrowLeft, Trophy, AlertTriangle, TrendingUp } from 'lucide-react';
import { fetchWithAuth } from '../lib/apiClient';

interface SimulationRun {
  id: string;
  type: string;
  created_at: string;
  results_json: any;
}

export default function Simulations() {
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<SimulationRun | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      const data = await fetchWithAuth('/simulation/history');
      if (Array.isArray(data)) {
        setRuns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createMockSimulation = async () => {
    setSimulating(true);
    try {
      const response = await fetchWithAuth('/simulation/scenario', {
        method: 'POST',
        body: JSON.stringify({
          initial_state: { risk_tolerance: "high", focus: "balanced" },
          actions: []
        })
      });
      
      if (response && !response.error) {
        setRuns([response, ...runs]);
        setSelectedRun(response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  if (selectedRun) {
    const results = selectedRun.results_json || {};
    const winProb = results.win_probability || 0;
    const matchOutcomes = results.match_outcomes || [];
    const impactPlayers = results.key_impact_players || [];

    return (
      <div className="space-y-6 h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <button onClick={() => setSelectedRun(null)} className="flex items-center gap-2 text-muted hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Simulations
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Simulation Results
            </h1>
            <p className="text-muted mt-2 font-mono text-xs">Run ID: {selectedRun.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Championship Probability</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke={winProb > 60 ? "#10b981" : winProb > 40 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="8" 
                  strokeDasharray={`${(winProb / 100) * 251.2} 251.2`} 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{winProb}%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Match Outcomes (Projected)
            </h3>
            <div className="space-y-3">
              {matchOutcomes.map((match: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-bold">vs {match.opponent}</span>
                  {match.win ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-2">WON <span className="text-xs text-emerald-400/70">by {match.margin}</span></span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-2">LOST <span className="text-xs text-red-400/70">by {match.margin}</span></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Key Impact Players
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {impactPlayers.map((player: string, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {player.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-white">{player}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Digital Twin Simulations
          </h1>
          <p className="text-muted mt-2">Run thousands of hypothetical Monte Carlo auction scenarios to find the dominant strategy.</p>
        </div>
        <button 
          onClick={createMockSimulation}
          disabled={simulating}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {simulating ? <Clock className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {simulating ? 'Simulating...' : 'New Simulation'}
        </button>
      </div>

      <div className="glass-panel p-6 flex-1">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-muted" /> Recent Runs
          </h2>
          <button className="p-2 hover:bg-white/5 rounded-lg text-muted">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted py-12">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Simulations Found</h3>
            <p className="text-muted max-w-md mx-auto mb-6">
              You haven't run any digital twin scenarios yet. Click 'New Simulation' to start stress-testing your auction strategies against AI opponents.
            </p>
            <button onClick={createMockSimulation} disabled={simulating} className="btn-primary">
              {simulating ? 'Running...' : 'Run First Simulation'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-muted">
                  <th className="pb-3 font-medium">Simulation ID</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {runs.map((run) => (
                  <tr key={run.id} onClick={() => setSelectedRun(run)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="py-4 font-mono text-primary">{run.id.split('-')[0]}...</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-surface border border-white/10 rounded-md text-xs uppercase text-emerald-400">
                        {run.type}
                      </span>
                    </td>
                    <td className="py-4 text-muted">{new Date(run.created_at).toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-primary hover:text-white transition-colors" title="View Results">
                        <Play className="w-4 h-4 inline" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
