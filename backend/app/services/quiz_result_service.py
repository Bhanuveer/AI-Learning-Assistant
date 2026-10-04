from datetime import datetime

from app.database.mongodb import db

from app.services.learner_state_service import (
    record_question_attempts,
    refresh_learner_state
)


def save_quiz_result(

    current_user,

    file_name,

    score,

    total,

    answers=None,

    difficulty=None,

    mode="standard"

):

    quiz_collection = (
        db["quiz_attempts"]
    )

    inserted = quiz_collection.insert_one(

        {

            "user_email":
            current_user["email"],

            "file_name":
            file_name,

            "score":
            score,

            "total":
            total,

            "difficulty":
            difficulty,

            "mode":
            mode,

            "answers_recorded":
            bool(answers),

            "date":
            datetime.now()

        }

    )

    if answers:

        record_question_attempts(
            current_user["email"],
            file_name,
            "adaptive" if mode == "adaptive" else "quiz",
            str(inserted.inserted_id),
            [a.model_dump() for a in answers]
        )

        refresh_learner_state(
            current_user["email"]
        )

    return {

        "success": True,

        "message":
        "Quiz Result Saved"

    }
