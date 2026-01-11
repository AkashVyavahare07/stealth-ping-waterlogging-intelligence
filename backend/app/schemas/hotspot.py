from pydantic import BaseModel
from datetime import datetime

class HotspotResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    frequency: int
    ward_id: int
    ward_name: str
    avg_rainfall: float
    last_occurrence: datetime
    
    class Config:
        from_attributes = True
