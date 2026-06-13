from fastapi import APIRouter
from fastapi import Depends

from app.utils.auth import (
    get_current_user
)

from app.services.profile_service import (
    get_profile_data
)

from app.models.user_model import (
    UserRegister,
    UserLogin
)

from app.services.auth_service import (
    register_user,
    login_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(
    user: UserRegister
):

    return register_user(
        user
    )

@router.post("/login")
def login(
    user: UserLogin
):

    return login_user(
        user
    )

@router.get("/profile")
def profile(

    current_user = Depends(
        get_current_user
    )

):

    return get_profile_data(
        current_user["email"]
    )



@router.get("/me")
def me(

    current_user = Depends(
        get_current_user
    )

):
    return current_user