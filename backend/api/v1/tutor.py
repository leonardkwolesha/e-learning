from fastapi import APIRouter, Depends
from pydantic import BaseModel
from core.auth import get_current_user
from core.database import get_supabase
from services.tutor_engine import get_tutor_response
from datetime import datetime, timezone

router = APIRouter(prefix="/tutor", tags=["tutor"])


class TutorMessageRequest(BaseModel):
    session_id: str
    message: str
    chapter_id: str


@router.post("/message")
async def send_message(body: TutorMessageRequest, user=Depends(get_current_user)):
    db = get_supabase()

    chapter = db.table("chapters").select("title, curricula(subject)").eq("id", body.chapter_id).maybe_single().execute()
    chapter_context = "General topic"
    if chapter.data:
        subject = chapter.data.get("curricula", {}).get("subject", "")
        chapter_context = f"{subject} — {chapter.data['title']}"

    profile_resp = db.table("student_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    profile = profile_resp.data or {}

    conv_resp = db.table("tutor_conversations").select("messages_json").eq("id", body.session_id).maybe_single().execute()
    history = conv_resp.data["messages_json"] if conv_resp.data else []

    history.append({"role": "user", "content": body.message})
    reply = await get_tutor_response(history, chapter_context, profile)
    history.append({"role": "assistant", "content": reply})

    db.table("tutor_conversations").upsert({
        "id": body.session_id,
        "student_id": user["id"],
        "chapter_id": body.chapter_id,
        "messages_json": history,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    return {"data": {"reply": reply, "session_id": body.session_id}, "error": None}


@router.get("/history/{session_id}")
async def get_history(session_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("tutor_conversations").select("*").eq("id", session_id).maybe_single().execute()
    return {"data": resp.data, "error": None}
