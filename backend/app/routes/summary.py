from fastapi import APIRouter

from app.models.summary_model import (
    SummaryRequest
)

from app.services.summary_service import (
    generate_summary
)

router = APIRouter(
    prefix="/summary",
    tags=["Summary"]
)


@router.post("/")
def summary(
    request: SummaryRequest
):

    return generate_summary(
        request.file_name
    )