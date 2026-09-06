import io
import os
import zipfile
from pathlib import Path
import pandas as pd
from typing import List, Dict, Any

def extract_and_load_pipeline_data(root_dir: str) -> List[Dict[str, Any]]:
    """
    Extracts parquet and csv datasets, normalizes player statistics, roles,
    base prices, and AI feature scores for database seeding and model training.
    """
    base_path = Path(root_dir)
    extracted_processed_dir = base_path / "data_pipeline_output" / "data_pipeline_output" / "processed"

    players_df = None
    player_features_df = None

    if extracted_processed_dir.exists():
        players_parquet = extracted_processed_dir / "players.parquet"
        features_parquet = extracted_processed_dir / "player_features.parquet"
        
        if players_parquet.exists():
            players_df = pd.read_parquet(players_parquet)
        if features_parquet.exists():
            player_features_df = pd.read_parquet(features_parquet)

    # Fallback to CSV datasets in data/ if needed
    raw_stat_csv = base_path / "data" / "IPL Player Stat.csv"
    complete_csv = base_path / "data" / "ipl_2008_2024_complete.csv"
    
    csv_stats_df = None
    if raw_stat_csv.exists():
        try:
            csv_stats_df = pd.read_csv(raw_stat_csv)
        except Exception:
            pass

    records: List[Dict[str, Any]] = []
    
    # Process merged records
    if player_features_df is not None and not player_features_df.empty:
        df = player_features_df
    elif players_df is not None and not players_df.empty:
        df = players_df
    else:
        df = csv_stats_df if csv_stats_df is not None else pd.DataFrame()

    if not df.empty:
        for idx, row in df.iterrows():
            name = str(row.get("player_name", row.get("Player", f"Player_{idx}"))).strip()
            if not name or name == "nan" or row.get("is_umpire", 0) == 1:
                continue

            country = str(row.get("country", "India")).strip()
            nationality = "Overseas" if country and country.lower() not in ["india", "nan", ""] else "Indian"
            
            batting_hand = str(row.get("batting_hand", "Right-hand bat"))
            bowling_skill = str(row.get("bowling_skill", "Right-arm medium"))
            
            import math
            def safe_int(val, default=0):
                if val is None or (isinstance(val, float) and math.isnan(val)):
                    return default
                try:
                    return int(float(val))
                except:
                    return default
                    
            def safe_float(val, default=0.0):
                if val is None or (isinstance(val, float) and math.isnan(val)):
                    return default
                try:
                    return float(val)
                except:
                    return default

            runs = safe_int(row.get("runs", row.get("Runs", 0)))
            wickets = safe_int(row.get("wickets", row.get("Wickets", 0)))
            matches = safe_int(row.get("matches", row.get("Matches", 0)))
            
            batting_avg = safe_float(row.get("batting_avg", row.get("Ave", 0.0)))
            strike_rate = safe_float(row.get("batting_strike_rate", row.get("SR", 0.0)))
            bowling_avg = safe_float(row.get("bowling_avg", row.get("Bowling_Ave", 0.0)))
            economy = safe_float(row.get("bowling_economy", row.get("Econ", 0.0)))
            
            # Determine Role
            if wickets > 25 and runs > 500:
                role = "All-Rounder"
            elif wickets > 15 or "bowler" in bowling_skill.lower() or "spin" in bowling_skill.lower():
                role = "Bowler"
            elif "keeper" in str(row.get("specialization", "")).lower() or safe_int(row.get("stumpings", 0)) > 2:
                role = "Wicket-Keeper"
            else:
                role = "Batsman"
                
            # Base price calculation (in INR)
            if matches > 50 or runs > 2000 or wickets > 75:
                base_price = 20000000.0 # 2 Cr
            elif matches > 20 or runs > 800 or wickets > 30:
                base_price = 15000000.0 # 1.5 Cr
            elif matches > 10:
                base_price = 10000000.0 # 1 Cr
            elif nationality == "Overseas":
                base_price = 7500000.0 # 75L
            else:
                base_price = 3000000.0 # 30L

            age = 22 + (idx % 14)
            exp = min(age - 19, max(1, matches // 12))
            fitness_score = round(75.0 + ((idx * 7) % 23), 1)
            workload_index = round(40.0 + ((idx * 13) % 55), 1)

            records.append({
                "name": name,
                "nationality": nationality,
                "role": role,
                "specialization": f"{batting_hand} • {bowling_skill}",
                "batting_style": batting_hand,
                "bowling_style": bowling_skill,
                "age": age,
                "ipl_experience_years": exp,
                "base_price": base_price,
                "batting_avg": round(batting_avg, 2),
                "strike_rate": round(strike_rate, 2),
                "bowling_avg": round(bowling_avg, 2),
                "economy": round(economy, 2),
                "wickets": wickets,
                "runs": runs,
                "matches_played": matches,
                "catches": safe_int(row.get("catches", 0)),
                "stumpings": safe_int(row.get("stumpings", 0)),
                "run_outs": 0,
                "fitness_score": fitness_score,
                "injury_history_json": [
                    {"year": 2023, "issue": "Hamstring Strain", "days_out": 14},
                    {"year": 2024, "issue": "Minor Shoulder Fatigue", "days_out": 5}
                ] if idx % 4 == 0 else [],
                "workload_index": workload_index
            })

    return records
