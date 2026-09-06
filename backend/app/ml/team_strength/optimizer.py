from typing import List, Dict, Any
from ortools.linear_solver import pywraplp

class SquadSelectionService:
    def __init__(self):
        # We use SCIP, a powerful open-source integer programming solver
        self.solver = pywraplp.Solver.CreateSolver('SCIP')

    def get_optimal_xi(self, available_players: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a list of player dictionaries. Each player needs:
        - id: str
        - role: str (Batsman, Bowler, All-Rounder, Wicket-Keeper)
        - nationality: str (Indian, Overseas)
        - batting_avg, strike_rate, bowling_avg, economy
        """
        if not self.solver:
            return {"error": "SCIP solver not available."}
            
        if len(available_players) < 11:
            return {"error": "Not enough players to form an XI."}

        # Clear state if reused
        self.solver.Clear()

        # Decision variables: x[i] = 1 if player i is selected, 0 otherwise
        x = {}
        for p in available_players:
            x[p['id']] = self.solver.IntVar(0, 1, f"player_{p['id']}")

        # 1. Total players must be exactly 11
        self.solver.Add(sum(x[p['id']] for p in available_players) == 11)

        # 2. Maximum 4 overseas players
        self.solver.Add(sum(x[p['id']] for p in available_players if p.get('nationality', '').lower() == 'overseas') <= 4)

        # 3. Minimum 1 Wicket-Keeper
        self.solver.Add(sum(x[p['id']] for p in available_players if 'wicket' in p.get('role', '').lower() or p.get('role') == 'WICKET_KEEPER') >= 1)

        # 4. Minimum 5 bowling options (Bowlers + All-Rounders)
        self.solver.Add(sum(x[p['id']] for p in available_players if 'bowl' in p.get('role', '').lower() or 'all-rounder' in p.get('role', '').lower() or p.get('role') in ['BOWLER', 'ALL_ROUNDER']) >= 5)

        # 5. Minimum 5 batting options (Batsmen + All-Rounders + Wicket-Keepers)
        self.solver.Add(sum(x[p['id']] for p in available_players if 'bat' in p.get('role', '').lower() or 'all-rounder' in p.get('role', '').lower() or 'wicket' in p.get('role', '').lower() or p.get('role') in ['BATSMAN', 'ALL_ROUNDER', 'WICKET_KEEPER']) >= 5)

        # Objective function: Maximize "Player Score"
        # We will compute a simple heuristic score for each player
        objective = self.solver.Objective()
        for p in available_players:
            score = self._calculate_player_score(p)
            objective.SetCoefficient(x[p['id']], score)
            
        objective.SetMaximization()

        status = self.solver.Solve()

        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            selected_ids = [p['id'] for p in available_players if x[p['id']].solution_value() > 0.5]
            total_score = objective.Value()
            
            # Map score to a pseudo win probability
            # Let's say a perfect XI has a score of ~110 (10 avg per player)
            # This is a highly heuristic baseline just for demonstration.
            baseline_championship_score = 100.0
            win_probability = min(99.9, (total_score / baseline_championship_score) * 100.0)
            if win_probability < 10:
                win_probability = 15.0 # floor
                
            return {
                "selected_ids": selected_ids,
                "total_score": float(total_score),
                "win_probability": float(win_probability)
            }
        else:
            return {"error": "Could not find a feasible Playing XI given the constraints."}

    def _calculate_player_score(self, p: Dict[str, Any]) -> float:
        """
        Simple heuristic:
        Batting contribution: (batting_avg * strike_rate) / 1000
        Bowling contribution: (25 - bowling_avg) + (10 - economy)*2  (if valid)
        """
        score = 0.0
        
        # Batting
        bat_avg = p.get('batting_avg')
        sr = p.get('strike_rate')
        if bat_avg and sr:
            score += (bat_avg * sr) / 500.0
            
        # Bowling
        bowl_avg = p.get('bowling_avg')
        eco = p.get('economy')
        if bowl_avg and eco and bowl_avg > 0:
            bowl_score = (30.0 - bowl_avg) + (10.0 - eco) * 2
            if bowl_score > 0:
                score += bowl_score / 10.0
                
        # Base fallback if no stats
        if score == 0:
            price = p.get('base_price', 0)
            score = (price / 10000000) * 2 # 2 points per Cr
            
        return score
