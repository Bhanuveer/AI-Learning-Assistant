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
    save_document,
    get_documents,
    delete_document
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
def upload_document(

    file: UploadFile = File(...),

    current_user = Depends(
        get_current_user
    )

):

    return save_document(
        file,
        current_user
    )


@router.get("/")
def list_documents(

    current_user = Depends(
        get_current_user
    )

):

    return get_documents(
        current_user
    )


@router.delete("/{file_name}")
def remove_document(

    file_name: str,

    current_user = Depends(
        get_current_user
    )

):

    return delete_document(
        file_name,
        current_user
    )
