"""Helpers for tagging quiz questions with topic / skill / difficulty metadata."""

import json
import re

DIFFICULTIES = ("easy", "medium", "hard")

# Canonical parent skills. Kept in sync with data/career_roles.json so that
# quiz evidence can be compared against career requirements.
CANONICAL_SKILLS = (
    "Python", "Statistics", "Data Analysis", "SQL", "Algorithms",
    "Software Engineering", "Machine Learning", "Deep Learning", "NLP",
    "Generative AI", "Model Deployment", "MLOps",
)

GENERAL_SKILL = "General"


def topic_key(topic):
    return " ".join(str(topic or "").split()).lower()


def clean_topic(topic):
    topic = " ".join(str(topic or "").split())
    return topic[:60] or "General Concepts"


def canonical_skill(skill):
    wanted = str(skill or "").strip().lower()
    for name in CANONICAL_SKILLS:
        if name.lower() == wanted:
            return name
    return GENERAL_SKILL


def canonical_difficulty(value, default="medium"):
    value = str(value or "").strip().lower()
    return value if value in DIFFICULTIES else default


def _extract_json_array(text):
    text = re.sub(r"```(?:json)?", "", str(text))
    start, end = text.find("["), text.rfind("]")
    if start == -1 or end <= start:
        raise ValueError("no JSON array found")
    return json.loads(text[start:end + 1])


def _resolve_answer(answer, options):
    """Return the answer as the exact option text, or None if it can't be resolved."""
    answer = str(answer or "").strip()
    if answer in options:
        return answer
    letter = re.match(r"^\(?([A-Da-d])[\).:]?$", answer)
    if letter and ord(letter.group(1).upper()) - 65 < len(options):
        return options[ord(letter.group(1).upper()) - 65]
    for option in options:
        if option.lower() == answer.lower():
            return option
    return None


def parse_quiz(text, default_difficulty="medium"):
    """Parse the LLM quiz output into validated, tagged questions.

    Raises ValueError when nothing usable is found.
    """
    raw = _extract_json_array(text)
    questions = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        options = [str(o).strip() for o in item.get("options", []) if str(o).strip()]
        question = str(item.get("question", "")).strip()
        answer = _resolve_answer(item.get("answer"), options)
        if not question or len(options) < 2 or answer is None:
            continue
        questions.append({
            "question": question,
            "options": options,
            "answer": answer,
            "topic": clean_topic(item.get("topic")),
            "skill": canonical_skill(item.get("skill")),
            "difficulty": canonical_difficulty(item.get("difficulty"), default_difficulty),
        })
    if not questions:
        raise ValueError("no valid questions")
    return questions
