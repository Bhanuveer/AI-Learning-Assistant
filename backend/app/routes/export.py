import os

from fastapi import (
    APIRouter,
    HTTPException
)
from fastapi.responses import (
    FileResponse
)

from app.services.notes_service import (
    generate_notes
)
from app.services.pdf_service import (
    create_notes_pdf
)

router = APIRouter(
    prefix="/export",
    tags=["Export"]
)


@router.get(
    "/notes/{file_name}"
)
def export_notes(
    file_name: str
):

    notes_response = generate_notes(
        file_name
    )

    if not notes_response["success"]:

        raise HTTPException(
            status_code=404,
            detail=notes_response["message"]
        )

    safe_file_name = os.path.basename(
        file_name
    )

    pdf_path = os.path.join(
        "exports",
        f"{safe_file_name}.pdf"
    )

    create_notes_pdf(
        pdf_path,
        notes_response["notes"]
    )

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{safe_file_name}-notes.pdf"
    )
