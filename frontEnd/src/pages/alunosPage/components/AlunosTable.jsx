// src/pages/components/alunos/AlunosTable.jsx
import Badge from "../ui/Badge";

function joinTurmas(aluno) {
  if (Array.isArray(aluno.turmas) && aluno.turmas.length) {
    return aluno.turmas.map((t) => t.nome).join(", ");
  }
  return "—";
}

function pagoLabel(aluno) {
  if (aluno.pago_mes_atual === true) return <Badge tone="green">Pago</Badge>;
  if (aluno.pago_mes_atual === false) return <Badge tone="red">Pendente</Badge>;
  return <Badge tone="zinc">—</Badge>;
}

export default function AlunosTable({ loading, alunos, onDetails }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-yellow-400/10 bg-zinc-950/35">
      <table className="min-w-[900px] w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">Nome</th>
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">Email</th>
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">Modalidades</th>
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">Ativo</th>
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">Pago no mês</th>
            <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-6 text-sm text-zinc-400">
                Carregando alunos...
              </td>
            </tr>
          ) : alunos.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-sm text-zinc-400">
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            alunos.map((a) => (
              <tr
                key={a.aluno_id}
                className="group transition hover:bg-yellow-400/5"
              >
                <td className="border-b border-white/5 p-3">
                  <div className="font-semibold text-zinc-100">{a.nome}</div>
                </td>

                <td className="border-b border-white/5 p-3 text-sm text-zinc-300">
                  {a.email}
                </td>

                <td className="border-b border-white/5 p-3 text-sm text-zinc-300">
                  {joinTurmas(a)}
                </td>

                <td className="border-b border-white/5 p-3">
                  {a.ativo ? <Badge tone="blue">Ativo</Badge> : <Badge tone="zinc">Inativo</Badge>}
                </td>

                <td className="border-b border-white/5 p-3">
                  {pagoLabel(a)}
                </td>

                <td className="border-b border-white/5 p-3 text-right">
                  <button
                    onClick={() => onDetails?.(a.aluno_id)}
                    className="rounded-xl border border-yellow-400/15 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900 hover:border-yellow-400/25 active:scale-[0.99]"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
