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

    const input =
        "mt-1 w-full rounded-xl border border-yellow-400/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-yellow-400/25 focus:ring-2 focus:ring-yellow-400/10";

    function submit() {
        onSubmit({
        descricao: String(form.descricao || "").trim(),
        categoria: String(form.categoria || "").trim(),
        competencia: String(form.competencia || "").trim(),
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
        <div className="w-full max-w-lg rounded-2xl border border-yellow-400/10 bg-zinc-950/85 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-base font-extrabold text-zinc-100">
                {mode === "edit" ? "Editar despesa" : "Nova despesa"}
                </h3>
                <p className="text-xs text-zinc-500">
                Competência: <span className="font-semibold text-zinc-300">YYYY-MM-01</span>
                </p>
            </div>

            <button
                onClick={onClose}
                className="rounded-xl border border-yellow-400/15 bg-zinc-900/50 px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-900"
            >
                ✕
            </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold text-zinc-300">
                Descrição
                <input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className={input}
                />
            </label>

            <label className="text-xs font-semibold text-zinc-300">
                Categoria
                <input
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className={input}
                />
            </label>

            <label className="text-xs font-semibold text-zinc-300">
                Competência (YYYY-MM-01)
                <input
                value={form.competencia}
                onChange={(e) => setForm({ ...form, competencia: e.target.value })}
                placeholder="2026-01-01"
                className={input}
                />
            </label>

            <label className="text-xs font-semibold text-zinc-300">
                Valor
                <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className={input}
                />
            </label>

            <label className="text-xs font-semibold text-zinc-300 md:col-span-2">
                Vencimento (opcional, YYYY-MM-DD)
                <input
                value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                placeholder="2026-01-10"
                className={input}
                />
            </label>

            <label className="text-xs font-semibold text-zinc-300 md:col-span-2">
                Observação (opcional)
                <input
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className={input}
                />
            </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
            <button
                onClick={onClose}
                className="rounded-xl border border-yellow-400/15 bg-zinc-900/40 px-4 py-2 text-sm font-extrabold text-zinc-100 hover:bg-zinc-900"
            >
                Cancelar
            </button>
            <button
                onClick={submit}
                disabled={!canSave || busy}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Salvar
            </button>
            </div>
        </div>
        </div>
    );
}
