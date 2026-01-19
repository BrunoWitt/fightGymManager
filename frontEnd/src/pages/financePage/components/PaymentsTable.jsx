// src/pages/financePage/components/PaymentsTable.jsx
import { useMemo, useState } from "react";

export default function PaymentsTable({ loading, rows, moneyBRL, onTogglePago, busy }) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = (q || "").trim().toLowerCase();
        if (!s) return rows;
        return rows.filter((r) => {
        const nome = (r.nome || "").toLowerCase();
        const email = (r.email || "").toLowerCase();
        return nome.includes(s) || email.includes(s);
        });
    }, [rows, q]);

    if (loading) {
        return <div className="text-sm text-zinc-500">Carregando mensalidades...</div>;
    }

    return (
        <div>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Mensalidades</h2>
            <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por aluno/email..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 md:w-64"
            />
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                <th className="py-2 pr-3">Aluno</th>
                <th className="py-2 pr-3">Turmas</th>
                <th className="py-2 pr-3 text-right">Valor</th>
                <th className="py-2 pr-3 text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map((r) => (
                <tr key={r.pagamento_id} className="border-b border-zinc-100">
                    <td className="py-2 pr-3">
                    <div className="font-medium text-zinc-900">{r.nome}</div>
                    <div className="text-xs text-zinc-500">{r.email}</div>
                    </td>
                    <td className="py-2 pr-3 text-zinc-700">
                    {(r.turmas || []).map((t) => t.nome).join(", ") || "-"}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium text-zinc-900">
                    {moneyBRL(r.quantia)}
                    </td>
                    <td className="py-2 pr-3 text-center">
                    <button
                        onClick={() => onTogglePago(r)}
                        disabled={busy}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
                        r.pago
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                    >
                        {r.pago ? "Pago" : "Em aberto"}
                    </button>
                    </td>
                </tr>
                ))}

                {filtered.length === 0 ? (
                <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                    Nenhuma mensalidade encontrada.
                    </td>
                </tr>
                ) : null}
            </tbody>
            </table>
        </div>
        </div>
    );
}
