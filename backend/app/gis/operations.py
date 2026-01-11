from sqlalchemy.orm import Session
from sqlalchemy import text, func
from geoalchemy2.functions import ST_Within
from ..models import Ward, Report


class GISOperations:
    @staticmethod
    def find_ward_for_point(db: Session, lat: float, lng: float) -> Ward | None:
        """Find which ward contains a given point"""
        point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
        ward = db.query(Ward).filter(
            ST_Within(point, Ward.geometry)
        ).first()
        return ward

    @staticmethod
    def get_ward_geometry_as_geojson(db: Session, ward_id: int) -> dict | None:
        """Get ward geometry as GeoJSON"""
        result = db.execute(
            text("""
                SELECT ST_AsGeoJSON(geometry)
                FROM wards
                WHERE id = :ward_id
            """),
            {"ward_id": ward_id}
        ).fetchone()

        if result and result[0]:
            import json
            return json.loads(result[0])
        return None

    @staticmethod
    def get_all_wards_with_geometry(db: Session) -> list:
        """
        FINAL SAFE VERSION
        Matches actual database schema
        """
        result = db.execute(
            text("""
                SELECT
                    id,
                    ward_name,
                    ST_AsGeoJSON(geometry) AS geometry
                FROM wards
                ORDER BY ward_name
            """)
        ).fetchall()

        import json
        wards = []
        for row in result:
            wards.append({
                "id": row.id,
                "ward_name": row.ward_name,
                "geometry": json.loads(row.geometry) if row.geometry else None
            })

        return wards

    @staticmethod
    def count_reports_in_ward(db: Session, ward_id: int) -> int:
        """Count reports within a ward"""
        return db.query(Report).filter(Report.ward_id == ward_id).count()

    @staticmethod
    def find_reports_in_radius(db: Session, lat: float, lng: float, radius_meters: float) -> list:
        """Find reports within a radius of a point"""
        result = db.execute(
            text("""
                SELECT *
                FROM reports
                WHERE ST_DWithin(
                    location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
            """),
            {"lat": lat, "lng": lng, "radius": radius_meters}
        ).fetchall()
        return result
