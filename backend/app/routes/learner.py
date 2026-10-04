from fastapi import (
    APIRouter,
    Depends
)

from app.services.learner_state_service import (
    get_learner_state
)
from app.services.skill_gap_service import (
    analyze_gaps
)
from app.services.next_best_action_engine import (
    get_next_actions
)
from app.services.skill_evidence_service import (
    compute_evidence
)
from app.services.career_service import (
    get_target,
    role_gaps
)
from app.services.roadmap_service import (
    get_roadmap
)
from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/learner",
    tags=["Learner Intelligence"]
)


@router.get("/state")
def state(
    current_user = Depends(
        get_current_user
    )
):

    return get_learner_state(
        current_user["email"]
    )


@router.get("/skills")
def skills(
    current_user = Depends(
        get_current_user
    )
):

    return {
        "skills": get_learner_state(
            current_user["email"]
        )["skills"]
    }


@router.get("/gaps")
def gaps(
    current_user = Depends(
        get_current_user
    )
):

    return analyze_gaps(
        current_user["email"]
    )


@router.get("/next-action")
def next_action(
    explain: bool = False,
    current_user = Depends(
        get_current_user
    )
):

    return get_next_actions(
        current_user["email"],
        explain=explain
    )


@router.get("/overview")
def overview(
    current_user = Depends(
        get_current_user
    )
):
    """One call that feeds the dashboard's Learner Overview."""

    email = current_user["email"]

    state = get_learner_state(email)
    evidence = compute_evidence(email)
    role = get_target(email)
    roadmap = get_roadmap(email)

    return {
        "state": state,
        "gaps": analyze_gaps(email, state),
        "next": get_next_actions(email),
        "evidence": evidence,
        "target_role": role,
        "career_gap": role_gaps(email, role, evidence) if role else None,
        "roadmap": roadmap
    }
