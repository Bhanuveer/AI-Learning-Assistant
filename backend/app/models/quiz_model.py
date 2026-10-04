from typing import Optional

from pydantic import BaseModel


class QuizRequest(
    BaseModel
):

    file_name: str
    difficulty: Optional[str] = None
    focus_topics: Optional[list[str]] = None
