// src/pages/components/alunos/ui/Badge.jsx
export default function Badge({ tone = "zinc", children }) {
  const tones = {
    zinc:   "bg-zinc-800/60 text-zinc-200 ring-1 ring-white/10",
    green:  "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20",
    red:    "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20",
    yellow: "bg-yellow-400/15 text-yellow-200 ring-1 ring-yellow-400/25",
    blue:   "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/20",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        "backdrop-blur",
        tones[tone] || tones.zinc,
      ].join(" ")}
    >
      {children}
    </span>
  );
}