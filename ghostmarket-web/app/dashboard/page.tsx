"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, User, Calendar, Shield, Mail } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '../utils/auth';

interface UserData {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            if (!isAuthenticated()) {
                router.push('/login?callbackUrl=/dashboard');
                return;
            }

            const userData = await getCurrentUser();
            if (!userData) {
                router.push('/login?callbackUrl=/dashboard');
                return;
            }

            setUser(userData);
            setLoading(false);
        }

        loadUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] text-zinc-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const memberSince = new Date(user.createdAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#09090b] relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 pt-28 pb-16">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                            Minha <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Conta</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">Gerencie suas informações e pedidos</p>
                    </div>

                    {/* User Profile Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                        <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-2xl">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{user.email}</h2>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                                            <Shield size={16} className="text-indigo-400" />
                                            <span className="text-sm font-semibold text-indigo-300 capitalize">{user.role.toLowerCase()}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Mail size={20} className="text-indigo-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email</p>
                                                <p className="text-zinc-200 font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Calendar size={20} className="text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Membro desde</p>
                                                <p className="text-zinc-200 font-medium">{memberSince}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* My Orders Card */}
                        <a
                            href="/my-orders"
                            className="relative group overflow-hidden rounded-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all duration-300"></div>
                            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 group-hover:border-indigo-500/50 p-8 transition-all duration-300">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                        <Package size={28} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                            Meus Pedidos
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Visualize seu histórico de compras e faça downloads
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                    Acessar pedidos
                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </a>

                        {/* Account Settings Card (Coming Soon) */}
                        <div className="relative group overflow-hidden rounded-2xl opacity-60 cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-700/20"></div>
                            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-xl">
                                        <User size={28} className="text-zinc-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            Configurações
                                        </h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            Altere sua senha e preferências
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-zinc-800/50 text-sm font-semibold text-zinc-500">
                                    Em breve
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}