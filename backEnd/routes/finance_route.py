from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import connect_db, close_db

router = APIRouter(prefix="/finance")

@router.get("")
async def getFinanceInfo():
    