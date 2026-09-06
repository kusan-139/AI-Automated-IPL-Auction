from app.config import get_settings

settings = get_settings()

class MockSupabaseClient:
    def auth(self):
        return self
    def sign_up(self, credentials):
        return {"user": {"id": "demo-user-id"}}
    def sign_in_with_password(self, credentials):
        return {"session": {"access_token": "demo-token"}}

def get_supabase_client():
    try:
        from supabase import create_client
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    except Exception:
        return MockSupabaseClient()

supabase = get_supabase_client()
