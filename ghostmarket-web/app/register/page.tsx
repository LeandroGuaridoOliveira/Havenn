"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, AlertCircle } from "lucide-react";
import VantaBackground from "../components/VantaBackground";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3333/auth/register-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (res.ok) {
                // Auto-login after registration or redirect to login
                // For simplicity, let's redirect to login for now, or we could auto-login
                // Let's try to auto-login immediately
                const loginRes = await fetch("http://localhost:3333/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (loginRes.ok) {
                    const data = await loginRes.json();
                    document.cookie = `havenn_token=${data.access_token}; path=/; max-age=86400`;
                    router.push("/"); // Redirect to home/checkout
                } else {
                    router.push("/login?message=registered");
                }
            } else {
                const data = await res.json();
                setError(data.message || "Erro ao criar conta.");
            }
        } catch (err) {
            setError("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute inset-0 z-0">
                <VantaBackground />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            <UserPlus size={20} className="text-zinc-400" />
                        </div>
                        <h1 className="text-2xl font-medium text-white tracking-tight mb-2">Criar Conta</h1>
                        <p className="text-sm text-zinc-500">Junte-se ao Havenn para comprar.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
                            <input
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-zinc-700"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-zinc-700"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Senha</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-zinc-700"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold h-12 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? "Criando conta..." : (
                                <>
                                    Criar Conta <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Já tem uma conta?{" "}
                            <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Entrar
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
