from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    severity: str  # LOW, MEDIUM, HIGH
    description: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    severity: str
    description: Optional[str]
    ward_id: Optional[int]
    ward_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
