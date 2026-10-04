from fastapi import (
    APIRouter,
    Depends
)

from app.models.quiz_model import (
    QuizRequest
)

from app.services.quiz_service import (
    generate_quiz
)

from app.utils.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

@router.post("/")
def quiz(
    request: QuizRequest,
    current_user = Depends(
        get_current_user
    )
):

    return generate_quiz(
        request.file_name,
        current_user["email"],
        request.difficulty,
        request.focus_topics
    )
