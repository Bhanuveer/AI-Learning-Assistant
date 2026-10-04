from fastapi import (
    APIRouter,
    Depends
)

from app.models.learning_models import (
    AdaptiveRequest
)
from app.services.adaptive_assessment_service import (
    build_plan,
    create_adaptive_assessment
)
from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/assessment",
    tags=["Adaptive Assessment"]
)


@router.get("/plan")
def plan(
    current_user = Depends(
        get_current_user
    )
):

    return build_plan(
        current_user["email"]
    )


@router.post("/adaptive")
def adaptive(
    request: AdaptiveRequest,
    current_user = Depends(
        get_current_user
    )
):

    return create_adaptive_assessment(
        current_user["email"],
        request.file_name
    )
