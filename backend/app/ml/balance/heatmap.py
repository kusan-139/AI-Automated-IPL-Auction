from typing import Dict, Any, List
from app.ml.base import BaseMLModel
from app.ml.balance.analyzer import analyze_role_buckets

class BalanceHeatmapModel(BaseMLModel):
    model_name = "balance_heatmap"
    model_version = "1.0.0"
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        features: {'squad': List[Dict]}
        """
        squad = features.get('squad', [])
        buckets = analyze_role_buckets(squad)
        
        # Ideal counts mapping
        ideal = {
            "Openers": 3,
            "Middle Order": 4,
            "Finishers": 2,
            "Pacers": 5,
            "Spinners": 3,
            "Wicketkeepers": 2
        }
        
        heatmap_data = []
        for role, count in buckets.items():
            ideal_count = ideal[role]
            score = min(1.0, count / float(max(1, ideal_count)))
            heatmap_data.append({
                "role": role,
                "current": count,
                "ideal": ideal_count,
                "score": score,
                "status": "Good" if score >= 0.8 else ("Adequate" if score >= 0.5 else "Critical")
            })
            
        return {
            "heatmap": heatmap_data,
            "overall_balance": sum(b["score"] for b in heatmap_data) / len(heatmap_data) * 100
        }
        
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "reasoning": "Team balance is scored based on hitting ideal counts for key functional roles."
        }
        
    def save(self, path: str) -> None:
        pass
        
    @classmethod
    def load(cls, path: str) -> "BaseMLModel":
        return cls()
