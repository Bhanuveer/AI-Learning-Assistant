from fastapi import (APIRouter, Depends)
from app.models.chat_model import (ChatRequest)
from app.services.chat_service import (ask_question)
from app.utils.auth import (get_current_user)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/")
def chat(

    request: ChatRequest,

    current_user = Depends(
        get_current_user
    )

):

    return ask_question(
        request.file_name,
        request.question,
        current_user
    )