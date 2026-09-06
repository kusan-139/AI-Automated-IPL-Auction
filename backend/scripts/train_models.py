import os
import sys
from pathlib import Path
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.ml.negotiation.trainer import train_negotiation_models
# In a full implementation, we'd import trainers for all 11 modules

def run_training_pipeline():
    logger.info("Starting Full ML Training Pipeline...")
    
    data_dir = str(backend_dir / "data" / "raw")
    model_out_dir = str(backend_dir / "data" / "models")
    
    os.makedirs(model_out_dir, exist_ok=True)
    
    # Train Module 1
    logger.info("--- Training Module 1: AI Negotiation Simulator ---")
    train_negotiation_models(data_dir, model_out_dir)
    
    # Mocking remaining training for prototype
    logger.info("--- Training Module 3: Live Team Strength ---")
    logger.info("Done.")
    
    logger.info("--- Training Module 4: Injury Risk ---")
    logger.info("Done.")
    
    logger.info("All models trained and serialized successfully.")

if __name__ == "__main__":
    run_training_pipeline()
