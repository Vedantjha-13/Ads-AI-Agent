"""ASGI compatibility entrypoint.

Render/FastAPI tutorials often default to `main:app`. This project keeps the
real application in `backend.main`, so we re-export `app` here for robustness.
"""

from backend.main import app

__all__ = ["app"]
