"""Skill Evidence: combines knowledge, quiz and practical results per skill.

This is *demonstrated skill* inside this app only. It is not a certification.
"""

import json
import os
from collections import defaultdict
from datetime import datetime

from app.database.mongodb import db
from app.services.code_runner import run_tests
from app.services.learner_state_service import (
    classify,
    load_attempts,
    record_question_attempts,
    refresh_learner_state,
    weighted_mastery,
)
from app.services.topic_service import GENERAL_SKILL

WEIGHTS = {"knowledge": 0.4, "quiz": 0.2, "practical": 0.4}
PASS_SCORE = 0.6
EFFICIENCY_SHARE = 0.2
DISCLAIMER = ("Skill Evidence reflects results inside this app only. "
              "It is not a professional certification.")

_TASKS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "practical_tasks.json")


def _all_tasks():
    with open(_TASKS_PATH) as f:
        return json.load(f)["tasks"]


def _find_task(task_id):
    return next((t for t in _all_tasks() if t["id"] == task_id), None)


def list_tasks(skill=None):
    tasks = []
    for t in _all_tasks():
        if skill and t["skill"].lower() != skill.lower():
            continue
        tasks.append({k: t[k] for k in ("id", "skill", "topic", "difficulty", "title", "prompt", "starter", "function")})
    return tasks


def score_submission(result):
    """Correctness (80%) + efficiency (20%); efficiency only applies when a perf test exists."""
    cases = result.get("cases", [])
    if not result.get("ok") or not cases:
        return 0.0, 0, len(cases)
    passed = sum(1 for c in cases if c["ok"])
    correctness = passed / len(cases)
    if correctness == 0:
        return 0.0, passed, len(cases)
    perf_ok = result.get("perf_ok")
    efficiency = 1.0 if perf_ok in (True, None) else 0.0
    return round((1 - EFFICIENCY_SHARE) * correctness + EFFICIENCY_SHARE * efficiency, 3), passed, len(cases)


def submit_practical(user_email, task_id, code):
    task = _find_task(task_id)
    if not task:
        return None

    result = run_tests(code, task["function"], task["tests"], task.get("float_tolerance", 0.0), task.get("perf_test"))
    score, passed, total = score_submission(result)

    db["practical_submissions"].insert_one({
        "user_email": user_email,
        "task_id": task_id,
        "skill": task["skill"],
        "topic": task["topic"],
        "code": code[:5000],
        "score": score,
        "passed": passed,
        "total": total,
        "perf_ok": result.get("perf_ok"),
        "error": result.get("error"),
        "date": datetime.now(),
    })

    record_question_attempts(user_email, None, "practical", task_id, [{
        "question": f"Practical: {task['title']}",
        "topic": task["topic"],
        "skill": task["skill"],
        "difficulty": task["difficulty"],
        "score": score,
    }])
    refresh_learner_state(user_email)

    failures = [
        {"input": task["tests"][i][0], "expected": task["tests"][i][1], "got": c.get("got"), "error": c.get("error")}
        for i, c in enumerate(result.get("cases", [])) if not c["ok"]
    ][:2]

    return {
        "task_id": task_id,
        "skill": task["skill"],
        "topic": task["topic"],
        "passed": passed,
        "total": total,
        "score": round(score * 100, 1),
        "perf_ok": result.get("perf_ok"),
        "error": result.get("error"),
        "sample_failures": failures,
        "verdict": "Passed" if score >= PASS_SCORE else "Not yet",
        "sandbox": "prototype-subprocess (not a hardened sandbox)",
        "evidence": next((e for e in compute_evidence(user_email)["skills"] if e["skill"] == task["skill"]), None),
    }


def compute_evidence(user_email):
    attempts = load_attempts(user_email)
    by_skill = defaultdict(list)
    for a in attempts:
        if a["skill"] != GENERAL_SKILL:
            by_skill[a["skill"]].append(a)

    submissions = list(db["practical_submissions"].find({"user_email": user_email}).sort("date", 1))
    best_by_task = defaultdict(dict)
    for s in submissions:
        best = best_by_task[s["skill"]].get(s["task_id"], 0)
        best_by_task[s["skill"]][s["task_id"]] = max(best, s["score"])

    skills = []
    for skill in sorted(set(by_skill) | set(best_by_task)):
        items = by_skill.get(skill, [])
        conceptual = [a for a in items if a["source"] != "practical"]
        quiz_items = [a for a in items if a["source"] in ("quiz", "adaptive")]

        components = {
            "knowledge": weighted_mastery(conceptual),
            "quiz": round(sum(a["score"] for a in quiz_items) / len(quiz_items) * 100, 1) if quiz_items else None,
            "practical": (round(sum(best_by_task[skill].values()) / len(best_by_task[skill]) * 100, 1)
                          if best_by_task.get(skill) else None),
        }
        available = {k: v for k, v in components.items() if v is not None}
        weight_sum = sum(WEIGHTS[k] for k in available)
        score = round(sum(WEIGHTS[k] * v for k, v in available.items()) / weight_sum, 1) if available else 0

        skills.append({
            "skill": skill,
            **components,
            "evidence_score": score,
            "level": classify(score),
            "verified": components["practical"] is not None,
            "tasks_completed": len(best_by_task.get(skill, {})),
            "basis": ("Verified by practical task(s)" if components["practical"] is not None
                      else "Quiz results only: complete a practical task to verify"),
        })
    skills.sort(key=lambda s: s["evidence_score"], reverse=True)
    return {"skills": skills, "weights": WEIGHTS, "disclaimer": DISCLAIMER}


def recent_submissions(user_email, limit=10):
    docs = db["practical_submissions"].find(
        {"user_email": user_email},
        {"_id": 0, "code": 0, "user_email": 0},
    ).sort("date", -1).limit(limit)
    return [{**d, "date": d["date"].isoformat()} for d in docs]
