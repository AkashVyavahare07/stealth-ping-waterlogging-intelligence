from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from ..database import get_db
from ..schemas import HotspotResponse

router = APIRouter(prefix="/api/hotspots", tags=["hotspots"])


@router.get("", response_model=List[HotspotResponse])
def get_all_hotspots(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT
                h.id,
                ST_Y(h.location) AS latitude,
                ST_X(h.location) AS longitude,
                h.frequency,
                h.ward_id,
                w.ward_name AS ward_name,
                h.avg_rainfall,
                COALESCE(h.last_occurrence, h.created_at) AS last_occurrence
            FROM hotspots h
            LEFT JOIN wards w ON w.id = h.ward_id
            WHERE h.frequency > 0
            ORDER BY h.last_occurrence DESC NULLS LAST
        """)
    ).fetchall()

    return [
        {
            "id": r.id,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "frequency": r.frequency,
            "ward_id": r.ward_id or 0,
            "ward_name": r.ward_name or "Unknown",
            "avg_rainfall": r.avg_rainfall or 0.0,
            "last_occurrence": r.last_occurrence,
        }
        for r in rows
    ]
