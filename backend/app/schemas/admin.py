from pydantic import BaseModel
from typing import List
from .report import ReportResponse
from .ward import WardRiskResponse

class AdminDashboardResponse(BaseModel):
    total_reports: int
    total_hotspots: int
    high_risk_wards: int
    recent_reports: List[ReportResponse]
    ward_stats: List[WardRiskResponse]

class SimulationRequest(BaseModel):
    rainfall_multiplier: float  # e.g., 2.0 for double rainfall

class SimulatedWard(BaseModel):
    id: int
    name: str
    original_risk: float
    simulated_risk: float
    original_level: str
    simulated_level: str

class SimulationResponse(BaseModel):
    wards: List[SimulatedWard]
