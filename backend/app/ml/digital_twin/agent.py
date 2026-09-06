from typing import Dict, Any

class FranchiseAgent:
    def __init__(self, team_id: str, budget: float, strategy: str = "balanced"):
        self.team_id = team_id
        self.budget = budget
        self.strategy = strategy
        self.risk_tolerance = 0.5 if strategy == "balanced" else (0.8 if strategy == "aggressive" else 0.3)
        self.player_valuations = {} # internal valuation model
        
    def evaluate_player(self, player: Dict[str, Any]) -> float:
        """Evaluate player and return max willingness to pay."""
        base = player.get("base_price", 20000000)
        # Prototype logic
        val = base * 2.5
        if self.strategy == "aggressive":
            val *= 1.2
        return min(val, self.budget * 0.3)
        
    def decide_bid(self, current_price: float, player: Dict[str, Any]) -> bool:
        """Decide whether to place a bid at the current price."""
        max_willingness = self.evaluate_player(player)
        if current_price < max_willingness and current_price < self.budget:
            return True
        return False
        
    def record_purchase(self, price: float):
        self.budget -= price
