import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://10.0.0.91:8001";

const DIAS = [
    { id: 1, label: "Segunda" },
    { id: 2, label: "Terça" },
    { id: 3, label: "Quarta" },
    { id: 4, label: "Quinta" },
    { id: 5, label: "Sexta" },
    { id: 6, label: "Sábado" },
    { id: 7, label: "Domingo" },
];

function buildTimeSlots() {
    const slots = [];
    for (let h = 8; h < 22; h++) {
        const start = String(h).padStart(2, "0") + ":00";
        const end = String(h + 1).padStart(2, "0") + ":00";
        slots.push({ start, end, label: `${start} - ${end}` });
    }
    return slots;
}

function emptyDays() {
    const obj = {};
    for (const d of DIAS) obj[d.id] = false;
    return obj;
}

// Agrupa horários vindos do backend em linhas por faixa (hora_inicio+hora_fim)
function groupHorariosToRows(horarios) {
    const map = new Map();
    for (const h of horarios || []) {
        const key = `${h.hora_inicio}|${h.hora_fim}`;
        if (!map.has(key)) {
        map.set(key, {
            rowId: crypto.randomUUID(),
            start: h.hora_inicio,
            end: h.hora_fim,
            days: emptyDays(),
        });
        }
        const row = map.get(key);
        row.days[h.dia_semana] = true;
    }
    return Array.from(map.values());
}

