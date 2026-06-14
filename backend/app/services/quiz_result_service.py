from datetime import datetime

from app.database.mongodb import db


def save_quiz_result(

    current_user,

    file_name,

    score,

    total

):

    quiz_collection = (
        db["quiz_attempts"]
    )

    quiz_collection.insert_one(

        {

            "user_email":
            current_user["email"],

            "file_name":
            file_name,

            "score":
            score,

            "total":
            total,

            "date":
            datetime.now()

        }

    )

    return {

        "success": True,

        "message":
        "Quiz Result Saved"

    }