"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, AlertCircle, User } from "lucide-react";
// IMPORTANTE: Os dois pontos (..) significam "volte uma pasta" para achar components
import VantaBackground from "../components/VantaBackground";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Tenta bater na API de Login
      const res = await fetch("http://localhost:3333/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();

        // 2. Salva o Token no Cookie (dura 1 dia)
        document.cookie = `havenn_token=${data.access_token}; path=/; max-age=86400`;

        // 3. Redireciona para o callbackUrl ou Home
        router.push(callbackUrl);
      } else {
        setError("Credenciais inválidas. Acesso negado.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 overflow-hidden relative">

      {/* Fundo Névoa */}
      <div className="absolute inset-0 z-0">
        <VantaBackground />
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">

          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <User size={20} className="text-zinc-400" />
            </div>
            <h1 className="text-2xl font-medium text-white tracking-tight mb-2">Bem-vindo de volta</h1>
            <p className="text-sm text-zinc-500">Entre na sua conta para continuar.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
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
              {loading ? "Autenticando..." : (
                <>
                  Entrar <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm">
              Não tem uma conta?{" "}
              <a href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Criar conta
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Sistema Seguro • Criptografia Ponta-a-Ponta
          </p>
        </div>
      </div>
    </div>
  );
}