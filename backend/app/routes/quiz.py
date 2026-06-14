from fastapi import APIRouter

from app.models.quiz_model import (
    QuizRequest
)

from app.services.quiz_service import (
    generate_quiz
)

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

@router.post("/")
def quiz(
    request: QuizRequest
):

    return generate_quiz(
        request.file_name
    )