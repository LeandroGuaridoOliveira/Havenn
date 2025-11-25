"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Package } from 'lucide-react';
import { isAuthenticated, logout, getCurrentUser } from '../utils/auth';

export default function UserMenu() {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                setIsAuth(true);
                const userData = await getCurrentUser();
                setUser(userData);
            }
        };
        checkAuth();
    }, []);

    if (!isAuth) {
        return (
            <Link
                href="/login"
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition duration-300 flex items-center gap-2"
            >
                <User size={16} />
                Sign In
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold hover:bg-indigo-500 transition"
            >
                {user?.email?.[0]?.toUpperCase() || 'U'}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs text-zinc-500">{user?.email}</p>
                    </div>

                    <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition"
                    >
                        <User size={16} />
                        My Account
                    </Link>

                    <Link
                        href="/my-orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition"
                    >
                        <Package size={16} />
                        My Orders
                    </Link>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
