// src/pages/components/alunos/ui/Badge.jsx
export default function Badge({ tone = "zinc", children }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone] || tones.zinc}`}>
      {children}
    </span>
  );
}
