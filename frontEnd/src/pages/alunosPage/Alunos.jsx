// src/pages/Alunos.jsx
import { useEffect, useMemo, useState } from "react";
import AlunoFilters from "./components/AlunoFilters";
import AlunosTable from "./components/AlunosTable";
import AlunoDetailsModal from "./components/AlunoDetailsModal";
import AlunoFormModal from "./components/AlunoFormModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

//Cria uma função geral para chamar o banco(facilita a vida)
async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    //Todos os routes retornam json então da pra criar esse padrão
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data?.message || data?.detail || "Erro na requisição";
        throw new Error(msg);
    }
    return data;
}

export default function Alunos() {
    const [loading, setLoading] = useState(true);
    const [alunos, setAlunos] = useState([]);
    const [turmas, setTurmas] = useState([]);

    const [filters, setFilters] = useState({
        q: "",
        turmaId: "todas",
        ativo: "todos", // todos | ativos | inativos
        pagoMes: "todos", // todos | pagos | pendentes
        sort: "nome_asc", // nome_asc | nome_desc | mais_recente
    });

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedAlunoId, setSelectedAlunoId] = useState(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create"); // create | edit
    const [formInitial, setFormInitial] = useState(null);

    async function loadBase() {
        setLoading(true);
        try {
        // 1) lista alunos (mínimo)
        const alunosData = await api("/alunos");
        setAlunos(Array.isArray(alunosData) ? alunosData : []);

        // 2) lista turmas (assumido que exista endpoint)
        // Se você ainda não tiver, pode comentar isso por enquanto.
        try {
            const turmasData = await api("/turmas");
            setTurmas(Array.isArray(turmasData) ? turmasData : []);
        } catch {
            setTurmas([]);
        }
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => {
        loadBase();
    }, []);

    const alunosFiltrados = useMemo(() => {
        const q = (filters.q || "").trim().toLowerCase();

        let list = [...alunos];

        // filtro por texto (nome/email)
        if (q) {
        list = list.filter((a) => {
            const nome = (a.nome || "").toLowerCase();
            const email = (a.email || "").toLowerCase();
            return nome.includes(q) || email.includes(q);
        });
        }

        // ativo/inativo
        if (filters.ativo !== "todos") {
        const wantActive = filters.ativo === "ativos";
        list = list.filter((a) => Boolean(a.ativo) === wantActive);
        }

        // turma/modalidade (precisa vir no payload como a.turmas = [{id,nome}] ou a.turmas_ids)
        if (filters.turmaId !== "todas") {
        const turmaIdNum = Number(filters.turmaId);
        list = list.filter((a) => {
            const ids =
            Array.isArray(a.turmas_ids) ? a.turmas_ids :
            Array.isArray(a.turmas) ? a.turmas.map((t) => t.id) :
            [];
            return ids.includes(turmaIdNum);
        });
        }

        // pago do mês (precisa vir como a.pago_mes_atual boolean)
        if (filters.pagoMes !== "todos") {
        if (filters.pagoMes === "pagos") {
            list = list.filter((a) => a.pago_mes_atual === true);
        } else if (filters.pagoMes === "pendentes") {
            list = list.filter((a) => a.pago_mes_atual === false);
        }
        }

        // ordenação
        if (filters.sort === "nome_asc") {
        list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        } else if (filters.sort === "nome_desc") {
        list.sort((a, b) => (b.nome || "").localeCompare(a.nome || ""));
        } else if (filters.sort === "mais_recente") {
        // se você tiver created_at/updated_at no payload, usa aqui
        list.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
        }

        return list;
    }, [alunos, filters]);


    function openDetails(alunoId) {
        setSelectedAlunoId(alunoId);
        setDetailsOpen(true);
    }


    function openCreate() {
        setFormMode("create");
        setFormInitial(null);
        setFormOpen(true);
    }


    function openEditFromDetails(alunoDetalhe) {
        setFormMode("edit");
        setFormInitial(alunoDetalhe);
        setFormOpen(true);
    }


    async function handleSubmitAluno(payload, mode, alunoId) {
        if (mode === "create") {
        await api("/alunos/register", { method: "POST", body: JSON.stringify(payload) });
        } else {
        await api(`/alunos/${alunoId}/edit`, { method: "PUT", body: JSON.stringify(payload) });
        }
        await loadBase();
    }


    return (
        <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
            <h1 className="text-xl font-semibold">Alunos</h1>
            <p className="text-sm text-zinc-500">
                Listagem, filtros e detalhes com histórico de pagamentos.
            </p>
            </div>

            <button
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
            + Cadastrar aluno
            </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-3">
            <AlunoFilters
                filters={filters}
                setFilters={setFilters}
                turmas={turmas}
                total={alunos.length}
                totalFiltrado={alunosFiltrados.length}
            />
            </div>

            <div className="p-3">
            <AlunosTable
                loading={loading}
                alunos={alunosFiltrados}
                onDetails={(id) => openDetails(id)}
            />
            </div>
        </div>

        <AlunoDetailsModal
            open={detailsOpen}
            alunoId={selectedAlunoId}
            onClose={() => setDetailsOpen(false)}
            api={api}
            onEdit={(alunoDetalhe) => openEditFromDetails(alunoDetalhe)}
        />

        <AlunoFormModal
            open={formOpen}
            mode={formMode}
            initial={formInitial}
            turmas={turmas}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmitAluno}
        />
        </div>
    );
}
