import { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { Sparkles, ArrowRight, Gavel, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuctionSocket } from '../hooks/useAuctionSocket';

const AI_TEAMS = ['MI', 'CSK', 'KKR', 'DC', 'RR', 'PBKS', 'SRH', 'LSG', 'GT'];

export default function AuctionRoom() {
  const {
    activePlayer,
    currentBid,
    highestBidder,
    auctionLog,
    currentBudget,
    squad,
    shortlist,
    isBiddingActive,
    placeBid,
    sellCurrentPlayer,
    nextPlayer,
    resetAuction
  } = useAuctionStore();

  const [showShapModal, setShowShapModal] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [maxSafeBidCr, setMaxSafeBidCr] = useState<number>(0);
  const [marginalValue, setMarginalValue] = useState<number>(0);

  useAuctionSocket('default-session');

  const basePriceCr = activePlayer ? activePlayer.base_price / 10000000 : 2.0;
  const currentBidCr = currentBid / 10000000;
  const isOverpaid = currentBidCr > maxSafeBidCr && maxSafeBidCr > 0;

  useEffect(() => {
    if (activePlayer) {
      const getAdvice = async () => {
        try {
          const { fetchWithAuth } = await import('../lib/apiClient');
          const res = await fetchWithAuth('/auction/coach/advise', {
            method: 'POST',
            body: JSON.stringify({
              player: activePlayer,
              squad: squad,
              shortlist: shortlist,
              auction_state: {
                current_bid: currentBid,
                current_budget: currentBudget
              }
            })
          });
          if (res && res.advice) {
            setMaxSafeBidCr(res.max_safe_bid / 10000000);
            setMarginalValue(res.marginal_value || 0);
          }
        } catch (e) {
          console.error(e);
        }
      };
      getAdvice();
    } else {
      setMaxSafeBidCr(0);
      setMarginalValue(0);
    }
  }, [activePlayer, squad, shortlist, currentBudget]);

  const handleUserBid = (incrementInLakhs: number) => {
    if (!activePlayer || !isBiddingActive) return;
    const increment = incrementInLakhs * 100000;
    const newBid = currentBid + increment;

    if (newBid > currentBudget) {
      alert("Bid exceeds your remaining budget!");
      return;
    }

    placeBid("Your Franchise (RCB)", newBid);

    if (autoSimulate) {
      setTimeout(() => {
        const randomOpponent = AI_TEAMS[Math.floor(Math.random() * AI_TEAMS.length)];
        const oppIncrement = (Math.floor(Math.random() * 2) + 1) * 2500000;
        const oppBid = newBid + oppIncrement;
        placeBid(randomOpponent, oppBid);
      }, 1200);
    }
  };

  const handleOpponentBid = () => {
    if (!activePlayer || !isBiddingActive) return;
    const randomOpponent = AI_TEAMS[Math.floor(Math.random() * AI_TEAMS.length)];
    const oppIncrement = 2500000;
    placeBid(randomOpponent, currentBid + oppIncrement);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
          <div>
            <h1 className="text-2xl font-bold">IPL Live Mega Auction Room</h1>
            <p className="text-xs text-muted">Real-time WebSocket bidding engine & AI Coach</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold bg-surface border border-white/10 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={autoSimulate}
              onChange={(e) => setAutoSimulate(e.target.checked)}
              className="rounded accent-primary"
            />
            Auto AI Counter-Bids
          </label>
          <button onClick={resetAuction} className="p-2 bg-surface hover:bg-white/10 border border-white/10 rounded-xl text-muted hover:text-white" title="Reset Auction">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="bg-surface px-4 py-2 rounded-xl border border-white/10 font-mono text-sm font-bold text-yellow-400">
            Budget Left: ₹{(currentBudget / 10000000).toFixed(2)} Cr
          </div>
        </div>
      </div>

      {/* Main Auction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left 2 Cols: Player Stage & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Stage Panel */}
          <div className="glass-panel p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black/30 pointer-events-none" />

            {activePlayer ? (
              <div className="text-center z-10 w-full max-w-xl">
                <div className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-semibold text-primary mb-4 uppercase tracking-wider">
                  Set 1 • {activePlayer.role}
                </div>

                <h2 className="text-4xl font-black text-white mb-2">{activePlayer.name}</h2>
                <p className="text-base text-muted mb-6">
                  {activePlayer.specialization} • {activePlayer.nationality} • Base: ₹{basePriceCr.toFixed(2)} Cr
                </p>

                {/* Current Bid Display */}
                <div className="p-6 bg-black/40 border border-white/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <div className="text-xs uppercase tracking-widest text-muted mb-1">Current Highest Bid</div>
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 font-mono">
                    ₹{currentBidCr.toFixed(2)} Cr
                  </div>
                  <div className="text-sm font-semibold mt-2 font-mono">
                    {highestBidder ? (
                      <span className="text-emerald-400">Highest Bidder: {highestBidder}</span>
                    ) : (
                      <span className="text-muted">Awaiting Opening Bid</span>
                    )}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                {isBiddingActive ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => handleUserBid(25)}
                      className="px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      +₹25 Lakhs
                    </button>
                    <button
                      onClick={() => handleUserBid(50)}
                      className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all hover:scale-105"
                    >
                      +₹50 Lakhs
                    </button>
                    <button
                      onClick={() => handleUserBid(100)}
                      className="px-5 py-3 bg-amber-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-amber-400 transition-all hover:scale-105"
                    >
                      +₹1.00 Cr
                    </button>
                    <button
                      onClick={handleOpponentBid}
                      className="px-4 py-3 bg-surface border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                      title="Trigger Opponent Counter Bid"
                    >
                      AI Opponent Bid
                    </button>
                    <button
                      onClick={sellCurrentPlayer}
                      className="px-6 py-3 bg-emerald-500 text-black font-extrabold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all flex items-center gap-2"
                    >
                      <Gavel className="w-5 h-5" />
                      SOLD!
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Hammer Down! Round Completed.
                    </div>
                    <button
                      onClick={nextPlayer}
                      className="px-8 py-3.5 bg-primary text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-2"
                    >
                      Next Player <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted">No active player on stage</div>
            )}
          </div>

          {/* Auction Log Feed */}
          <div className="glass-panel p-6 h-48 flex flex-col">
            <h3 className="font-semibold mb-3 text-muted text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Live Bidding Log Feed</span>
              <span className="font-mono text-[10px] text-emerald-400">WebSocket Connected</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 text-sm font-mono pr-2">
              {auctionLog.map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-black/20 border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-secondary">{log.time}</span>
                  <span className="font-bold text-white">{log.team}</span>
                  <span className="text-yellow-400 font-bold">
                    {log.amount > 0 ? `₹${(log.amount / 10000000).toFixed(2)} Cr` : 'Event'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Auction Coach */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className={`border rounded-2xl p-6 relative overflow-hidden transition-all ${
            isOverpaid ? 'border-red-500/40 bg-red-500/10' : 'border-primary/40 bg-primary/10'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isOverpaid ? 'from-red-500 to-amber-500' : 'from-primary to-emerald-400'}`} />
            <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              AI Auction Coach (SHAP Guidance)
            </h3>

            {isOverpaid ? (
              <>
                <div className="text-3xl font-extrabold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> EXCEEDS SAFE CEILING
                </div>
                <p className="text-xs text-white/80 mb-4">
                  Current bid (₹{currentBidCr.toFixed(2)} Cr) exceeds AI safe valuation ceiling of ₹{maxSafeBidCr.toFixed(2)} Cr. Risk of budget strain.
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-400" /> SAFE TO BID
                </div>
                <p className="text-xs text-white/80 mb-4">
                  Maximum calculated safe bid is <strong>₹{maxSafeBidCr.toFixed(2)} Cr</strong> based on current squad role gaps and remaining purse.
                </p>
              </>
            )}

            <button
              onClick={() => setShowShapModal(true)}
              className="text-xs text-primary font-bold underline underline-offset-4 hover:text-white transition-colors"
            >
              View SHAP AI Explanation & Feature Impact
            </button>
          </div>

          {/* Predicted Opponent Limits */}
          <div className="flex-1 border border-white/5 rounded-2xl bg-black/30 p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">AI Opponent Maximum Purse Ceilings</h4>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="font-bold text-blue-400">MI (Mumbai Indians)</span>
                  <span className="text-red-400 font-bold">~₹16.50 Cr</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="font-bold text-yellow-400">CSK (Chennai)</span>
                  <span className="text-amber-400 font-bold">~₹14.80 Cr</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="font-bold text-purple-400">KKR (Kolkata)</span>
                  <span className="text-emerald-400 font-bold">~₹17.20 Cr</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="font-bold text-rose-400">PBKS (Punjab)</span>
                  <span className="text-secondary font-bold">~₹19.00 Cr</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-surface border border-white/10 rounded-xl text-center mt-4">
              <span className="text-xs text-muted">Auctioneer Status: </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">Bidding Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Modal */}
      {showShapModal && activePlayer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-accent" />
                AI Auction Coach SHAP Breakdown
              </h3>
              <button onClick={() => setShowShapModal(false)} className="text-muted hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-surface border border-white/5 rounded-xl">
                <p className="text-xs text-muted">Recommended Max Ceiling</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">₹{maxSafeBidCr.toFixed(2)} Cr</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted uppercase">Top Valuation Factors</h4>
                <div className="p-2.5 bg-black/30 rounded-lg flex justify-between text-xs">
                  <span>Marginal Synergy Score Impact</span>
                  <span className="text-emerald-400 font-mono font-bold">+{marginalValue.toFixed(2)} Points</span>
                </div>
                <div className="p-2.5 bg-black/30 rounded-lg flex justify-between text-xs">
                  <span>Remaining Squad Role Deficiency</span>
                  <span className="text-emerald-400 font-mono font-bold">+33% Weight</span>
                </div>
                <div className="p-2.5 bg-black/30 rounded-lg flex justify-between text-xs">
                  <span>Opponent Purse Pressure</span>
                  <span className="text-amber-400 font-mono font-bold">+25% Weight</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowShapModal(false)} className="w-full btn-primary py-2 text-sm font-bold">Close Explanation</button>
          </div>
        </div>
      )}
    </div>
  );
}
