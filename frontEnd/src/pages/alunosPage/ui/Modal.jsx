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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
            >
              Fechar
            </button>
          </div>

          <div className="max-h-[75vh] overflow-auto p-4">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-zinc-200 p-4">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
