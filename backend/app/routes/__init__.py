from .reports import router as reports_router
from .wards import router as wards_router
from .hotspots import router as hotspots_router
from .admin import router as admin_router

__all__ = ["reports_router", "wards_router", "hotspots_router", "admin_router"]
