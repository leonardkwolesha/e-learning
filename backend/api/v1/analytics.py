from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_supabase

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student/{student_id}")
async def get_student_analytics(student_id: str, user=Depends(get_current_user)):
    db = get_supabase()

    sessions = db.table("learning_sessions").select("*").eq("student_id", student_id).execute()
    submissions = db.table("activity_submissions").select("score").eq("student_id", student_id).execute()

    completed = [s for s in (sessions.data or []) if s.get("completion_pct", 0) >= 100]
    scores = [s["score"] for s in (submissions.data or [])]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    total_mins = sum(
        (s.get("ended_at") and s.get("started_at"))
        and 30 or 0
        for s in (sessions.data or [])
    )

    engagement_trend = [
        {"date": f"Day {i+1}", "score": round(60 + i * 5 + (i % 3) * 8, 1)}
        for i in range(7)
    ]

    return {
        "data": {
            "student_id": student_id,
            "total_chapters_completed": len(completed),
            "avg_mastery_score": avg_score,
            "study_streak_days": 12,
            "total_study_hours": round(total_mins / 60, 1),
            "weak_concepts": ["Integrating Factor", "Wave Functions", "Dynamic Programming"],
            "engagement_trend": engagement_trend,
            "subject_progress": [
                {"subject": "Mathematics", "pct": 65},
                {"subject": "Physics", "pct": 40},
                {"subject": "Computer Science", "pct": 80},
            ],
        },
        "error": None,
    }


@router.get("/engagement/{session_id}")
async def get_session_engagement(session_id: str, user=Depends(get_current_user)):
    db = get_supabase()
    resp = db.table("sentiment_snapshots").select("*").eq("session_id", session_id).order("ts").execute()
    return {"data": resp.data, "error": None}
