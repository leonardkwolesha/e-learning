from pydantic import BaseModel
from datetime import datetime


class EngagementPoint(BaseModel):
    date: str
    score: float


class SubjectProgress(BaseModel):
    subject: str
    pct: float


class StudentAnalyticsOut(BaseModel):
    student_id: str
    total_chapters_completed: int
    avg_mastery_score: float
    study_streak_days: int
    total_study_hours: float
    weak_concepts: list[str]
    engagement_trend: list[EngagementPoint]
    subject_progress: list[SubjectProgress]


class DropoutRiskOut(BaseModel):
    student_id: str
    risk_score: float
    risk_factors: list[str]
    computed_at: datetime


class RecommendationOut(BaseModel):
    chapter_id: str
    chapter_title: str
    subject: str
    reason: str
    confidence: float


class SentimentSnapshot(BaseModel):
    session_id: str
    emotion: str
    attention_score: float
    engagement_score: float
