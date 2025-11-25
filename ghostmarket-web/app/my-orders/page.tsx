"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Download, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import VantaBackground from "../components/VantaBackground";

interface OrderItem {
    id: string;
    product: {
        id: string;
        name: string;
        description: string;
    };
    price: number;
}

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            // Get token from cookie
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("havenn_token="))
                ?.split("=")[1];

            if (!token) {
                router.push("/login?callbackUrl=/my-orders");
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/orders/my-orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                if (res.status === 401) {
                    router.push("/login?callbackUrl=/my-orders");
                } else {
                    setError("Erro ao carregar pedidos.");
                }
            }
        } catch (err) {
            setError("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(orderId: string, productId: string) {
        try {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("havenn_token="))
                ?.split("=")[1];

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/orders/${orderId}/download/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                window.open(data.downloadUrl, "_blank");
            } else {
                alert("Erro ao gerar link de download.");
            }
        } catch (err) {
            alert("Erro de conexão.");
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <VantaBackground />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Meus Pedidos</h1>
                        <p className="text-zinc-400">Gerencie suas compras e downloads.</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
                    >
                        Voltar para Loja
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
                        <AlertCircle className="mx-auto mb-2" />
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Nenhum pedido encontrado</h3>
                        <p className="text-zinc-500 mb-6">Você ainda não realizou nenhuma compra.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Ir às Compras
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                            >
                                <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Package size={20} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Pedido #{order.id.slice(0, 8)}</p>
                                            <p className="text-sm text-zinc-300 flex items-center gap-2">
                                                <Clock size={12} />
                                                {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'PAID'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {order.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                        </div>
                                        <p className="text-xl font-bold">
                                            R$ {Number(order.totalAmount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Itens do Pedido</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between group">
                                                <div>
                                                    <p className="font-medium text-zinc-200">{item.product.name}</p>
                                                    <p className="text-sm text-zinc-500 line-clamp-1">{item.product.description}</p>
                                                </div>
                                                {order.status === 'PAID' && (
                                                    <button
                                                        onClick={() => handleDownload(order.id, item.product.id)} // Assuming item.product.id is available, might need to check DTO
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10"
                                                    >
                                                        <Download size={16} className="text-indigo-400" />
                                                        <span>Download</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
