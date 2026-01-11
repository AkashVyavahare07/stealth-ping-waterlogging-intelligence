from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class Centroid(BaseModel):
    lat: float
    lng: float

class WardRiskResponse(BaseModel):
    id: int
    name: str
    risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH
    rainfall_mm: float
    report_count: int
    hotspot_count: int
    geometry: Optional[Any] = None
    centroid: Optional[Centroid] = None
    
    class Config:
        from_attributes = True
