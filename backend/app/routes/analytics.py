from fastapi import (
    APIRouter,
    Depends
)

from app.utils.auth import (
    get_current_user
)

from app.services.analytics_service import (
    get_analytics
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/")
def analytics(

    file_name: str | None = None,

    current_user = Depends(
        get_current_user
    )

):

    return get_analytics(
        current_user,
        file_name
    )
