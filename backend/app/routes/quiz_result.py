from fastapi import (
    APIRouter,
    Depends
)

from app.models.quiz_submit_model import (
    QuizSubmitRequest
)

from app.services.quiz_result_service import (
    save_quiz_result
)

from app.utils.auth import (
    get_current_user
)

router = APIRouter(

    prefix="/quiz-result",

    tags=["Quiz Result"]

)


@router.post("/")
def submit_quiz(

    request: QuizSubmitRequest,

    current_user = Depends(
        get_current_user
    )

):

    return save_quiz_result(

        current_user,

        request.file_name,

        request.score,

        request.total

    )