from pydantic import BaseModel

class QuizRequest(
    BaseModel
):

    file_name: str