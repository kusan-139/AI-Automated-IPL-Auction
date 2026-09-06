from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.auth.jwt_bearer import get_current_user, CurrentUser

router = APIRouter()

@router.get("/team-strength/{team_id}")
async def team_strength(
    team_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    # Dummy data fetch for team squad, in a real app query DB
    dummy_squad = [{"role": "Batsman", "strike_rate": 135.0}, {"role": "Bowler", "economy": 7.5}]
    
    from app.ml.team_strength.model import TeamStrengthModel
    model = TeamStrengthModel()
    pred = model.predict({"squad": dummy_squad})
    expl = model.explain({"squad": dummy_squad})
    
    return {"prediction": pred, "explanation": expl}

@router.get("/injury-risk/{player_id}")
async def injury_risk(
    player_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    dummy_player = {"age": 31, "workload_index": 85.0, "injury_history_json": [{"type": "hamstring"}]}
    
    from app.ml.injury.risk_model import InjuryRiskModel
    model = InjuryRiskModel()
    pred = model.predict({"player": dummy_player})
    expl = model.explain({"player": dummy_player})
    
    return {"prediction": pred, "explanation": expl}

@router.get("/chemistry/{team_id}")
async def chemistry(
    team_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    dummy_squad = [
        {"nationality": "Indian", "batting_style": "Right-hand bat"},
        {"nationality": "Indian", "batting_style": "Left-hand bat"}
    ]
    
    from app.ml.chemistry.engine import SquadChemistryEngine
    model = SquadChemistryEngine()
    pred = model.predict({"squad": dummy_squad})
    expl = model.explain({"squad": dummy_squad})
    
    return {"prediction": pred, "explanation": expl}

@router.get("/balance/{team_id}")
async def balance(
    team_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    dummy_squad = [{"role": "Batsman", "specialization": "Opening Batter"}, {"role": "Wicket-Keeper"}]
    
    from app.ml.balance.heatmap import BalanceHeatmapModel
    model = BalanceHeatmapModel()
    pred = model.predict({"squad": dummy_squad})
    
    return {"prediction": pred}

@router.get("/opponent/{team_id}")
async def opponent(
    team_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    dummy_team = {"squad": [], "remaining_budget": 500000000, "max_squad_size": 25}
    
    from app.ml.opponent.weakness import OpponentWeaknessModel
    model = OpponentWeaknessModel()
    pred = model.predict({"team": dummy_team})
    
    return {"prediction": pred}
