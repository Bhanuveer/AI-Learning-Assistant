from fastapi import HTTPException

from app.database.mongodb import db
from app.utils.hash import (
    hash_password,
    verify_password
)
from app.utils.jwt_handler import (
    create_access_token
)

def register_user(user_data):

    users_collection = db["users"]

    existing_user = (
        users_collection.find_one(
            {
                "email":
                user_data.email
            }
        )
    )

    if existing_user:

        return {
            "success": False,
            "message":
            "Email already exists"
        }

    hashed_password = (
        hash_password(
            user_data.password
        )
    )

    user_document = {

        "name":
        user_data.name,

        "email":
        user_data.email,

        "password":
        hashed_password

    }

    users_collection.insert_one(
        user_document
    )

    return {
        "success": True,
        "message":
        "User Registered Successfully"
    }


def login_user(user_data):

    users_collection = db["users"]

    user = (
        users_collection.find_one(
            {
                "email":
                user_data.email
            }
        )
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    is_valid = verify_password(
        user_data.password,
        user["password"]
    )

    if not is_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    token = create_access_token(
        {
            "email":
            user["email"]
        }
    )

    return {

        "success": True,

        "access_token":
        token

    }
