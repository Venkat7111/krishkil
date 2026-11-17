import os
import sys

# Ensure backend directory is in Python path so 'app' can be imported seamlessly
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: F401
