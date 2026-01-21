from fastapi import APIRouter, FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt
import os
from pathlib import Path
from dotenv import load_dotenv

from services.login_service import validate_user_account
from services.login_service import get_current_user

router = APIRouter(prefix="")


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(request: LoginRequest):
    """validate user login credentials and return JWT token if valid.

    Args:
        request (LoginRequest): login request body containing email and password

    Returns:
        _type_: _response indicating success or failure of login
    """
    user = validate_user_account(request.email, request.password)
    
    if not user:
        return {"success": False, "message": "Invalid credentials"}
    
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    
    ENV_PATH = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=ENV_PATH)
    JWT_SECRET = os.getenv("JWT_SECRET")
    
    token = jwt.encode({
        "sub": str(user.user_id),
        "role": user.role,
        "exp": exp,
        "iat": datetime.now(timezone.utc)
    }, JWT_SECRET, algorithm="HS256")
    
    response = JSONResponse (content={"success": True, "message": "Login successful"}) #Em caso de sucesso é criado o response
    
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure="lax", #Lax por conta do cross-site
        samesite="lax",
        path="/"
    )
    
    return response #Retorna com sucesso se tem ou não o login e está salvando de forma correta no dev tools com segurança


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {
        "authenticated": True,
        "user_id": user.get("sub"),
        "role": user.get("role"),
        "nome": user.get("nome"),
        "email": user.get("email")
    }