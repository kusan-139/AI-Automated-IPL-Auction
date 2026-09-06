import { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Download, Filter } from 'lucide-react';
import { fetchWithAuth } from '../lib/apiClient';
import { useAuctionStore } from '../store/auctionStore';

interface AuctionResult {
  id: string;
  session_id: string;
  player_id: string;
  winning_team_id: string | null;
  final_price: number | null;
  round_number: number | null;
}

export default function History() {
  const [results, setResults] = useState<AuctionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSessionId, auctionPlayers, availableTeams } = useAuctionStore();

  useEffect(() => {
    if (currentSessionId) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [currentSessionId]);

  const fetchHistory = async () => {
    try {
      const data = await fetchWithAuth(`/auction/${currentSessionId}/history`);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (id: string) => {
    const p = auctionPlayers.find(p => p.id === id);
    return p ? p.name : 'Unknown Player';
  };

  const getTeamName = (id: string | null) => {
    if (!id) return 'UNSOLD';
    const t = availableTeams.find(t => t.id === id);
    return t ? t.name : 'Unknown Team';
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" />
            Auction Ledger
          </h1>
          <p className="text-muted mt-2">Immutable record of all bids, sales, and retained players for the current session.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-5 h-5" /> Export CSV
        </button>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Search by player or team..." 
              className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="p-2.5 bg-surface border border-white/10 hover:bg-white/5 rounded-xl text-muted transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted py-12">Loading...</div>
        ) : !currentSessionId ? (
          <div className="text-center text-muted py-12">No active auction session found.</div>
        ) : results.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>The ledger is currently empty. Start selling players in the Auction Room!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-muted">
                  <th className="pb-3 font-medium">Player</th>
                  <th className="pb-3 font-medium">Winning Team</th>
                  <th className="pb-3 font-medium text-right">Final Price</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {results.map((res) => (
                  <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white">{getPlayerName(res.player_id)}</td>
                    <td className="py-4">
                      {res.winning_team_id ? (
                        <span className="text-emerald-400 font-bold">{getTeamName(res.winning_team_id)}</span>
                      ) : (
                        <span className="text-red-400 font-bold">UNSOLD</span>
                      )}
                    </td>
                    <td className="py-4 text-right font-mono text-yellow-400 font-bold">
                      {res.final_price ? `₹${(res.final_price / 10000000).toFixed(2)} Cr` : '-'}
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
