from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

auction_manager = ConnectionManager()
sim_manager = ConnectionManager()

@router.websocket("/auction/{session_id}")
async def websocket_auction(websocket: WebSocket, session_id: str):
    await auction_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming bid/event
            await auction_manager.broadcast(f"Event: {data}")
    except WebSocketDisconnect:
        auction_manager.disconnect(websocket)

@router.websocket("/simulation")
async def websocket_simulation(websocket: WebSocket):
    await sim_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await sim_manager.broadcast(f"Sim Update: {data}")
    except WebSocketDisconnect:
        sim_manager.disconnect(websocket)
