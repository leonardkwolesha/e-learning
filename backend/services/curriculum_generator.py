import json
import uuid
from datetime import datetime, timezone

from openai import AsyncOpenAI

from core.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

CURRICULUM_SYSTEM = """You are an expert curriculum designer. Given a student profile and subject,
generate a structured, personalized curriculum as a JSON object.

Rules:
- Generate 12-20 chapters, ordered from foundational to advanced
- Each chapter has a clear title, estimated duration (15-90 mins), and prerequisites
- First 2 chapters have no prerequisites
- Sequence prerequisites logically
- Output ONLY valid JSON, no markdown fences
"""

CONTENT_SYSTEM = """You are an expert teacher. Generate rich chapter content as a JSON array of content blocks.

Block types: heading (level 1-3), text, formula (latex string, display bool), code (language, content),
callout (variant: info|warning|tip, content), list (items array, ordered bool), diagram (spec in mermaid syntax, caption).

Rules:
- Include at least 6 blocks
- Use formulas for mathematical content (LaTeX syntax)
- Include at least one worked example
- Include one callout with a practical tip
- Output ONLY a valid JSON array, no markdown fences
"""


async def generate_curriculum(student_profile: dict, subject: str) -> dict:
    prompt = f"""Student Profile:
- Grade: {student_profile.get('grade_level')}
- Education: {student_profile.get('education_type')}
- Learning style: {student_profile.get('learning_style')}
- Background: {student_profile.get('background_summary', 'None provided')}

Subject: {subject}

Generate a curriculum JSON with this exact structure:
{{
  "subject": "{subject}",
  "total_chapters": <number>,
  "chapters": [
    {{
      "title": "Chapter title",
      "sequence_order": 1,
      "estimated_duration_mins": 45,
      "prerequisites": []
    }}
  ]
}}"""

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": CURRICULUM_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    curriculum_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    chapters = []
    for i, ch in enumerate(data.get("chapters", [])):
        chapters.append({
            "id": str(uuid.uuid4()),
            "curriculum_id": curriculum_id,
            "title": ch["title"],
            "sequence_order": ch.get("sequence_order", i + 1),
            "estimated_duration_mins": ch.get("estimated_duration_mins", 45),
            "prerequisites": ch.get("prerequisites", []),
            "status": "available" if i == 0 else "locked",
        })

    return {
        "id": curriculum_id,
        "subject": subject,
        "total_chapters": len(chapters),
        "generated_at": now.isoformat(),
        "status": "ready",
        "chapters": chapters,
    }


async def generate_chapter_content(chapter_title: str, subject: str, student_profile: dict) -> list[dict]:
    prompt = f"""Generate content for:
Subject: {subject}
Chapter: {chapter_title}
Student level: {student_profile.get('grade_level')}
Learning style: {student_profile.get('learning_style', 'visual')}

Create an engaging, comprehensive lesson with examples, formulas where relevant, and clear explanations."""

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": CONTENT_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.6,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(raw)


async def generate_diagnostic_questions(subject: str, grade_level: str) -> list[dict]:
    prompt = f"""Generate 5 adaptive diagnostic MCQ questions for:
Subject: {subject}
Grade: {grade_level}

Output JSON array: [{{"question": "...", "options": ["A","B","C","D"], "correct": 0, "difficulty": "easy|medium|hard"}}]"""

    response = await client.chat.completions.create(
        model=settings.openai_model_fast,
        messages=[
            {"role": "system", "content": "You are an expert teacher creating diagnostic assessments. Output only valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("questions", [])
