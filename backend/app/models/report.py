from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from ..database import Base

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(Geometry("POINT", srid=4326), nullable=False)
    severity = Column(String, nullable=False)  # LOW, MEDIUM, HIGH
    description = Column(Text, nullable=True)
    user_id = Column(String, nullable=False)  # Firebase UID
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)

    # ✅ ADD THIS LINE
    status = Column(String, default="PENDING")  
    # PENDING | APPROVED | REJECTED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
