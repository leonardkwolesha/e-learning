from pydantic import BaseModel
from datetime import datetime
from typing import Literal
import uuid


class CurriculumGenerateRequest(BaseModel):
    student_id: str
    subject: str


class ChapterOut(BaseModel):
    id: str
    curriculum_id: str
    title: str
    sequence_order: int
    estimated_duration_mins: int
    prerequisites: list[str] = []
    status: Literal["locked", "available", "in_progress", "completed"] = "locked"
    mastery_score: float | None = None


class CurriculumOut(BaseModel):
    id: str
    student_id: str
    subject: str
    total_chapters: int
    generated_at: datetime
    status: Literal["generating", "ready", "error"]
    chapters: list[ChapterOut] = []


class ContentBlock(BaseModel):
    type: str
    content: str | None = None
    level: int | None = None
    latex: str | None = None
    display: bool | None = None
    spec: str | None = None
    caption: str | None = None
    language: str | None = None
    variant: str | None = None
    items: list[str] | None = None
    ordered: bool | None = None


class ChapterContentOut(BaseModel):
    id: str
    chapter_id: str
    content_json: list[ContentBlock]
    diagrams_json: list[dict] = []
    formulas_json: list[dict] = []
    generated_at: datetime
