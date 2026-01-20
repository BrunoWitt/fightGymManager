// src/pages/Alunos.jsx
import { useEffect, useMemo, useState } from "react";
import AlunoFilters from "./components/AlunoFilters";
import AlunosTable from "./components/AlunosTable";
import AlunoDetailsModal from "./components/AlunoDetailsModal";
import AlunoFormModal from "./components/AlunoFormModal";

const API_URL = import.meta.env.VITE_API_URL

// função padrão de API
async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });

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
        ativo: "todos",
        pagoMes: "todos",
        sort: "nome_asc",
    });

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedAlunoId, setSelectedAlunoId] = useState(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [formInitial, setFormInitial] = useState(null);

    async function loadBase() {
        setLoading(true);
        try {
        const alunosData = await api("/alunos");
        setAlunos(Array.isArray(alunosData) ? alunosData : []);

        // ✅ Evita 307 do FastAPI: rota é /turmas/
        try {
            const turmasData = await api("/turmas/");
            setTurmas(Array.isArray(turmasData) ? turmasData : []);
        } catch {
            setTurmas([]);
        }
        } catch (e) {
        console.error(e);
        setAlunos([]);
        setTurmas([]);
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

        if (q) {
        list = list.filter((a) => {
            const nome = (a.nome || "").toLowerCase();
            const email = (a.email || "").toLowerCase();
            return nome.includes(q) || email.includes(q);
        });
        }

        if (filters.ativo !== "todos") {
        const wantActive = filters.ativo === "ativos";
        list = list.filter((a) => Boolean(a.ativo) === wantActive);
        }

        if (filters.turmaId !== "todas") {
        const turmaIdNum = Number(filters.turmaId);
        list = list.filter((a) => {
            const ids =
            Array.isArray(a.turmas_ids)
                ? a.turmas_ids
                : Array.isArray(a.turmas)
                ? a.turmas.map((t) => t.id)
                : [];
            return ids.includes(turmaIdNum);
        });
        }

        if (filters.pagoMes !== "todos") {
        if (filters.pagoMes === "pagos") list = list.filter((a) => a.pago_mes_atual === true);
        if (filters.pagoMes === "pendentes") list = list.filter((a) => a.pago_mes_atual === false);
        }

        if (filters.sort === "nome_asc") {
        list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        } else if (filters.sort === "nome_desc") {
        list.sort((a, b) => (b.nome || "").localeCompare(a.nome || ""));
        } else if (filters.sort === "mais_recente") {
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
        <div className="p-4 md:p-6 text-zinc-100">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
            <h1 className="text-xl font-semibold tracking-tight">Alunos</h1>
            <p className="text-sm text-zinc-400">
                Listagem, filtros e detalhes com histórico de pagamentos.
            </p>
            </div>

            <button
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 active:scale-[0.99]"
            >
            + Cadastrar aluno
            </button>
        </div>

        {/* Card principal */}
        <div className="rounded-2xl border border-yellow-400/15 bg-zinc-950/55 shadow-[0_0_0_1px_rgba(250,204,21,0.10)] backdrop-blur">
            <div className="border-b border-yellow-400/10 p-3">
            <AlunoFilters
                filters={filters}
                setFilters={setFilters}
                turmas={turmas}
                total={alunos.length}
                totalFiltrado={alunosFiltrados.length}
            />
            </div>

            <div className="p-3">
            <AlunosTable loading={loading} alunos={alunosFiltrados} onDetails={(id) => openDetails(id)} />
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
