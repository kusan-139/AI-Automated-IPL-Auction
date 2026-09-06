import pandas as pd
from typing import List, Dict
from .kaggle_parser import KaggleDatasetParser
from .official_api_client import OfficialAPIClient
import asyncio

class DataMerger:
    def __init__(self):
        self.kaggle = KaggleDatasetParser()
        self.api = OfficialAPIClient()
        
    async def build_training_dataset(self) -> List[Dict]:
        """Merge Kaggle base data with API high-accuracy data"""
        
        # 1. Get base stats from Kaggle
        base_df = self.kaggle.get_player_stats()
        
        # 2. Enrich with API data
        enriched_data = []
        for _, row in base_df.iterrows():
            player_dict = row.to_dict()
            
            # Fetch official API data
            # In a real scenario we'd use fuzzy matching to map names to IDs
            api_data = await self.api.get_player_profile(player_dict["player_name"])
            
            # Merge
            if api_data:
                player_dict["recent_form_score"] = sum(api_data.get("recent_form", [])) / 5.0
                player_dict["injury_status"] = api_data.get("injury_status")
                
            enriched_data.append(player_dict)
            
        return enriched_data
