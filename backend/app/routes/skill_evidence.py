from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.models.learning_models import (
    PracticalSubmission
)
from app.services.skill_evidence_service import (
    compute_evidence,
    list_tasks,
    recent_submissions,
    submit_practical
)
from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/skill-evidence",
    tags=["Skill Evidence"]
)


@router.get("")
def evidence(
    current_user = Depends(
        get_current_user
    )
):

    email = current_user["email"]

    return {
        **compute_evidence(email),
        "recent_submissions": recent_submissions(email)
    }


@router.get("/tasks")
def tasks(
    skill: Optional[str] = None,
    current_user = Depends(
        get_current_user
    )
):

    return {
        "tasks": list_tasks(skill)
    }


@router.post("")
def submit(
    request: PracticalSubmission,
    current_user = Depends(
        get_current_user
    )
):

    result = submit_practical(
        current_user["email"],
        request.task_id,
        request.code
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return result
