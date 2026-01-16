from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
import json

from database import connect_db, close_db
from services.alunos_service import registerAlunoDB, editAlunoDB, deleteAlunoDB, detailAlunoDB


router = APIRouter(prefix="/alunos")

"""
parte dos alunos
sistema crud
detalhes do aluno - read
cadastrar aluno - create X
editar aluno - edit X
deletar aluno - delete

detalhes do aluno: pagamentos, modalidades que faz
"""

class AlunoRequest(BaseModel):
    nome: str
    email: str
    turmas: list


"""helpers"""
@router.get("")
async def listAlunos():
    connection = connect_db()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT
            a.aluno_id,
            a.nome,
            a.email,
            a.ativo,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object('id', t.id, 'nome', t.nome)
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS turmas
        FROM alunos a
        LEFT JOIN aluno_turma at
            ON at.aluno_id = a.aluno_id
            AND at.ativo = TRUE
        LEFT JOIN turma t
            ON t.id = at.turma_id
        GROUP BY a.aluno_id, a.nome, a.email, a.ativo
        ORDER BY a.aluno_id ASC
    """)

    rows = cursor.fetchall()
    close_db(connection)

    # dependendo da config do psycopg2, "turmas" pode vir como string json
    for r in rows:
        if isinstance(r.get("turmas"), str):
            r["turmas"] = json.loads(r["turmas"])

    return JSONResponse(rows)


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
async def editAluno(aluno_id: int, request: AlunoRequest):
    return JSONResponse(editAlunoDB(aluno_id, request.nome, request.email, request.turmas))


@router.delete("/{aluno_id}/delete")
async def deleteAluno(aluno_id: int):
    return JSONResponse(deleteAlunoDB(aluno_id))


"""Parte de detalhes"""

@router.get("/{aluno_id}/details")
async def detailAluno(aluno_id: int):
    return JSONResponse(detailAlunoDB(aluno_id))


