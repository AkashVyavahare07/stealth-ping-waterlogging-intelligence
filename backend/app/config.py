import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/stealth_ping")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "a008c30ef2661d76bbad136a71dd80c9")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "delhi-water-logging")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Risk calculation weights
    WEIGHT_RAINFALL: float = 0.35
    WEIGHT_RECURRENCE: float = 0.25
    WEIGHT_HOTSPOT: float = 0.20
    WEIGHT_DRAINAGE: float = 0.10
    WEIGHT_POPULATION: float = 0.10
    
    # Hotspot detection thresholds
    HOTSPOT_MIN_REPORTS: int = 5
    HOTSPOT_RADIUS_METERS: float = 100
    HOTSPOT_MIN_DAYS: int = 3
    
    # Weather cache duration (seconds)
    WEATHER_CACHE_DURATION: int = 1800  # 30 minutes

settings = Settings()
