"""AutoMLab backend entrypoint — re-exports the dashboard API app."""
from dashboard.api.main import app

__all__ = ["app"]
