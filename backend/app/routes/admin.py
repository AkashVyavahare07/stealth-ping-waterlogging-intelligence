from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Report, Ward, Hotspot
from ..schemas import (
    AdminDashboardResponse, 
    SimulationRequest, 
    SimulationResponse,
    ReportResponse,
    WardRiskResponse
)
from ..services.auth import require_admin
from ..prediction.risk_calculator import RiskCalculator
from ..gis.operations import GISOperations

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Get admin dashboard data"""
    total_reports = db.query(Report).count()
    total_hotspots = db.query(Hotspot).count()
    high_risk_wards = db.query(Ward).filter(Ward.risk_level == "HIGH").count()
    
    # Recent reports
    recent_reports_db = db.query(Report).order_by(Report.created_at.desc()).limit(20).all()
    recent_reports = []
    for r in recent_reports_db:
        ward = db.query(Ward).filter(Ward.id == r.ward_id).first() if r.ward_id else None
        recent_reports.append(ReportResponse(
            id=r.id,
            latitude=r.latitude,
            longitude=r.longitude,
            severity=r.severity,
            description=r.description,
            ward_id=r.ward_id,
            ward_name=ward.name if ward else None,
            created_at=r.created_at
        ))
    
    # Ward stats (without geometry for dashboard)
    wards = db.query(Ward).all()
    ward_stats = [
        WardRiskResponse(
            id=w.id,
            name=w.name,
            risk_score=w.risk_score or 0,
            risk_level=w.risk_level or "LOW",
            rainfall_mm=w.rainfall_mm or 0,
            report_count=w.report_count or 0,
            hotspot_count=w.hotspot_count or 0,
            geometry=None,
            centroid={"lat": w.centroid_lat, "lng": w.centroid_lng} if w.centroid_lat else None
        )
        for w in wards
    ]
    
    return AdminDashboardResponse(
        total_reports=total_reports,
        total_hotspots=total_hotspots,
        high_risk_wards=high_risk_wards,
        recent_reports=recent_reports,
        ward_stats=ward_stats
    )

@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Run rainfall simulation"""
    if request.rainfall_multiplier < 0.1 or request.rainfall_multiplier > 10:
        raise HTTPException(status_code=400, detail="Rainfall multiplier must be between 0.1 and 10")
    
    wards = db.query(Ward).all()
    results = []
    
    for ward in wards:
        recurrence = RiskCalculator.calculate_recurrence_rate(db, ward.id)
        hotspot_persistence = RiskCalculator.calculate_hotspot_persistence(db, ward.id)
        
        simulated_risk, simulated_level = RiskCalculator.simulate_risk(
            ward=ward,
            rainfall_multiplier=request.rainfall_multiplier,
            recurrence_rate=recurrence,
            hotspot_persistence=hotspot_persistence
        )
        
        results.append({
            "id": ward.id,
            "name": ward.name,
            "original_risk": ward.risk_score or 0,
            "simulated_risk": simulated_risk,
            "original_level": ward.risk_level or "LOW",
            "simulated_level": simulated_level
        })
    
    return SimulationResponse(wards=results)
