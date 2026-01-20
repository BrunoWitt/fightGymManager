from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import date
from services.login_service import get_current_user

from services.finance_service import (
    list_pagamentos_mes_db,
    gerar_pagamentos_mes_db,
    set_pagamento_status_db,
    resumo_mes_db,
    list_despesas_db,
    create_despesa_db,
    update_despesa_db,
    delete_despesa_db,
    set_despesa_status_db,
)

router = APIRouter(prefix="/financeiro", dependencies=[Depends(get_current_user)])

# Helpers
def _parse_mes(mes_str: str) -> date:
    # espera "YYYY-MM-01" (como você já está fazendo)
    try:
        y, m, d = mes_str.split("-")
        return date(int(y), int(m), int(d))
    except Exception:
        raise HTTPException(status_code=400, detail="mes inválido. Use YYYY-MM-01")


# Pagamentos (Receitas)
@router.get("/pagamentos")
def list_pagamentos(mes: str):
    mes_ref = _parse_mes(mes)
    return JSONResponse(list_pagamentos_mes_db(mes_ref))


class GerarPagamentosRequest(BaseModel):
    mes: str
    vencimento: str | None = None
    sobrescrever_nao_pagos: bool = False


@router.post("/pagamentos/gerar")
def gerar_pagamentos(request: GerarPagamentosRequest):
    mes_ref = _parse_mes(request.mes)

    venc = None
    if request.vencimento:
        try:
            y, m, d = request.vencimento.split("-")
            venc = date(int(y), int(m), int(d))
        except Exception:
            raise HTTPException(status_code=400, detail="vencimento inválido. Use YYYY-MM-DD")

    return JSONResponse(
        gerar_pagamentos_mes_db(
            mes_ref=mes_ref,
            vencimento=venc,
            sobrescrever_nao_pagos=request.sobrescrever_nao_pagos,
        )
    )


class PagamentoStatusRequest(BaseModel):
    pago: bool
    observacao: str | None = None


@router.put("/pagamentos/{pagamento_id}/status")
def set_pagamento_status(pagamento_id: int, request: PagamentoStatusRequest):
    return JSONResponse(set_pagamento_status_db(pagamento_id, request.pago, request.observacao))


# Resumo / Dashboard
@router.get("/resumo")
def resumo(mes: str):
    mes_ref = _parse_mes(mes)
    return JSONResponse(resumo_mes_db(mes_ref))


# Despesas
@router.get("/despesas")
def list_despesas(competencia: str):
    comp = _parse_mes(competencia)
    return JSONResponse(list_despesas_db(comp))


class DespesaRequest(BaseModel):
    descricao: str
    categoria: str
    competencia: str  # YYYY-MM-01
    valor: float
    vencimento: str | None = None  # YYYY-MM-DD
    observacao: str | None = None


@router.post("/despesas")
def create_despesa(request: DespesaRequest):
    comp = _parse_mes(request.competencia)

    venc = None
    if request.vencimento:
        y, m, d = request.vencimento.split("-")
        venc = date(int(y), int(m), int(d))

    return JSONResponse(create_despesa_db(
        descricao=request.descricao,
        categoria=request.categoria,
        competencia=comp,
        valor=request.valor,
        vencimento=venc,
        observacao=request.observacao,
    ))


@router.put("/despesas/{despesa_id}")
def update_despesa(despesa_id: int, request: DespesaRequest):
    comp = _parse_mes(request.competencia)

    venc = None
    if request.vencimento:
        y, m, d = request.vencimento.split("-")
        venc = date(int(y), int(m), int(d))

    return JSONResponse(update_despesa_db(
        despesa_id=despesa_id,
        descricao=request.descricao,
        categoria=request.categoria,
        competencia=comp,
        valor=request.valor,
        vencimento=venc,
        observacao=request.observacao,
    ))


@router.delete("/despesas/{despesa_id}")
def delete_despesa(despesa_id: int):
    return JSONResponse(delete_despesa_db(despesa_id))


class DespesaStatusRequest(BaseModel):
    pago: bool
    observacao: str | None = None


@router.put("/despesas/{despesa_id}/status")
def set_despesa_status(despesa_id: int, request: DespesaStatusRequest, user=Depends(get_current_user)):
    return JSONResponse(set_despesa_status_db(despesa_id, request.pago, request.observacao))
