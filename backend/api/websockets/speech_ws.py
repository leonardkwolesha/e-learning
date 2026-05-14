import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.speech_service import transcribe_audio, synthesize_speech
from services.tutor_engine import get_tutor_response

router = APIRouter()


@router.websocket("/ws/speech/{session_id}")
async def speech_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    history: list[dict] = []

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "audio_chunk":
                audio_b64 = msg["payload"].get("audio", "")
                import base64
                audio_bytes = base64.b64decode(audio_b64)

                transcript = await transcribe_audio(audio_bytes)
                await websocket.send_json({"type": "transcript", "payload": {"text": transcript}})

                history.append({"role": "user", "content": transcript})
                reply = await get_tutor_response(history, msg["payload"].get("context", ""), {})
                history.append({"role": "assistant", "content": reply})

                tts_audio = await synthesize_speech(reply)
                import base64
                await websocket.send_json({
                    "type": "audio_response",
                    "payload": {
                        "text": reply,
                        "audio_b64": base64.b64encode(tts_audio).decode(),
                    },
                })

            elif msg.get("type") == "barge_in":
                await websocket.send_json({"type": "playback_stop", "payload": {}})

    except WebSocketDisconnect:
        pass
