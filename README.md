# AI Automated IPL Auction Platform & Pipeline

An advanced, AI-powered decision intelligence platform built for the **IPL Mega Auction**. This platform combines state-of-the-art Machine Learning models, real-time analytics, an interactive glassmorphism React dashboard, and a live WebSocket bidding simulator to give IPL franchises a strategic competitive edge.

---

## 🌟 Key Features

- **📊 Live Decision Intelligence Dashboard**: Real-time budget tracking, bidding timeline visualizations, and dynamic squad role radar composition charts.
- **🔍 Player Analysis Engine**: Deep player database search, category filters (Batsmen, Bowler, All-Rounder, Wicketkeeper), performance metrics, and SHAP XAI feature contribution modal.
- **🧩 Playing XI Squad Builder & Chemistry Engine**: Interactive 11-player squad lineup builder, real-time synergy scoring, role coverage progress indicators, and scenario simulation.
- **🔨 Live Auction Room & AI Coach**: Real-time bidding interface with manual increment buttons (+₹25L, +₹50L, +₹1Cr), automated AI opponent counter-bids, live bidding activity log feed, and AI Auction Coach "Safe Max Ceiling" advice.
- **⚡ End-to-End Automated Data & ML Pipeline**: Ingestion script parsing parquet and CSV datasets, populating database tables, and serializing ML model artifacts.

---

## 🏗️ Architecture & Technology Stack

```text
                               ┌─────────────────────────┐
                               │ React 19 + Vite + CSS   │
                               │ Glassmorphism Dashboard │
                               └────────────┬────────────┘
                                            │ HTTP / WebSocket
                               ┌────────────▼────────────┐
                               │  FastAPI Backend Server │
                               └──────┬────────────┬─────┘
                                      │            │
             ┌────────────────────────┴─┐        ┌─┴────────────────────────┐
             │  SQLAlchemy ORM + SQLite │        │  11 Core ML Modules &    │
             │  (PostgreSQL/Supabase)   │        │  SHAP XAI Explainer      │
             └──────────────────────────┘        └──────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Zustand State Management.
- **Backend**: FastAPI, Python 3.10+, SQLAlchemy (Async), Alembic, Pydantic v2, PyJWT, WebSockets.
- **Database & Storage**: PostgreSQL (Supabase) / Async SQLite (`aiosqlite`) zero-dependency fallback, Redis / In-memory fallback.
- **Machine Learning**: Scikit-Learn (RandomForest, Gradient Boosting), LightGBM, XGBoost, SHAP XAI Explainer.

---

## 🚀 Quickstart Guide

Follow these steps to run the data pipeline, train the ML models, start the FastAPI backend, and launch the React dashboard.

### 1. Prerequisites

Ensure you have installed:
- **Python 3.10+**
- **Node.js 18+** & `npm`
- *(Optional)* Docker Desktop for containerized deployment

---

### 2. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

### 3. Backend Setup & Data Ingestion Pipeline

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   python -m venv venv
   ```

2. Activate virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy aiosqlite pydantic pydantic-settings pyjwt httpx pytest pytest-asyncio pandas openpyxl
   ```

4. **Execute Data Ingestion Pipeline**:
   ```bash
   python scripts/seed_db.py
   ```
   *What this does:*
   - Unzips `data_pipeline_output.zip` and parses player datasets.
   - Creates database tables automatically (`sqlite+aiosqlite` local fallback or Supabase PostgreSQL).
   - Seeds 10 IPL Franchises (MI, CSK, RCB, KKR, DC, RR, PBKS, SRH, LSG, GT) and 100+ player profiles with stats, base prices, fitness ratings, and injury history.

5. **Train ML Models**:
   ```bash
   python scripts/train_models.py
   ```
   *What this does:*
   - Trains regression & valuation models on player feature sets.
   - Serializes trained artifacts into `backend/data/models/negotiation_ensemble.pkl`.

---

### 4. Running the Backend Server

Start the FastAPI server using Uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Interactive Swagger API Docs are available at:* `http://localhost:8000/docs`

---

### 5. Running the Frontend Dashboard

1. Open a **new terminal window** in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` to access the live dashboard!

---

## 🧪 Verification & Testing

To run the backend test suite:
```bash
cd backend
pytest
```

---

## 🐳 Docker Compose Quickstart

To run the entire platform via Docker:
```bash
docker-compose build --no-cache
docker-compose up -d
```
- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost:8000/docs`

---

## 🚀 Vercel Deployment

This project is configured for Vercel deployment out-of-the-box.
- **Frontend**: The React + Vite application will be built and served as a static site.
- **Backend**: The FastAPI server is configured as a serverless function via `api/index.py`. 
*Note: Due to the size of ML dependencies (`xgboost`, `lightgbm`, etc.), deploying the backend on Vercel's free tier may hit the 250MB size limit. We recommend deploying the backend on a VPS (Render, Railway, DigitalOcean) using Docker, while keeping the React frontend on Vercel.*

---

## 📁 Repository Structure

```text
AI-Automated-IPL-Auction-main/
├── .env.example                 # Environment variable template
├── docker-compose.yml           # Docker orchestration
├── data_pipeline_output.zip     # Preprocessed Parquet datasets
├── backend/
│   ├── app/
│   │   ├── api/v1/              # RESTful & WebSocket API endpoints
│   │   ├── auth/                # JWT Authentication & RBAC
│   │   ├── data/                # Data ingestion pipeline
│   │   ├── ml/                  # 11 Core ML Modules & SHAP XAI
│   │   ├── models/              # SQLAlchemy Database Models & GUID helper
│   │   └── database.py          # Dual SQLite/PostgreSQL Engine
│   ├── scripts/
│   │   ├── seed_db.py           # Database Ingestion & Seeding Script
│   │   └── train_models.py      # ML Model Training Pipeline
│   └── tests/                   # Pytest test suite
└── frontend/
    ├── src/
    │   ├── components/          # Reusable Glassmorphism UI Components
    │   ├── pages/               # Dashboard, PlayerAnalysis, TeamBuilder, AuctionRoom
    │   └── store/               # Zustand Auction State Management
    └── package.json
```