export default function Turma() {
    const timeSlots = useMemo(() => buildTimeSlots(), []);

    const [turmas, setTurmas] = useState([]);
    const [professores, setProfessores] = useState([]);

    const [selectedTurmaId, setSelectedTurmaId] = useState("");
    const [turmaNome, setTurmaNome] = useState("");
    const [turmaProfessor, setTurmaProfessor] = useState("");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

  // --- styles base (Classic) ---
    const card =
        "rounded-2xl border border-yellow-400/10 bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur";
    const label = "mb-1 block text-xs font-semibold text-zinc-300";
    const helper = "mt-2 text-xs text-zinc-500";
    const input =
        "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10 disabled:opacity-60";
    const select =
        "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10 disabled:opacity-60";

    // Carrega turmas (dropdown)
    useEffect(() => {
        (async () => {
        try {
            const res = await fetch(`${API_URL}/turmas`, {
            method: "get",
            credentials: "include",
            });
            if (!res.ok) throw new Error("Falha ao carregar turmas");
            const data = await res.json();
            setTurmas(data);
        } catch (e) {
            setMsg(String(e.message || e));
        }
        })();
    }, []);

  // Carrega professores
    useEffect(() => {
        (async () => {
        try {
            const res = await fetch(`${API_URL}/turmas/users`, {
            credentials: "include",
            });
            if (!res.ok) throw new Error("Falha ao carregar professores");
            const data = await res.json();
            setProfessores(data);
        } catch (e) {
            setMsg((prev) => prev || String(e.message || e));
        }
        })();
    }, []);

     // Ao selecionar turma, buscar detalhes
    useEffect(() => {
        if (!selectedTurmaId) {
        setTurmaNome("");
        setTurmaProfessor("");
        setRows([]);
        return;
        }

        (async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API_URL}/turmas/${selectedTurmaId}`, {
            credentials: "include",
            });
            if (!res.ok) throw new Error("Falha ao carregar turma selecionada");
            const data = await res.json();

            setTurmaNome(data.nome || "");
            setTurmaProfessor(data.professor || "");

            const grouped = groupHorariosToRows(data.horarios || []);

            if (grouped.length === 0) {
            const first = timeSlots[0];
            setRows([
                {
                rowId: crypto.randomUUID(),
                start: first.start,
                end: first.end,
                days: emptyDays(),
                },
            ]);
            } else {
            setRows(grouped);
            }
        } catch (e) {
            setMsg(String(e.message || e));
        } finally {
            setLoading(false);
        }
        })();
    }, [selectedTurmaId, timeSlots]);

    function addRow() {
        const first = timeSlots[0];
        setRows((prev) => [
        ...prev,
        { rowId: crypto.randomUUID(), start: first.start, end: first.end, days: emptyDays() },
        ]);
    }

    function removeRow(rowId) {
        setRows((prev) => prev.filter((r) => r.rowId !== rowId));
    }

    function toggleCell(rowId, diaId) {
        setRows((prev) =>
        prev.map((r) => {
            if (r.rowId !== rowId) return r;
            return { ...r, days: { ...r.days, [diaId]: !r.days[diaId] } };
        })
        );
    }

    function changeTime(rowId, value) {
        const [start, end] = value.split("|");
        setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, start, end } : r)));
    }

    async function onSave() {
        if (!selectedTurmaId) {
            setMsg("Selecione uma turma antes de salvar.");
            return;
        }
        if (!turmaProfessor) {
            setMsg("Selecione um professor.");
            return;
        }

    const horarios = [];
        for (const r of rows) {
        for (const d of DIAS) {
            if (r.days[d.id]) {
            horarios.push({
                dia_semana: d.id,
                hora_inicio: r.start,
                hora_fim: r.end,
            });
            }
        }
    }

    const payload = {
        nome: turmaNome,
        professor: turmaProfessor,
        horarios,
    };

        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API_URL}/turmas/${selectedTurmaId}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Erro ao salvar. ${txt}`);
        }

        const data = await res.json();
            setMsg(data?.result ? `Salvo: ${data.result}` : "Salvo com sucesso!");
        } catch (e) {
            setMsg(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }

    const professorDisabled = !selectedTurmaId;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* glow + textura */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-44 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-[-200px] right-[-140px] h-[520px] w-[520px] rounded-full bg-yellow-300/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative w-full p-4 md:p-6">
            {/* header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Turmas</h1>
                <p className="mt-1 text-sm text-zinc-400">
                Selecione a turma, defina professor e marque os horários por dia.
                </p>
            </div>

            <button
                onClick={onSave}
                disabled={loading || !selectedTurmaId}
                className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-yellow-300 disabled:opacity-50"
            >
                {loading ? "Salvando..." : "Salvar"}
            </button>
            </div>

            {msg ? (
            <div className="mb-5 rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-sm text-yellow-200">
                {msg}
            </div>
            ) : null}

            {/* Topo: turma + professor + nome */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div className={card}>
                <label className={label}>Escolha de turma</label>
                <select
                value={selectedTurmaId}
                onChange={(e) => setSelectedTurmaId(e.target.value)}
                className={select}
                >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                    {t.id} — {t.nome}
                    </option>
                ))}
                </select>
                <p className={helper}>
                As opções são ligadas ao <b className="text-zinc-200">id</b> da turma.
                </p>
            </div>

            <div className={card}>
                <label className={label}>Professor da turma</label>
                <select
                value={turmaProfessor}
                onChange={(e) => setTurmaProfessor(e.target.value)}
                disabled={professorDisabled}
                className={select}
                >
                <option value="">
                    {professorDisabled ? "Selecione uma turma primeiro..." : "Selecione..."}
                </option>
                {professores.map((p) => (
                    <option key={p.user_id} value={p.nome}>
                    {p.nome} ({p.email})
                    </option>
                ))}
                </select>
                <p className={helper}>
                Salvando o <b className="text-zinc-200">nome</b> no campo{" "}
                <code className="font-mono text-yellow-200">turma.professor</code> (texto).
                </p>
            </div>

            <div className={card}>
                <label className={label}>Nome da turma</label>
                <input
                value={turmaNome}
                onChange={(e) => setTurmaNome(e.target.value)}
                disabled={!selectedTurmaId}
                className={input}
                placeholder="Ex: Muay Thai"
                />
                <p className={helper}>
                Você pode editar o nome (vai no payload do update).
                </p>
            </div>
            </div>

            {/* Grade */}
            <div className={`${card} p-0`}>
            <div className="flex items-center justify-between gap-3 border-b border-yellow-400/10 px-4 py-3">
                <div>
                <h2 className="text-lg font-extrabold">Horários</h2>
                <p className="text-xs text-zinc-500">
                    Marque os dias para cada faixa de horário.
                </p>
                </div>

                <button
                onClick={addRow}
                disabled={!selectedTurmaId}
                className="rounded-xl border border-yellow-400/15 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900 disabled:opacity-50"
                >
                + Adicionar horário
                </button>
            </div>

            <div className="overflow-x-auto p-4">
                <div className="rounded-2xl border border-yellow-400/10 overflow-hidden">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                    <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-400">
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3">
                        Horário
                        </th>
                        {DIAS.map((d) => (
                        <th
                            key={d.id}
                            className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3 text-center"
                        >
                            {d.label}
                        </th>
                        ))}
                        <th className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-yellow-400/10 p-3 text-center">
                        Ações
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((r) => (
                        <tr key={r.rowId} className="transition hover:bg-yellow-400/5">
                        <td className="border-b border-white/5 p-3">
                            <select
                            value={`${r.start}|${r.end}`}
                            onChange={(e) => changeTime(r.rowId, e.target.value)}
                            className={select}
                            disabled={!selectedTurmaId}
                            >
                            {timeSlots.map((s) => (
                                <option key={`${s.start}|${s.end}`} value={`${s.start}|${s.end}`}>
                                {s.label}
                                </option>
                            ))}
                            </select>
                        </td>

                        {DIAS.map((d) => {
                            const checked = !!r.days[d.id];
                            return (
                            <td key={d.id} className="border-b border-white/5 p-3 text-center">
                                <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCell(r.rowId, d.id)}
                                disabled={!selectedTurmaId}
                                className="h-4 w-4 accent-yellow-400"
                                />
                            </td>
                            );
                        })}

                        <td className="border-b border-white/5 p-3 text-center">
                            <button
                            onClick={() => removeRow(r.rowId)}
                            disabled={!selectedTurmaId || rows.length === 1}
                            className="rounded-xl border border-yellow-400/15 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900 disabled:opacity-50"
                            title="Remover linha"
                            >
                            Remover
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
