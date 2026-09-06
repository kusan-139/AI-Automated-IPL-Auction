from typing import List, Dict, Any
from app.ml.digital_twin.agent import FranchiseAgent

class AuctionEngine:
    def __init__(self, format_rules: Dict[str, Any]):
        self.format_rules = format_rules
        
    def get_next_bid(self, current_bid: float) -> float:
        """Calculate next valid bid amount based on tiers."""
        # Simple flat increment for prototype
        return current_bid + 1000000
        
    def run_single_auction(self, players: List[Dict[str, Any]], teams: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run a single simulated auction."""
        agents = {t["id"]: FranchiseAgent(t["id"], t.get("remaining_budget", 1000000000), t.get("strategy_profile", "balanced")) for t in teams}
        
        results = []
        for player in players:
            current_bid = player.get("base_price", 20000000)
            active_bidders = list(agents.keys())
            winning_team = None
            
            # Simple bidding loop
            while len(active_bidders) > 1:
                # Filter agents willing to bid at current price
                willing = [t for t in active_bidders if agents[t].decide_bid(current_bid, player)]
                
                if len(willing) >= 2:
                    current_bid = self.get_next_bid(current_bid)
                    active_bidders = willing
                    winning_team = willing[0] # just pick the first willing one for prototype
                elif len(willing) == 1:
                    winning_team = willing[0]
                    break
                else:
                    break
                    
            if winning_team:
                agents[winning_team].record_purchase(current_bid)
                results.append({
                    "player_id": player.get("id"),
                    "winning_team_id": winning_team,
                    "final_price": current_bid
                })
                
        return {"results": results}
