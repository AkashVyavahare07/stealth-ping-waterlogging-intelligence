from sqlalchemy.orm import Session
from app.models import WardRiskScore, Ward
from app.services.weather_service import WeatherService
from app.services.hotspot_service import HotspotService


class RiskService:
    @staticmethod
    def compute_for_ward(db: Session, ward_id: int):
        """
        Compute risk score for a single ward
        """

        rainfall = WeatherService.get_recent_rainfall(db, ward_id)
        recurrence = HotspotService.get_recurrence_score(db, ward_id)

        # Simple weighted risk model (can be improved later)
        total_score = (
            0.4 * rainfall +
            0.3 * recurrence +
            0.3
        )

        if total_score >= 0.7:
            level = "HIGH"
        elif total_score >= 0.4:
            level = "MEDIUM"
        else:
            level = "LOW"

        existing = (
            db.query(WardRiskScore)
            .filter(WardRiskScore.ward_id == ward_id)
            .first()
        )

        if existing:
            existing.total_risk_score = total_score
            existing.risk_level = level
        else:
            db.add(
                WardRiskScore(
                    ward_id=ward_id,
                    total_risk_score=total_score,
                    risk_level=level
                )
            )
