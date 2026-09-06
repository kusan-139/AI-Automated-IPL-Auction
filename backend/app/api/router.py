from fastapi import APIRouter
from app.api.v1 import auth, players, teams, auction, auction_config, analytics, simulation, websocket

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(players.router, prefix="/players", tags=["players"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(auction.router, prefix="/auction", tags=["auction"])
api_router.include_router(auction_config.router, prefix="/auction-formats", tags=["auction-formats"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(websocket.router, tags=["websocket"])
