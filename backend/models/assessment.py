from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class QuestionOut(BaseModel):
    id: str
    type: Literal["mcq", "short_answer", "problem"]
    prompt: str
    options: list[str] = []
    marks: int


class ActivityOut(BaseModel):
    id: str
    chapter_id: str
    activity_type: Literal["quiz", "assignment", "practice"]
    questions: list[QuestionOut]
    generated_at: datetime


class SubmissionCreate(BaseModel):
    answers: dict[str, str]


class SubmissionOut(BaseModel):
    id: str
    activity_id: str
    student_id: str
    score: float
    max_score: float
    percentage: float
    ai_feedback: str
    per_question_feedback: list[dict]
    submitted_at: datetime
