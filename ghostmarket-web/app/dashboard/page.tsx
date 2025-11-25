"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, User, Calendar } from 'lucide-react';
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
                <p>Loading...</p>
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
        <div className="min-h-screen bg-[#09090b] text-zinc-200 p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                        My Account
                    </h1>
                    <p className="text-zinc-500">Manage your account information</p>
                </div>

                {/* Account Info Card */}
                <div className="bg-zinc-900 border border-white/[0.08] rounded-xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">{user.email}</h2>
                            <p className="text-sm text-zinc-500 capitalize">{user.role.toLowerCase()} Account</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <User size={20} className="text-indigo-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-zinc-200">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar size={20} className="text-indigo-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-zinc-200">{memberSince}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href="/my-orders"
                        className="bg-zinc-900 border border-white/[0.08] rounded-xl p-6 hover:border-indigo-500/50 hover:bg-zinc-900/80 transition flex items-start gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600/20 transition">
                            <Package size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">My Orders</h3>
                            <p className="text-sm text-zinc-500">View your purchase history and downloads</p>
                        </div>
                    </a>

                    <div className="bg-zinc-900/50 border border-white/[0.05] rounded-xl p-6 flex items-start gap-4 opacity-50">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <User size={24} className="text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Account Settings</h3>
                            <p className="text-sm text-zinc-500">Coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}