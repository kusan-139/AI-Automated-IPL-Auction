from typing import Dict, Any
from app.ml.base import BaseMLModel
from app.ml.injury.features import extract_injury_features

class InjuryRiskModel(BaseMLModel):
    model_name = "injury_risk_classifier"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'player': Dict}
        """
        player = features.get('player', {})
        inj_features = extract_injury_features(player)
        
        # Prototype risk calculation
        base_risk = 0.05
        age_factor = max(0, (inj_features['age'] - 30) * 0.02)
        history_factor = inj_features['previous_injuries_count'] * 0.05
        workload_factor = (inj_features['workload_index'] / 100.0) * 0.1
        
        total_risk = min(0.95, base_risk + age_factor + history_factor + workload_factor)
        
        tier = "Low"
        if total_risk > 0.6:
            tier = "Critical"
        elif total_risk > 0.4:
            tier = "High"
        elif total_risk > 0.2:
            tier = "Medium"
            
        return {
            "injury_probability": float(total_risk),
            "risk_tier": tier
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "High workload and age over 32 increase injury risk."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
