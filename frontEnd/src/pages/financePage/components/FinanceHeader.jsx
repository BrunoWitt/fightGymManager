export default function FinanceHeader({ monthValue, setMonthValue, onGerarMes, busy }) {
    const card =
        "rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur";
    const label = "text-sm font-semibold text-zinc-200";
    const input =
        "rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10";

    return (
        <div className={`${card} flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
        <div className="flex items-center gap-3">
            <label className={label}>Mês</label>
            <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className={input}
            />
        </div>

        <button
            onClick={onGerarMes}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
            Gerar mensalidades do mês
        </button>
        </div>
    );
}