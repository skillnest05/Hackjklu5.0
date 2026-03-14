"""
Essay Evaluation API Routes
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import math

from models.essay import EssayRequest, EvaluationResponse, IssueDetail, ScoreBreakdown, FeedbackBreakdown, PracticeRequest, PracticeResponse
from services.evaluator import evaluate_essay, evaluate_practice_answer
from services.plagiarism import check_plagiarism
from services.bias_detector import detect_hallucinations, detect_bias
import database

router = APIRouter(prefix="/api", tags=["evaluate"])


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EssayRequest):
    """
    Evaluate an essay across 5 dimensions with integrity checks.
    Returns detailed scores, feedback, and detected issues.
    """
    text = request.essay_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Essay text cannot be empty.")

    word_count = len(text.split())
    if word_count < 10:
        raise HTTPException(status_code=400, detail="Essay must contain at least 10 words.")

    # Parse optional scoring weights
    weights = None
    if request.settings and "weights" in request.settings:
        weights = request.settings["weights"]

    # ── Run the multi-aspect evaluation ──
    result = evaluate_essay(text, request.prompt, weights)

    # ── Run integrity checks ──
    all_issues = []

    # Plagiarism check
    plagiarism_issues = check_plagiarism(text)
    all_issues.extend(plagiarism_issues)

    # Hallucination detection
    hallucination_issues = detect_hallucinations(text)
    all_issues.extend(hallucination_issues)

    # Bias detection
    bias_issues = detect_bias(text)
    all_issues.extend(bias_issues)

    # ── Build response ──
    reading_time = f"{max(1, math.ceil(word_count / 200))} min"
    submitted_at = datetime.now(timezone.utc).isoformat()

    evaluation_data = {
        "title": request.title or "Untitled Essay",
        "prompt": request.prompt or "",
        "essay_text": text,
        "submitted_at": submitted_at,
        "status": "evaluated",
        "overall_score": result["overall_score"],
        "scores": result["scores"],
        "feedback": result["feedback"],
        "issues": all_issues,
        "word_count": word_count,
        "reading_time": reading_time,
    }

    # Save to database
    eval_id = database.save_evaluation(evaluation_data)

    # Return response
    return EvaluationResponse(
        id=eval_id,
        title=evaluation_data["title"],
        prompt=evaluation_data["prompt"],
        essay_text=text,
        submitted_at=submitted_at,
        status="evaluated",
        overall_score=result["overall_score"],
        scores=ScoreBreakdown(**result["scores"]),
        feedback=FeedbackBreakdown(**result["feedback"]),
        issues=[IssueDetail(**issue) for issue in all_issues],
        word_count=word_count,
        reading_time=reading_time,
    )


@router.post("/evaluate-practice", response_model=PracticeResponse)
async def evaluate_practice(request: PracticeRequest):
    """
    Evaluate a user's answer to a specific practice question.
    """
    if not request.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")
    
    result = evaluate_practice_answer(request.question, request.answer)
    return PracticeResponse(
        score=result["score"],
        feedback=result["feedback"]
    )
