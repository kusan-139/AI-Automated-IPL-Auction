import sys
import os

# Add the backend directory to sys.path so 'app' module can be resolved
backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
sys.path.insert(0, backend_path)

from app.main import app
