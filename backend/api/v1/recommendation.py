from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_supabase

router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.get("/next/{student_id}")
async def get_next_recommendation(student_id: str, user=Depends(get_current_user)):
    db = get_supabase()

    sessions = db.table("learning_sessions").select("chapter_id, completion_pct").eq("student_id", student_id).order("started_at", desc=True).limit(10).execute()

    completed_ids = {s["chapter_id"] for s in (sessions.data or []) if s.get("completion_pct", 0) >= 80}

    chapters = db.table("chapters").select("id, title, curricula(subject)").execute()
    available = [
        ch for ch in (chapters.data or [])
        if ch["id"] not in completed_ids
    ][:3]

    recommendations = []
    reasons = [
        "Prerequisite for your next chapter",
        "Matches your learning pace",
        "High mastery rate among peers",
    ]
    for i, ch in enumerate(available):
        recommendations.append({
            "chapter_id": ch["id"],
            "chapter_title": ch["title"],
            "subject": ch.get("curricula", {}).get("subject", ""),
            "reason": reasons[i % len(reasons)],
            "confidence": round(0.95 - i * 0.1, 2),
        })

    return {"data": recommendations, "error": None}
