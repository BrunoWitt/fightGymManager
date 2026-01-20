// src/pages/components/alunos/AlunoFilters.jsx
export default function AlunoFilters({ filters, setFilters, turmas, total, totalFiltrado }) {
    const inputBase =
    "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10";
    const labelBase = "mb-1 block text-xs font-semibold text-zinc-300";
    const selectBase =
    "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10";

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
            <label className={labelBase}>Buscar</label>
            <input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="Nome ou email..."
                className={inputBase}
            />
            </div>

            <div>
            <label className={labelBase}>Modalidade</label>
            <select
                value={filters.turmaId}
                onChange={(e) => setFilters((p) => ({ ...p, turmaId: e.target.value }))}
                className={selectBase}
            >
                <option value="todas">Todas</option>
                {turmas?.map((t) => (
                <option key={t.id} value={String(t.id)}>
                    {t.nome}
                </option>
                ))}
            </select>
            </div>

            <div>
            <label className={labelBase}>Ativo</label>
            <select
                value={filters.ativo}
                onChange={(e) => setFilters((p) => ({ ...p, ativo: e.target.value }))}
                className={selectBase}
            >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
            </select>
            </div>

            <div>
            <label className={labelBase}>Pago no mês</label>
            <select
                value={filters.pagoMes}
                onChange={(e) => setFilters((p) => ({ ...p, pagoMes: e.target.value }))}
                className={selectBase}
            >
                <option value="todos">Todos</option>
                <option value="pagos">Pagos</option>
                <option value="pendentes">Pendentes</option>
            </select>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
            <label className={labelBase}>Ordenar</label>
            <select
                value={filters.sort}
                onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                className={selectBase}
            >
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="mais_recente">Mais recente</option>
            </select>
            </div>
        </div>

        <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end">
            <div className="text-xs text-zinc-400">
            Mostrando <span className="font-semibold text-zinc-100">{totalFiltrado}</span> de{" "}
            <span className="font-semibold text-zinc-100">{total}</span>
            </div>

            <button
            onClick={() =>
                setFilters({
                q: "",
                turmaId: "todas",
                ativo: "todos",
                pagoMes: "todos",
                sort: "nome_asc",
                })
            }
            className="rounded-xl border border-yellow-400/15 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15 hover:border-yellow-400/25"
            >
            Limpar filtros
            </button>
        </div>
        </div>
    );
}
