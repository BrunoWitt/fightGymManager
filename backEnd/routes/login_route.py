from fastapi import APIRouter, FastAPI
from pydantic import BaseModel
from backEnd.services.login_service import validate_user_account

router = APIRouter(prefix="")

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    login_service = validate_user_account()
    return login_service.validate_user_account(request.username, request.password)