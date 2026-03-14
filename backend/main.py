"""
EssayAI Backend — FastAPI Application
Multi-Aspect Semantic Essay Evaluation Engine
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import database
from routes.evaluate import router as evaluate_router
from routes.history import router as history_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    database.init_db()
    print("✅ Database initialized")
    print("🚀 EssayAI Backend is ready!")
    yield
    print("👋 Shutting down EssayAI Backend")


app = FastAPI(
    title="EssayAI — Multi-Aspect Semantic Essay Evaluator",
    description=(
        "AI-powered API for evaluating long-form student essays across 5 dimensions: "
        "Coherence, Argument Strength, Factual Correctness, Originality, and Writing Quality. "
        "Includes hallucination detection, bias detection, and plagiarism scanning."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(evaluate_router)
app.include_router(history_router)


@app.get("/")
async def root():
    return {
        "name": "EssayAI Backend",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "evaluate": "POST /api/evaluate",
            "history": "GET /api/history",
            "stats": "GET /api/stats",
            "docs": "GET /docs",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
