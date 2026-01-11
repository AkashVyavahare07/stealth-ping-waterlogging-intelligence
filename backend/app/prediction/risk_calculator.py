from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from ..config import settings
from ..models import Ward, Report, Hotspot

class RiskCalculator:
    @staticmethod
    def calculate_risk_score(
        rainfall_mm: float,
        recurrence_rate: float,  # 0-1, based on historical reports
        hotspot_persistence: float,  # 0-1, based on hotspot count
        drainage_stress: float,  # 0-1
        population_exposure: float  # 0-1
    ) -> float:
        """
        Calculate risk score using weighted formula:
        Risk = 0.35 × Rainfall + 0.25 × Recurrence + 0.20 × Hotspot + 0.10 × Drainage + 0.10 × Population
        """
        # Normalize rainfall to 0-1 scale (assuming 50mm is max concern)
        rainfall_normalized = min(rainfall_mm / 50.0, 1.0)
        
        risk_score = (
            settings.WEIGHT_RAINFALL * rainfall_normalized +
            settings.WEIGHT_RECURRENCE * recurrence_rate +
            settings.WEIGHT_HOTSPOT * hotspot_persistence +
            settings.WEIGHT_DRAINAGE * drainage_stress +
            settings.WEIGHT_POPULATION * population_exposure
        )
        
        return min(max(risk_score, 0.0), 1.0)
    
    @staticmethod
    def get_risk_level(score: float) -> str:
        """Convert risk score to risk level"""
        if score >= 0.6:
            return "HIGH"
        elif score >= 0.3:
            return "MEDIUM"
        return "LOW"
    
    @staticmethod
    def calculate_recurrence_rate(db: Session, ward_id: int) -> float:
        """Calculate flood recurrence rate for a ward"""
        # Count reports in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_reports = db.query(Report).filter(
            Report.ward_id == ward_id,
            Report.created_at >= thirty_days_ago
        ).count()
        
        # Normalize (10+ reports = 1.0)
        return min(recent_reports / 10.0, 1.0)
    
    @staticmethod
    def calculate_hotspot_persistence(db: Session, ward_id: int) -> float:
        """Calculate hotspot persistence for a ward"""
        hotspot_count = db.query(Hotspot).filter(
            Hotspot.ward_id == ward_id
        ).count()
        
        # Normalize (5+ hotspots = 1.0)
        return min(hotspot_count / 5.0, 1.0)
    
    @staticmethod
    def update_ward_risk(db: Session, ward: Ward, rainfall_mm: float) -> None:
        """Update risk score for a ward"""
        recurrence = RiskCalculator.calculate_recurrence_rate(db, ward.id)
        hotspot_persistence = RiskCalculator.calculate_hotspot_persistence(db, ward.id)
        
        risk_score = RiskCalculator.calculate_risk_score(
            rainfall_mm=rainfall_mm,
            recurrence_rate=recurrence,
            hotspot_persistence=hotspot_persistence,
            drainage_stress=ward.drainage_stress or 0.5,
            population_exposure=ward.population_density or 0.5
        )
        
        ward.risk_score = risk_score
        ward.risk_level = RiskCalculator.get_risk_level(risk_score)
        ward.rainfall_mm = rainfall_mm
        ward.report_count = db.query(Report).filter(Report.ward_id == ward.id).count()
        ward.hotspot_count = db.query(Hotspot).filter(Hotspot.ward_id == ward.id).count()
        
        db.commit()
    
    @staticmethod
    def simulate_risk(
        ward: Ward,
        rainfall_multiplier: float,
        recurrence_rate: float,
        hotspot_persistence: float
    ) -> tuple[float, str]:
        """Simulate risk score with modified rainfall"""
        simulated_rainfall = (ward.rainfall_mm or 0) * rainfall_multiplier
        
        risk_score = RiskCalculator.calculate_risk_score(
            rainfall_mm=simulated_rainfall,
            recurrence_rate=recurrence_rate,
            hotspot_persistence=hotspot_persistence,
            drainage_stress=ward.drainage_stress or 0.5,
            population_exposure=ward.population_density or 0.5
        )
        
        return risk_score, RiskCalculator.get_risk_level(risk_score)
