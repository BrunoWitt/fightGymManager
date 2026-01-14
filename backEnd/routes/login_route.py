from fastapi import APIRouter, FastAPI, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt

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
    
    #Precisa fazer a parte do JWT para ficar armazenado nos cookies o role e user_id
    token = jwt.encode({
        "sub": str(user.user_id),
        "role": user.role,
        "exp": exp,
        "iat": datetime.now(timezone.utc)
    }, "secret_key", algorithm="HS256")
    
    response = JSONResponse (content={"success": True, "message": "Login successful"})
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        expires=exp
    )
    return response #Retorna com sucesso se tem ou não o login e está salvando de forma correta no dev tools com segurança

@router.get("/me")
def me(user=Depends(get_current_user)):
    """validate in every page if the user is logged. 

    Args:
        user (_type_, optional): _description_. Defaults to Depends(get_current_user).

    Returns:
        dict: _user information extracted from JWT token
    """
    return {
        "authenticated": True,
        "user_id": user.get("sub"),
        "role": user.get("role"),
        "nome": user.get("nome"),
        "email": user.get("email")
    }