from fastapi import APIRouter, FastAPI
from pydantic import BaseModel
from services.login_service import validate_user_account

router = APIRouter(prefix="")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    login_service = validate_user_account(request.email, request.password)
    
    if not login_service:
        return {"success": False, "message": "Invalid credentials"}
    
    return {"success": True, "message": "Login successful", "user": login_service}