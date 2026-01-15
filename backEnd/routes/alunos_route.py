from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import connect_db, close_db
from services.alunos_service import registerAlunoDB, editAlunoDB

router = APIRouter(prefix="/alunos")

"""
parte dos alunos
sistema crud
detalhes do aluno - read
cadastrar aluno - create
editar aluno - edit
deletar aluno - delete

detalhes do aluno: pagamentos, modalidades que faz
"""

class AlunoRequest(BaseModel):
    nome: str
    email: str
    turmas: list

@router.post("/register")
async def registrarAluno(request: AlunoRequest):
    """register a new student with the current month already paid

    Args:
        request (AlunoRequest): name, email and classes

    Returns:
        json: return a json {"result": "message"}
    """
    return JSONResponse(registerAlunoDB(request.nome, request.email, request.turmas))

@router.put("/{aluno_id}/edit")
async def editAluno(request: AlunoRequest):
    return JSONResponse(editAlunoDB(request.nome, request.email, request.turmas))