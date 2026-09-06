import asyncio
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.database import async_session_maker, engine
from app.models.player import Player, PlayerRole
from app.data.ingest_pipeline import extract_and_load_pipeline_data
from scripts.seed_db import MARQUEE_PLAYERS

async def run():
    root_dir = str(backend_dir.parent)
    
    async with async_session_maker() as session:
        # Delete existing players
        print("Deleting existing players...")
        await session.execute(delete(Player))
        await session.commit()
        
        print("Loading player datasets from data_pipeline_output...")
        extracted_players = extract_and_load_pipeline_data(root_dir)
        all_player_dicts = MARQUEE_PLAYERS + extracted_players
        
        seen_names = set()
        count = 0
        for pdata in all_player_dicts:
            pname = pdata["name"]
            if pname in seen_names:
                continue
            seen_names.add(pname)
            
            role_str = pdata.get("role", "Batsman")
            if role_str == "Batsman":
                prole = PlayerRole.BATSMAN
            elif role_str == "Bowler":
                prole = PlayerRole.BOWLER
            elif role_str == "All-Rounder":
                prole = PlayerRole.ALL_ROUNDER
            else:
                prole = PlayerRole.WICKET_KEEPER

            p = Player(
                name=pname,
                nationality=pdata.get("nationality", "Indian"),
                role=prole,
                specialization=pdata.get("specialization", "Player"),
                batting_style=pdata.get("batting_style", "Right-hand bat"),
                bowling_style=pdata.get("bowling_style", "Right-arm medium"),
                age=int(pdata.get("age", 25)),
                ipl_experience_years=int(pdata.get("ipl_experience_years", 3)),
                base_price=float(pdata.get("base_price", 20000000.0)),
                batting_avg=float(pdata.get("batting_avg", 25.0)),
                strike_rate=float(pdata.get("strike_rate", 130.0)),
                bowling_avg=float(pdata.get("bowling_avg", 30.0)),
                economy=float(pdata.get("economy", 8.0)),
                wickets=int(pdata.get("wickets", 0)),
                runs=int(pdata.get("runs", 0)),
                matches_played=int(pdata.get("matches_played", 0)),
                catches=int(pdata.get("catches", 0)),
                stumpings=int(pdata.get("stumpings", 0)),
                run_outs=int(pdata.get("run_outs", 0)),
                fitness_score=float(pdata.get("fitness_score", 90.0)),
                injury_history_json=pdata.get("injury_history_json", []),
                workload_index=float(pdata.get("workload_index", 50.0))
            )
            session.add(p)
            count += 1
            
        await session.commit()
        print(f"Successfully reseeded {count} player records!")

if __name__ == "__main__":
    asyncio.run(run())
