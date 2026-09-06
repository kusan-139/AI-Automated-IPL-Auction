import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to sys.path to allow imports
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.auth.supabase_client import supabase

TEAMS = ["csk", "dc", "gt", "kkr", "lsg", "mi", "pbks", "rr", "rcb", "srh"]
ROLES = ["owner", "analyst", "coach"]

async def seed_auth():
    print("Seeding auth users...")
    
    # We will need the actual team UUIDs here eventually, but for now we'll create the users
    # and link them to teams later or generate deterministic UUIDs for teams
    import uuid
    
    for team in TEAMS:
        # Generate a deterministic UUID for the team based on its short name
        team_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{team}.ipl.auction"))
        
        for role in ROLES:
            email = f"{role}@{team}.com"
            password = f"demo_{team}"
            
            try:
                print(f"Creating user {email}...")
                response = supabase.auth.admin.create_user({
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {
                        "role": role,
                        "franchise_id": team_id,
                        "display_name": f"{team.upper()} {role.capitalize()}"
                    }
                })
                print(f"Created: {response.user.id}")
            except Exception as e:
                print(f"Failed to create {email}: {e}")

if __name__ == "__main__":
    asyncio.run(seed_auth())
