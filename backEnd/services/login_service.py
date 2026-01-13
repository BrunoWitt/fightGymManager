import bcrypt
from database import connect_db, close_db
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException, Depends
import jwt
from jwt import PyJWTError

class User(BaseModel):
    user_id: int
    role: str

def validate_user_account(email: str, password: str) -> User | bool:
    """Function to validate user account credentials on database.

    Args:
        email (str): email of the user
        password (str): password of the user

    Returns:
        User: user object if credentials are valid
        bool: False if credentials are invalid
    """
    connection = connect_db()
    cursor = connection.cursor()
    query = "SELECT senha_hash, user_id, role FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    
    result = cursor.fetchone()
    close_db(connection)
    
    if result is None:
        return False

    password_hash, user_id, role = result
    
    if isinstance(password_hash, str):
        password_hash = password_hash.encode('utf-8')
    
    if bcrypt.checkpw(password.encode(), password_hash):
        return User(user_id=user_id, role=role)
    
    return False

def get_current_user(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "user_id": payload.get("sub"),
        "role": payload.get("role"),
    }