from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime


class HotspotService:

    @staticmethod
    def recompute_hotspots(db: Session):
        """
        Detect clusters of reports and store them as hotspots
        """

        print("[HOTSPOT] Recomputing hotspots...")

        # 1️⃣ Clear old hotspots
        db.execute(text("DELETE FROM hotspots"))

        # 2️⃣ Detect clusters using PostGIS (DBSCAN)
        result = db.execute(text("""
            WITH report_clusters AS (
                SELECT
                    ST_ClusterDBSCAN(
                        location,
                        eps := 0.002,          -- ~200m
                        minpoints := 3
                    ) OVER () AS cluster_id,
                    ward_id,
                    location,
                    created_at
                FROM reports
                WHERE created_at >= NOW() - INTERVAL '90 days'
            ),
            cluster_stats AS (
                SELECT
                    cluster_id,
                    COUNT(*) AS report_count,
                    COUNT(DISTINCT DATE(created_at)) AS unique_days,
                    ST_Centroid(ST_Collect(location)) AS centroid,
                    MAX(ward_id) AS ward_id,
                    MAX(created_at) AS last_occurrence
                FROM report_clusters
                WHERE cluster_id IS NOT NULL
                GROUP BY cluster_id
                HAVING
                    COUNT(*) >= 3
                    AND COUNT(DISTINCT DATE(created_at)) >= 3
            )
            SELECT
                ward_id,
                report_count,
                ST_Y(centroid) AS latitude,
                ST_X(centroid) AS longitude,
                last_occurrence
            FROM cluster_stats
        """)).fetchall()

        # 3️⃣ Insert hotspots (LOCATION FIX — CRITICAL)
        for row in result:
            db.execute(text("""
                INSERT INTO hotspots (
                    ward_id,
                    latitude,
                    longitude,
                    location,
                    frequency,
                    ward_name,
                    avg_rainfall,
                    last_occurrence,
                    created_at
                )
                VALUES (
                    :ward_id,
                    :lat,
                    :lng,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
                    :freq,
                    'Unknown',
                    0.0,
                    :last_occurrence,
                    :now
                )
            """), {
                "ward_id": row.ward_id,
                "lat": row.latitude,
                "lng": row.longitude,
                "freq": row.report_count,
                "last_occurrence": row.last_occurrence,
                "now": datetime.utcnow()
            })

        db.commit()

        print(f"[HOTSPOT] {len(result)} hotspot(s) detected")