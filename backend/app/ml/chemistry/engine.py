from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.chemistry.compatibility import calculate_compatibility

class SquadChemistryEngine(BaseMLModel):
    model_name = "chemistry_engine"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'squad': List[Dict]}
        """
        squad = features.get('squad', [])
        
        if len(squad) < 2:
            return {"chemistry_score": 50.0}
            
        # Pairwise average
        total_comp = 0
        pairs = 0
        for i in range(len(squad)):
            for j in range(i+1, len(squad)):
                total_comp += calculate_compatibility(squad[i], squad[j])
                pairs += 1
                
        avg_comp = (total_comp / pairs) if pairs > 0 else 0.5
        score = avg_comp * 100.0
        
        return {
            "chemistry_score": float(score)
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Good mix of left-right hand combinations and domestic synergy."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
