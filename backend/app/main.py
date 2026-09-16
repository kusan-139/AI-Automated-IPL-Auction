from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from contextlib import asynccontextmanager
from app.config import get_settings
from app.middleware.logging import RequestLoggingMiddleware
from app.api.router import api_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Starting up IPL Auction AI Platform...")
    yield
    # Shutdown logic
    print("Shutting down...")


class ProxyHTTPSMiddleware(BaseHTTPMiddleware):
    """Fix redirect URLs when running behind a reverse proxy (Railway).
    
    Railway terminates SSL at its proxy layer, so FastAPI thinks requests
    are HTTP. When FastAPI issues a redirect (e.g. trailing-slash 307),
    the Location header contains http:// instead of https://, which
    browsers block as 'Mixed Content'. This middleware rewrites those
    Location headers to use https://.
    """
    async def dispatch(self, request: Request, call_next):
        # Tell FastAPI the original request scheme was HTTPS
        forwarded_proto = request.headers.get("x-forwarded-proto")
        if forwarded_proto:
            request.scope["scheme"] = forwarded_proto

        response = await call_next(request)

        # Also fix any redirect Location headers
        if response.status_code in (301, 302, 307, 308):
            location = response.headers.get("location", "")
            if location.startswith("http://") and forwarded_proto == "https":
                response.headers["location"] = "https://" + location[7:]

        return response


app = FastAPI(
    title="IPL Auction Decision Intelligence Platform",
    description="AI-powered IPL Mega Auction intelligence platform",
    version="1.0.0",
    lifespan=lifespan
)

# Proxy HTTPS fix — must be added FIRST so it wraps everything
app.add_middleware(ProxyHTTPSMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Custom Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

app.include_router(api_router, prefix="/api/v1")


