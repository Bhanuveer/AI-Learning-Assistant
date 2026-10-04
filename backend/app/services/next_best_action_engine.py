"""Next-Best-Action engine.

Decisions are rule based and derived from learner state. The LLM is only used
(optionally) to phrase an explanation; it never chooses the action.
"""

from datetime import datetime

from app.database.mongodb import db
from app.rag.chat_engine import llm
from app.services.learner_state_service import get_learner_state

PRIORITY_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class NextBestActionEngine:

    def __init__(self, user_email, state=None):
        self.user_email = user_email
        self.state = state or get_learner_state(user_email)

    def _has_practical(self, skill):
        return db["practical_submissions"].count_documents(
            {"user_email": self.user_email, "skill": skill, "score": {"$gte": 0.6}}
        ) > 0

    def _practice_since_last_attempt(self, topic_key):
        return db["roadmap_completions"].count_documents(
            {"user_email": self.user_email, "topic_key": topic_key, "action": "PRACTICE"}
        )

    def decide(self):
        state = self.state
        actions = []

        if not state["has_data"]:
            if state["documents"]:
                actions.append(self._action(
                    "ASSESS", state["documents"][0], "HIGH",
                    "No assessment results yet, so the system cannot tell what you know. "
                    "A first quiz creates your learner state.",
                    ["Open Quiz", "Complete all questions", "Submit to see your first diagnosis"]))
            else:
                actions.append(self._action(
                    "READ", "Your first document", "HIGH",
                    "No documents uploaded yet. Upload study material to start building your learner state.",
                    ["Upload a PDF on the Dashboard", "Read the generated summary", "Take a quiz"]))
            return actions

        topics = state["topics"]

        for t in sorted((t for t in topics if t["status"] == "Weak"), key=lambda t: t["mastery"]):
            if not t["revised_since_last_attempt"]:
                actions.append(self._action(
                    "REVISE", t["topic"], "HIGH", t["reason"],
                    [f"Revise {t['topic']} using your notes or chat", "Practice 5 questions",
                     f"Attempt an easier {t['topic']} assessment"], t))
            else:
                actions.append(self._action(
                    "PRACTICE", t["topic"], "HIGH",
                    f"You revised {t['topic']} after your last attempt; re-test it to check the gap has closed. "
                    f"Current score: {t['mastery']}%.",
                    ["Take an adaptive quiz focused on this topic"], t))

        for t in sorted((t for t in topics if t["status"] == "Needs Practice"), key=lambda t: t["mastery"]):
            actions.append(self._action(
                "PRACTICE", t["topic"], "MEDIUM", t["reason"],
                [f"Practice 5 {t['topic']} questions", "Attempt a medium-difficulty assessment"], t))

        for t in (x for x in topics if x["status"] in ("Good", "Strong") and x["attempts"] >= 2):
            if t["skill"] != "General" and not self._has_practical(t["skill"]):
                actions.append(self._action(
                    "BUILD_PROJECT", t["skill"], "MEDIUM",
                    f"Your {t['skill']} quiz results are solid ({t['topic']}: {t['mastery']}%) but there is "
                    f"no practical evidence yet. A practical task turns quiz knowledge into demonstrated skill.",
                    [f"Open Skill Evidence and complete a {t['skill']} task"], t))
                break

        for t in sorted((x for x in topics if x["status"] == "Strong"), key=lambda t: -t["mastery"])[:1]:
            actions.append(self._action(
                "ADVANCE", t["topic"], "LOW",
                f"{t['topic']} is a strength ({t['mastery']}%). Raise the difficulty to keep progressing.",
                ["Attempt a hard-difficulty assessment", "Move on to a connected advanced topic"], t))

        if not actions:
            actions.append(self._action(
                "ASSESS", "New material", "LOW",
                "No gaps detected. Assess more material to widen your learner state.",
                ["Take a quiz on another document"]))

        actions.sort(key=lambda a: PRIORITY_ORDER[a["priority"]])
        return actions

    @staticmethod
    def _action(action, topic, priority, reason, steps, topic_info=None):
        return {
            "action": action,
            "topic": topic,
            "skill": (topic_info or {}).get("skill"),
            "reason": reason,
            "priority": priority,
            "steps": steps,
        }


def get_next_actions(user_email, explain=False, persist=True):
    engine = NextBestActionEngine(user_email)
    actions = engine.decide()
    top = actions[0] if actions else None

    if top and explain:
        top["explanation"] = _explain(top)

    last = db["recommendations"].find_one({"user_email": user_email}, sort=[("created_at", -1)]) if persist and top else None
    changed = not last or (last["top"]["action"], last["top"]["topic"]) != (top["action"], top["topic"])

    if persist and top and changed:
        db["recommendations"].insert_one({
            "user_email": user_email,
            "created_at": datetime.now(),
            "top": top,
            "actions": actions[:5],
        })

    return {"next_action": top, "actions": actions[:5]}


def _explain(action):
    prompt = (
        "In 2 short sentences, tell a student why this learning step is the best next move. "
        "Use only these facts, do not invent numbers.\n"
        f"Action: {action['action']}\nTopic: {action['topic']}\nFacts: {action['reason']}"
    )
    try:
        return llm.invoke(prompt).content.strip()
    except Exception:
        return action["reason"]
