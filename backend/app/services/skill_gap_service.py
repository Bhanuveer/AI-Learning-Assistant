"""Skill Gap Engine: explains which topics are weak and why, from learner state."""

from app.services.learner_state_service import (
    PRACTICE_BELOW,
    WEAK_BELOW,
    get_learner_state,
)


def analyze_gaps(user_email, state=None):
    state = state or get_learner_state(user_email)
    topics = state["topics"]

    gaps = [t for t in topics if t["status"] in ("Weak", "Needs Practice")]
    gaps.sort(key=lambda t: t["mastery"])

    revision = [
        t for t in topics
        if t["status"] == "Weak"
        or t["repeated_mistakes"]
        or (t["trend"] == "declining" and t["status"] != "Strong")
    ]

    return {
        "has_data": state["has_data"],
        "thresholds": {
            "weak_below": WEAK_BELOW,
            "needs_practice_below": PRACTICE_BELOW,
            "method": ("Recency-weighted accuracy per topic: recent answers count more, harder "
                       "questions count slightly more, and a neutral prior keeps single answers "
                       "from giving extreme scores."),
        },
        "gaps": gaps,
        "weakest": topics[:3],
        "strongest": list(reversed(topics[-3:])),
        "needs_revision": revision,
        "all_topics": topics,
    }
