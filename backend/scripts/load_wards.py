import json
from sqlalchemy import create_engine, text
from geoalchemy2 import Geometry
from shapely.geometry import shape
from shapely.ops import unary_union
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

GEOJSON_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "delhi_wards.geojson"
)

def load_wards():
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geojson = json.load(f)

    with engine.begin() as conn:
        # Create table if not exists
        conn.execute(text("""
            CREATE EXTENSION IF NOT EXISTS postgis;

            CREATE TABLE IF NOT EXISTS wards (
                id SERIAL PRIMARY KEY,
                ward_code VARCHAR(50),
                ward_name VARCHAR(255),
                geometry GEOMETRY(POLYGON, 4326)
            );

            CREATE INDEX IF NOT EXISTS idx_wards_geom
            ON wards USING GIST (geometry);
        """))

        # Clear existing wards (safe for dev)
        conn.execute(text("DELETE FROM wards;"))

        for feature in geojson["features"]:
            props = feature["properties"]
            geom = shape(feature["geometry"])

            ward_code = props.get("Ward_No") or props.get("ward_code")
            ward_name = props.get("Ward_Name") or props.get("ward_name")

            conn.execute(
                text("""
                    INSERT INTO wards (ward_code, ward_name, geometry)
                    VALUES (:code, :name, ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326))
                """),
                {
                    "code": ward_code,
                    "name": ward_name,
                    "geom": json.dumps(feature["geometry"])
                }
            )

    print("✅ Delhi wards loaded successfully")

if __name__ == "__main__":
    load_wards()
