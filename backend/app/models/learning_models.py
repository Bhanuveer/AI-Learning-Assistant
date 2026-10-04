from pydantic import BaseModel, Field


class AdaptiveRequest(
    BaseModel
):

    file_name: str = Field(min_length=1)


class PracticalSubmission(
    BaseModel
):

    task_id: str = Field(min_length=1, max_length=60)
    code: str = Field(min_length=1, max_length=5000)


class TargetRoleRequest(
    BaseModel
):

    role: str = Field(min_length=1, max_length=60)


class RoadmapCompleteRequest(
    BaseModel
):

    item_id: str = Field(min_length=1, max_length=200)
