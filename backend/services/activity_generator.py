import json
import uuid
from datetime import datetime, timezone

from openai import AsyncOpenAI

from core.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

ACTIVITY_SYSTEM = """You are an expert teacher creating assessments. Generate questions that test genuine understanding, not just memorisation.

Include a mix of:
- MCQ questions (4 options, one correct)
- Short answer questions
- Problem-solving questions

Output ONLY valid JSON with this structure:
{
  "activity_type": "quiz",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "correct_index": 0,
      "marks": 2,
      "explanation": "Why this is correct"
    }
  ]
}
"""

EVALUATION_SYSTEM = """You are an expert teacher evaluating student answers.
Provide teacher-like feedback that is encouraging yet honest.
Award partial marks where appropriate.
Explain the correct approach clearly.

Return JSON: {"score": <number>, "feedback": "<detailed feedback>", "correct_answer": "<model answer>"}
"""


async def generate_activity(chapter_title: str, subject: str, content_summary: str) -> dict:
    prompt = f"""Create a chapter assessment for:
Subject: {subject}
Chapter: {chapter_title}
Content: {content_summary[:500]}

Generate 5 questions: 3 MCQ (2 marks each), 1 short answer (5 marks), 1 problem (8 marks)."""

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": ACTIVITY_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        response_format={"type": "json_object"},
    )

    data = json.loads(response.choices[0].message.content)
    activity_id = str(uuid.uuid4())

    questions = []
    for q in data.get("questions", []):
        questions.append({
            "id": q.get("id", str(uuid.uuid4())),
            "type": q.get("type", "mcq"),
            "prompt": q["prompt"],
            "options": q.get("options", []),
            "correct_answer": q.get("correct_answer"),
            "correct_index": q.get("correct_index"),
            "marks": q.get("marks", 2),
            "explanation": q.get("explanation", ""),
        })

    return {
        "id": activity_id,
        "activity_type": data.get("activity_type", "quiz"),
        "questions": questions,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


async def evaluate_submission(
    questions: list[dict],
    answers: dict[str, str],
) -> dict:
    total_score = 0.0
    max_score = sum(q["marks"] for q in questions)
    per_question = []

    for q in questions:
        answer = answers.get(q["id"], "")

        if q["type"] == "mcq":
            correct = q.get("correct_answer", "")
            is_correct = answer.strip().lower() == correct.strip().lower()
            earned = q["marks"] if is_correct else 0
            feedback = f"{'Correct!' if is_correct else 'Incorrect.'} {q.get('explanation', '')}"
        else:
            # Use AI to evaluate open-ended answers
            eval_response = await client.chat.completions.create(
                model=settings.openai_model_fast,
                messages=[
                    {"role": "system", "content": EVALUATION_SYSTEM},
                    {"role": "user", "content": f"Question ({q['marks']} marks): {q['prompt']}\nStudent answer: {answer}"},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            eval_data = json.loads(eval_response.choices[0].message.content)
            earned = min(float(eval_data.get("score", 0)), q["marks"])
            feedback = eval_data.get("feedback", "")

        total_score += earned
        per_question.append({
            "question_id": q["id"],
            "earned": earned,
            "max": q["marks"],
            "feedback": feedback,
        })

    # Generate overall AI feedback
    overall_response = await client.chat.completions.create(
        model=settings.openai_model_fast,
        messages=[
            {"role": "system", "content": "You are a supportive teacher giving overall assessment feedback. Be specific and encouraging. 2-3 sentences."},
            {"role": "user", "content": f"Student scored {total_score}/{max_score}. Per-question results: {json.dumps(per_question)}"},
        ],
        temperature=0.7,
    )

    return {
        "score": total_score,
        "max_score": max_score,
        "percentage": round((total_score / max_score) * 100, 1) if max_score > 0 else 0,
        "ai_feedback": overall_response.choices[0].message.content,
        "per_question_feedback": per_question,
    }
