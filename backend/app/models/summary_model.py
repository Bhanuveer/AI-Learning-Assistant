from pydantic import BaseModel

class SummaryRequest(
    BaseModel
):

    file_name: str