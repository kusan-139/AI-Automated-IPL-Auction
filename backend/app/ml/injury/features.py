from typing import Dict, Any

def extract_injury_features(player_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract features for injury risk and recovery models.
    """
    age = player_data.get('age', 25)
    workload = player_data.get('workload_index', 50.0)
    history = player_data.get('injury_history_json', [])
    
    return {
        "age": age,
        "workload_index": workload,
        "previous_injuries_count": len(history) if history else 0
    }
