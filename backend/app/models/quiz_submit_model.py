from pydantic import BaseModel


class QuizSubmitRequest(
    BaseModel
):

    file_name: str
    score: int  
    total: int