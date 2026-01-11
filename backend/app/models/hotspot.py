from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from ..database import Base

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)

    # 🔥 SINGLE SOURCE OF TRUTH
    location = Column(Geometry("POINT", srid=4326), nullable=False)

    frequency = Column(Integer, default=0)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)

    avg_rainfall = Column(Float, default=0.0)
    last_occurrence = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
