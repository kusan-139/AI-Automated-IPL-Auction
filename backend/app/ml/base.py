from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseMLModel(ABC):
    """Abstract base for all ML models. Enables model versioning and hot-swap."""
    model_name: str = "base_model"
    model_version: str = "1.0.0"
    
    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make a prediction based on input features."""
        pass
    
    @abstractmethod
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Explain the prediction (XAI built-in)."""
        pass
    
    @abstractmethod
    def save(self, path: str) -> None:
        """Save the model to disk (e.g., joblib serialization)."""
        pass
    
    @classmethod
    @abstractmethod
    def load(cls, path: str) -> "BaseMLModel":
        """Load the model from disk."""
        pass
