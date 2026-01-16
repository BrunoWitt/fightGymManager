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
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3">Nome</th>
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3">Email</th>
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3">Modalidades</th>
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3">Ativo</th>
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3">Pago no mês</th>
            <th className="sticky top-0 bg-white border-b border-zinc-200 p-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-6 text-sm text-zinc-500">
                Carregando alunos...
              </td>
            </tr>
          ) : alunos.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-sm text-zinc-500">
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            alunos.map((a) => (
              <tr key={a.aluno_id} className="hover:bg-zinc-50">
                <td className="border-b border-zinc-100 p-3">
                  <div className="font-medium text-zinc-900">{a.nome}</div>
                </td>
                <td className="border-b border-zinc-100 p-3 text-sm text-zinc-700">
                  {a.email}
                </td>
                <td className="border-b border-zinc-100 p-3 text-sm text-zinc-700">
                  {joinTurmas(a)}
                </td>
                <td className="border-b border-zinc-100 p-3">
                  {a.ativo ? <Badge tone="blue">Ativo</Badge> : <Badge tone="zinc">Inativo</Badge>}
                </td>
                <td className="border-b border-zinc-100 p-3">
                  {pagoLabel(a)}
                </td>
                <td className="border-b border-zinc-100 p-3 text-right">
                  <button
                    onClick={() => onDetails?.(a.aluno_id)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-white"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="mt-3 text-xs text-zinc-500">
        * Para “Modalidades” e “Pago no mês” aparecerem aqui, o backend precisa retornar esses campos
        no endpoint de listagem, ou você pode preencher via um endpoint “summary”.
      </p>
    </div>
  );
}
