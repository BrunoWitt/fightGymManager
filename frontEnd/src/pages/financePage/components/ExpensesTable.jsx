export default function ExpensesTable({
    loading,
    rows,
    moneyBRL,
    onNew,
    onEdit,
    onDelete,
    onTogglePago,
    busy,
}) {
    const card =
        "rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur";

    if (loading) return <div className="text-sm text-zinc-400">Carregando despesas...</div>;

    return (
        <div className={card}>
        <div className="mb-3 flex items-center justify-between gap-2">
            <div>
            <h2 className="text-base font-extrabold text-zinc-100">Despesas</h2>
            <p className="text-xs text-zinc-500">Controle de custos do mês selecionado.</p>
            </div>

            <button
            onClick={onNew}
            disabled={busy}
            className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-extrabold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
            + Nova despesa
            </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-yellow-400/10">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3">Descrição</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3">Categoria</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3 text-right">Valor</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3 text-center">Status</th>
                <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 py-3 px-3 text-right">Ações</th>
                </tr>
            </thead>

            <tbody>
                {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 transition hover:bg-yellow-400/5">
                    <td className="py-3 px-3">
                    <div className="font-semibold text-zinc-100">{r.descricao}</div>
                    {r.observacao ? <div className="text-xs text-zinc-500">{r.observacao}</div> : null}
                    </td>
                    <td className="py-3 px-3 text-zinc-200/90">{r.categoria}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-zinc-100">
                    {moneyBRL(r.valor)}
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
                        {r.pago ? "Paga" : "Em aberto"}
                    </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                        onClick={() => onEdit(r)}
                        disabled={busy}
                        className="rounded-xl border border-yellow-400/15 bg-zinc-900/40 px-3 py-2 text-xs font-extrabold text-zinc-100 hover:bg-zinc-900 disabled:opacity-60"
                        >
                        Editar
                        </button>
                        <button
                        onClick={() => onDelete(r)}
                        disabled={busy}
                        className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-extrabold text-red-200 hover:bg-red-400/15 disabled:opacity-60"
                        >
                        Excluir
                        </button>
                    </div>
                    </td>
                </tr>
                ))}

                {rows.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-zinc-500">
                    Nenhuma despesa lançada.
                    </td>
                </tr>
                ) : null}
            </tbody>
            </table>
        </div>
        </div>
    );
}
