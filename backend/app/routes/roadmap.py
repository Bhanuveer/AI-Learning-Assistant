from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from app.models.learning_models import (
    RoadmapCompleteRequest
)
from app.services.roadmap_service import (
    complete_item,
    get_roadmap
)
from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/roadmap",
    tags=["Roadmap"]
)


@router.get("")
def roadmap(
    current_user = Depends(
        get_current_user
    )
):

    return get_roadmap(
        current_user["email"]
    )


@router.post("/action/complete")
def complete(
    request: RoadmapCompleteRequest,
    current_user = Depends(
        get_current_user
    )
):

    result = complete_item(
        current_user["email"],
        request.item_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Roadmap item not found"
        )

    if "error" in result:

        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )

    return result
