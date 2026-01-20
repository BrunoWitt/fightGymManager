// src/pages/components/alunos/AlunoDetailsModal.jsx
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";

function moneyBRL(v) {
    const n = Number(v || 0);
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function mesFmt(isoDate) {
    if (!isoDate) return "—";
    const d = new Date(isoDate);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function AlunoDetailsModal({ open, alunoId, onClose, api, onEdit }) {
    const [loading, setLoading] = useState(false);
    const [detalhe, setDetalhe] = useState(null);
    const [error, setError] = useState("");

    const detailsPath = useMemo(() => {
        if (!alunoId) return null;
        return `/alunos/${alunoId}/details`;
    }, [alunoId]);

    useEffect(() => {
        if (!open || !detailsPath) return;

        let mounted = true;
        setLoading(true);
        setError("");
        setDetalhe(null);

        api(detailsPath)
            .then((data) => {
                if (!mounted) return;
                setDetalhe(data);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Erro ao carregar detalhes");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
            };
        }, [open, detailsPath, api]);

    const payload = detalhe?.data ?? detalhe;

    const aluno = payload?.aluno ?? payload ?? null;
    const turmas = payload?.turmas ?? aluno?.turmas ?? [];
    const pagamentos = payload?.pagamentos ?? aluno?.pagamentos ?? [];

    return (
        <Modal
        open={open}
        title={aluno ? `Detalhes — ${aluno.nome}` : "Detalhes do aluno"}
        onClose={onClose}
        footer={
            <div className="flex items-center justify-between">
            <div className="text-xs">
                {aluno?.pago_mes_atual === true ? (
                <Badge tone="green">Pago no mês</Badge>
                ) : aluno?.pago_mes_atual === false ? (
                <Badge tone="red">Pendente no mês</Badge>
                ) : (
                <Badge tone="zinc">Status do mês indisponível</Badge>
                )}
            </div>

            <div className="flex gap-2">
                {aluno ? (
                <button
                    onClick={() => onEdit?.(aluno)}
                    className="rounded-xl border border-yellow-400/15 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
                >
                    Editar
                </button>
                ) : null}

                <button
                onClick={onClose}
                className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                Fechar
                </button>
            </div>
            </div>
        }
        >
        {loading ? (
            <div className="text-sm text-zinc-400">Carregando detalhes...</div>
        ) : error ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
            <div className="mt-2 text-xs text-rose-200/80">
                Dica: implemente o endpoint{" "}
                <code className="font-mono text-yellow-200">GET /alunos/{`{id}`}/detalhes</code>.
            </div>
            </div>
        ) : !aluno ? (
            <div className="text-sm text-zinc-400">Nenhum detalhe disponível.</div>
        ) : (
            <div className="space-y-6">
            {/* Info */}
            <section className="rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Informações</h3>
                {aluno.ativo ? <Badge tone="blue">Ativo</Badge> : <Badge tone="zinc">Inativo</Badge>}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                    <div className="text-xs text-zinc-500">Nome</div>
                    <div className="text-sm font-semibold text-zinc-100">{aluno.nome}</div>
                </div>

                <div>
                    <div className="text-xs text-zinc-500">Email</div>
                    <div className="text-sm text-zinc-200">{aluno.email}</div>
                </div>

                <div className="md:col-span-2">
                    <div className="text-xs text-zinc-500">Modalidades</div>
                    <div className="text-sm text-zinc-200">
                    {Array.isArray(turmas) && turmas.length ? turmas.map((t) => t.nome).join(", ") : "—"}
                    </div>
                </div>
                </div>
            </section>

            {/* Pagamentos */}
            <section className="rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Histórico de pagamentos</h3>
                <div className="text-xs text-zinc-500">{pagamentos.length} registro(s)</div>
                </div>

                {pagamentos.length === 0 ? (
                <div className="text-sm text-zinc-400">Sem pagamentos registrados.</div>
                ) : (
                <div className="overflow-x-auto rounded-2xl border border-yellow-400/10">
                    <table className="min-w-[700px] w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-2">Mês</th>
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-2">Quantia</th>
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-2">Status</th>
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-2">Pago em</th>
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-2">Obs.</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pagamentos.map((p) => (
                        <tr key={p.id} className="transition hover:bg-yellow-400/5">
                            <td className="border-b border-white/5 p-2 text-sm text-zinc-200">
                            {mesFmt(p.mes)}
                            </td>
                            <td className="border-b border-white/5 p-2 text-sm text-zinc-200">
                            {moneyBRL(p.quantia)}
                            </td>
                            <td className="border-b border-white/5 p-2 text-sm">
                            {p.pago ? <Badge tone="green">Pago</Badge> : <Badge tone="red">Pendente</Badge>}
                            </td>
                            <td className="border-b border-white/5 p-2 text-sm text-zinc-300">
                            {p.pago_em ? new Date(p.pago_em).toLocaleString("pt-BR") : "—"}
                            </td>
                            <td className="border-b border-white/5 p-2 text-sm text-zinc-300">
                            {p.observacao || "—"}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </section>
            </div>
        )}
        </Modal>
    );
}
