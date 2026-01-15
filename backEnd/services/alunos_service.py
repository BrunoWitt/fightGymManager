from database import connect_db, close_db
from datetime import date

VALOR_POR_TURMA = 160.00

"""helpers"""
def _first_day_of_month(d: date) -> date:
    return date(d.year, d.month, 1)

def registerAlunoDB(nome: str, email: str, turmas: list):
    """
    register 
    
    :param nome: Description
    :type nome: str
    :param email: Description
    :type email: str
    :param turmas: Description
    :type turmas: list
    """
    if not nome or not nome.strip():
        return {"result": "erro", "message": "Nome é obrigatório"}

    if not email or not email.strip():
        return {"result": "erro", "message": "Email é obrigatório"}

    if not turmas or len(turmas) == 0:
        return {"result": "erro", "message": "Selecione ao menos 1 turma"}

    # remove duplicados e garante ints
    try:
        turmas_ids = sorted(set(int(t) for t in turmas))
    except Exception:
        return {"result": "erro", "message": "Lista de turmas inválida"}

    mes_ref = _first_day_of_month(date.today())
    quantia_total = float(VALOR_POR_TURMA * len(turmas_ids))

    connection = connect_db()
    try:
        cursor = connection.cursor()

        # valida se turmas existem
        cursor.execute(
            "SELECT id FROM turma WHERE id = ANY(%s)",
            (turmas_ids,)
        )
        found = {row[0] for row in cursor.fetchall()}
        missing = [t for t in turmas_ids if t not in found]
        if missing:
            return {"result": "erro", "message": f"Turmas inválidas: {missing}"}

        # cria aluno (ou pega existente pelo email)
        cursor.execute("SELECT aluno_id FROM alunos WHERE email = %s", (email.strip(),))
        row = cursor.fetchone()

        if row:
            aluno_id = row[0]
            # atualiza nome e reativa se estiver inativo
            cursor.execute(
                "UPDATE alunos SET nome = %s, ativo = TRUE WHERE aluno_id = %s",
                (nome.strip(), aluno_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO alunos (nome, email, ativo)
                VALUES (%s, %s, TRUE)
                RETURNING aluno_id
                """,
                (nome.strip(), email.strip())
            )
            aluno_id = cursor.fetchone()[0]

        # vincula aluno às turmas (upsert)
        # se já existir, garante ativo=true
        cursor.execute(
            """
            INSERT INTO aluno_turma (aluno_id, turma_id, ativo)
            SELECT %s, unnest(%s::bigint[]), TRUE
            ON CONFLICT (aluno_id, turma_id)
            DO UPDATE SET ativo = EXCLUDED.ativo
            """,
            (aluno_id, turmas_ids)
        )

        # cria pagamento do mês atual como pago
        # se já existir (mesmo aluno e mes), atualiza (pra não duplicar)
        cursor.execute(
            """
            INSERT INTO alunos_pagamentos (aluno_id, mes, quantia, pago, pago_em, observacao)
            VALUES (%s, %s, %s, TRUE, NOW(), %s)
            ON CONFLICT (aluno_id, mes)
            DO UPDATE SET
                quantia = EXCLUDED.quantia,
                pago = TRUE,
                pago_em = NOW(),
                observacao = EXCLUDED.observacao
            RETURNING id
            """,
            (aluno_id, mes_ref, quantia_total, "Pagamento inicial no cadastro")
        )
        pagamento_id = cursor.fetchone()[0]

        # registra turmas pagas do mês (limpa e reinsere)
        cursor.execute("DELETE FROM pagamento_turma WHERE pagamento_id = %s", (pagamento_id,))
        cursor.execute(
            """
            INSERT INTO pagamento_turma (pagamento_id, turma_id)
            SELECT %s, unnest(%s::bigint[])
            """,
            (pagamento_id, turmas_ids)
        )

        connection.commit()
        return {
            "result": "sucesso",
        }

    except Exception as e:
        connection.rollback()
        # se quiser, loga o erro em vez de retornar
        raise
    finally:
        close_db(connection)


def editAlunoDB(aluno_id: int, nome: str, email: str, turmas: list):
    if not aluno_id:
        return {"result": "erro", "message": "aluno_id é obrigatório"}

    if not nome or not nome.strip():
        return {"result": "erro", "message": "Nome é obrigatório"}

    if not email or not email.strip():
        return {"result": "erro", "message": "Email é obrigatório"}

    if not turmas or len(turmas) == 0:
        return {"result": "erro", "message": "Selecione ao menos 1 turma"}

    # remove duplicados e garante ints
    try:
        turmas_ids = sorted(set(int(t) for t in turmas))
    except Exception:
        return {"result": "erro", "message": "Lista de turmas inválida"}

    connection = connect_db()
    try:
        cursor = connection.cursor()

        # verifica se aluno existe
        cursor.execute("SELECT aluno_id FROM alunos WHERE aluno_id = %s", (aluno_id,))
        if not cursor.fetchone():
            return {"result": "erro", "message": "Aluno não encontrado"}

        # valida se email já está em uso por outro aluno
        cursor.execute(
            "SELECT aluno_id FROM alunos WHERE email = %s AND aluno_id <> %s",
            (email.strip(), aluno_id)
        )
        if cursor.fetchone():
            return {"result": "erro", "message": "Email já está em uso por outro aluno"}

        # valida se as turmas existem
        cursor.execute("SELECT id FROM turma WHERE id = ANY(%s)", (turmas_ids,))
        found = {row[0] for row in cursor.fetchall()}
        missing = [t for t in turmas_ids if t not in found]
        if missing:
            return {"result": "erro", "message": f"Turmas inválidas: {missing}"}

        # update aluno
        cursor.execute(
            """
            UPDATE alunos
            SET nome = %s, email = %s
            WHERE aluno_id = %s
            """,
            (nome.strip(), email.strip(), aluno_id)
        )

        # atualiza vínculos aluno_turma
        # desativa todos os vínculos existentes
        cursor.execute(
            "UPDATE aluno_turma SET ativo = FALSE WHERE aluno_id = %s",
            (aluno_id,)
        )

        # ativa/insere os vínculos escolhidos
        cursor.execute(
            """
            INSERT INTO aluno_turma (aluno_id, turma_id, ativo)
            SELECT %s, unnest(%s::bigint[]), TRUE
            ON CONFLICT (aluno_id, turma_id)
            DO UPDATE SET ativo = EXCLUDED.ativo
            """,
            (aluno_id, turmas_ids)
        )

        connection.commit()
        return {"result": "sucesso"}

    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)