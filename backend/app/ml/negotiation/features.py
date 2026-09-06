from typing import Dict, Any
import numpy as np

def extract_negotiation_features(player_data: Dict[str, Any], team_data: Dict[str, Any], auction_context: Dict[str, Any]) -> np.ndarray:
    """
    Extract features for the negotiation models (BidProbability and MaxBidRegressor).
    
    player_data: stats, age, base_price, role
    team_data: budget, squad_gaps, strategy
    auction_context: round, time, players_remaining
    """
    # Dummy feature extraction for prototype
    
    # 1. Player features
    base_price = player_data.get('base_price', 2000000)
    age = player_data.get('age', 25)
    
    # 2. Team features
    remaining_budget = team_data.get('remaining_budget', 500000000)
    
    # 3. Context features
    round_num = auction_context.get('round', 1)
    
    features = [
        base_price,
        age,
        remaining_budget,
        round_num
    ]
    
    return np.array([features])
