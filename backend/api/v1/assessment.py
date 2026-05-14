from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_supabase
from models.assessment import SubmissionCreate
from services.activity_generator import generate_activity, evaluate_submission
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/generate/{chapter_id}")
async def generate_assessment(chapter_id: str, user=Depends(get_current_user)):
    db = get_supabase()

    chapter = db.table("chapters").select("title, curricula(subject)").eq("id", chapter_id).maybe_single().execute()
    if not chapter.data:
        return {"data": None, "error": "Chapter not found"}

    ch = chapter.data
    subject = ch.get("curricula", {}).get("subject", "General")

    content = db.table("chapter_content").select("content_json").eq("chapter_id", chapter_id).maybe_single().execute()
    content_summary = str(content.data.get("content_json", "")[:500]) if content.data else ""

    activity = await generate_activity(ch["title"], subject, content_summary)
    activity["chapter_id"] = chapter_id

    db.table("activities").insert({
        "id": activity["id"],
        "chapter_id": chapter_id,
        "activity_type": activity["activity_type"],
        "questions_json": activity["questions"],
        "generated_at": activity["generated_at"],
    }).execute()

    return {"data": activity, "error": None}


@router.post("/submit/{activity_id}")
async def submit_assessment(activity_id: str, body: SubmissionCreate, user=Depends(get_current_user)):
    db = get_supabase()

    activity = db.table("activities").select("*").eq("id", activity_id).maybe_single().execute()
    if not activity.data:
        return {"data": None, "error": "Activity not found"}

    questions = activity.data["questions_json"]
    result = await evaluate_submission(questions, body.answers)

    submission_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db.table("activity_submissions").insert({
        "id": submission_id,
        "activity_id": activity_id,
        "student_id": user["id"],
        "answers_json": body.answers,
        "score": result["score"],
        "ai_feedback": result["ai_feedback"],
        "submitted_at": now,
    }).execute()

    return {"data": {**result, "id": submission_id, "submitted_at": now}, "error": None}


@router.get("/results/{activity_id}")
async def get_results(activity_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("activity_submissions").select("*").eq("activity_id", activity_id).eq("student_id", user["id"]).order("submitted_at", desc=True).limit(1).execute()
    return {"data": resp.data[0] if resp.data else None, "error": None}
