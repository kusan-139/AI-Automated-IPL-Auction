from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI(
    title="IPL Auction Decision Intelligence Platform",
    description="AI-powered IPL Mega Auction intelligence platform",
    version="1.0.0",
    lifespan=lifespan
)

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

