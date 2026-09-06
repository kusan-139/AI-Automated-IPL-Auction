import asyncio
import os
import sys
import uuid
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import async_session_maker, engine, Base
from app.models.auction_config import AuctionFormat, FormatType
from app.models.team import Team, StrategyProfile
from app.models.player import Player, PlayerRole
from app.models.auction import AuctionSession, AuctionStatus
from app.data.ingest_pipeline import extract_and_load_pipeline_data

DEFAULT_TEAMS = [
    {"name": "Mumbai Indians", "short_name": "MI", "primary_color": "#004BA0", "secondary_color": "#D4AF37", "strategy_profile": StrategyProfile.AGGRESSIVE, "owner": "Reliance Industries", "coach": "Mahela Jayawardene", "home_ground": "Wankhede Stadium, Mumbai"},
    {"name": "Chennai Super Kings", "short_name": "CSK", "primary_color": "#FFFF00", "secondary_color": "#0081E9", "strategy_profile": StrategyProfile.BALANCED, "owner": "India Cements", "coach": "Stephen Fleming", "home_ground": "M. A. Chidambaram Stadium, Chennai"},
    {"name": "Royal Challengers Bengaluru", "short_name": "RCB", "primary_color": "#EC1C24", "secondary_color": "#000000", "strategy_profile": StrategyProfile.AGGRESSIVE, "owner": "Diageo", "coach": "Andy Flower", "home_ground": "M. Chinnaswamy Stadium, Bengaluru"},
    {"name": "Kolkata Knight Riders", "short_name": "KKR", "primary_color": "#3A225D", "secondary_color": "#B3A125", "strategy_profile": StrategyProfile.BALANCED, "owner": "Red Chillies Entertainment", "coach": "Chandrakant Pandit", "home_ground": "Eden Gardens, Kolkata"},
    {"name": "Delhi Capitals", "short_name": "DC", "primary_color": "#00008B", "secondary_color": "#FF0000", "strategy_profile": StrategyProfile.CONSERVATIVE, "owner": "JSP & GMR Group", "coach": "Hemang Badani", "home_ground": "Arun Jaitley Stadium, Delhi"},
    {"name": "Rajasthan Royals", "short_name": "RR", "primary_color": "#EA1A85", "secondary_color": "#254AA5", "strategy_profile": StrategyProfile.BALANCED, "owner": "Manoj Badale", "coach": "Rahul Dravid", "home_ground": "Sawai Mansingh Stadium, Jaipur"},
    {"name": "Punjab Kings", "short_name": "PBKS", "primary_color": "#DD1D1D", "secondary_color": "#D3D3D3", "strategy_profile": StrategyProfile.AGGRESSIVE, "owner": "Preity Zinta & Ness Wadia", "coach": "Ricky Ponting", "home_ground": "PCA Stadium, Mohali"},
    {"name": "Sunrisers Hyderabad", "short_name": "SRH", "primary_color": "#F26522", "secondary_color": "#000000", "strategy_profile": StrategyProfile.AGGRESSIVE, "owner": "SUN Group", "coach": "Daniel Vettori", "home_ground": "Rajiv Gandhi Intl Stadium, Hyderabad"},
    {"name": "Lucknow Super Giants", "short_name": "LSG", "primary_color": "#0057B8", "secondary_color": "#FF671F", "strategy_profile": StrategyProfile.BALANCED, "owner": "RPSG Group", "coach": "Justin Langer", "home_ground": "BRSABV Ekana Stadium, Lucknow"},
    {"name": "Gujarat Titans", "short_name": "GT", "primary_color": "#1B2133", "secondary_color": "#B3995D", "strategy_profile": StrategyProfile.CONSERVATIVE, "owner": "CVC Capital Partners", "coach": "Ashish Nehra", "home_ground": "Narendra Modi Stadium, Ahmedabad"},
]

