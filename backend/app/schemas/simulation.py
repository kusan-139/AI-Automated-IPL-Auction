from pydantic import BaseModel
from typing import Optional, Any
import uuid
from datetime import datetime
from app.models.simulation import SimulationType

class SimulationRunBase(BaseModel):
    type: SimulationType
    config_json: Optional[Any] = None

class SimulationRunCreate(SimulationRunBase):
    pass

class SimulationRunResponse(SimulationRunBase):
    id: uuid.UUID
    franchise_id: uuid.UUID
    created_by_user_id: Optional[uuid.UUID]
    results_json: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class SimulationSnapshotBase(BaseModel):
    run_id: uuid.UUID
    step_number: int
    state_json: Any

class SimulationSnapshotResponse(SimulationSnapshotBase):
    id: uuid.UUID
    timestamp: datetime

    class Config:
        from_attributes = True
