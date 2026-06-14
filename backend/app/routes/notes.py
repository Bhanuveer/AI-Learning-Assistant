from fastapi import APIRouter

from app.models.notes_model import (
    NotesRequest
)

from app.services.notes_service import (
    generate_notes
)

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.post("/")
def notes(
    request: NotesRequest
):

    return generate_notes(
        request.file_name
    )