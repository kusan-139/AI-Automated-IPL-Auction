from typing import Dict, Any, List

class ScenarioSimulator:
    def __init__(self):
        # We would inject TeamStrengthModel and ChemistryEngine here
        pass
        
    def run_scenario(self, initial_state: Dict[str, Any], actions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Run a series of actions (e.g. buy_player) on the initial state and return final state.
        """
        state = dict(initial_state)
        squad = list(state.get('squad', []))
        budget = state.get('remaining_budget', 0)
        
        for action in actions:
            if action['type'] == 'buy_player':
                squad.append(action['player'])
                budget -= action['price']
                
        state['squad'] = squad
        state['remaining_budget'] = budget
        
        # Here we would call the actual ML models to score the new state
        return {
            "final_state": state,
            "metrics": {
                "team_strength": 85.0, # Dummy
                "chemistry": 70.0      # Dummy
            }
        }
