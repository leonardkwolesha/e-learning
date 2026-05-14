import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.database import get_supabase
from services.tutor_engine import stream_tutor_response
import uuid
from datetime import datetime, timezone

router = APIRouter()


@router.websocket("/ws/tutor/{session_id}")
async def tutor_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    db = get_supabase()
    history: list[dict] = []

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") != "message":
                continue

            payload = msg.get("payload", {})
            user_text = payload.get("content", "")
            chapter_id = payload.get("chapter_id", "")
            chapter_context = payload.get("chapter_context", "General topic")

            history.append({"role": "user", "content": user_text})

            await websocket.send_json({"type": "stream_start", "payload": {}})

            full_reply = ""
            async for chunk in stream_tutor_response(history, chapter_context, {}):
                full_reply += chunk
                await websocket.send_json({"type": "stream_chunk", "payload": {"chunk": chunk}})

            await websocket.send_json({"type": "stream_end", "payload": {"full": full_reply}})

            history.append({"role": "assistant", "content": full_reply})

            db.table("tutor_conversations").upsert({
                "id": session_id,
                "chapter_id": chapter_id,
                "messages_json": history,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }).execute()

    except WebSocketDisconnect:
        pass
