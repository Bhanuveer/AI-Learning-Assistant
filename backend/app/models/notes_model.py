from pydantic import BaseModel

class NotesRequest(
    BaseModel
):

    file_name: str