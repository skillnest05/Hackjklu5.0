"""
History & Stats API Routes
"""

from fastapi import APIRouter, HTTPException
import database

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def get_history():
    """
    Get all past essay evaluations, ordered by most recent first.
    """
    evaluations = database.get_all_evaluations()
    
    # Return in the format the frontend expects
    history_items = []
    for ev in evaluations:
        history_items.append({
            "id": ev["id"],
            "title": ev["title"],
            "prompt": ev["prompt"],
            "essayText": ev["essay_text"],
            "submittedAt": ev["submitted_at"],
            "status": ev["status"],
            "overallScore": ev["overall_score"],
            "scores": {
                "coherence": ev["scores"]["coherence"],
                "argumentStrength": ev["scores"]["argument_strength"],
                "factualCorrectness": ev["scores"]["factual_correctness"],
                "originality": ev["scores"]["originality"],
                "writingQuality": ev["scores"]["writing_quality"],
            },
            "feedback": {
                "coherence": ev["feedback"]["coherence"],
                "argumentStrength": ev["feedback"]["argument_strength"],
                "factualCorrectness": ev["feedback"]["factual_correctness"],
                "originality": ev["feedback"]["originality"],
                "writingQuality": ev["feedback"]["writing_quality"],
                "improvementTips": ev["feedback"].get("improvement_tips", []),
                "practiceQuestions": ev["feedback"].get("practice_questions", []),
            },
            "issues": ev["issues"],
            "wordCount": ev["word_count"],
            "readingTime": ev["reading_time"],
        })
    
    return {"evaluations": history_items, "count": len(history_items)}


@router.get("/history/{eval_id}")
async def get_evaluation(eval_id: int):
    """Get a single evaluation by ID."""
    ev = database.get_evaluation_by_id(eval_id)
    if ev is None:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    
    return {
        "id": ev["id"],
        "title": ev["title"],
        "prompt": ev["prompt"],
        "essayText": ev["essay_text"],
        "submittedAt": ev["submitted_at"],
        "status": ev["status"],
        "overallScore": ev["overall_score"],
        "scores": {
            "coherence": ev["scores"]["coherence"],
            "argumentStrength": ev["scores"]["argument_strength"],
            "factualCorrectness": ev["scores"]["factual_correctness"],
            "originality": ev["scores"]["originality"],
            "writingQuality": ev["scores"]["writing_quality"],
        },
        "feedback": {
            "coherence": ev["feedback"]["coherence"],
            "argumentStrength": ev["feedback"]["argument_strength"],
            "factualCorrectness": ev["feedback"]["factual_correctness"],
            "originality": ev["feedback"]["originality"],
            "writingQuality": ev["feedback"]["writing_quality"],
            "improvementTips": ev["feedback"].get("improvement_tips", []),
            "practiceQuestions": ev["feedback"].get("practice_questions", []),
        },
        "issues": ev["issues"],
        "wordCount": ev["word_count"],
        "readingTime": ev["reading_time"],
    }


@router.delete("/history/{eval_id}")
async def delete_evaluation(eval_id: int):
    """Delete an evaluation by ID."""
    success = database.delete_evaluation(eval_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    return {"message": "Evaluation deleted successfully."}


@router.get("/stats")
async def get_stats():
    """Get aggregate statistics for the dashboard."""
    stats = database.get_stats()
    return stats
