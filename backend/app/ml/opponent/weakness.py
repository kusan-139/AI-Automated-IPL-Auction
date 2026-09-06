from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.opponent.features import extract_opponent_features

class OpponentWeaknessModel(BaseMLModel):
    model_name = "opponent_weakness"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'team': Dict}
        """
        team = features.get('team', {})
        opp_features = extract_opponent_features(team)
        
        # Rule-based weakness detection for prototype
        gaps = []
        roles = opp_features["role_counts"]
        
        if roles["Batsman"] < 5:
            gaps.append({"role": "Batsman", "severity": "High"})
        if roles["Bowler"] < 5:
            gaps.append({"role": "Bowler", "severity": "High"})
        if roles["Wicket-Keeper"] < 1:
            gaps.append({"role": "Wicket-Keeper", "severity": "Critical"})
            
        pressure = "Low"
        if opp_features["budget_per_slot"] < 20000000: # < 2Cr per slot
            pressure = "High"
            
        return {
            "gaps": gaps,
            "budget_pressure": pressure,
            "predicted_targets": ["Role: Wicket-Keeper"] if "Wicket-Keeper" in [g['role'] for g in gaps] else []
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Identified critical gap in Wicket-Keeper position driving prediction."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
