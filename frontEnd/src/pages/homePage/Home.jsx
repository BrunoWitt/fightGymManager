// src/pages/homePage/Home.jsx
import { useEffect, useMemo, useState } from "react";
import Agenda from "./components/Agenda";
import PagamentosEmAberto from "./components/PagamentosEmAberto";

import logoMark from "../../assets/logoMark.png";

const API_URL = import.meta.env.VITE_API_URL;

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
        callAPI("/me");
    }, []);

    const [classesToday, setClassesToday] = useState([]);
    const [loadingToday, setLoadingToday] = useState(false);

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
        <div className="min-h-[calc(100vh-0px)] bg-zinc-950 text-zinc-100">
        {/* Fundo (glow + textura) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-300/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative p-4">
            {/* Header da página */}
            <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <img
                src={logoMark}
                alt="Classic Centro de Lutas"
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-yellow-400/20"
                />
                <div>
                <p className="text-xs text-yellow-200/80">Painel</p>
                <h1 className="text-lg font-extrabold text-white">Dashboard</h1>
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-zinc-400">Theme:</span>
                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">
                Classic (Preto • Amarelo)
                </span>
            </div>
            </div>

            {/* Grid “dashboard” */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* AGENDA */}
            <section className="lg:col-span-8">
                <div className="rounded-3xl border border-yellow-400/15 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(250,204,21,0.08)] backdrop-blur">
                {/* Dica: Agenda precisa herdar o tema. Se ela for branca por dentro, ajustamos depois. */}
                <Agenda onMonthChange={setAgendaMonth} />
                </div>
            </section>

            {/* COLUNA DIREITA */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
                {/* Aulas de hoje */}
                <div className="rounded-3xl border border-yellow-400/15 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(250,204,21,0.08)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                    <div>
                    <h2 className="text-base font-semibold text-white">Aulas de hoje</h2>
                    <p className="text-xs text-zinc-400">Lista do dia (atualize se necessário)</p>
                    </div>

                    <button
                    onClick={fetchClassesToday}
                    className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-extrabold text-zinc-950 transition hover:bg-yellow-300 disabled:opacity-70"
                    disabled={loadingToday}
                    >
                    {loadingToday ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>

                <div className="mt-3">
                    {loadingToday ? (
                    <p className="text-sm text-zinc-400">Carregando...</p>
                    ) : classesToday.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3 text-sm text-zinc-400">
                        Nenhuma aula hoje.
                    </div>
                    ) : (
                    <ul className="space-y-2 max-h-[340px] overflow-auto pr-1">
                        {classesToday.map((item, idx) => (
                        <li
                            key={`${item.turma_id}-${idx}`}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3 transition hover:bg-zinc-900/50"
                        >
                            <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-white">{item.nome}</p>
                                <p className="text-xs text-zinc-400">
                                {item.hora_inicio}–{item.hora_fim} • Prof: {item.professor}
                                </p>
                            </div>

                            <span className="text-[11px] rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-yellow-200">
                                Hoje
                            </span>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
                </div>

                {/* Em aberto */}
                <div className="rounded-3xl border border-yellow-400/15 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(250,204,21,0.08)] backdrop-blur">
                <PagamentosEmAberto mesRef={mesRef} />
                </div>
            </aside>
            </div>
        </div>
        </div>
    );
}
