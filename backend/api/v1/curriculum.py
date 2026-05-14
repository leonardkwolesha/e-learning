from fastapi import APIRouter, Depends, BackgroundTasks
from core.auth import get_current_user
from core.database import get_supabase
from models.curriculum import CurriculumGenerateRequest, CurriculumOut
from services.curriculum_generator import generate_curriculum
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


@router.post("/generate")
async def generate(body: CurriculumGenerateRequest, user=Depends(get_current_user)):
    db = get_supabase()

    # Fetch student profile for personalisation
    profile_resp = db.table("student_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    profile = profile_resp.data or {"grade_level": "Grade 10", "education_type": "secondary", "learning_style": "visual"}

    curriculum = await generate_curriculum(profile, body.subject)
    curriculum["student_id"] = body.student_id

    # Persist
    db.table("curricula").insert({
        "id": curriculum["id"],
        "student_id": body.student_id,
        "subject": body.subject,
        "total_chapters": curriculum["total_chapters"],
        "generated_at": curriculum["generated_at"],
        "status": "ready",
    }).execute()

    for ch in curriculum["chapters"]:
        db.table("chapters").insert(ch).execute()

    return {"data": curriculum, "error": None}


@router.get("/{curriculum_id}")
async def get_curriculum(curriculum_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("curricula").select("*").eq("id", curriculum_id).maybe_single().execute()
    if not resp.data:
        return {"data": None, "error": "Curriculum not found"}
    return {"data": resp.data, "error": None}


@router.get("/{curriculum_id}/chapters")
async def get_chapters(curriculum_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("chapters").select("*").eq("curriculum_id", curriculum_id).order("sequence_order").execute()
    return {"data": resp.data, "error": None}
