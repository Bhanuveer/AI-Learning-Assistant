"""Learner State: derives topic / skill mastery from stored question attempts.

Source of truth is the `question_attempts` collection. Nothing here is
hardcoded: every number comes from the learner's own recorded activity.
`learner_state` and `topic_performance` are persisted snapshots refreshed
whenever new evidence arrives.
"""

from collections import defaultdict
from datetime import datetime

from app.database.mongodb import db
from app.services.topic_service import (
    GENERAL_SKILL,
    canonical_difficulty,
    canonical_skill,
    clean_topic,
    topic_key,
)

DECAY = 0.85                      # each older attempt counts 15% less
DIFFICULTY_WEIGHT = {"easy": 0.8, "medium": 1.0, "hard": 1.2}
WEAK_BELOW = 50
PRACTICE_BELOW = 70
STRONG_FROM = 85
TREND_DELTA = 10
MIN_CONFIDENT_ATTEMPTS = 3
RECENT_WINDOW = 5
PRIOR_WEIGHT = 1.0                # neutral 50% prior: one answer can't give 0% or 100%
PRIOR_SCORE = 0.5


def classify(mastery):
    if mastery >= STRONG_FROM:
        return "Strong"
    if mastery >= PRACTICE_BELOW:
        return "Good"
    if mastery >= WEAK_BELOW:
        return "Needs Practice"
    return "Weak"


def weighted_mastery(attempts):
    """Recency- and difficulty-weighted score (0-100) for chronologically ordered attempts.

    A small neutral prior keeps tiny samples from producing extreme scores; its
    influence fades as more attempts are recorded.
    """
    if not attempts:
        return None
    total, weight_sum = PRIOR_WEIGHT * PRIOR_SCORE, PRIOR_WEIGHT
    for age, attempt in enumerate(reversed(attempts)):
        weight = (DECAY ** age) * DIFFICULTY_WEIGHT.get(attempt.get("difficulty"), 1.0)
        total += weight * attempt["score"]
        weight_sum += weight
    return round(total / weight_sum * 100, 1)


def trend_of(attempts):
    if len(attempts) < 4:
        return "not enough data"
    half = len(attempts) // 2
    older = sum(a["score"] for a in attempts[:half]) / half
    recent = sum(a["score"] for a in attempts[half:]) / (len(attempts) - half)
    delta = (recent - older) * 100
    if delta >= TREND_DELTA:
        return "improving"
    if delta <= -TREND_DELTA:
        return "declining"
    return "steady"


# ---------------------------------------------------------------- storage

def record_question_attempts(user_email, file_name, source, attempt_id, answers):
    """Persist question-level results. `answers` items need question/topic/skill/
    difficulty plus either (selected, correct_answer) or a fractional `score`."""
    now = datetime.now()
    docs = []
    for item in answers:
        if "score" in item and item["score"] is not None:
            score = max(0.0, min(1.0, float(item["score"])))
        else:
            score = 1.0 if item.get("selected") == item.get("correct_answer") else 0.0
        topic = clean_topic(item.get("topic"))
        docs.append({
            "user_email": user_email,
            "file_name": file_name,
            "source": source,
            "quiz_attempt_id": attempt_id,
            "question": str(item.get("question", ""))[:500],
            "topic": topic,
            "topic_key": topic_key(topic),
            "skill": canonical_skill(item.get("skill")),
            "difficulty": canonical_difficulty(item.get("difficulty")),
            "selected": item.get("selected"),
            "correct_answer": item.get("correct_answer"),
            "score": score,
            "date": now,
        })
    if docs:
        db["question_attempts"].insert_many(docs)
    return len(docs)


def load_attempts(user_email):
    return list(db["question_attempts"].find({"user_email": user_email}).sort("date", 1))


def _completions(user_email):
    return list(db["roadmap_completions"].find({"user_email": user_email}))


# ----------------------------------------------------------- topic level

def _topic_reason(topic, mastery, status, attempts):
    n = len(attempts)
    recent = attempts[-RECENT_WINDOW:]
    wrong = sum(1 for a in recent if a["score"] < 0.5)
    last = f"the last {len(recent)} item(s)" if len(recent) > 1 else "the only item"
    base = (f"{topic} is classified as {status} because the recency-weighted score "
            f"across your {n} recorded {topic} item(s) is {mastery}%")
    if status == "Weak":
        base += f" (below the {WEAK_BELOW}% threshold); {wrong} of {last} answered incorrectly."
    elif status == "Needs Practice":
        base += f" (between {WEAK_BELOW}% and {PRACTICE_BELOW}%); {wrong} of {last} answered incorrectly."
    else:
        base += f" (at or above {PRACTICE_BELOW}%)."
    if n < MIN_CONFIDENT_ATTEMPTS:
        base += f" Confidence is low: only {n} data point(s) so far."
    return base


