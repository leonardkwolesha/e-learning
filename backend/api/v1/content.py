from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_supabase
from services.curriculum_generator import generate_chapter_content
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/content", tags=["content"])


@router.post("/generate/{chapter_id}")
async def generate_content(chapter_id: str, user=Depends(get_current_user)):
    db = get_supabase()

    chapter = db.table("chapters").select("*, curricula(subject, student_id)").eq("id", chapter_id).maybe_single().execute()
    if not chapter.data:
        return {"data": None, "error": "Chapter not found"}

    ch = chapter.data
    subject = ch.get("curricula", {}).get("subject", "General")

    profile_resp = db.table("student_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    profile = profile_resp.data or {"grade_level": "Grade 10", "learning_style": "visual"}

    content_blocks = await generate_chapter_content(ch["title"], subject, profile)

    content_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "id": content_id,
        "chapter_id": chapter_id,
        "content_json": content_blocks,
        "diagrams_json": [],
        "formulas_json": [],
        "generated_at": now,
    }
    db.table("chapter_content").upsert(record).execute()

    return {"data": record, "error": None}


@router.get("/{chapter_id}")
async def get_content(chapter_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("chapter_content").select("*").eq("chapter_id", chapter_id).maybe_single().execute()
    if not resp.data:
        return {"data": None, "error": "Content not found. Generate it first."}
    return {"data": resp.data, "error": None}
