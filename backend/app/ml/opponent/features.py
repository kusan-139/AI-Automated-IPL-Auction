from typing import Dict, Any, List

def extract_opponent_features(team_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract features for opponent weakness model.
    """
    squad = team_data.get('squad', [])
    budget = team_data.get('remaining_budget', 0)
    max_slots = team_data.get('max_squad_size', 25)
    
    # Calculate role distribution
    roles = {"Batsman": 0, "Bowler": 0, "All-Rounder": 0, "Wicket-Keeper": 0}
    for player in squad:
        role = player.get('role')
        if role in roles:
            roles[role] += 1
            
    slots_left = max_slots - len(squad)
    
    return {
        "budget_per_slot": budget / max(1, slots_left),
        "role_counts": roles,
        "slots_left": slots_left
    }
