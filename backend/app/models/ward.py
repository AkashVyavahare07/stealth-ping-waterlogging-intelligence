from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from ..database import Base

class Ward(Base):
    __tablename__ = "wards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    geometry = Column(Geometry("MULTIPOLYGON", srid=4326), nullable=False)
    centroid_lat = Column(Float, nullable=True)
    centroid_lng = Column(Float, nullable=True)
    
    # Risk factors (updated by background job)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH
    rainfall_mm = Column(Float, default=0.0)
    report_count = Column(Integer, default=0)
    hotspot_count = Column(Integer, default=0)
    drainage_stress = Column(Float, default=0.5)  # 0-1 scale
    population_density = Column(Float, default=0.5)  # 0-1 normalized
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
