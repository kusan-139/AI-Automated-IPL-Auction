from typing import List, Dict, Any

def calculate_compatibility(player_a: Dict[str, Any], player_b: Dict[str, Any]) -> float:
    """
    Calculate pairwise compatibility between two players.
    Returns score between 0.0 and 1.0
    """
    # Dummy compatibility: just randomness based on names for prototype
    score = 0.5
    if player_a.get('nationality') == player_b.get('nationality'):
        score += 0.2
    
    # Left-Right hand combination is good for batting
    if player_a.get('batting_style') != player_b.get('batting_style'):
        score += 0.1
        
    return min(1.0, score)
