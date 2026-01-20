// src/pages/components/alunos/AlunoFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";

export default function AlunoFormModal({ open, mode, initial, turmas, onClose, onSubmit }) {
    const isEdit = mode === "edit";

    const initialTurmasIds = useMemo(() => {
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
        setSelectedTurmas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    async function handleSave() {
        setErr("");

    if (!nome.trim()) return setErr("Nome é obrigatório.");
    if (!email.trim()) return setErr("Email é obrigatório.");
    if (selectedTurmas.length === 0) return setErr("Selecione ao menos 1 turma.");

    const payload = {
        nome: nome.trim(),
        email: email.trim(),
        turmas: selectedTurmas,
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

    const inputBase =
    "w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10";

    return (
        <Modal
        open={open}
        title={isEdit ? "Editar aluno" : "Cadastrar novo aluno"}
        onClose={onClose}
        footer={
            <div className="flex items-center justify-end gap-2">
            <button
                onClick={onClose}
                className="rounded-xl border border-yellow-400/10 bg-zinc-900/50 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                disabled={saving}
            >
                Cancelar
            </button>

            <button
                onClick={handleSave}
                className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
                disabled={saving}
            >
                {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
            </button>
            </div>
        }
        >
        <div className="space-y-4">
            {err ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                {err}
            </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputBase} />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">Email</label>
                <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className={inputBase}
                />
            </div>
            </div>

            <div>
            <div className="mb-2 text-xs font-semibold text-zinc-300">Turmas / Modalidades</div>

            {!turmas || turmas.length === 0 ? (
                <div className="text-sm text-zinc-400">
                Nenhuma turma carregada. (Você precisa de um endpoint{" "}
                <code className="font-mono text-yellow-200">GET /turmas/</code>.)
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {turmas.map((t) => {
                    const checked = selectedTurmas.includes(t.id);
                    return (
                    <label
                        key={t.id}
                        className={[
                        "flex items-center gap-2 rounded-xl border p-2 transition",
                        checked
                            ? "border-yellow-400/25 bg-yellow-400/10"
                            : "border-yellow-400/10 bg-zinc-950/40 hover:bg-zinc-900/50",
                        ].join(" ")}
                    >
                        <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTurma(t.id)}
                        className="accent-yellow-400"
                        />
                        <span className="text-sm text-zinc-100">{t.nome}</span>
                    </label>
                    );
                })}
                </div>
            )}
            </div>
        </div>
        </Modal>
    );
}
