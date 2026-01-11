from sqlalchemy import Column, Integer, Float, DateTime, String
from sqlalchemy.sql import func
from ..database import Base

class WeatherCache(Base):
    __tablename__ = "weather_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    ward_id = Column(Integer, nullable=False)
    rainfall_1h = Column(Float, default=0.0)
    rainfall_3h = Column(Float, default=0.0)
    cached_at = Column(DateTime(timezone=True), server_default=func.now())
