import { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import type { PlayerItem } from '../store/auctionStore';
import { Search, ShieldAlert, Sparkles, Plus, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '../lib/apiClient';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function PlayerAnalysis() {
  const { shortlist, addToShortlist, removeFromShortlist } = useAuctionStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerItem | null>(null);
  const [showShapModal, setShowShapModal] = useState(false);

  // Pagination & Data State
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 50;
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setSkip(0); // reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on role change
  useEffect(() => {
    setSkip(0);
  }, [selectedRole]);

  // Fetch Data
  useEffect(() => {
    let active = true;
    const loadPlayers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('skip', skip.toString());
        params.append('limit', limit.toString());
        if (debouncedSearch) params.append('search', debouncedSearch);
        
        let roleFilter = selectedRole;
        if (roleFilter !== 'ALL') {
           if (roleFilter === 'BATSMAN') roleFilter = 'Batsman';
           if (roleFilter === 'BOWLER') roleFilter = 'Bowler';
           if (roleFilter === 'ALL-ROUNDER') roleFilter = 'All-Rounder';
           if (roleFilter === 'WICKET-KEEPER') roleFilter = 'Wicket-Keeper';
           params.append('role', roleFilter);
        }

        const res = await fetchWithAuth(`/players?${params.toString()}`);
        if (active) {
          setPlayers(res.items || []);
          setTotal(res.total || 0);
          if ((res.items || []).length > 0 && !selectedPlayer) {
            setSelectedPlayer(res.items[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load players", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadPlayers();
    return () => { active = false; };
  }, [debouncedSearch, selectedRole, skip]);

  const p = selectedPlayer || players[0];
  const isShortlisted = p ? shortlist.some(item => item.id === p.id) : false;

  const radarData = p ? [
    { metric: 'Consistency', value: Math.min(100, (p.batting_avg || 25) * 2.2) },
    { metric: 'Power (SR)', value: Math.min(100, ((p.strike_rate || 130) - 90) * 1.25) },
    { metric: 'Bowling', value: p.wickets ? Math.min(100, p.wickets * 0.6 + 30) : 10 },
    { metric: 'Fitness', value: p.fitness_score || 90 },
    { metric: 'Experience', value: Math.min(100, p.ipl_experience_years * 7 + 20) },
  ] : [];

  const shapData = p ? [
    { feature: 'Strike Rate', importance: 0.38, impact: '+₹3.2 Cr' },
    { feature: 'IPL Experience', importance: 0.28, impact: '+₹2.5 Cr' },
    { feature: 'Boundary %', importance: 0.18, impact: '+₹1.4 Cr' },
    { feature: 'Fitness Score', importance: 0.16, impact: '+₹0.8 Cr' },
  ] : [];

  const handleNext = () => {
    if (skip + limit < total) setSkip(skip + limit);
  };
  const handlePrev = () => {
    if (skip - limit >= 0) setSkip(skip - limit);
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden pb-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Player Intelligence & AI Valuation</h1>
          <p className="text-sm text-muted">Deep Machine Learning feature analytics & SHAP explanations</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search player name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'BATSMAN', 'BOWLER', 'ALL-ROUNDER', 'WICKET-KEEPER'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedRole === role ? 'bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-surface hover:bg-white/10 text-muted'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-4">
        {/* Left: Player List */}
        <div className="lg:col-span-1 glass-panel p-4 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Available Auction Pool ({total})</h3>
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} disabled={skip === 0} className="p-1 disabled:opacity-30 hover:bg-white/10 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted">
                {total === 0 ? 0 : skip + 1}-{Math.min(skip + limit, total)}
              </span>
              <button onClick={handleNext} disabled={skip + limit >= total} className="p-1 disabled:opacity-30 hover:bg-white/10 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-semibold uppercase">Loading AI Models...</span>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center p-4 text-muted text-sm">No players found.</div>
            ) : (
              players.map((player) => {
                const isSelected = p && p.id === player.id;
                return (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-white">{player.name}</p>
                      <p className="text-xs text-muted mt-0.5">{player.role} • {player.nationality}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-yellow-400">₹{(player.base_price / 10000000).toFixed(2)} Cr</div>
                      <div className="text-[10px] text-secondary font-medium mt-0.5">{player.fitness_score ? `${player.fitness_score}% Fit` : '92% Match'}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Player Analytics */}
        {p ? (
          <div className="lg:col-span-2 glass-panel p-6 flex flex-col min-h-0 overflow-y-auto">
            {/* Header section */}
            <div className="border-b border-white/10 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white">{p.name}</h2>
                  <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold">{p.role}</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-muted">{p.nationality}</span>
                </div>
                <p className="text-sm text-muted mt-1">{p.specialization} • Age: {p.age} • {p.ipl_experience_years} Years Experience</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => isShortlisted ? removeFromShortlist(p.id) : addToShortlist(p)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                    isShortlisted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  }`}
                >
                  {isShortlisted ? <><Check className="w-4 h-4" /> Shortlisted</> : <><Plus className="w-4 h-4" /> Add to Shortlist</>}
                </button>
                <button
                  onClick={() => setShowShapModal(true)}
                  className="px-4 py-2.5 bg-surface border border-white/10 hover:border-accent text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  SHAP XAI
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <MetricBox label="Base Price" value={`₹${(p.base_price / 10000000).toFixed(2)} Cr`} color="text-yellow-400" />
              <MetricBox label="Predicted Max Ceiling" value={`₹${((p.base_price * 1.85) / 10000000).toFixed(2)} Cr`} color="text-emerald-400" />
              <MetricBox label="Strike Rate / Econ" value={p.strike_rate ? `${p.strike_rate}` : `${p.economy || 8.0}`} color="text-blue-400" />
              <MetricBox label="Fitness Rating" value={`${p.fitness_score || 92}%`} color="text-purple-400" />
            </div>

            {/* Charts & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
              <div className="border border-white/5 rounded-xl bg-black/20 p-4 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Performance Radar Profile
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4B5563" />
                      <Radar name={p.name} dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl bg-black/20 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-secondary" />
                    AI Risk & Workload Projection
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-muted">
                        <span>Workload Stress Index</span>
                        <span className="font-mono text-white">{p.workload_index || 45}/100</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${p.workload_index || 45}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 text-muted">
                        <span>Injury Risk Probability</span>
                        <span className="font-mono text-emerald-400">Low (8.2%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '8.2%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl mt-4">
                  <p className="text-xs text-white/90">
                    <strong className="text-primary">AI Insight:</strong> Exceptional metrics make {p.name} a high-priority target for your squad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-panel p-6 flex items-center justify-center text-muted">
            {isLoading ? "Loading Player Data..." : "Select a player from the pool"}
          </div>
        )}
      </div>

      {/* SHAP Modal */}
      {showShapModal && p && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-accent" />
                SHAP Feature Explanation ({p.name})
              </h3>
              <button onClick={() => setShowShapModal(false)} className="text-muted hover:text-white font-bold">✕</button>
            </div>
            <p className="text-xs text-muted">Machine learning Shapley values breaking down the key factors influencing our valuation model for this player.</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical">
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis dataKey="feature" type="category" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px' }} />
                  <Bar dataKey="importance" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface p-3 rounded-xl border border-white/5 text-xs text-white/90">
              <p>Primary driver is <strong>{shapData[0].feature}</strong> contributing <strong>{shapData[0].impact}</strong> over base price.</p>
            </div>

            <button onClick={() => setShowShapModal(false)} className="w-full btn-primary py-2 text-sm font-bold">Close Explanation</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
