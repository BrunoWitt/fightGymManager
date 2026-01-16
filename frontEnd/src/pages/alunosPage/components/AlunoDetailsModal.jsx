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
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);
}


export default function AlunoDetailsModal({ open, alunoId, onClose, api, onEdit }) {
    const [loading, setLoading] = useState(false);
    const [detalhe, setDetalhe] = useState(null);
    const [error, setError] = useState("");

  // Ajuste esse path conforme você implementar no backend:
  // Recomendado: GET /alunos/{aluno_id}/detalhes
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
            <div className="text-xs text-zinc-500">
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
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                >
                    Editar
                </button>
                ) : null}
                <button
                onClick={onClose}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
                >
                Fechar
                </button>
            </div>
            </div>
        }
        >
        {loading ? (
            <div className="text-sm text-zinc-500">Carregando detalhes...</div>
        ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
            <div className="mt-2 text-xs text-red-700/80">
                Dica: implemente o endpoint <code className="font-mono">GET /alunos/{`{id}`}/detalhes</code>.
            </div>
            </div>
        ) : !aluno ? (
            <div className="text-sm text-zinc-500">Nenhum detalhe disponível.</div>
        ) : (
            <div className="space-y-6">
            {/* Info */}
            <section className="rounded-xl border border-zinc-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Informações</h3>
                {aluno.ativo ? <Badge tone="blue">Ativo</Badge> : <Badge tone="zinc">Inativo</Badge>}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                    <div className="text-xs text-zinc-500">Nome</div>
                    <div className="text-sm font-medium text-zinc-900">{aluno.nome}</div>
                </div>
                <div>
                    <div className="text-xs text-zinc-500">Email</div>
                    <div className="text-sm text-zinc-800">{aluno.email}</div>
                </div>
                <div className="md:col-span-2">
                    <div className="text-xs text-zinc-500">Modalidades</div>
                    <div className="text-sm text-zinc-800">
                    {Array.isArray(turmas) && turmas.length
                        ? turmas.map((t) => t.nome).join(", ")
                        : "—"}
                    </div>
                </div>
                </div>
            </section>

            {/* Pagamentos */}
            <section className="rounded-xl border border-zinc-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Histórico de pagamentos</h3>
                <div className="text-xs text-zinc-500">{pagamentos.length} registro(s)</div>
                </div>

                {pagamentos.length === 0 ? (
                <div className="text-sm text-zinc-500">Sem pagamentos registrados.</div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                        <th className="border-b border-zinc-200 p-2">Mês</th>
                        <th className="border-b border-zinc-200 p-2">Quantia</th>
                        <th className="border-b border-zinc-200 p-2">Status</th>
                        <th className="border-b border-zinc-200 p-2">Pago em</th>
                        <th className="border-b border-zinc-200 p-2">Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagamentos.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50">
                            <td className="border-b border-zinc-100 p-2 text-sm">
                            {mesFmt(p.mes)}
                            </td>
                            <td className="border-b border-zinc-100 p-2 text-sm">
                            {moneyBRL(p.quantia)}
                            </td>
                            <td className="border-b border-zinc-100 p-2 text-sm">
                            {p.pago ? <Badge tone="green">Pago</Badge> : <Badge tone="red">Pendente</Badge>}
                            </td>
                            <td className="border-b border-zinc-100 p-2 text-sm text-zinc-700">
                            {p.pago_em ? new Date(p.pago_em).toLocaleString("pt-BR") : "—"}
                            </td>
                            <td className="border-b border-zinc-100 p-2 text-sm text-zinc-700">
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
