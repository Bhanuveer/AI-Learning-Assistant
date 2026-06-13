from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends
)

from app.utils.auth import (
    get_current_user
)

from app.services.document_service import (
    save_document
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

@router.post("/upload")
def upload_document(

    file: UploadFile = File(...),

):

    return save_document(
        file,
        {
        "email":
        "test@gmail.com"
        }
    )