from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..gis.operations import GISOperations

router = APIRouter(
    prefix="/api/wards",
    tags=["wards"]
)


@router.get("", response_model=List[dict])
async def get_all_wards(db: Session = Depends(get_db)):
    """
    Get all wards with geometry (GeoJSON)
    """
    wards = GISOperations.get_all_wards_with_geometry(db)
    return wards


@router.get("/{ward_id}", response_model=dict)
async def get_single_ward(ward_id: int, db: Session = Depends(get_db)):
    """
    Get a single ward by ID
    """
    wards = GISOperations.get_all_wards_with_geometry(db)
    ward = next((w for w in wards if w["id"] == ward_id), None)

    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")

    return ward
