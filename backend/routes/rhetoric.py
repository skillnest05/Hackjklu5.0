"""
Voice Rhetoric Analysis API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.rhetoric_analyzer import analyze_rhetoric

router = APIRouter(prefix="/api", tags=["rhetoric"])


class RhetoricRequest(BaseModel):
    text: str
    duration_seconds: Optional[float] = 0


class RhetoricResponse(BaseModel):
    persuasiveness_score: int
    fillers: dict
    pacing: dict
    confidence: dict
    persuasion: dict
    feedback: list[str]


@router.post("/rhetoric/analyze", response_model=RhetoricResponse)
async def analyze_voice_rhetoric(request: RhetoricRequest):
    """
    Analyze transcribed speech for rhetoric quality.
    Returns persuasiveness score and detailed sub-metrics.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Transcribed text cannot be empty.")

    if len(text.split()) < 5:
        raise HTTPException(status_code=400, detail="Please speak at least a few sentences for meaningful analysis.")

    result = analyze_rhetoric(text, request.duration_seconds or 0)

    return RhetoricResponse(
        persuasiveness_score=result["persuasiveness_score"],
        fillers=result["fillers"],
        pacing=result["pacing"],
        confidence=result["confidence"],
        persuasion=result["persuasion"],
        feedback=result["feedback"],
    )
