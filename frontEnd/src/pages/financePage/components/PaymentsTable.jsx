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

    const card =
        "rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur";
    const input =
        "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10 md:w-64";

    if (loading) return <div className="text-sm text-zinc-400">Carregando mensalidades...</div>;

    return (
        <div className={card}>
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
            <h2 className="text-base font-extrabold text-zinc-100">Mensalidades</h2>
            <p className="text-xs text-zinc-500">Clique no status para marcar como pago/aberto.</p>
            </div>
            <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por aluno/email..."
            className={input}
            />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-yellow-400/10">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3">Aluno</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3">Turmas</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3 text-right">Valor</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3 text-center">Status</th>
                </tr>
            </thead>

            <tbody>
                {filtered.map((r) => (
                <tr key={r.pagamento_id} className="border-b border-white/5 transition hover:bg-yellow-400/5">
                    <td className="py-3 px-3">
                    <div className="font-semibold text-zinc-100">{r.nome}</div>
                    <div className="text-xs text-zinc-500">{r.email}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-200/90">
                    {(r.turmas || []).map((t) => t.nome).join(", ") || "—"}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-zinc-100">
                    {moneyBRL(r.quantia)}
                    </td>
                    <td className="py-3 px-3 text-center">
                    <button
                        onClick={() => onTogglePago(r)}
                        disabled={busy}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold disabled:opacity-60 ${
                        r.pago
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                            : "border-yellow-400/20 bg-yellow-400/10 text-yellow-200 hover:bg-yellow-400/15"
                        }`}
                    >
                        {r.pago ? "Pago" : "Em aberto"}
                    </button>
                    </td>
                </tr>
                ))}

                {filtered.length === 0 ? (
                <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-zinc-500">
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
