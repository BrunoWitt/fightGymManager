from database import connect_db, close_db
from psycopg2.extras import RealDictCursor
from datetime import date
import json

VALOR_POR_TURMA = 160.00

def list_pagamentos_mes_db(mes_ref: date):
    connection = connect_db()
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT
                ap.id AS pagamento_id,
                ap.aluno_id,
                a.nome,
                a.email,
                ap.mes,
                ap.quantia::float AS quantia,
                ap.pago,
                ap.vencimento,
                ap.pago_em,
                ap.observacao,
                COALESCE(
                    (
                        SELECT json_agg(
                            jsonb_build_object('id', t.id, 'nome', t.nome)
                            ORDER BY t.id
                        )
                        FROM pagamento_turma pt
                        JOIN turma t ON t.id = pt.turma_id
                        WHERE pt.pagamento_id = ap.id
                    ),
                    '[]'::json
                ) AS turmas
            FROM alunos_pagamentos ap
            JOIN alunos a ON a.aluno_id = ap.aluno_id
            WHERE ap.mes = %s
            ORDER BY a.nome ASC
        """, (mes_ref,))

        rows = cursor.fetchall()
        for r in rows:
            if isinstance(r.get("turmas"), str):
                r["turmas"] = json.loads(r["turmas"])

        return {"result": "sucesso", "data": rows}
    finally:
        close_db(connection)


def gerar_pagamentos_mes_db(mes_ref: date, vencimento: date | None, sobrescrever_nao_pagos: bool):
    """
    Gera mensalidades do mes_ref para todos os alunos ATIVOS
    usando as turmas ativas do aluno_turma.
    - Não duplica por causa do UNIQUE(aluno_id, mes)
    - Se sobrescrever_nao_pagos=True: recalcula quantia/turmas de pagamentos existentes ainda não pagos.
    """
    connection = connect_db()
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        # pega alunos ativos + turmas ativas
        cursor.execute("""
            SELECT
                a.aluno_id,
                array_agg(at.turma_id ORDER BY at.turma_id) AS turmas_ids,
                count(*)::int AS qtd_turmas
            FROM alunos a
            JOIN aluno_turma at
                ON at.aluno_id = a.aluno_id
                AND at.ativo = TRUE
            WHERE a.ativo = TRUE
            GROUP BY a.aluno_id
        """)
        alunos = cursor.fetchall()

        created = 0
        updated = 0

        for item in alunos:
            aluno_id = item["aluno_id"]
            turmas_ids = item["turmas_ids"] or []
            qtd = item["qtd_turmas"] or 0

            if qtd == 0:
                continue

            quantia_total = float(VALOR_POR_TURMA * qtd)

            # tenta inserir pagamento
            cursor.execute("""
                INSERT INTO alunos_pagamentos (aluno_id, mes, quantia, pago, vencimento, observacao)
                VALUES (%s, %s, %s, FALSE, %s, %s)
                ON CONFLICT (aluno_id, mes)
                DO UPDATE SET
                    -- só atualiza se o pagamento NÃO estiver pago e a flag permitir
                    quantia = CASE
                        WHEN alunos_pagamentos.pago = FALSE AND %s = TRUE THEN EXCLUDED.quantia
                        ELSE alunos_pagamentos.quantia
                    END,
                    vencimento = CASE
                        WHEN alunos_pagamentos.pago = FALSE AND %s = TRUE THEN EXCLUDED.vencimento
                        ELSE alunos_pagamentos.vencimento
                    END,
                    observacao = CASE
                        WHEN alunos_pagamentos.pago = FALSE AND %s = TRUE THEN EXCLUDED.observacao
                        ELSE alunos_pagamentos.observacao
                    END
                RETURNING id, (xmax = 0) AS inserted
            """, (
                aluno_id, mes_ref, quantia_total, vencimento, "Mensalidade gerada automaticamente",
                sobrescrever_nao_pagos, sobrescrever_nao_pagos, sobrescrever_nao_pagos
            ))

            row = cursor.fetchone()
            pagamento_id = row["id"]
            inserted = row["inserted"]

            if inserted:
                created += 1
            else:
                cursor.execute("SELECT pago FROM alunos_pagamentos WHERE id = %s", (pagamento_id,))
                pago_atual = cursor.fetchone()["pago"]
                if (not pago_atual) and sobrescrever_nao_pagos:
                    updated += 1
                else:
                    continue
                
            cursor.execute("DELETE FROM pagamento_turma WHERE pagamento_id = %s", (pagamento_id,))
            cursor.execute("""
                INSERT INTO pagamento_turma (pagamento_id, turma_id)
                SELECT %s, unnest(%s::bigint[])
            """, (pagamento_id, turmas_ids))

        connection.commit()
        return {"result": "sucesso", "created": created, "updated": updated}

    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)


def set_pagamento_status_db(pagamento_id: int, pago: bool, observacao: str | None):
    connection = connect_db()
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT id, pago FROM alunos_pagamentos WHERE id = %s", (pagamento_id,))
        if not cursor.fetchone():
            return {"result": "erro", "message": "Pagamento não encontrado"}

        if pago:
            cursor.execute("""
                UPDATE alunos_pagamentos
                SET pago = TRUE,
                    pago_em = NOW(),
                    observacao = COALESCE(%s, observacao),
                    updated_at = NOW()
                WHERE id = %s
            """, (observacao, pagamento_id))
        else:
            cursor.execute("""
                UPDATE alunos_pagamentos
                SET pago = FALSE,
                    pago_em = NULL,
                    observacao = COALESCE(%s, observacao),
                    updated_at = NOW()
                WHERE id = %s
            """, (observacao, pagamento_id))

        connection.commit()
        return {"result": "sucesso"}

    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)


def resumo_mes_db(mes_ref: date):
    connection = connect_db()
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)

        # receitas
        cursor.execute("""
            SELECT
                COALESCE(SUM(quantia), 0)::float AS receitas_previstas,
                COALESCE(SUM(CASE WHEN pago THEN quantia ELSE 0 END), 0)::float AS receitas_recebidas,
                COALESCE(SUM(CASE WHEN NOT pago THEN quantia ELSE 0 END), 0)::float AS receitas_em_aberto
            FROM alunos_pagamentos
            WHERE mes = %s
        """, (mes_ref,))
        rec = cursor.fetchone()

        # despesas
        cursor.execute("""
            SELECT
                COALESCE(SUM(valor), 0)::float AS despesas_previstas,
                COALESCE(SUM(CASE WHEN pago THEN valor ELSE 0 END), 0)::float AS despesas_pagas,
                COALESCE(SUM(CASE WHEN NOT pago THEN valor ELSE 0 END), 0)::float AS despesas_em_aberto
            FROM despesas
            WHERE competencia = %s
        """, (mes_ref,))
        desp = cursor.fetchone()

        data = {
            "mes": mes_ref.isoformat(),
            "receitas": rec,
            "despesas": desp,
            "saldo_caixa": float(rec["receitas_recebidas"] - desp["despesas_pagas"]),
            "saldo_previsto": float(rec["receitas_previstas"] - desp["despesas_previstas"]),
        }

        return {"result": "sucesso", "data": data}

    finally:
        close_db(connection)


# DESPESAS
def list_despesas_db(competencia: date):
    connection = connect_db()
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT
                id,
                descricao,
                categoria,
                competencia,
                valor::float AS valor,
                vencimento,
                pago,
                pago_em,
                observacao,
                created_at,
                updated_at
            FROM despesas
            WHERE competencia = %s
            ORDER BY categoria ASC, descricao ASC
        """, (competencia,))
        rows = cursor.fetchall()
        return {"result": "sucesso", "data": rows}
    finally:
        close_db(connection)


