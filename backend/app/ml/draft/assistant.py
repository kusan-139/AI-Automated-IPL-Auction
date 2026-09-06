from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.draft.optimizer import knapsack_draft_optimizer

class DraftAssistantModel(BaseMLModel):
    model_name = "draft_assistant"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'available_players': List[Dict], 'budget': float, 'slots': int, 'strategy': str}
        """
        players = features.get('available_players', [])
        budget = features.get('budget', 1000000000)
        slots = features.get('slots', 20)
        
        drafted_squad = knapsack_draft_optimizer(players, budget, slots)
        
        total_spent = sum(p.get('base_price', 0) for p in drafted_squad)
        
        return {
            "drafted_squad": drafted_squad,
            "total_spent": total_spent,
            "remaining_budget": budget - total_spent
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Draft squad optimized using greedy knapsack approximation to maximize value under budget."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
