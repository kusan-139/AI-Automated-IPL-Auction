import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.player import Player
from app.models.team import Team
from app.models.auction import AuctionSession, AuctionStatus
from app.models.auction_config import AuctionFormat

async def seed_data():
    async with async_session_maker() as session:
        # Create Teams
        teams = ["CSK", "MI", "RCB", "KKR", "DC", "RR", "PBKS", "SRH", "LSG", "GT"]
        team_objects = {}
        for t_name in teams:
            team_id = uuid.uuid4()
            team = Team(id=team_id, name=f"{t_name} Team", short_name=t_name, total_budget=1200000000)
            session.add(team)
            team_objects[t_name] = team_id

        # Create Format & Session
        fmt = AuctionFormat(name="Mega Auction", salary_cap=1200000000, max_squad_size=25, max_overseas=8)
        session.add(fmt)
        await session.flush()
        
        auction_session = AuctionSession(name="IPL 2025 Mega Auction", format_id=fmt.id, status=AuctionStatus.LIVE)
        session.add(auction_session)
        await session.flush()

        # Create Players
        demo_players = [
          { "name": "Virat Kohli", "nationality": "Indian", "role": "Batsman", "specialization": "Top-Order Batter", "base_price": 20000000, "age": 36 },
          { "name": "Jasprit Bumrah", "nationality": "Indian", "role": "Bowler", "specialization": "Pace / Death Bowler", "base_price": 20000000, "age": 30 },
          { "name": "Rohit Sharma", "nationality": "Indian", "role": "Batsman", "specialization": "Opening Batter", "base_price": 20000000, "age": 37 },
          { "name": "Rishabh Pant", "nationality": "Indian", "role": "Wicket-Keeper", "specialization": "Wicketkeeper Batter", "base_price": 20000000, "age": 27 },
          { "name": "Heinrich Klaasen", "nationality": "Overseas", "role": "Wicket-Keeper", "specialization": "Power Finisher", "base_price": 20000000, "age": 33 },
        ]
        
        for p in demo_players:
            player = Player(
                id=uuid.uuid4(),
                name=p["name"],
                nationality=p["nationality"],
                role=p["role"],
                specialization=p["specialization"],
                base_price=p["base_price"],
                age=p["age"]
            )
            session.add(player)
            
        await session.commit()
        print(f"Database seeded successfully. Session ID: {auction_session.id}")
        
if __name__ == "__main__":
    asyncio.run(seed_data())
