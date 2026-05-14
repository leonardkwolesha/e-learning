import json
from typing import AsyncIterator

from openai import AsyncOpenAI

from core.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

TUTOR_SYSTEM = """You are EduAI, an expert AI tutor with deep knowledge across all academic subjects.

Your teaching style:
- Explain concepts clearly with step-by-step reasoning
- Use analogies and real-world examples
- Adapt complexity to the student's level
- Ask guiding questions to promote active thinking
- Provide encouraging, constructive feedback
- Use LaTeX notation for mathematical formulas (wrap in $ for inline, $$ for display)
- Offer to draw diagrams or show code examples when helpful

You currently have context about the chapter the student is studying. Stay focused on that topic but handle related questions graciously.
"""


async def stream_tutor_response(
    messages: list[dict],
    chapter_context: str,
    student_profile: dict,
) -> AsyncIterator[str]:
    system_content = TUTOR_SYSTEM + f"""

Current chapter: {chapter_context}
Student grade: {student_profile.get('grade_level', 'unknown')}
Learning style: {student_profile.get('learning_style', 'visual')}
"""

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_content},
            *messages,
        ],
        stream=True,
        temperature=0.7,
        max_tokens=1500,
    )

    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def get_tutor_response(
    messages: list[dict],
    chapter_context: str,
    student_profile: dict,
) -> str:
    system_content = TUTOR_SYSTEM + f"\n\nCurrent chapter: {chapter_context}\nStudent grade: {student_profile.get('grade_level', 'unknown')}"

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_content},
            *messages,
        ],
        temperature=0.7,
        max_tokens=1500,
    )

    return response.choices[0].message.content
