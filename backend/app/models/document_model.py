from pydantic import BaseModel

class DocumentResponse(
    BaseModel
):

    success: bool

    message: str