def create_despesa_db(descricao: str, categoria: str, competencia: date, valor: float, vencimento: date | None, observacao: str | None):
    if not descricao or not descricao.strip():
        return {"result": "erro", "message": "descricao é obrigatória"}
    if not categoria or not categoria.strip():
        return {"result": "erro", "message": "categoria é obrigatória"}
    if valor is None or float(valor) < 0:
        return {"result": "erro", "message": "valor inválido"}

    connection = connect_db()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO despesas (descricao, categoria, competencia, valor, vencimento, observacao)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (descricao.strip(), categoria.strip(), competencia, float(valor), vencimento, observacao))
        despesa_id = cursor.fetchone()[0]
        connection.commit()
        return {"result": "sucesso", "id": despesa_id}
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)


def update_despesa_db(despesa_id: int, descricao: str, categoria: str, competencia: date, valor: float, vencimento: date | None, observacao: str | None):
    connection = connect_db()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM despesas WHERE id = %s", (despesa_id,))
        if not cursor.fetchone():
            return {"result": "erro", "message": "Despesa não encontrada"}

        cursor.execute("""
            UPDATE despesas
            SET descricao = %s,
                categoria = %s,
                competencia = %s,
                valor = %s,
                vencimento = %s,
                observacao = %s,
                updated_at = NOW()
            WHERE id = %s
        """, (descricao.strip(), categoria.strip(), competencia, float(valor), vencimento, observacao, despesa_id))

        connection.commit()
        return {"result": "sucesso"}
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)


def delete_despesa_db(despesa_id: int):
    connection = connect_db()
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM despesas WHERE id = %s", (despesa_id,))
        if cursor.rowcount == 0:
            return {"result": "erro", "message": "Despesa não encontrada"}
        connection.commit()
        return {"result": "sucesso"}
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)


def set_despesa_status_db(despesa_id: int, pago: bool, observacao: str | None):
    connection = connect_db()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM despesas WHERE id = %s", (despesa_id,))
        if not cursor.fetchone():
            return {"result": "erro", "message": "Despesa não encontrada"}

        if pago:
            cursor.execute("""
                UPDATE despesas
                SET pago = TRUE,
                    pago_em = NOW(),
                    observacao = COALESCE(%s, observacao),
                    updated_at = NOW()
                WHERE id = %s
            """, (observacao, despesa_id))
        else:
            cursor.execute("""
                UPDATE despesas
                SET pago = FALSE,
                    pago_em = NULL,
                    observacao = COALESCE(%s, observacao),
                    updated_at = NOW()
                WHERE id = %s
            """, (observacao, despesa_id))

        connection.commit()
        return {"result": "sucesso"}
    except Exception:
        connection.rollback()
        raise
    finally:
        close_db(connection)
