// src/pages/components/alunos/ui/Modal.jsx
import { useEffect } from "react";

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-yellow-400/15 bg-zinc-950/95 shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-yellow-400/10 p-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-yellow-400/15 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Fechar
            </button>
          </div>

          <div className="max-h-[75vh] overflow-auto p-4 text-zinc-100">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-yellow-400/10 p-4">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
