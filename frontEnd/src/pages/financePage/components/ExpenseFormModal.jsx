// src/pages/financePage/components/ExpenseFormModal.jsx
import { useEffect, useState } from "react";

export default function ExpenseFormModal({ open, mode, initial, onClose, onSubmit, busy }) {
    const [form, setForm] = useState({
        descricao: "",
        categoria: "",
        competencia: "",
        valor: "",
        vencimento: "",
        observacao: "",
    });

    useEffect(() => {
        if (!open) return;
        setForm({
        descricao: initial?.descricao || "",
        categoria: initial?.categoria || "",
        competencia: initial?.competencia || "",
        valor: initial?.valor ?? "",
        vencimento: initial?.vencimento || "",
        observacao: initial?.observacao || "",
        });
    }, [open, initial]);

    if (!open) return null;

    function submit() {
        onSubmit({
        descricao: String(form.descricao || "").trim(),
        categoria: String(form.categoria || "").trim(),
        competencia: String(form.competencia || "").trim(), // "YYYY-MM-01"
        valor: Number(form.valor || 0),
        vencimento: form.vencimento ? String(form.vencimento).trim() : null,
        observacao: form.observacao ? String(form.observacao).trim() : null,
        });
    }

    const canSave =
        String(form.descricao || "").trim() &&
        String(form.categoria || "").trim() &&
        String(form.competencia || "").trim() &&
        String(form.valor || "").trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between">
            <div>
                <h3 className="text-base font-semibold text-zinc-900">
                {mode === "edit" ? "Editar despesa" : "Nova despesa"}
                </h3>
                <p className="text-xs text-zinc-500">
                Competência deve ser no formato <span className="font-medium">YYYY-MM-01</span>
                </p>
            </div>

            <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
            >
                ✕
            </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs text-zinc-600">
            Descrição
            <input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            </label>

            <label className="text-xs text-zinc-600">
                Categoria
                <input
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </label>

            <label className="text-xs text-zinc-600">
                Competência (YYYY-MM-01)
                <input
                value={form.competencia}
                onChange={(e) => setForm({ ...form, competencia: e.target.value })}
                placeholder="2026-01-01"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </label>

            <label className="text-xs text-zinc-600">
                Valor
                <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </label>

            <label className="text-xs text-zinc-600 md:col-span-2">
                Vencimento (opcional, YYYY-MM-DD)
                <input
                value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                placeholder="2026-01-10"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </label>

            <label className="text-xs text-zinc-600 md:col-span-2">
                Observação (opcional)
                <input
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
            </label>
        </div>

            <div className="mt-4 flex justify-end gap-2">
            <button
                onClick={onClose}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
                Cancelar
            </button>
            <button
                onClick={submit}
                disabled={!canSave || busy}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Salvar
            </button>
            </div>
        </div>
        </div>
    );
}
