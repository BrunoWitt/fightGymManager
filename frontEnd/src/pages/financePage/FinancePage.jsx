// src/pages/financePage/Finance.jsx
import { useEffect, useMemo, useState } from "react";
import FinanceHeader from "./components/FinanceHeader";
import SummaryCards from "./components/SummaryCards";
import PaymentsTable from "./components/PaymentsTable";
import ExpensesTable from "./components/ExpensesTable";
import ExpenseFormModal from "./components/ExpenseFormModal";

const API_URL = import.meta.env.VITE_API_URL;

async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data?.message || data?.detail || "Erro na requisição";
        throw new Error(msg);
    }
    return data;
}

function moneyBRL(v) {
    const n = Number(v || 0);
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toMesISO(yyyyMM) {
    if (!yyyyMM || yyyyMM.length < 7) return null;
    return `${yyyyMM}-01`;
}

    export default function Finance() {
    const [monthValue, setMonthValue] = useState(() => {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${d.getFullYear()}-${mm}`;
    });

    const mesISO = useMemo(() => toMesISO(monthValue), [monthValue]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const [resumo, setResumo] = useState(null);
    const [pagamentos, setPagamentos] = useState([]);
    const [despesas, setDespesas] = useState([]);

    const [expenseOpen, setExpenseOpen] = useState(false);
    const [expenseMode, setExpenseMode] = useState("create");
    const [expenseInitial, setExpenseInitial] = useState(null);

  // --- styles base (Classic) ---
    const card =
        "rounded-2xl border border-yellow-400/10 bg-zinc-950/35 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur";
    const pageWrap = "relative mx-auto max-w-full px-4 py-6 md:px-6 md:py-10";

    async function loadAll() {
        if (!mesISO) return;
        setLoading(true);
        setError("");
        try {
        const [rResumo, rPag, rDesp] = await Promise.all([
            api(`/financeiro/resumo?mes=${encodeURIComponent(mesISO)}`),
            api(`/financeiro/pagamentos?mes=${encodeURIComponent(mesISO)}`),
            api(`/financeiro/despesas?competencia=${encodeURIComponent(mesISO)}`),
        ]);

        setResumo(rResumo?.data || null);
        setPagamentos(Array.isArray(rPag?.data) ? rPag.data : []);
        setDespesas(Array.isArray(rDesp?.data) ? rDesp.data : []);
        } catch (e) {
        setError(e.message || "Erro ao carregar financeiro");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesISO]);

    async function handleGerarMes() {
        if (!mesISO) return;
        setBusy(true);
        setError("");
        try {
        await api(`/financeiro/pagamentos/gerar`, {
            method: "POST",
            body: JSON.stringify({
            mes: mesISO,
            vencimento: null,
            sobrescrever_nao_pagos: false,
            }),
        });
        await loadAll();
        } catch (e) {
        setError(e.message || "Erro ao gerar mensalidades");
        } finally {
        setBusy(false);
        }
    }

    async function togglePagamento(p) {
        setBusy(true);
        setError("");
        try {
        await api(`/financeiro/pagamentos/${p.pagamento_id}/status`, {
            method: "PUT",
            body: JSON.stringify({ pago: !p.pago, observacao: null }),
        });
        await loadAll();
        } catch (e) {
        setError(e.message || "Erro ao atualizar pagamento");
        } finally {
        setBusy(false);
        }
    }

    function openNewExpense() {
        setExpenseMode("create");
        setExpenseInitial({
        descricao: "",
        categoria: "",
        competencia: mesISO,
        valor: "",
        vencimento: "",
        observacao: "",
        });
        setExpenseOpen(true);
    }

    function openEditExpense(row) {
        setExpenseMode("edit");
        setExpenseInitial({
        ...row,
        competencia: String(row.competencia || "").slice(0, 10),
        vencimento: row.vencimento ? String(row.vencimento).slice(0, 10) : "",
        valor: String(row.valor ?? ""),
        });
        setExpenseOpen(true);
    }

    async function handleSubmitExpense(payload) {
        setBusy(true);
        setError("");
        try {
        if (expenseMode === "create") {
            await api(`/financeiro/despesas`, { method: "POST", body: JSON.stringify(payload) });
        } else {
            await api(`/financeiro/despesas/${expenseInitial.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
            });
        }
        setExpenseOpen(false);
        await loadAll();
        } catch (e) {
        setError(e.message || "Erro ao salvar despesa");
        } finally {
        setBusy(false);
        }
    }

    async function handleDeleteExpense(row) {
        const ok = confirm(`Excluir despesa "${row.descricao}"?`);
        if (!ok) return;

        setBusy(true);
        setError("");
        try {
        await api(`/financeiro/despesas/${row.id}`, { method: "DELETE" });
        await loadAll();
        } catch (e) {
        setError(e.message || "Erro ao excluir despesa");
        } finally {
        setBusy(false);
        }
    }

    async function toggleDespesa(row) {
        setBusy(true);
        setError("");
        try {
        await api(`/financeiro/despesas/${row.id}/status`, {
            method: "PUT",
            body: JSON.stringify({ pago: !row.pago, observacao: null }),
        });
        await loadAll();
        } catch (e) {
        setError(e.message || "Erro ao atualizar despesa");
        } finally {
        setBusy(false);
        }
    }

    return (
        <div className={pageWrap}>
        <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Financeiro</h1>
            <p className="mt-1 text-sm text-zinc-400">
            Mensalidades (receitas) e despesas por mês.
            </p>
        </div>

        <div className={card}>
            <div className="p-4">
            <FinanceHeader
                monthValue={monthValue}
                setMonthValue={setMonthValue}
                onGerarMes={handleGerarMes}
                busy={busy}
            />
            </div>
        </div>

        {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
            </div>
        ) : null}

        <div className={`mt-4 ${card}`}>
            <div className="p-4">
            <SummaryCards loading={loading} resumo={resumo} moneyBRL={moneyBRL} />
            </div>
        </div>

        <div className="relative mx-auto w-full px-4 py-6 md:px-6 md:py-10">
            <div className={card}>
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PaymentsTable
                loading={loading}
                rows={pagamentos}
                moneyBRL={moneyBRL}
                onTogglePago={togglePagamento}
                busy={busy}
            />

            <ExpensesTable
                loading={loading}
                rows={despesas}
                moneyBRL={moneyBRL}
                onNew={openNewExpense}
                onEdit={openEditExpense}
                onDelete={handleDeleteExpense}
                onTogglePago={toggleDespesa}
                busy={busy}
            />
            </div>
            </div>
        </div>

        <ExpenseFormModal
            open={expenseOpen}
            mode={expenseMode}
            initial={expenseInitial}
            onClose={() => setExpenseOpen(false)}
            onSubmit={handleSubmitExpense}
            busy={busy}
        />
        </div>
    );
}
