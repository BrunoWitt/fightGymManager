// src/pages/homePage/Home.jsx
import { useEffect, useMemo, useState } from "react";
import Agenda from "./components/Agenda";
import PagamentosEmAberto from "./components/PagamentosEmAberto";

const API_URL = import.meta.env.VITE_API_URL

async function callAPI(path) {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message || data?.detail || "Erro na requisição";
        throw new Error(message);
    }

    return data;
}

function firstDayOfMonthYMD(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
}

export default function Home() {

    useEffect(() => {
        callAPI("/me")
    }, [])

    const [classesToday, setClassesToday] = useState([]);
    const [loadingToday, setLoadingToday] = useState(false);

    // mês atual exibido na agenda (sincroniza pagamentos)
    const [agendaMonth, setAgendaMonth] = useState(() => new Date());

    const mesRef = useMemo(() => firstDayOfMonthYMD(agendaMonth), [agendaMonth]);

    async function fetchClassesToday() {
        try {
        setLoadingToday(true);
        const data = await callAPI("/turmas/hoje");
        setClassesToday(data);
        } catch (e) {
        console.error(e);
        setClassesToday([]);
        } finally {
        setLoadingToday(false);
        }
    }

    useEffect(() => {
        fetchClassesToday();
    }, []);

    return (
        <div className="p-4">
        {/* grid “dashboard”: agenda grande + coluna direita com 2 cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* AGENDA (maior) */}
            <section className="lg:col-span-8">
            <Agenda onMonthChange={setAgendaMonth} />
            </section>

            {/* COLUNA DIREITA */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Aulas de hoje */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900">Aulas de hoje</h2>
                    <p className="text-xs text-zinc-500">
                    Lista do dia (atualize se necessário)
                    </p>
                </div>

                <button
                    onClick={fetchClassesToday}
                    className="text-xs rounded-md border border-zinc-200 px-2 py-1 hover:bg-zinc-50"
                    disabled={loadingToday}
                >
                    Atualizar
                </button>
                </div>

                <div className="mt-3">
                {loadingToday ? (
                    <p className="text-sm text-zinc-500">Carregando...</p>
                ) : classesToday.length === 0 ? (
                    <p className="text-sm text-zinc-500">Nenhuma aula hoje.</p>
                ) : (
                    <ul className="space-y-2 max-h-[340px] overflow-auto pr-1">
                    {classesToday.map((item, idx) => (
                        <li
                        key={`${item.turma_id}-${idx}`}
                        className="rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 transition"
                        >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                            <p className="text-sm font-semibold text-zinc-900">{item.nome}</p>
                            <p className="text-xs text-zinc-500">
                                {item.hora_inicio}–{item.hora_fim} • Prof: {item.professor}
                            </p>
                            </div>
                            <span className="text-[11px] rounded-full border border-zinc-200 px-2 py-1 text-zinc-600">
                            Hoje
                            </span>
                        </div>
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            </div>

            {/* Em aberto (sincroniza com mês da agenda) */}
            <PagamentosEmAberto mesRef={mesRef} />
            </aside>
        </div>
        </div>
    );
}
