"""
Debate Mode API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.debate_engine import (
    generate_opening_challenge,
    generate_debate_response,
)

router = APIRouter(prefix="/api", tags=["debate"])


class DebateStartRequest(BaseModel):
    essay_text: str
    scores: Optional[dict] = None


class DebateStartResponse(BaseModel):
    message: str
    role: str
    round: int
    thesis: str
    weak_claims: list[str]
    debate_over: bool = False


class DebateTurnRequest(BaseModel):
    essay_text: str
    user_message: str
    conversation_history: list[dict]
    scores: Optional[dict] = None
    weak_claims: Optional[list[str]] = []
    thesis: Optional[str] = ""


class DebateTurnResponse(BaseModel):
    message: str
    role: str
    round: int
    debate_over: bool


@router.post("/debate/start", response_model=DebateStartResponse)
async def start_debate(request: DebateStartRequest):
    """
    Start a Debate Mode session.
    Returns the AI's opening challenge based on the essay's thesis and weak points.
    """
    text = request.essay_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Essay text cannot be empty.")

    result = generate_opening_challenge(text, request.scores or {})

    return DebateStartResponse(
        message=result["message"],
        role="ai",
        round=0,
        thesis=result["thesis"],
        weak_claims=result["weak_claims"],
        debate_over=False,
    )


@router.post("/debate/respond", response_model=DebateTurnResponse)
async def debate_respond(request: DebateTurnRequest):
    """
    Process the student's defense and return the AI's next counter-argument.
    """
    if not request.user_message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = generate_debate_response(
        essay_text=request.essay_text,
        user_message=request.user_message,
        conversation_history=request.conversation_history,
        scores=request.scores or {},
        weak_claims=request.weak_claims or [],
        thesis=request.thesis or "",
    )

    return DebateTurnResponse(
        message=result["message"],
        role="ai",
        round=result["round"],
        debate_over=result.get("debate_over", False),
    )
