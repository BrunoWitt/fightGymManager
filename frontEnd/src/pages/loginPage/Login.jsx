import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"
import logoMark from "../../assets/logoMark.png"; 

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
            setErrorMsg(data?.message || "Credenciais inválidas.");
            return;
        }

        navigate("/home");
        } catch (error) {
            setErrorMsg("Erro ao conectar no servidor.");
            console.error("Error during login request:", error);
        } finally {
            setLoading(false);
        }
    };

return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Fundo (glow + textura leve) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Lado esquerdo (branding) */}
            <div className="relative hidden lg:block">
            {/* Marca d’água gigante */}
            <img
                src={logoMark}
                alt="Classic"
                className="pointer-events-none absolute -left-10 top-6 w-[520px] opacity-[0.10] blur-[0.2px] select-none"
            />

            {/* Conteúdo do lado esquerdo */}
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <p className="text-sm text-yellow-200/90">Classic Centro de Lutas</p>
            </div>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white">
                Acesso ao painel de gestão da
                <span className="block text-yellow-400">Classic.</span>
            </h1>

            <p className="mt-4 max-w-md text-zinc-300">
                Entre com seu e-mail e senha para acessar turmas, alunos e financeiro.
            </p>
            </div>


            {/* Card de login */}
            <div className="mx-auto w-full max-w-md">
                <div className="rounded-3xl border border-yellow-400/15 bg-zinc-950/60 p-7 shadow-[0_0_0_1px_rgba(250,204,21,0.08)] backdrop-blur">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                    <p className="text-sm font-semibold text-yellow-400">Login</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">Bem-vindo de volta</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Entre com seu e-mail e senha.
                    </p>
                    </div>

                    {/* Placeholder de logo (se quiser) */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 ring-1 ring-yellow-400/20">
                    <span className="text-lg font-black text-yellow-400"><img src={logo} alt="Classic" className="h-12 w-12 rounded-2xl object-cover" /></span>
                    </div>
                </div>

                {/* Erro */}
                {errorMsg ? (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMsg}
                    </div>
                ) : null}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                    <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        autoComplete="email"
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition
                                focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/10"
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-sm text-zinc-300">Senha</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition
                                focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/10"
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-extrabold text-zinc-950 transition
                                hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                    {loading ? "Entrando..." : "Entrar"}
                    </button>

                </form>
                </div>

                <p className="mt-4 text-center text-xs text-zinc-600">
                © {new Date().getFullYear()} Classic Centro de Lutas
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}
