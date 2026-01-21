import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2





def connect_db():
    ENV_PATH = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=ENV_PATH)
    
    print("ENV_PATH =", ENV_PATH)
    print("Existe?  =", ENV_PATH.exists())
    print("DB_USER  =", os.getenv("DB_USER"))
    print("DB_PASS definido? =", bool(os.getenv("DB_PASSWORD")))
    
    return psycopg2.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
    )

def close_db(connection):
    if connection:
        connection.close()