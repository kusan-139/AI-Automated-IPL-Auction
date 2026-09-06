from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.coach.strategy import apply_strategy_modifier

class AuctionCoachAdvisor(BaseMLModel):
    model_name = "auction_coach"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'player': Dict, 'squad': List[Dict], 'shortlist': List[Dict], 'auction_state': Dict}
        """
        player = features.get('player', {})
        squad = features.get('squad', [])
        shortlist = features.get('shortlist', [])
        state = features.get('auction_state', {})
        
        current_bid = state.get('current_bid', player.get('base_price', 0))
        budget = state.get('current_budget', 1200000000)

        from app.ml.team_strength.optimizer import SquadSelectionService
        optimizer = SquadSelectionService()

        # Score without player (using just squad + shortlist)
        available_without = squad + shortlist
        res_without = optimizer.get_optimal_xi(available_without)
        score_without = res_without.get('total_score', 0.0) if 'error' not in res_without else 0.0

        # Score with player
        available_with = squad + shortlist + [player]
        res_with = optimizer.get_optimal_xi(available_with)
        score_with = res_with.get('total_score', 0.0) if 'error' not in res_with else 0.0

        marginal_value = max(0.0, score_with - score_without)

        # Map marginal value points to a max safe bid
        # E.g., 1 point of heuristic score is worth 5,000,000 (50 Lakhs)
        base_valuation = player.get('base_price', 20000000)
        max_safe_bid = base_valuation + (marginal_value * 5000000.0)
        
        # Don't exceed 40% of remaining budget
        max_safe_bid = min(max_safe_bid, budget * 0.4)
        
        advice = "WAIT"
        reason = "Current bid exceeds calculated maximum safe value."
        if current_bid <= max_safe_bid:
            advice = "BID"
            reason = f"Player adds {marginal_value:.2f} synergy points. Safe up to {max_safe_bid/10000000:.2f} Cr."
            
        return {
            "advice": advice,
            "max_safe_bid": float(max_safe_bid),
            "reasoning": reason,
            "marginal_value": marginal_value,
            "confidence": 0.85
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Coach advice combines negotiation probabilities, team strength impact, and budget constraints."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
