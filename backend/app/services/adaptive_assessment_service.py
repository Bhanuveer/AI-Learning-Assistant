"""Adaptive assessment: picks difficulty and focus from learner state, then reuses the quiz generator."""

import json

from app.database.mongodb import db
from app.services.learner_state_service import get_learner_state
from app.services.quiz_service import generate_quiz

LEVELS = ["easy", "medium", "hard"]


def build_plan(user_email):
    state = get_learner_state(user_email)
    recent = state["progress_trend"][-3:]
    previous = round(sum(r["percentage"] for r in recent) / len(recent), 1) if recent else None

    focus_topics = [t for t in state["topics"] if t["status"] in ("Weak", "Needs Practice")][:3]
    last_difficulty = next((r["difficulty"] for r in reversed(state["progress_trend"]) if r.get("difficulty")), None)
    current = last_difficulty if last_difficulty in LEVELS else "medium"

    if previous is None:
        target, rationale = "medium", "No previous assessment; starting at medium difficulty."
    elif previous < 50:
        target = "easy" if current in ("easy", "medium") else "medium"
        rationale = (f"Recent average is {previous}% (below 50%), so difficulty drops and the quiz "
                     f"focuses on your weak concepts.")
    elif previous < 75:
        target = "medium"
        rationale = f"Recent average is {previous}%, so difficulty stays at medium while gaps are reinforced."
    else:
        target = LEVELS[min(2, LEVELS.index(current) + 1)]
        rationale = f"Recent average is {previous}% (75% or above), so difficulty increases."

    return {
        "previous_score": previous,
        "previous_difficulty": last_difficulty,
        "difficulty": target,
        "detected_gaps": [t["topic"] for t in focus_topics],
        "focus": [t["topic"] for t in focus_topics] or ["No gaps detected: broad coverage"],
        "focus_topics": [t["topic"] for t in focus_topics],
        "rationale": rationale,
        "unlocks_practical": previous is not None and previous >= 75,
    }


def create_adaptive_assessment(user_email, file_name):
    plan = build_plan(user_email)
    result = generate_quiz(file_name, user_email, plan["difficulty"], plan["focus_topics"] or None)

    if not result.get("success"):
        return result

    db["adaptive_plans"].insert_one({"user_email": user_email, "file_name": file_name, **plan})

    return {"success": True, "plan": plan, "quiz": result["quiz"]}
