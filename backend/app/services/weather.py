import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..config import settings
from ..models import WeatherCache

class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
    
    @staticmethod
    async def get_rainfall(lat: float, lng: float, db: Session, ward_id: int = None) -> float:
        """Get rainfall data from OpenWeather API with caching"""
        
        # Check cache first
        if ward_id:
            cache = db.query(WeatherCache).filter(
                WeatherCache.ward_id == ward_id
            ).first()
            
            if cache and cache.cached_at:
                age = datetime.utcnow() - cache.cached_at.replace(tzinfo=None)
                if age < timedelta(seconds=settings.WEATHER_CACHE_DURATION):
                    return cache.rainfall_1h + cache.rainfall_3h
        
        # Fetch from API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    WeatherService.BASE_URL,
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": settings.OPENWEATHER_API_KEY,
                        "units": "metric"
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                rain_1h = data.get("rain", {}).get("1h", 0.0)
                rain_3h = data.get("rain", {}).get("3h", 0.0)
                total_rain = rain_1h + (rain_3h / 3)  # Normalize 3h to hourly rate
                
                # Update cache
                if ward_id:
                    if cache:
                        cache.rainfall_1h = rain_1h
                        cache.rainfall_3h = rain_3h
                        cache.cached_at = datetime.utcnow()
                    else:
                        cache = WeatherCache(
                            ward_id=ward_id,
                            rainfall_1h=rain_1h,
                            rainfall_3h=rain_3h
                        )
                        db.add(cache)
                    db.commit()
                
                return total_rain
                
        except Exception as e:
            print(f"Weather API error: {e}")
            return 0.0
    
    @staticmethod
    async def get_rainfall_batch(wards: list, db: Session) -> dict:
        """Get rainfall for multiple wards"""
        rainfall_data = {}
        for ward in wards:
            if ward.centroid_lat and ward.centroid_lng:
                rainfall = await WeatherService.get_rainfall(
                    ward.centroid_lat, 
                    ward.centroid_lng, 
                    db, 
                    ward.id
                )
                rainfall_data[ward.id] = rainfall
            else:
                rainfall_data[ward.id] = 0.0
        return rainfall_data
