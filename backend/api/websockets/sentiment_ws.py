import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.video_sentiment import analyze_frame
from core.database import get_supabase
import uuid
from datetime import datetime, timezone

router = APIRouter()

LOW_ENGAGEMENT_THRESHOLD = 0.4
LOW_ENGAGEMENT_WINDOW = 10  # consecutive low frames before trigger


@router.websocket("/ws/sentiment/{session_id}")
async def sentiment_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    db = get_supabase()
    low_count = 0

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") != "frame":
                continue

            frame_b64 = msg["payload"].get("frame", "")
            result = analyze_frame(frame_b64)

            db.table("sentiment_snapshots").insert({
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "ts": datetime.now(timezone.utc).isoformat(),
                "emotion": result["emotion"],
                "attention_score": result["attention_score"],
                "engagement_score": result["engagement_score"],
            }).execute()

            if result["engagement_score"] < LOW_ENGAGEMENT_THRESHOLD:
                low_count += 1
            else:
                low_count = 0

            response = {
                "type": "sentiment_update",
                "payload": {
                    **result,
                    "adaptation_trigger": low_count >= LOW_ENGAGEMENT_WINDOW,
                },
            }
            await websocket.send_json(response)

    except WebSocketDisconnect:
        pass
