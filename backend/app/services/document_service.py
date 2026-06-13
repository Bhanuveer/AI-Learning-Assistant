import os

from app.database.mongodb import db


def save_document(
    file,
    current_user
):

    user_email = (
        current_user["email"]
    )

    user_folder = os.path.join(
        "uploads",
        user_email
    )

    os.makedirs(
        user_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        user_folder,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            file.file.read()
        )

    documents_collection = (
        db["documents"]
    )

    documents_collection.insert_one(
        {
            "user_email":
            user_email,

            "file_name":
            file.filename,

            "file_path":
            file_path
        }
    )

    return {
        "success": True,
        "message":
        "PDF Uploaded Successfully"
    }