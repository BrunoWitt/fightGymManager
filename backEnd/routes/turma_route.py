from fastapi import FastAPI, APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime

from database import connect_db, close_db
from services.turma_service import getTurmaDB, updateTurmaDB, deleteTurmaDB, createTurmaDB
from services.login_service import get_current_user

router = APIRouter(prefix="/turmas", dependencies=[Depends(get_current_user)])

class TurmaRequest(BaseModel):
    nome: str
    professor: str
    horarios: list

"""Helpers"""
@router.get("/")
async def listTurmas():
    connection = connect_db()
    cursor = connection.cursor()
    cursor.execute("SELECT id, nome, professor FROM turma ORDER BY id ASC")
    rows = cursor.fetchall()
    close_db(connection)
    return JSONResponse([{"id": r[0], "nome": r[1], "professor": r[2]} for r in rows])


@router.get("/hoje")
async def turmasHoje():
    dia = datetime.now().isoweekday()

    connection = connect_db()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            t.id,
            t.nome,
            t.professor,
            th.dia_semana,
            th.hora_inicio,
            th.hora_fim
        FROM turma t
        JOIN turma_horario th ON th.turma_id = t.id
        WHERE th.dia_semana = %s
        ORDER BY th.hora_inicio ASC
    """, (dia,))

    rows = cursor.fetchall()
    close_db(connection)

    return JSONResponse([
        {
            "turma_id": r[0],
            "nome": r[1],
            "professor": r[2],
            "dia_semana": r[3],
            "hora_inicio": r[4].strftime("%H:%M"),
            "hora_fim": r[5].strftime("%H:%M"),
        }
        for r in rows
    ])


"""Tela de turma"""
@router.get("/users")
async def listUsers(role: str | None = None):
    connection = connect_db()
    cursor = connection.cursor()

    if role:
        cursor.execute("SELECT user_id, nome, email, role FROM users WHERE role = %s ORDER BY nome ASC", (role,))
    else:
        cursor.execute("SELECT user_id, nome, email, role FROM users ORDER BY nome ASC")

    rows = cursor.fetchall()
    close_db(connection)

    return JSONResponse([
        {"user_id": r[0], "nome": r[1], "email": r[2], "role": r[3]}
        for r in rows
    ])


@router.get("/{turma_id}")
async def getTurma(turma_id: int):
    """frontend dá o numero id da turma(ques está no db) e ele irá carregar devolvendo as informações daquela turma

    Args:
        turma (int): id da turma
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
    """update a existing class

    Returns:
        json: return a json to frontend with message
    """
    return JSONResponse(updateTurmaDB(turma_id, changes))


@router.delete("/{turma_id}/delete")
async def deleteTurma(turma_id: int):
    """delete the actual selectead class

    Args:
        turma_id (int): class id

    Returns:
        json: return a json to frontend with message
    """
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