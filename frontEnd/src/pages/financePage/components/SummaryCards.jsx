// src/pages/financePage/components/SummaryCards.jsx
function Card({ title, value, subtitle }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-xs text-zinc-500">{title}</div>
        <div className="mt-1 text-lg font-semibold text-zinc-900">{value}</div>
        {subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}
        </div>
    );
}

export default function SummaryCards({ loading, resumo, moneyBRL }) {
    if (loading) {
        return <div className="text-sm text-zinc-500">Carregando resumo...</div>;
    }
    if (!resumo) {
        return <div className="text-sm text-zinc-500">Sem dados.</div>;
    }

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
