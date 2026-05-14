from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_supabase
from models.user import StudentProfileCreate, StudentProfileOut
from services.curriculum_generator import generate_diagnostic_questions
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/profile")
async def save_profile(body: StudentProfileCreate, user=Depends(get_current_user)):
    db = get_supabase()
    profile_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    profile = {
        "id": profile_id,
        "user_id": user["id"],
        "grade_level": body.grade_level,
        "education_type": body.education_type,
        "background_summary": body.background_summary,
        "learning_style": body.learning_style,
        "created_at": now,
    }
    db.table("student_profiles").upsert(profile).execute()

    for i, subject in enumerate(body.subject_interests):
        db.table("subject_interests").insert({
            "id": str(uuid.uuid4()),
            "student_id": profile_id,
            "subject_name": subject,
            "priority_order": i,
        }).execute()

    return {"data": profile, "error": None}


@router.post("/diagnostic")
async def submit_diagnostic(
    subject: str,
    answers: dict[str, int],
    user=Depends(get_current_user),
):
    correct = sum(1 for v in answers.values() if v == 0)  # placeholder scoring
    score = round(correct / max(len(answers), 1) * 100, 1)
    return {"data": {"subject": subject, "score": score, "level": "intermediate"}, "error": None}


@router.get("/diagnostic/questions")
async def get_diagnostic_questions(subject: str, grade: str, user=Depends(get_current_user)):
    questions = await generate_diagnostic_questions(subject, grade)
    return {"data": questions, "error": None}
