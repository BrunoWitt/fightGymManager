from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import connect_db, close_db
from services.turma_service import getTurmaDB, updateTurmaDB, deleteTurmaDB, createTurmaDB

router = APIRouter(prefix="/turmas")

class TurmaRequest(BaseModel):
    nome: str
    professor: str
    horarios: dict

"""
Crud de turma
Criar turma post
Ler turma get X
Editar turma put X
Deletar turma delete X

Endpoints:
/
"""

@router.get("/{turma_id}")
async def getTurma(turma_id: int):
    """frontend dá o numero id da turma(ques está no db) e ele irá carregar devolvendo as informações daquela turma

    Args:
        turma (int): _description_
    """
    """Frontend envia o numero de id da turma para carregar as informações dela para edição, leitura ou delete.

    Returns:
        Json: retorna um json com todas as informações da turma desse jeito:"id": 1,
                                                                            "nome": boxe,
                                                                            "professor": faustino,
                                                                            "horarios": [{"dia_semana": 1, "hora_inicio": str(ini), "hora_fim": str(fim)}],
    """
    return JSONResponse(getTurmaDB(turma_id))

@router.put("/{turma_id}/update")
async def updateTurma(turma_id: int, changes: dict):
    """Frontend terá escolhido a turma com opções id, quando clicar em salvar será carregado todas as mudanças dos horarios completos"""
    return JSONResponse(updateTurmaDB(turma_id, changes))

@router.delete("/{turma_id}/delete")
async def deleteTurma(turma_id: int):
    """Frontend só clica no botão de deletar"""
    return JSONResponse(deleteTurmaDB(turma_id))

@router.post("/create")
async def createTurma(request: TurmaRequest):
    """create a new class in database

    Args:
        request (TurmaRequest): all informations to pull in database

    Returns:
        json: return a jsonresponse with success mensage
    """
    return JSONResponse(createTurmaDB(request.nome, request.professor, request.horarios))