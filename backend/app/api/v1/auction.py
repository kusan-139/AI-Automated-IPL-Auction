from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.auth.jwt_bearer import get_current_user, CurrentUser
from app.auth.rbac import require_role
from app.database import get_db
from app.models.auction import AuctionResult, AuctionEvent, EventType
from app.schemas.auction import AuctionResultCreate, AuctionResultResponse
from app.api.v1.websocket import auction_manager
import json

router = APIRouter()

@router.post("/sell", response_model=AuctionResultResponse)
async def sell_player(
    sale_data: AuctionResultCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    # Create the result
    new_result = AuctionResult(
        session_id=sale_data.session_id,
        player_id=sale_data.player_id,
        winning_team_id=sale_data.winning_team_id,
        final_price=sale_data.final_price,
        round_number=sale_data.round_number
    )
    db.add(new_result)
    
    # Also log the event
    new_event = AuctionEvent(
        auction_session_id=sale_data.session_id,
        player_id=sale_data.player_id,
        event_type=EventType.SOLD,
        bid_amount=sale_data.final_price,
        bidding_team_id=sale_data.winning_team_id
    )
    db.add(new_event)
    
    await db.commit()
    await db.refresh(new_result)
    
    # Broadcast to websocket
    ws_msg = {
        "event": "SOLD",
        "player_id": str(sale_data.player_id),
        "winning_team_id": str(sale_data.winning_team_id) if sale_data.winning_team_id else None,
        "final_price": sale_data.final_price
    }
    await auction_manager.broadcast(json.dumps(ws_msg))
    
    return new_result

@router.get("/{session_id}/history", response_model=List[AuctionResultResponse])
async def get_auction_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    query = select(AuctionResult).where(AuctionResult.session_id == session_id).order_by(AuctionResult.round_number)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/negotiate")
async def negotiate(
    data: Dict[str, Any],
    current_user: CurrentUser = Depends(get_current_user)
):
    from app.ml.negotiation.model import NegotiationModel
    model = NegotiationModel()
    pred = model.predict(data)
    expl = model.explain(data)
    return {"prediction": pred, "explanation": expl}

@router.post("/coach/advise")
async def coach_advise(
    data: Dict[str, Any],
    current_user: CurrentUser = Depends(get_current_user)
):
    from app.ml.coach.advisor import AuctionCoachAdvisor
    model = AuctionCoachAdvisor()
    pred = model.predict(data)
    expl = model.explain(data)
    return {"advice": pred, "explanation": expl}

@router.post("/digital-twin/run")
async def digital_twin_run(
    data: Dict[str, Any],
    current_user: CurrentUser = Depends(require_role("analyst")) # Owner or Analyst
):
    from app.ml.digital_twin.simulator import DigitalTwinSimulator
    model = DigitalTwinSimulator()
    pred = model.predict(data)
    expl = model.explain(data)
    return {"result": pred, "explanation": expl}

@router.get("/digital-twin/{id}/status")
async def digital_twin_status(
    id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    return {"status": "completed"} # Dummy for prototype
