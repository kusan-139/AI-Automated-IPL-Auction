import { create } from 'zustand';
import { fetchWithAuth } from '../lib/apiClient';

export interface PlayerItem {
  id: string;
  name: string;
  nationality: string;
  role: string;
  specialization: string;
  batting_style?: string;
  bowling_style?: string;
  age: number;
  ipl_experience_years: number;
  base_price: number;
  batting_avg?: number;
  strike_rate?: number;
  bowling_avg?: number;
  economy?: number;
  wickets?: number;
  runs?: number;
  matches_played?: number;
  fitness_score?: number;
  workload_index?: number;
}

export interface BidLogItem {
  id: string;
  time: string;
  team: string;
  amount: number;
}

interface AuctionState {
  currentSessionId: string | null;
  currentBudget: number;
  initialBudget: number;
  squad: PlayerItem[];
  shortlist: PlayerItem[];
  activePlayer: PlayerItem | null;
  currentBid: number;
  highestBidder: string | null;
  auctionLog: BidLogItem[];
  playerIndex: number;
  auctionPlayers: PlayerItem[];
  availableTeams: any[];
  isBiddingActive: boolean;
  isLoading: boolean;

  // Actions
  fetchInitialData: () => Promise<void>;
  setAuctionPlayers: (players: PlayerItem[]) => void;
  setActivePlayer: (player: PlayerItem | null) => void;
  placeBid: (team: string, amount: number) => void;
  sellCurrentPlayer: () => Promise<void>;
  passCurrentPlayer: () => void;
  nextPlayer: () => void;
  addToShortlist: (player: PlayerItem) => void;
  removeFromShortlist: (playerId: string) => void;
  addToSquad: (player: PlayerItem, price: number) => void;
  removeFromSquad: (playerId: string) => void;
  resetAuction: () => void;
  setSquad: (squad: PlayerItem[]) => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  currentSessionId: null,
  currentBudget: 1200000000,
  initialBudget: 1200000000,
  squad: [],
  shortlist: [],
  auctionPlayers: [],
  availableTeams: [],
  playerIndex: 0,
  activePlayer: null,
  currentBid: 0,
  highestBidder: null,
  auctionLog: [],
  isBiddingActive: false,
  isLoading: true,

  fetchInitialData: async () => {
    try {
      const [playersRes, teams] = await Promise.all([
        fetchWithAuth('/players?limit=50'),
        fetchWithAuth('/teams')
      ]);
      const players = playersRes.items || playersRes; // Handle paginated or fallback
      
      set({ 
        auctionPlayers: players,
        availableTeams: teams,
        isLoading: false,
        // Hack: store a session ID for prototype. In production, fetch current active session
        currentSessionId: '71d124df-9eca-4efc-a543-9fbe7dc53a48'
      });
      if (players.length > 0) {
        get().setAuctionPlayers(players);
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
      set({ isLoading: false });
    }
  },

  setAuctionPlayers: (players) => {
    if (!players || players.length === 0) return;
    set({
      auctionPlayers: players,
      playerIndex: 0,
      activePlayer: players[0],
      currentBid: players[0].base_price,
      highestBidder: null,
      auctionLog: [{ id: "init", time: new Date().toLocaleTimeString(), team: "Auctioneer", amount: players[0].base_price }]
    });
  },

  setActivePlayer: (player) => {
    if (!player) return;
    set({
      activePlayer: player,
      currentBid: player.base_price,
      highestBidder: null,
      isBiddingActive: true
    });
  },

  placeBid: (team, amount) => {
    const time = new Date().toLocaleTimeString();
    const newLogItem: BidLogItem = {
      id: Math.random().toString(),
      time,
      team,
      amount
    };
    set((state) => ({
      currentBid: amount,
      highestBidder: team,
      auctionLog: [newLogItem, ...state.auctionLog]
    }));
  },

  sellCurrentPlayer: async () => {
    const { activePlayer, currentBid, highestBidder, squad, currentBudget, currentSessionId, availableTeams } = get();
    if (!activePlayer || !currentSessionId) return;

    let updatedSquad = squad;
    let updatedBudget = currentBudget;

    if (highestBidder === "Your Franchise" || highestBidder === "RCB" || highestBidder === "RCB Team") {
      updatedSquad = [...squad, activePlayer];
      updatedBudget = Math.max(0, currentBudget - currentBid);
    }

    const team = availableTeams.find(t => t.name.includes(highestBidder) || t.short_name === highestBidder);
    const winningTeamId = team ? team.id : null;

    try {
      await fetchWithAuth('/auction/sell', {
        method: 'POST',
        body: JSON.stringify({
          session_id: currentSessionId,
          player_id: activePlayer.id,
          winning_team_id: winningTeamId,
          final_price: currentBid,
          round_number: 1
        })
      });
      // The websocket will broadcast the SOLD event, but we can also update local state immediately.
    } catch (e) {
      console.error("Failed to save auction result:", e);
      // Optional: alert the user
    }

    const logItem: BidLogItem = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      team: "AUCTIONEER",
      amount: currentBid
    };

    set((state) => ({
      squad: updatedSquad,
      currentBudget: updatedBudget,
      isBiddingActive: false,
      auctionLog: [
        { ...logItem, team: `SOLD to ${highestBidder || 'Unsold'} for ₹${(currentBid / 10000000).toFixed(2)} Cr` },
        ...state.auctionLog
      ]
    }));
  },

  passCurrentPlayer: () => {
    set((state) => ({
      isBiddingActive: false,
      auctionLog: [
        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), team: "AUCTIONEER", amount: 0 },
        ...state.auctionLog
      ]
    }));
  },

  nextPlayer: () => {
    const { playerIndex, auctionPlayers } = get();
    const nextIdx = (playerIndex + 1) % auctionPlayers.length;
    const nextP = auctionPlayers[nextIdx];

    set({
      playerIndex: nextIdx,
      activePlayer: nextP,
      currentBid: nextP.base_price,
      highestBidder: null,
      isBiddingActive: true,
      auctionLog: [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), team: "Auctioneer", amount: nextP.base_price }]
    });
  },

  addToShortlist: (player) => {
    set((state) => {
      if (state.shortlist.some(p => p.id === player.id)) return state;
      return { shortlist: [...state.shortlist, player] };
    });
  },

  removeFromShortlist: (playerId) => {
    set((state) => ({ shortlist: state.shortlist.filter(p => p.id !== playerId) }));
  },

  addToSquad: (player, price) => {
    set((state) => {
      if (state.squad.some(p => p.id === player.id)) return state;
      return {
        squad: [...state.squad, player],
        currentBudget: Math.max(0, state.currentBudget - price)
      };
    });
  },

  removeFromSquad: (playerId) => {
    set((state) => ({
      squad: state.squad.filter(p => p.id !== playerId)
    }));
  },

  setSquad: (squad) => {
    set({ squad });
  },

  resetAuction: () => {
    const first = get().auctionPlayers[0] || null;
    set({
      currentBudget: 1200000000,
      squad: [],
      playerIndex: 0,
      activePlayer: first,
      currentBid: first ? first.base_price : 0,
      highestBidder: null,
      isBiddingActive: !!first,
      auctionLog: first ? [{ id: "init", time: new Date().toLocaleTimeString(), team: "Auctioneer", amount: first.base_price }] : []
    });
  }
}));
