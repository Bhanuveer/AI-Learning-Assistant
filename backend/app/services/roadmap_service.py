"""Adaptive roadmap built from target role + skill gaps + learner state + evidence."""

from datetime import datetime

from app.database.mongodb import db
from app.services.career_service import catalog, get_target, role_gaps
from app.services.learner_state_service import get_learner_state, refresh_learner_state
from app.services.skill_evidence_service import compute_evidence, list_tasks
from app.services.topic_service import topic_key

EFFORT = {"REVISE": 2, "PRACTICE": 1, "ASSESS": 0.5, "VERIFY": 1}


def _depth(skill, cat, seen=()):
    prereqs = [p for p in cat.get(skill, {}).get("prerequisites", []) if p not in seen]
    return 0 if not prereqs else 1 + max(_depth(p, cat, seen + (skill,)) for p in prereqs)


def _completed_ids(user_email):
    return {c["item_id"] for c in db["roadmap_completions"].find({"user_email": user_email}, {"item_id": 1})}


def _build_items(user_email):
    role = get_target(user_email)
    if not role:
        return role, [], None

    evidence = compute_evidence(user_email)
    gaps = role_gaps(user_email, role, evidence)
    state = get_learner_state(user_email)
    cat = catalog()
    by_skill_ev = {e["skill"]: e for e in evidence["skills"]}
    topics_by_skill = {}
    for t in state["topics"]:
        topics_by_skill.setdefault(t["skill"], []).append(t)

    items = []
    ordered = sorted(gaps["gaps"], key=lambda g: (_depth(g["skill"], cat), -g["gap"]))
    for g in ordered:
        skill = g["skill"]
        chain_start = len(items)
        prereq_skill = next((p for p in cat.get(skill, {}).get("prerequisites", [])
                             if any(x["skill"] == p for x in gaps["gaps"])), None)
        header = f"{g['skill']}: required {g['required']}%, current {g['current']}%"

        weak = [t for t in topics_by_skill.get(skill, []) if t["status"] in ("Weak", "Needs Practice")]
        for t in weak[:2]:
            action = "REVISE" if t["status"] == "Weak" and not t["revised_since_last_attempt"] else "PRACTICE"
            items.append({"id": f"{skill}|{action}|{t['topic_key']}", "action": action, "skill": skill,
                          "topic": t["topic"], "title": f"{'Revise' if action == 'REVISE' else 'Practice'} {t['topic']}",
                          "reason": t["reason"], "effort_hours": EFFORT[action]})

        if not topics_by_skill.get(skill):
            items.append({"id": f"{skill}|ASSESS", "action": "ASSESS", "skill": skill, "topic": None,
                          "title": f"Take a {skill} assessment",
                          "reason": f"No assessment data for {skill} yet. {header}.",
                          "effort_hours": EFFORT["ASSESS"]})

        ev = by_skill_ev.get(skill)
        if not (ev and ev["verified"]) and any(t["skill"] == skill for t in list_tasks()):
            items.append({"id": f"{skill}|VERIFY", "action": "VERIFY", "skill": skill, "topic": None,
                          "title": f"Complete a {skill} practical task",
                          "reason": f"Practical tasks verify {skill} beyond quiz answers. {header}.",
                          "effort_hours": EFFORT["VERIFY"], "auto_completes": True})

        project = cat.get(skill, {}).get("project")
        if project:
            items.append({"id": f"{skill}|PROJECT", "action": "BUILD_PROJECT", "skill": skill, "topic": None,
                          "title": project,
                          "reason": f"A project demonstrates {skill} end to end. {header}. (Self-reported; not counted as evidence.)",
                          "effort_hours": cat[skill]["effort_hours"], "self_reported": True})

        for i in range(chain_start, len(items)):
            items[i]["prerequisite"] = (items[i - 1]["title"] if i > chain_start
                                        else (f"Reach required level in {prereq_skill}" if prereq_skill else None))
    return role, items, gaps


def get_roadmap(user_email):
    role, items, gaps = _build_items(user_email)
    if not role:
        return {"target_role": None, "items": [], "message": "Select a target role to generate your roadmap."}

    done = _completed_ids(user_email)
    current_assigned = False
    for order, item in enumerate(items, start=1):
        item["order"] = order
        if item["id"] in done:
            item["status"] = "completed"
        elif not current_assigned:
            item["status"], current_assigned = "current", True
        else:
            item["status"] = "upcoming"
        item.setdefault("prerequisite", None)

    return {
        "target_role": role,
        "readiness": gaps["readiness"],
        "items": items,
        "total_effort_hours": round(sum(i["effort_hours"] for i in items if i["status"] != "completed"), 1),
        "notice": gaps["notice"],
    }


def complete_item(user_email, item_id):
    _, items, _ = _build_items(user_email)
    item = next((i for i in items if i["id"] == item_id), None)
    if not item:
        return None
    if item.get("auto_completes"):
        return {"error": "Verification tasks complete automatically when you pass a practical task."}

    db["roadmap_completions"].update_one(
        {"user_email": user_email, "item_id": item_id},
        {"$set": {
            "user_email": user_email, "item_id": item_id, "action": item["action"],
            "skill": item["skill"], "topic": item["topic"],
            "topic_key": topic_key(item["topic"]) if item["topic"] else None,
            "self_reported": True, "date": datetime.now(),
        }},
        upsert=True,
    )
    refresh_learner_state(user_email)
    return get_roadmap(user_email)
