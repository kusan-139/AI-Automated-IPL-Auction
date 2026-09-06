import { useState } from 'react';
import { Save, Sliders, Database, Shield, Zap } from 'lucide-react';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [auctionRules, setAuctionRules] = useState({
    purseLimit: 120,
    overseasQuota: 8,
    playingOverseas: 4,
    retentionLimit: 4
  });

  const [aiParams, setAiParams] = useState({
    riskTolerance: 'balanced',
    simulationIterations: 10000,
    focusMode: 'batting-heavy'
  });

  const [apiPrefs, setApiPrefs] = useState({
    syncEnabled: true,
    webhookUrl: '',
    logLevel: 'info'
  });

  const handleSave = () => {
    setSaving(true);
    setMessage(null);
    setTimeout(() => {
      setSaving(false);
      setMessage({ text: 'Settings saved successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in h-full overflow-y-auto pr-2">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sliders className="w-8 h-8 text-primary" />
            Configuration & Settings
          </h1>
          <p className="text-muted mt-2">Manage auction rules, AI engine parameters, and database integrations.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Auction Rules */}
        <div className="glass-panel p-6 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> Auction Rules
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Total Purse Limit (Cr)</label>
            <input 
              type="number" 
              value={auctionRules.purseLimit}
              onChange={(e) => setAuctionRules({...auctionRules, purseLimit: Number(e.target.value)})}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Max Overseas Squad</label>
              <input 
                type="number" 
                value={auctionRules.overseasQuota}
                onChange={(e) => setAuctionRules({...auctionRules, overseasQuota: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Playing XI Overseas</label>
              <input 
                type="number" 
                value={auctionRules.playingOverseas}
                onChange={(e) => setAuctionRules({...auctionRules, playingOverseas: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Retention Limit</label>
            <input 
              type="number" 
              value={auctionRules.retentionLimit}
              onChange={(e) => setAuctionRules({...auctionRules, retentionLimit: Number(e.target.value)})}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* AI Engine Parameters */}
        <div className="glass-panel p-6 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> AI Engine Parameters
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'balanced', 'aggressive'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setAiParams({...aiParams, riskTolerance: opt})}
                  className={`p-2 rounded-lg text-sm font-medium capitalize border ${aiParams.riskTolerance === opt ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-white/10 text-muted hover:border-white/30'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Strategy Focus</label>
            <select 
              value={aiParams.focusMode}
              onChange={(e) => setAiParams({...aiParams, focusMode: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="balanced">Balanced Squad</option>
              <option value="batting-heavy">Batting Heavy</option>
              <option value="bowling-heavy">Bowling Heavy</option>
              <option value="all-rounders">All-Rounder Focus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Monte Carlo Iterations</label>
            <input 
              type="range" 
              min="1000" max="50000" step="1000"
              value={aiParams.simulationIterations}
              onChange={(e) => setAiParams({...aiParams, simulationIterations: Number(e.target.value)})}
              className="w-full accent-primary"
            />
            <div className="text-right text-xs text-primary font-mono mt-1">{aiParams.simulationIterations.toLocaleString()} runs</div>
          </div>
        </div>

        {/* System & Database */}
        <div className="glass-panel p-6 space-y-6 md:col-span-2">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> API & Integrations
          </h2>
          
          <div className="flex items-center gap-4">
            <input 
              type="checkbox" 
              id="syncEnabled"
              checked={apiPrefs.syncEnabled}
              onChange={(e) => setApiPrefs({...apiPrefs, syncEnabled: e.target.checked})}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
            <label htmlFor="syncEnabled" className="text-sm font-medium text-white cursor-pointer">
              Enable Real-time Supabase Sync
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Webhook URL (External Integration)</label>
            <input 
              type="text" 
              placeholder="https://api.example.com/webhook"
              value={apiPrefs.webhookUrl}
              onChange={(e) => setApiPrefs({...apiPrefs, webhookUrl: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors font-mono text-sm"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
