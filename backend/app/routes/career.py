from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.models.learning_models import (
    TargetRoleRequest
)
from app.services.career_service import (
    get_target,
    list_roles,
    role_gaps,
    role_skills,
    set_target
)
from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/career",
    tags=["Career"]
)


@router.get("/roles")
def roles(
    current_user = Depends(
        get_current_user
    )
):

    return list_roles()


@router.get("/target")
def target(
    current_user = Depends(
        get_current_user
    )
):

    return {
        "role": get_target(
            current_user["email"]
        )
    }


@router.post("/target")
def choose_target(
    request: TargetRoleRequest,
    current_user = Depends(
        get_current_user
    )
):

    role = set_target(
        current_user["email"],
        request.role
    )

    if role is None:

        raise HTTPException(
            status_code=404,
            detail="Unknown role"
        )

    return {
        "role": role
    }


@router.get("/{role}/skills")
def skills(
    role: str,
    current_user = Depends(
        get_current_user
    )
):

    result = role_skills(role)

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Unknown role"
        )

    return result


@router.get("/{role}/gaps")
def gaps(
    role: str,
    current_user = Depends(
        get_current_user
    )
):

    result = role_gaps(
        current_user["email"],
        role
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Unknown role"
        )

    return result