def compute_topic_performance(user_email, attempts=None):
    attempts = load_attempts(user_email) if attempts is None else attempts
    completions = _completions(user_email)

    grouped = defaultdict(list)
    for attempt in attempts:
        grouped[attempt["topic_key"]].append(attempt)

    results = []
    for key, items in grouped.items():
        mastery = weighted_mastery(items)
        status = classify(mastery)
        display = items[-1]["topic"]
        skill = items[-1]["skill"]
        last_date = items[-1]["date"]

        question_misses = defaultdict(int)
        for a in items:
            if a["score"] < 0.5:
                question_misses[a["question"]] += 1
        repeated = [q for q, c in question_misses.items() if c >= 2]

        revised = any(
            c.get("topic_key") == key and c["date"] > last_date and c.get("action") in ("READ", "REVISE")
            for c in completions
        )
        topic_trend = trend_of(items)
        reason = _topic_reason(display, mastery, status, items)
        if topic_trend in ("improving", "declining"):
            reason += f" Performance is {topic_trend} compared with earlier attempts."
        if repeated:
            reason += f" {len(repeated)} question(s) were missed more than once."

        results.append({
            "topic": display,
            "topic_key": key,
            "skill": skill,
            "mastery": mastery,
            "status": status,
            "attempts": len(items),
            "correct": sum(1 for a in items if a["score"] >= 0.5),
            "wrong": sum(1 for a in items if a["score"] < 0.5),
            "confidence": "low" if len(items) < MIN_CONFIDENT_ATTEMPTS else "ok",
            "trend": topic_trend,
            "recent_results": [round(a["score"], 2) for a in items[-RECENT_WINDOW:]],
            "repeated_mistakes": repeated,
            "last_practiced": last_date.isoformat(),
            "revised_since_last_attempt": revised,
            "files": sorted({a["file_name"] for a in items if a.get("file_name")}),
            "reason": reason,
        })
    results.sort(key=lambda t: t["mastery"])
    return results


# ----------------------------------------------------------- skill level

def compute_skill_mastery(attempts):
    grouped = defaultdict(list)
    for attempt in attempts:
        if attempt["skill"] != GENERAL_SKILL:
            grouped[attempt["skill"]].append(attempt)
    skills = []
    for skill, items in grouped.items():
        mastery = weighted_mastery(items)
        skills.append({
            "skill": skill,
            "mastery": mastery,
            "status": classify(mastery),
            "attempts": len(items),
            "topics": len({a["topic_key"] for a in items}),
            "trend": trend_of(items),
        })
    skills.sort(key=lambda s: s["mastery"], reverse=True)
    return skills


# ------------------------------------------------------------ full state

def get_learner_state(user_email):
    attempts = load_attempts(user_email)
    topics = compute_topic_performance(user_email, attempts)
    skills = compute_skill_mastery(attempts)

    quiz_attempts = list(db["quiz_attempts"].find({"user_email": user_email}).sort("date", 1))
    history = [
        {
            "attempt": i + 1,
            "percentage": round(q["score"] / q["total"] * 100, 1) if q.get("total") else 0,
            "file_name": q.get("file_name"),
            "difficulty": q.get("difficulty"),
            "date": q["date"].isoformat() if q.get("date") else None,
        }
        for i, q in enumerate(quiz_attempts)
    ]

    rated = [t for t in topics if t["attempts"] >= 2] or topics
    strengths = sorted((t for t in rated if t["status"] in ("Good", "Strong")),
                       key=lambda t: t["mastery"], reverse=True)[:3]
    gaps = [t for t in topics if t["status"] in ("Weak", "Needs Practice")]

    if skills:
        overall = round(sum(s["mastery"] for s in skills) / len(skills), 1)
    elif history:
        overall = round(sum(h["percentage"] for h in history) / len(history), 1)
    else:
        overall = None

    by_file = defaultdict(set)
    for a in attempts:
        if a.get("file_name"):
            by_file[a["file_name"]].add(a["topic"])

    documents = [d["file_name"] for d in db["documents"].find({"user_email": user_email}, {"file_name": 1})]

    return {
        "has_data": bool(attempts),
        "overall_progress": overall,
        "skills": skills,
        "topics": topics,
        "strengths": [{"topic": t["topic"], "mastery": t["mastery"], "skill": t["skill"]} for t in strengths],
        "gaps": [{"topic": t["topic"], "mastery": t["mastery"], "status": t["status"], "skill": t["skill"]} for t in gaps],
        "recent_assessment": history[-1] if history else None,
        "progress_trend": history,
        "document_topics": {name: sorted(topics_) for name, topics_ in by_file.items()},
        "documents": documents,
        "legacy_attempts_without_topics": sum(1 for q in quiz_attempts if not q.get("answers_recorded")),
        "totals": {
            "questions_answered": len(attempts),
            "quizzes_taken": len(quiz_attempts),
            "topics_tracked": len(topics),
        },
    }


def refresh_learner_state(user_email):
    """Recompute and persist snapshots; call after any new evidence."""
    state = get_learner_state(user_email)
    now = datetime.now()
    for t in state["topics"]:
        db["topic_performance"].update_one(
            {"user_email": user_email, "topic_key": t["topic_key"]},
            {"$set": {**{k: v for k, v in t.items() if k != "reason"}, "user_email": user_email, "updated_at": now}},
            upsert=True,
        )
    db["learner_state"].update_one(
        {"user_email": user_email},
        {"$set": {
            "user_email": user_email,
            "overall_progress": state["overall_progress"],
            "skills": state["skills"],
            "strengths": state["strengths"],
            "gaps": state["gaps"],
            "totals": state["totals"],
            "updated_at": now,
        }},
        upsert=True,
    )
    return state
