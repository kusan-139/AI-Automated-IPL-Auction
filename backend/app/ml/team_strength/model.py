from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.team_strength.features import aggregate_squad_features

class TeamStrengthModel(BaseMLModel):
    model_name = "team_strength_composite"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'squad': List[Dict]}
        """
        squad = features.get('squad', [])
        agg_features = aggregate_squad_features(squad)
        
        # Prototype composite scoring
        batting_score = min(100, agg_features['avg_batting_sr'] / 1.5)
        bowling_score = max(0, 100 - (agg_features['avg_bowling_econ'] * 10))
        
        # Very simple title probability proxy
        title_prob = (batting_score + bowling_score) / 200.0 * (min(25, agg_features['squad_size']) / 25.0)
        
        return {
            "batting_score": float(batting_score),
            "bowling_score": float(bowling_score),
            "fielding_score": 75.0, # Placeholder
            "squad_balance": 80.0, # Placeholder
            "title_probability": float(title_prob)
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Team strength is balanced, but could use improvement in death bowling."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
