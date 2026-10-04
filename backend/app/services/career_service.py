"""Career skill mapping over a small internal PROTOTYPE dataset (data/career_roles.json)."""

import json
import os
from datetime import datetime

from app.database.mongodb import db
from app.services.skill_evidence_service import compute_evidence

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "career_roles.json")

DATA_NOTICE = ("Prototype data: role requirements are hand-written illustrations, "
               "not taken from real job postings.")


def _dataset():
    with open(_DATA_PATH) as f:
        return json.load(f)


def catalog():
    return _dataset()["skills_catalog"]


def list_roles():
    roles = _dataset()["roles"]
    return {
        "notice": DATA_NOTICE,
        "roles": [{"role": r, "description": v["description"], "skill_count": len(v["skills"])} for r, v in roles.items()],
    }


def _resolve_role(role):
    roles = _dataset()["roles"]
    return next((name for name in roles if name.lower() == role.strip().lower()), None)


def role_skills(role):
    name = _resolve_role(role)
    if not name:
        return None
    data = _dataset()["roles"][name]
    return {
        "role": name,
        "description": data["description"],
        "notice": DATA_NOTICE,
        "skills": [
            {"skill": s, "required": level, "prerequisites": catalog().get(s, {}).get("prerequisites", [])}
            for s, level in data["skills"].items()
        ],
    }


def get_target(user_email):
    doc = db["user_career"].find_one({"user_email": user_email})
    return doc["role"] if doc else None


def set_target(user_email, role):
    name = _resolve_role(role)
    if not name:
        return None
    db["user_career"].update_one(
        {"user_email": user_email},
        {"$set": {"user_email": user_email, "role": name, "updated_at": datetime.now()}},
        upsert=True,
    )
    return name


def role_gaps(user_email, role, evidence=None):
    spec = role_skills(role)
    if not spec:
        return None
    evidence = evidence or compute_evidence(user_email)
    by_skill = {e["skill"]: e for e in evidence["skills"]}

    rows, coverage = [], []
    for item in spec["skills"]:
        ev = by_skill.get(item["skill"])
        current = ev["evidence_score"] if ev else 0
        required = item["required"]
        gap = max(0, round(required - current, 1))
        coverage.append(min(current, required) / required)
        rows.append({
            "skill": item["skill"],
            "required": required,
            "current": current,
            "gap": gap,
            "has_evidence": ev is not None,
            "verified": bool(ev and ev["verified"]),
            "status": "Met" if gap == 0 else ("No evidence yet" if ev is None else "Gap"),
        })

    rows.sort(key=lambda r: r["gap"], reverse=True)
    return {
        "role": spec["role"],
        "notice": DATA_NOTICE,
        "readiness": round(sum(coverage) / len(coverage) * 100, 1) if coverage else 0,
        "skills": rows,
        "gaps": [r for r in rows if r["gap"] > 0],
    }
