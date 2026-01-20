import { NavLink } from "react-router-dom";
import logoBadge from "../assets/logoBadge.jpg";

const navItems = [
    { to: "/home", label: "Home" },
    { to: "/alunos", label: "Alunos" },
    { to: "/turmas", label: "Turmas" },
    { to: "/finance", label: "Financeiro" },
];

function NavItem({ to, label }) {
    return (
        <NavLink
        to={to}
        className={({ isActive }) =>
            [
            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
            isActive
                ? "bg-yellow-400 text-zinc-950 shadow-[0_0_0_1px_rgba(250,204,21,0.35),0_10px_30px_rgba(250,204,21,0.12)]"
                : "text-zinc-200 hover:bg-zinc-900/60 hover:text-yellow-200",
            ].join(" ")
        }
        >
        {/* bolinha indicador */}
        <span className="h-2 w-2 rounded-full bg-yellow-400/70 group-hover:bg-yellow-300" />
        <span>{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    return (
        <aside className="h-screen w-[280px] shrink-0 border-r border-yellow-400/10 bg-zinc-950 text-zinc-100">
        {/* topo */}
        <div className="relative px-5 pt-6">
            {/* glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
            <img
                src={logoBadge}
                alt="Classic Centro de Lutas"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-yellow-400/30"
            />

            <div className="leading-tight">
                <p className="text-sm font-semibold text-yellow-200">Classic</p>
                <p className="text-xs text-zinc-300">Centro de Lutas</p>
            </div>
            </div>

            <div className="mt-5 h-px bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent" />
        </div>

        {/* menu */}
        <nav className="px-4 py-5">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Painel
            </p>

            <div className="space-y-1">
            {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} />
            ))}
            </div>
        </nav>

        {/* rodapé */}
        <div className="mt-auto px-5 pb-6">
            <div className="rounded-2xl border border-yellow-400/10 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-300">
                Theme: <span className="text-yellow-200 font-semibold">Classic</span>
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">Preto • Branco • Amarelo</p>
            </div>
        </div>
        </aside>
    );
}
