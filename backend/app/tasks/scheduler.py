from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
import asyncio

from app.database import SessionLocal
from app.models import Ward
from app.services.weather import WeatherService
from app.prediction.risk_calculator import RiskCalculator

# 🔥 REQUIRED IMPORT (ADDED)
from app.services.hotspot_service import HotspotService

scheduler = BackgroundScheduler()


def update_weather_and_risks():
    """Update weather cache and recalculate ward risks"""
    print(f"[{datetime.now()}] Running weather + risk update job")

    db: Session = SessionLocal()

    try:
        wards = db.query(Ward).all()

        async def run():
            for ward in wards:
                if ward.centroid_lat and ward.centroid_lng:
                    # ✅ Correct async call
                    rainfall = await WeatherService.get_rainfall(
                        ward.centroid_lat,
                        ward.centroid_lng,
                        db,
                        ward.id
                    )

                    # ✅ RiskCalculator reads rainfall from DB
                    RiskCalculator.update_ward_risk(db, ward, rainfall)
                    

            db.commit()

        asyncio.run(run())

        # 🔥 Recompute hotspots after risk update (ADDED)
        HotspotService.recompute_hotspots(db)

        print(f"[{datetime.now()}] Updated {len(wards)} wards")

    except Exception as e:
        print("Scheduler error:", e)
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(update_weather_and_risks, "interval", minutes=30)
    scheduler.start()
    print("Background scheduler started")


def stop_scheduler():
    scheduler.shutdown()
