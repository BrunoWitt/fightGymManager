import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

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
  // 08:00-09:00 ... 21:00-22:00
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
    const map = new Map(); // key = "08:00|09:00" => row
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

    const [rows, setRows] = useState([]); // linhas da grade
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // Carrega turmas (dropdown)
    useEffect(() => {
        (async () => {
        try {
            const res = await fetch(`${API_URL}/turmas`);
            if (!res.ok) throw new Error("Falha ao carregar turmas");
            const data = await res.json();
            setTurmas(data);
        } catch (e) {
            setMsg(String(e.message || e));
        }
        })();
    }, []);

    // Carrega professores (role=professor)
    useEffect(() => {
        (async () => {
        try {
            const res = await fetch(`${API_URL}/turmas/users`); //Rota temporaria depois tem que mudar para /users
            if (!res.ok) throw new Error("Falha ao carregar professores");
            const data = await res.json();
            setProfessores(data);
        } catch (e) {
            // não trava a tela, só avisa
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
            const res = await fetch(`${API_URL}/turmas/${selectedTurmaId}`);
            if (!res.ok) throw new Error("Falha ao carregar turma selecionada");
            const data = await res.json();

            setTurmaNome(data.nome || "");
            setTurmaProfessor(data.professor || "");

            const grouped = groupHorariosToRows(data.horarios || []);

            // se não tiver horários, começa com 1 linha padrão
            if (grouped.length === 0) {
            const first = timeSlots[0];
            setRows([
                { rowId: crypto.randomUUID(), start: first.start, end: first.end, days: emptyDays() },
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
        // value = "08:00|09:00"
        const [start, end] = value.split("|");
        setRows((prev) =>
        prev.map((r) => (r.rowId === rowId ? { ...r, start, end } : r))
        );
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

        // achata rows => horarios[]
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
        <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Turma</h1>
            <button
            onClick={onSave}
            disabled={loading || !selectedTurmaId}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
            {loading ? "Salvando..." : "Salvar"}
            </button>
        </div>

        {msg && (
            <div className="mb-4 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-900">
            {msg}
            </div>
        )}

        {/* Topo: turma + professor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded border bg-white">
            <label className="block text-sm font-medium mb-2">Escolha de turma</label>
            <select
                value={selectedTurmaId}
                onChange={(e) => setSelectedTurmaId(e.target.value)}
                className="w-full rounded border px-3 py-2"
            >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                    {t.id} — {t.nome}
                </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
                As opções são ligadas ao <b>id</b> da turma.
            </p>
            </div>

            <div className="p-4 rounded border bg-white">
            <label className="block text-sm font-medium mb-2">Professor da turma</label>
            <select
                value={turmaProfessor}
                onChange={(e) => setTurmaProfessor(e.target.value)}
                disabled={professorDisabled}
                className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
            >
                <option value="">{professorDisabled ? "Selecione uma turma primeiro..." : "Selecione..."}</option>
                {professores.map((p) => (
                <option key={p.user_id} value={p.nome}>
                    {p.nome} ({p.email})
                </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
                Aqui estamos salvando o <b>nome</b> no campo `turma.professor` (porque no teu DB ele é text).
            </p>
            </div>

            <div className="p-4 rounded border bg-white">
            <label className="block text-sm font-medium mb-2">Nome da turma</label>
            <input
                value={turmaNome}
                onChange={(e) => setTurmaNome(e.target.value)}
                disabled={!selectedTurmaId}
                className="w-full rounded border px-3 py-2 disabled:bg-gray-100"
                placeholder="Ex: Muay Thai"
            />
            <p className="text-xs text-gray-500 mt-2">
                Você pode editar o nome também (vai no payload do update).
            </p>
            </div>
        </div>

        {/* Grade */}
        <div className="p-4 rounded border bg-white">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Horários</h2>
            <button
                onClick={addRow}
                disabled={!selectedTurmaId}
                className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
            >
                + Adicionar horário
            </button>
            </div>

            <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
                <thead>
                <tr className="bg-gray-50">
                    <th className="text-left p-2 border">Horário</th>
                    {DIAS.map((d) => (
                    <th key={d.id} className="text-center p-2 border">
                        {d.label}
                    </th>
                    ))}
                    <th className="text-center p-2 border">Ações</th>
                </tr>
                </thead>

                <tbody>
                {rows.map((r) => (
                    <tr key={r.rowId} className="hover:bg-gray-50">
                    <td className="p-2 border">
                        <select
                        value={`${r.start}|${r.end}`}
                        onChange={(e) => changeTime(r.rowId, e.target.value)}
                        className="w-full rounded border px-2 py-1"
                        disabled={!selectedTurmaId}
                        >
                        {timeSlots.map((s) => (
                            <option key={`${s.start}|${s.end}`} value={`${s.start}|${s.end}`}>
                            {s.label}
                            </option>
                        ))}
                        </select>
                    </td>

                    {DIAS.map((d) => (
                        <td key={d.id} className="p-2 border text-center">
                        <input
                            type="checkbox"
                            checked={!!r.days[d.id]}
                            onChange={() => toggleCell(r.rowId, d.id)}
                            disabled={!selectedTurmaId}
                            className="h-4 w-4"
                        />
                        </td>
                    ))}

                    <td className="p-2 border text-center">
                        <button
                        onClick={() => removeRow(r.rowId)}
                        disabled={!selectedTurmaId || rows.length === 1}
                        className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
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

            <p className="text-xs text-gray-500 mt-3">
            Cada checkbox cria/remover um item em <code>horarios</code> no formato:
            <code className="ml-1">{`{ dia_semana, hora_inicio, hora_fim }`}</code>
            </p>
        </div>
        </div>
    );
}
