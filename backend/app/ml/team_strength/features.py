from typing import List, Dict, Any
import numpy as np

def aggregate_squad_features(squad_players: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate individual player stats into squad-level features.
    """
    if not squad_players:
        return {
            "avg_batting_sr": 0.0,
            "avg_bowling_econ": 0.0,
            "squad_size": 0,
            "overseas_count": 0
        }
        
    batting_srs = [p.get('strike_rate', 120.0) for p in squad_players if p.get('role') in ('Batsman', 'Wicket-Keeper', 'All-Rounder') and p.get('strike_rate')]
    bowling_econs = [p.get('economy', 8.0) for p in squad_players if p.get('role') in ('Bowler', 'All-Rounder') and p.get('economy')]
    
    overseas_count = sum(1 for p in squad_players if p.get('nationality') != 'Indian')
    
    return {
        "avg_batting_sr": float(np.mean(batting_srs)) if batting_srs else 0.0,
        "avg_bowling_econ": float(np.mean(bowling_econs)) if bowling_econs else 0.0,
        "squad_size": len(squad_players),
        "overseas_count": overseas_count
    }
