"use client";
import { useState, FormEvent } from 'react';
import { Mail, Search, Download, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Definir as interfaces de dados para tipagem correta
interface Product {
    name: string;
}
interface OrderItem {
    id: string;
    productId: string;
    price: number;
    product: Product; // Inclui o nome do produto
}
interface Order {
    id: string;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    createdAt: string;
    items: OrderItem[];
}

export default function DashboardPage() {
    const [email, setEmail] = useState('');
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false); // Flag para mostrar 'não encontrado'

    async function handleSearch(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setOrders(null);
        setSearched(true); // Indica que a busca foi feita

        try {
            // Chamada ao Backend (GET /orders/email/:email)
            const res = await fetch(`http://localhost:3333/orders/email/${email}`);

            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                // Se a API retornar erro (404/500), mostra erro genérico
                setOrders([]);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão com o servidor. Verifique o Backend.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    // Helper para formatar data (opcional, mas bom para UX)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 p-8 pt-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                    Minhas Compras
                </h1>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="flex gap-4 p-4 bg-zinc-900 border border-white/[0.08] rounded-xl">
                    <Mail size={24} className="text-zinc-500 mt-2" />
                    <input
                        type="email"
                        placeholder="Insira o e-mail de compra para buscar..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 bg-transparent text-white text-lg p-2 focus:outline-none placeholder-zinc-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
                        Buscar Pedidos
                    </button>
                </form>

                {/* Lista de Pedidos */}
                {searched && (
                    <div className="pt-4">
                        <h2 className="text-xl font-medium text-white border-b border-white/10 pb-3 mb-6">
                            Resultados ({loading ? '...' : orders?.length || 0})
                        </h2>

                        {/* Loading State */}
                        {loading && <p className="text-zinc-500 text-center py-10">Buscando...</p>}

                        {/* No Results State */}
                        {!loading && orders && orders.length === 0 && (
                            <div className='text-center p-10 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl'>
                                <p className='text-zinc-400'>Nenhum pedido encontrado para **{email}**.</p>
                            </div>
                        )}

                        {/* Orders List */}
                        {!loading && orders && orders.length > 0 && orders.map((order) => (
                            <div key={order.id} className="bg-zinc-900/50 border border-white/[0.08] p-6 rounded-xl mb-4 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Pedido ID: {order.id.substring(0, 8)}...</span>
                                    <span className={`font-bold text-xs px-2 py-1 rounded-full ${order.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <p className="text-2xl font-bold text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                                </p>
                                <p className="text-xs text-zinc-600">Comprado em: {formatDate(order.createdAt)}</p>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-zinc-800/50 p-3 rounded">
                                            <span className="text-white text-base">{item.product.name}</span>
                                            {order.status === 'PAID' ? (
                                                // Link de Re-download (Vai para a página de sucesso para gerar o novo link seguro)
                                                <Link
                                                    href={`/checkout/success/${order.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm font-medium transition"
                                                >
                                                    Download <Download size={16} />
                                                </Link>
                                            ) : (
                                                <span className="text-yellow-500 text-sm flex items-center gap-1"><XCircle size={14} /> Pagamento Pendente</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}