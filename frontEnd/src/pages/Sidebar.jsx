import { NavLink } from "react-router-dom";

function Item({ to, label }) {
    return (
        <NavLink
        to={to}
        end
        className={({ isActive }) =>
            [
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
            isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
            ].join(" ")
        }
        >
        {label}
        </NavLink>
    );
}

export default function Sidebar() {
    return (
        <aside className="w-64 border-r border-zinc-200 bg-white p-4">
        <div className="mb-4">
            <div className="text-lg font-semibold text-zinc-900">FightGymManager</div>
            <div className="text-xs text-zinc-500">Painel</div>
        </div>

        <nav className="space-y-1">
            <Item to="/home" label="Home" />
            <Item to="/alunos" label="Alunos" />
            <Item to="/turmas" label="Turmas" />
            <Item to="/finance" label="Financeiro" />
        </nav>
        </aside>
    );
}
