from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EssayRequest(BaseModel):
    title: str = Field("", description="Title of the essay")
    prompt: str = Field("", description="The essay prompt/question")
    essay_text: str = Field(..., description="The full essay text to evaluate")
    settings: Optional[dict] = Field(None, description="Optional scoring weight overrides")


class IssueDetail(BaseModel):
    type: str = Field(..., description="Type: hallucination, bias, plagiarism, factual")
    severity: str = Field(..., description="Severity: high, medium, low")
    description: str = Field(..., description="Description of the issue")
    location: str = Field(..., description="Where in the essay the issue was found")


class ScoreBreakdown(BaseModel):
    coherence: int = Field(..., ge=0, le=100)
    argument_strength: int = Field(..., ge=0, le=100)
    factual_correctness: int = Field(..., ge=0, le=100)
    originality: int = Field(..., ge=0, le=100)
    writing_quality: int = Field(..., ge=0, le=100)


class FeedbackBreakdown(BaseModel):
    coherence: str
    argument_strength: str
    factual_correctness: str
    originality: str
    writing_quality: str
    improvement_tips: list[str] = Field(default_factory=list)
    practice_questions: list[str] = Field(default_factory=list)


class EvaluationResponse(BaseModel):
    id: int
    title: str
    prompt: str
    essay_text: str
    submitted_at: str
    status: str = "evaluated"
    overall_score: int
    scores: ScoreBreakdown
    feedback: FeedbackBreakdown
    issues: list[IssueDetail]
    word_count: int
    reading_time: str


class HistoryItem(BaseModel):
    id: int
    title: str
    prompt: str
    submitted_at: str
    status: str
    overall_score: int
    scores: ScoreBreakdown
    issues_count: int
    word_count: int
    reading_time: str


class PracticeRequest(BaseModel):
    question: str = Field(..., description="The practice question asked")
    answer: str = Field(..., description="The user's submitted answer")


class PracticeResponse(BaseModel):
    score: int = Field(..., description="Score out of 100")
    feedback: str = Field(..., description="Actionable feedback on the answer")
