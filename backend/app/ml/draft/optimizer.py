from typing import Dict, Any, List

def knapsack_draft_optimizer(players: List[Dict[str, Any]], budget: float, max_slots: int) -> List[Dict[str, Any]]:
    """
    Greedy approximation of knapsack problem for draft selection.
    """
    # Sort players by value (proxy: base_price) descending
    sorted_players = sorted(players, key=lambda x: x.get('base_price', 0), reverse=True)
    
    drafted = []
    current_spent = 0
    
    for p in sorted_players:
        price = p.get('base_price', 0)
        if current_spent + price <= budget and len(drafted) < max_slots:
            drafted.append(p)
            current_spent += price
            
    return drafted
