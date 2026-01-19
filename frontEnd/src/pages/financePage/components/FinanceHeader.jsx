// src/pages/financePage/components/FinanceHeader.jsx
export default function FinanceHeader({ monthValue, setMonthValue, onGerarMes, busy }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-700">Mês</label>
            <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
        </div>

        <button
            onClick={onGerarMes}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
            Gerar mensalidades do mês
        </button>
        </div>
    );
}
