from app.database.mongodb import db


def get_analytics(
    current_user,
    file_name=None
):

    quiz_collection = (
        db["quiz_attempts"]
    )

    query = {
        "user_email":
        current_user["email"]
    }

    if file_name:

        query["file_name"] = (
            file_name
        )

    attempts = list(
        quiz_collection.find(
            query
        ).sort(
            "date",
            1
        )
    )

    if not attempts:

        return {

            "total_quizzes": 0,

            "average_score": 0,

            "best_score": 0,

            "recent_attempts": [],

            "history": []

        }

    total_quizzes = len(
        attempts
    )

    scores = [

        (
            attempt["score"]
            /
            attempt["total"]
        ) * 100

        for attempt
        in attempts

    ]

    average_score = round(
        sum(scores)
        / len(scores),
        2
    )

    best_score = round(
        max(scores),
        2
    )

    return {

        "total_quizzes":
        total_quizzes,

        "average_score":
        average_score,

        "best_score":
        best_score,

        "recent_attempts":
        [
            {
                "file_name":
                attempt["file_name"],

                "score":
                attempt["score"],

                "total":
                attempt["total"]
            }

            for attempt
            in attempts[-5:]
        ],

        "history":
        [
            {
                "attempt": i + 1,
                "percentage": round(
                    (attempts[i]["score"] / attempts[i]["total"]) * 100,
                    2
                )
            }

            for i
            in range(len(attempts))
        ]

    }
