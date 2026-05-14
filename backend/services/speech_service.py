import io
import httpx

from core.config import settings

try:
    from faster_whisper import WhisperModel
    _WHISPER_AVAILABLE = True
except ImportError:
    WhisperModel = None  # type: ignore[assignment,misc]
    _WHISPER_AVAILABLE = False

_whisper_model = None


def get_whisper():
    global _whisper_model
    if not _WHISPER_AVAILABLE:
        raise RuntimeError("faster-whisper is not installed")
    if _whisper_model is None:
        _whisper_model = WhisperModel(settings.whisper_model, device="cpu", compute_type="int8")
    return _whisper_model


async def transcribe_audio(audio_bytes: bytes) -> str:
    if not _WHISPER_AVAILABLE:
        return "[Speech-to-text unavailable — faster-whisper not installed]"
    model = get_whisper()
    audio_buffer = io.BytesIO(audio_bytes)
    segments, _ = model.transcribe(audio_buffer, beam_size=5)
    return " ".join(seg.text for seg in segments).strip()


async def synthesize_speech(text: str, voice: str = "alloy") -> bytes:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.openedai_speech_url}/v1/audio/speech",
            json={"model": "tts-1", "input": text, "voice": voice},
        )
        resp.raise_for_status()
        return resp.content