MARQUEE_PLAYERS = [
    {"name": "Virat Kohli", "nationality": "Indian", "role": "Batsman", "specialization": "Top-Order Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm medium", "age": 36, "ipl_experience_years": 16, "base_price": 20000000.0, "runs": 8004, "wickets": 4, "matches_played": 252, "batting_avg": 38.7, "strike_rate": 131.9, "fitness_score": 98.0, "workload_index": 45.0},
    {"name": "Jasprit Bumrah", "nationality": "Indian", "role": "Bowler", "specialization": "Pace / Death Bowler", "batting_style": "Right-hand bat", "bowling_style": "Right-arm fast", "age": 30, "ipl_experience_years": 11, "base_price": 20000000.0, "runs": 65, "wickets": 165, "matches_played": 133, "bowling_avg": 22.5, "economy": 7.3, "fitness_score": 94.0, "workload_index": 60.0},
    {"name": "Rohit Sharma", "nationality": "Indian", "role": "Batsman", "specialization": "Opening Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm offbreak", "age": 37, "ipl_experience_years": 16, "base_price": 20000000.0, "runs": 6628, "wickets": 15, "matches_played": 257, "batting_avg": 29.7, "strike_rate": 131.1, "fitness_score": 88.0, "workload_index": 50.0},
    {"name": "Rishabh Pant", "nationality": "Indian", "role": "Wicket-Keeper", "specialization": "Wicketkeeper Batter", "batting_style": "Left-hand bat", "bowling_style": "None", "age": 27, "ipl_experience_years": 8, "base_price": 20000000.0, "runs": 3284, "wickets": 0, "matches_played": 111, "batting_avg": 35.3, "strike_rate": 148.9, "stumpings": 20, "catches": 75, "fitness_score": 92.0, "workload_index": 55.0},
    {"name": "Heinrich Klaasen", "nationality": "Overseas", "role": "Wicket-Keeper", "specialization": "Power Finisher", "batting_style": "Right-hand bat", "bowling_style": "None", "age": 33, "ipl_experience_years": 4, "base_price": 20000000.0, "runs": 993, "wickets": 0, "matches_played": 35, "batting_avg": 38.2, "strike_rate": 168.3, "fitness_score": 95.0, "workload_index": 42.0},
    {"name": "Travis Head", "nationality": "Overseas", "role": "Batsman", "specialization": "Aggressive Opener", "batting_style": "Left-hand bat", "bowling_style": "Right-arm offbreak", "age": 30, "ipl_experience_years": 3, "base_price": 20000000.0, "runs": 767, "wickets": 2, "matches_played": 25, "batting_avg": 36.5, "strike_rate": 178.6, "fitness_score": 96.0, "workload_index": 48.0},
    {"name": "Hardik Pandya", "nationality": "Indian", "role": "All-Rounder", "specialization": "Fast Bowling All-Rounder", "batting_style": "Right-hand bat", "bowling_style": "Right-arm fast-medium", "age": 30, "ipl_experience_years": 9, "base_price": 20000000.0, "runs": 2525, "wickets": 64, "matches_played": 137, "batting_avg": 28.7, "strike_rate": 145.8, "bowling_avg": 33.2, "economy": 8.9, "fitness_score": 90.0, "workload_index": 62.0},
    {"name": "Sunil Narine", "nationality": "Overseas", "role": "All-Rounder", "specialization": "Spin All-Rounder", "batting_style": "Left-hand bat", "bowling_style": "Right-arm offbreak", "age": 36, "ipl_experience_years": 12, "base_price": 20000000.0, "runs": 1537, "wickets": 180, "matches_played": 177, "batting_avg": 17.1, "strike_rate": 165.8, "bowling_avg": 25.4, "economy": 6.7, "fitness_score": 93.0, "workload_index": 52.0},
    {"name": "Rashid Khan", "nationality": "Overseas", "role": "Bowler", "specialization": "Leg-Spin Mystery Bowler", "batting_style": "Right-hand bat", "bowling_style": "Right-arm legbreak", "age": 25, "ipl_experience_years": 7, "base_price": 20000000.0, "runs": 545, "wickets": 149, "matches_played": 121, "batting_avg": 13.6, "strike_rate": 142.1, "bowling_avg": 21.8, "economy": 6.8, "fitness_score": 97.0, "workload_index": 58.0},
    {"name": "Shreyas Iyer", "nationality": "Indian", "role": "Batsman", "specialization": "Middle-Order Anchor", "batting_style": "Right-hand bat", "bowling_style": "Right-arm legbreak", "age": 29, "ipl_experience_years": 8, "base_price": 20000000.0, "runs": 3127, "wickets": 0, "matches_played": 116, "batting_avg": 32.2, "strike_rate": 127.5, "fitness_score": 91.0, "workload_index": 44.0},
]

