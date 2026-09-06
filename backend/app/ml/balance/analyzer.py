from typing import Dict, Any, List

def analyze_role_buckets(squad: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Score the team balance based on role buckets.
    """
    buckets = {
        "Openers": 0,
        "Middle Order": 0,
        "Finishers": 0,
        "Pacers": 0,
        "Spinners": 0,
        "Wicketkeepers": 0
    }
    
    for player in squad:
        role = player.get("role")
        spec = player.get("specialization")
        
        if spec == "Opening Batter":
            buckets["Openers"] += 1
        elif role == "Batsman":
            buckets["Middle Order"] += 1
        elif role == "Wicket-Keeper":
            buckets["Wicketkeepers"] += 1
        elif role == "Bowler":
            if player.get("bowling_style", "").lower().find("spin") != -1:
                buckets["Spinners"] += 1
            else:
                buckets["Pacers"] += 1
                
    return buckets
