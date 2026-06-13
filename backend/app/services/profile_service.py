from app.database.mongodb import db

def get_profile_data(
    email
):

    users_collection = db["users"]

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not user:

        return {
            "success": False,
            "message": "User Not Found"
        }

    return {

        "success": True,

        "name":
        user["name"],

        "email":
        user["email"]

    }