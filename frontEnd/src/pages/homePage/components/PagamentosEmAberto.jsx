import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

async function callAPI(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || data?.detail || "Erro na requisição";
        throw new Error(message);
    }

    return data;
}

function formatMesBonito(mesRef) {
    // mesRef = "YYYY-MM-01"
    const [y, m] = String(mesRef).split("-").map((x) => Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PagamentosEmAberto({ mesRef }) {
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payingId, setPayingId] = useState(null);

    const mesLabel = useMemo(() => formatMesBonito(mesRef), [mesRef]);

    const emAberto = useMemo(
        () => (pagamentos || []).filter((p) => p.pago === false),
        [pagamentos]
    );

    async function fetchPagamentosDoMes() {
        try {
        setLoading(true);
        const res = await callAPI(`/financeiro/pagamentos?mes=${mesRef}`);
        setPagamentos(res?.data || []);
        } catch (e) {
        console.error(e);
        setPagamentos([]);
        } finally {
        setLoading(false);
        }
    }

    async function marcarComoPago(pagamento_id) {
        try {
        setPayingId(pagamento_id);

        await callAPI(`/financeiro/pagamentos/${pagamento_id}/status`, {
            method: "PUT",
            body: JSON.stringify({
            pago: true,
            observacao: "Pago pela Home",
            }),
        });

        setPagamentos((prev) =>
            (prev || []).map((p) =>
            p.pagamento_id === pagamento_id ? { ...p, pago: true } : p
            )
        );
        } catch (e) {
        console.error(e);
        alert(e.message);
        } finally {
        setPayingId(null);
        }
    }

  // refetch automático quando mudar o mês da agenda
    useEffect(() => {
        fetchPagamentosDoMes();
    }, [mesRef]);

    return (
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
            <h2 className="text-base font-semibold text-zinc-900">Em aberto</h2>
            <p className="text-xs text-zinc-500">Mês: <span className="font-medium text-zinc-700">{mesLabel}</span></p>
            </div>

            <button
            onClick={fetchPagamentosDoMes}
            className="text-xs rounded-md border border-zinc-200 px-2 py-1 hover:bg-zinc-50"
            disabled={loading}
            >
            Atualizar
            </button>
        </div>

        <div className="mt-3">
            {loading ? (
            <p className="text-sm text-zinc-500">Carregando...</p>
            ) : emAberto.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum pagamento em aberto</p>
            ) : (
            <ul className="space-y-2 max-h-[340px] overflow-auto pr-1">
                {emAberto.map((p) => (
                <li
                    key={p.pagamento_id}
                    className="rounded-xl border border-zinc-200 p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 transition"
                >
                    <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{p.nome}</p>
                    <p className="text-xs text-zinc-500">
                        {p.email} • R$ {Number(p.quantia).toFixed(2)}
                        {p.vencimento ? ` • Venc: ${p.vencimento}` : ""}
                    </p>

                    {Array.isArray(p.turmas) && p.turmas.length > 0 ? (
                        <p className="text-xs text-zinc-500 mt-1">
                        Turmas: {p.turmas.map((t) => t.nome).join(", ")}
                        </p>
                    ) : null}
                    </div>

                    <button
                    onClick={() => marcarComoPago(p.pagamento_id)}
                    disabled={payingId === p.pagamento_id}
                    className="text-xs rounded-full px-3 py-1 border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 whitespace-nowrap"
                    >
                    {payingId === p.pagamento_id ? "Salvando..." : "Em aberto"}
                    </button>
                </li>
                ))}
            </ul>
            )}
        </div>
        </aside>
    );
}
