from typing import Optional

from pydantic import BaseModel, Field, model_validator


class QuizAnswer(
    BaseModel
):

    question: str
    topic: str = "General Concepts"
    skill: str = "General"
    difficulty: str = "medium"
    selected: Optional[str] = None
    correct_answer: str


class QuizSubmitRequest(
    BaseModel
):

    file_name: str
    score: int = Field(ge=0)
    total: int = Field(gt=0)

    # Optional so the original {file_name, score, total} payload still works.
    answers: Optional[list[QuizAnswer]] = None
    difficulty: Optional[str] = None
    mode: str = "standard"

    @model_validator(mode="after")
    def score_within_total(self):

        if self.score > self.total:
            raise ValueError("score cannot exceed total")

        return self
