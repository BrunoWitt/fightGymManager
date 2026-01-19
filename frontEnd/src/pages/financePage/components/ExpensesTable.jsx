// src/pages/financePage/components/ExpensesTable.jsx
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
    if (loading) {
        return <div className="text-sm text-zinc-500">Carregando despesas...</div>;
    }

    return (
        <div>
        <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-zinc-900">Despesas</h2>

            <button
            onClick={onNew}
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
            + Nova despesa
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                <th className="py-2 pr-3">Descrição</th>
                <th className="py-2 pr-3">Categoria</th>
                <th className="py-2 pr-3 text-right">Valor</th>
                <th className="py-2 pr-3 text-center">Status</th>
                <th className="py-2 pr-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100">
                    <td className="py-2 pr-3">
                    <div className="font-medium text-zinc-900">{r.descricao}</div>
                    {r.observacao ? (
                        <div className="text-xs text-zinc-500">{r.observacao}</div>
                    ) : null}
                    </td>
                    <td className="py-2 pr-3 text-zinc-700">{r.categoria}</td>
                    <td className="py-2 pr-3 text-right font-medium text-zinc-900">
                    {moneyBRL(r.valor)}
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
                        {r.pago ? "Paga" : "Em aberto"}
                    </button>
                    </td>
                    <td className="py-2 pr-3 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                        onClick={() => onEdit(r)}
                        disabled={busy}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
                        >
                        Editar
                        </button>
                        <button
                        onClick={() => onDelete(r)}
                        disabled={busy}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                        Excluir
                        </button>
                    </div>
                    </td>
                </tr>
                ))}

                {rows.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
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
