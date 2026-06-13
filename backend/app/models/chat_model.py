from pydantic import (
    BaseModel
)

class ChatRequest(
    BaseModel
):

    file_name: str

    question: str