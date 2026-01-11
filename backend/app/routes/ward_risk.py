from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(
    prefix="/api/wards-risk",
    tags=["wards-risk"]
)

@router.get("")
def get_wards_risk(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT
                w.id,
                w.ward_name,
                ST_AsGeoJSON(w.geometry)::json AS geometry,
                COALESCE(w.risk_score, 0) AS risk_score,
                COALESCE(w.risk_level, 'LOW') AS risk_level
            FROM wards w
        """)
    ).fetchall()

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": row.geometry,
                "properties": {
                    "ward_id": row.id,
                    "ward_name": row.ward_name,
                    "risk_score": float(row.risk_score),
                    "risk_level": row.risk_level
                }
            }
            for row in rows
        ]
    }