async def seed_db():
    print("Initializing Database Schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    print("Seeding database entities...")
    root_dir = str(backend_dir.parent)
    
    async with async_session_maker() as session:
        # Check existing formats
        res = await session.execute(select(AuctionFormat))
        existing_formats = res.scalars().all()
        
        mega_format = None
        if not existing_formats:
            mega_format = AuctionFormat(
                name="IPL Mega Auction 2025",
                format_type=FormatType.MEGA,
                is_default=True,
                salary_cap=1200000000.0,
                max_squad_size=25,
                max_overseas=8,
                max_overseas_playing=4,
                rtm_enabled=True,
                unsold_reentry_enabled=True,
                bid_increment_tiers_json={
                    "tiers": [
                        {"max": 20000000, "increment": 500000},
                        {"max": 50000000, "increment": 2000000},
                        {"max": 100000000, "increment": 2500000},
                        {"max": 200000000, "increment": 5000000},
                        {"max": None, "increment": 10000000}
                    ]
                }
            )
            generic_format = AuctionFormat(
                name="Generic T20",
                format_type=FormatType.GENERIC,
                is_default=False,
                salary_cap=1000000000.0,
                max_squad_size=20,
                max_overseas=6,
                rtm_enabled=False,
                unsold_reentry_enabled=False
            )
            session.add(mega_format)
            session.add(generic_format)
            await session.commit()
            await session.refresh(mega_format)
        else:
            mega_format = existing_formats[0]

        # Seed Teams
        res = await session.execute(select(Team))
        existing_teams = res.scalars().all()
        if not existing_teams:
            print("Seeding 10 IPL Franchises...")
            for team_data in DEFAULT_TEAMS:
                t = Team(
                    name=team_data["name"],
                    short_name=team_data["short_name"],
                    primary_color=team_data["primary_color"],
                    secondary_color=team_data["secondary_color"],
                    strategy_profile=team_data["strategy_profile"],
                    owner=team_data["owner"],
                    coach=team_data["coach"],
                    home_ground=team_data["home_ground"],
                    total_budget=1200000000.0,
                    remaining_budget=1200000000.0,
                    max_squad_size=25,
                    current_squad_size=0
                )
                session.add(t)
            await session.commit()

        # Seed Players
        res = await session.execute(select(Player))
        existing_players = res.scalars().all()
        if not existing_players:
            print("Loading player datasets...")
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
            print(f"Seeded {count} player records successfully.")

        # Seed Active Auction Session
        res = await session.execute(select(AuctionSession))
        existing_sessions = res.scalars().all()
        if not existing_sessions:
            active_session = AuctionSession(
                name="IPL 2025 Live Mega Auction",
                status=AuctionStatus.LIVE,
                format_id=mega_format.id,
                total_rounds=10,
                current_round=1
            )
            session.add(active_session)
            await session.commit()
            print("Seeded active live auction session.")

        print("Database seeding successfully completed!")

if __name__ == "__main__":
    asyncio.run(seed_db())
