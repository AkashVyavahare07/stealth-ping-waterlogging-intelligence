import httpx
import os
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

class WeatherService:

    @staticmethod
    def fetch_rainfall(lat: float, lon: float):
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }

        response = httpx.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        rain_1h = data.get("rain", {}).get("1h", 0.0)
        rain_3h = data.get("rain", {}).get("3h", 0.0)

        return {
            "rain_1h": rain_1h,
            "rain_3h": rain_3h,
            "fetched_at": datetime.utcnow()
        }

    @staticmethod
    def save_weather(db: Session, ward_id: int, rain_data: dict):
        expires_at = rain_data["fetched_at"] + timedelta(minutes=30)

        db.execute(
            text("""
                INSERT INTO weather_cache
                (ward_id, rain_1h, rain_3h, fetched_at, expires_at)
                VALUES (:ward_id, :r1, :r3, :fetched, :expires)
                ON CONFLICT (ward_id)
                DO UPDATE SET
                    rain_1h = EXCLUDED.rain_1h,
                    rain_3h = EXCLUDED.rain_3h,
                    fetched_at = EXCLUDED.fetched_at,
                    expires_at = EXCLUDED.expires_at;
            """),
            {
                "ward_id": ward_id,
                "r1": rain_data["rain_1h"],
                "r3": rain_data["rain_3h"],
                "fetched": rain_data["fetched_at"],
                "expires": expires_at
            }
        )
