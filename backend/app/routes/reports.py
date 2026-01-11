from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import Report, Ward
from ..schemas import ReportCreate, ReportResponse
from ..gis.operations import GISOperations

router = APIRouter(prefix="/api/reports", tags=["reports"])


# ===================== CREATE REPORT (PUBLIC) =====================
@router.post("", response_model=dict)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
):
    # Validate severity
    if report_data.severity not in ["LOW", "MEDIUM", "HIGH"]:
        raise HTTPException(status_code=400, detail="Invalid severity level")

    ward = None  # TEMP: disable GIS ward lookup


    # Create report
    report = Report(
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        location=func.ST_SetSRID(
            func.ST_Point(report_data.longitude, report_data.latitude),
            4326,
        ),
        severity=report_data.severity,
        description=report_data.description,
        user_id="public",   # ✅ NO AUTH
        ward_id=ward.id if ward else None,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Optional risk recalculation (SAFE)
    try:
        from app.services.risk_service import RiskService
        if report.ward_id:
            RiskService.compute_for_ward(db, report.ward_id)
            db.commit()
    except Exception:
        pass

    return {
        "id": report.id,
        "message": "Report submitted successfully",
    }


# ===================== 🔓 PUBLIC REPORTS (NO AUTH) =====================
@router.get("/all", response_model=List[ReportResponse])
async def get_all_reports(db: Session = Depends(get_db)):
    reports = (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .all()
    )

    result = []
    for r in reports:
        ward = (
            db.query(Ward)
            .filter(Ward.id == r.ward_id)
            .first()
            if r.ward_id else None
        )

        result.append(
            ReportResponse(
                id=r.id,
                latitude=r.latitude,
                longitude=r.longitude,
                severity=r.severity,
                description=r.description,
                ward_id=r.ward_id,
                ward_name=ward.ward_name if ward else None,
                created_at=r.created_at,
            )
        )

    return result
