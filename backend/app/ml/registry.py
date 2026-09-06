from typing import Dict, Type, Optional
from app.ml.base import BaseMLModel

class ModelRegistry:
    """In-memory model registry with version tracking and lazy loading."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._models = {}
        return cls._instance
        
    def register(self, name: str, model_instance: BaseMLModel) -> None:
        """Register an initialized model instance."""
        self._models[name] = model_instance
        
    def get(self, name: str) -> Optional[BaseMLModel]:
        """Retrieve a model by name."""
        return self._models.get(name)

    def load_all(self, models_dir: str = "data/models") -> None:
        """Load all models from disk into memory."""
        # This will be called during application startup
        pass

registry = ModelRegistry()
