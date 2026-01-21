function Card({ title, value, subtitle }) {
    return (
        <div className="rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
        <div className="text-xs uppercase tracking-wide text-zinc-400">{title}</div>
        <div className="mt-1 text-lg font-extrabold text-zinc-100">{value}</div>
        {subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}
        </div>
    );
}

export default function SummaryCards({ loading, resumo, moneyBRL }) {
    if (loading) return <div className="text-sm text-zinc-400">Carregando resumo...</div>;
    if (!resumo) return <div className="text-sm text-zinc-400">Sem dados.</div>;

    const rec = resumo.receitas || {};
    const desp = resumo.despesas || {};

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Receitas previstas" value={moneyBRL(rec.receitas_previstas)} />
        <Card
            title="Receitas recebidas"
            value={moneyBRL(rec.receitas_recebidas)}
            subtitle={`Em aberto: ${moneyBRL(rec.receitas_em_aberto)}`}
        />
        <Card title="Despesas previstas" value={moneyBRL(desp.despesas_previstas)} />
        <Card
            title="Despesas pagas"
            value={moneyBRL(desp.despesas_pagas)}
            subtitle={`Em aberto: ${moneyBRL(desp.despesas_em_aberto)}`}
        />
        <Card title="Saldo caixa" value={moneyBRL(resumo.saldo_caixa)} />
        <Card title="Saldo previsto" value={moneyBRL(resumo.saldo_previsto)} />
        </div>
    );
}
