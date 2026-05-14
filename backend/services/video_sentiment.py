import base64
import io
import numpy as np

try:
    import cv2
    from deepface import DeepFace
    import mediapipe as mp
    _VISION_AVAILABLE = True
except ImportError:
    _VISION_AVAILABLE = False

EMOTION_WEIGHTS = {
    "happy": 1.0,
    "neutral": 0.7,
    "surprised": 0.6,
    "sad": 0.3,
    "angry": 0.1,
    "fearful": 0.2,
    "disgusted": 0.1,
}


def analyze_frame(frame_b64: str) -> dict:
    if not _VISION_AVAILABLE:
        return {"emotion": "neutral", "attention_score": 0.7, "engagement_score": 0.7}

    img_bytes = base64.b64decode(frame_b64)
    arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    # Emotion via DeepFace
    try:
        result = DeepFace.analyze(frame, actions=["emotion"], enforce_detection=False, silent=True)
        dominant = result[0]["dominant_emotion"] if isinstance(result, list) else result["dominant_emotion"]
        emotion_score = EMOTION_WEIGHTS.get(dominant, 0.5)
    except Exception:
        dominant = "neutral"
        emotion_score = 0.7

    # Attention via MediaPipe face mesh
    attention_score = _compute_attention(frame)

    engagement = round((emotion_score * 0.5 + attention_score * 0.5), 3)

    return {
        "emotion": dominant,
        "attention_score": round(attention_score, 3),
        "engagement_score": engagement,
    }


def _compute_attention(frame: np.ndarray) -> float:
    if not _VISION_AVAILABLE:
        return 0.7
    try:
        mp_face = mp.solutions.face_mesh
        with mp_face.FaceMesh(static_image_mode=True, max_num_faces=1) as fm:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = fm.process(rgb)
            if results.multi_face_landmarks:
                return 0.85
            return 0.2
    except Exception:
        return 0.7
