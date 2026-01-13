import bcrypt
from database import connect_db, close_db
from pydantic import BaseModel

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