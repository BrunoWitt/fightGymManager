// src/pages/components/alunos/AlunoFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";

export default function AlunoFormModal({ open, mode, initial, turmas, onClose, onSubmit }) {
    const isEdit = mode === "edit";

    const initialTurmasIds = useMemo(() => {
        // aceita initial.turmas_ids ou initial.turmas [{id}]
        if (!initial) return [];
        if (Array.isArray(initial.turmas_ids)) return initial.turmas_ids;
        if (Array.isArray(initial.turmas)) return initial.turmas.map((t) => t.id);
        return [];
    }, [initial]);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [selectedTurmas, setSelectedTurmas] = useState([]);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!open) return;
        setErr("");
        setSaving(false);

        setNome(initial?.nome || "");
        setEmail(initial?.email || "");
        setSelectedTurmas(initialTurmasIds || []);
    }, [open, initial, initialTurmasIds]);


    function toggleTurma(id) {
        setSelectedTurmas((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }


    async function handleSave() {
        setErr("");

        if (!nome.trim()) return setErr("Nome é obrigatório.");
        if (!email.trim()) return setErr("Email é obrigatório.");
        if (selectedTurmas.length === 0) return setErr("Selecione ao menos 1 turma.");

        const payload = {
        nome: nome.trim(),
        email: email.trim(),
        turmas: selectedTurmas, // backend espera list
        };

        setSaving(true);
        try {
        await onSubmit?.(payload, mode, initial?.aluno_id);
        onClose?.();
        } catch (e) {
        setErr(e.message || "Erro ao salvar");
        } finally {
        setSaving(false);
        }
    }

    return (
        <Modal
        open={open}
        title={isEdit ? "Editar aluno" : "Cadastrar novo aluno"}
        onClose={onClose}
        footer={
            <div className="flex items-center justify-end gap-2">
            <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                disabled={saving}
            >
                Cancelar
            </button>
            <button
                onClick={handleSave}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
                disabled={saving}
            >
                {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
            </button>
            </div>
        }
        >
        <div className="space-y-4">
            {err ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
            </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Nome</label>
                <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Email</label>
                <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </div>
            </div>

            <div>
            <div className="mb-2 text-xs font-medium text-zinc-600">Turmas / Modalidades</div>

            {(!turmas || turmas.length === 0) ? (
                <div className="text-sm text-zinc-500">
                Nenhuma turma carregada. (Você precisa de um endpoint <code className="font-mono">GET /turmas</code>.)
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {turmas.map((t) => (
                    <label
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"
                    >
                    <input
                        type="checkbox"
                        checked={selectedTurmas.includes(t.id)}
                        onChange={() => toggleTurma(t.id)}
                    />
                    <span className="text-sm text-zinc-800">{t.nome}</span>
                    </label>
                ))}
                </div>
            )}
            </div>
        </div>
        </Modal>
    );
}
