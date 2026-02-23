# Vestora — AI-Powered Personal Fashion Operating System

Vestora is a full-stack AI fashion platform that digitizes your wardrobe, understands your style DNA, generates personalized outfit recommendations, and creates hyper-realistic virtual try-on images.

## Project Structure

```
vestora/
├── website/     # Static marketing website (Next.js 14)
├── frontend/    # Main application (Next.js 14 + TypeScript)
└── backend/     # API server (Python FastAPI + MongoDB)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Marketing Site** | Next.js 14, TypeScript, TailwindCSS, Framer Motion, Recharts |
| **Frontend App** | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Zustand, Framer Motion |
| **Backend** | Python 3.11+, FastAPI, Motor (async MongoDB), Pydantic v2 |
| **Database** | MongoDB (local or Atlas) |
| **AI — LLM** | us.inc `usf-mini` (clothing analysis, outfit reasoning, style DNA) |
| **AI — Image** | us.inc `usf-mini-image` (virtual try-on, background removal) |
| **Weather** | Google Maps Weather API (GCP) |
| **Image Storage** | AWS S3 (private bucket, signed URLs via boto3) |
| **Auth** | JWT (httpOnly cookies) + bcrypt |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas URI)

### 1. Marketing Website

```bash
cd website
npm install
npm run dev          # → http://localhost:3000
```

### 2. Frontend App

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Edit API URL if needed
npm run dev          # → http://localhost:3000
```

### 3. Backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # macOS/Linux
pip install -r requirements.txt
cp .env.example .env                 # Add your API keys
uvicorn app.main:app --reload        # → http://localhost:8000
```

### 4. Environment Variables

**Backend** (`.env`):
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET_KEY` — Secret for JWT signing
- `USINC_API_KEY` — us.inc API key for AI features
- `GCP_API_KEY` — Google Cloud API key (Weather API enabled)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — AWS credentials for S3
- `S3_BUCKET_NAME` — Private S3 bucket name

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL` — Backend URL (default: `http://localhost:8000`)

## Features

### Phase 1 — Core
- Smart Wardrobe Digitization (AI clothing analysis)
- Outfit Recommendation Engine (occasion, mood, weather aware)
- AI Virtual Try-On (hyper-realistic, multi-style)

### Phase 2 — Intelligence
- Style DNA Engine (personalized style profiling)
- Outfit Memory & Feedback Learning
- Smart Closet Analytics (cost-per-wear, color balance)
- Capsule Wardrobe Generator
- Shopping Assistant (gap analysis, price comparison)
- Social Layer (feed, battles, leaderboard)

### Phase 3 — Next Level
- AI Fashion Forecasting
- Mood-to-Style Generator
- Wardrobe Auto-Clean Assistant
- AI Confidence Engine
- Notifications & Daily Intelligence
- Onboarding & Gamification

## API Docs

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## License

Private — All rights reserved.
