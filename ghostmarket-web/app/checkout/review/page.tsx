"use client";
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart-store';
import { Mail, ArrowRight, CreditCard, ShoppingCart, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutReviewPage() {
    // Leitura do estado global
    const { items, total, clearCart, toggleCart } = useCartStore();
    const router = useRouter();
    
    // Estado local da página
    const [customerEmail, setCustomerEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Redireciona se o carrinho estiver vazio (Checagem de segurança)
    useEffect(() => {
        if (items.length === 0 && !isLoading) {
            router.push('/');
        }
    }, [items.length, isLoading, router]);

    // 2. Função de Pagamento Final (Chama a API POST /orders)
    const handleFinalizePurchase = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validação de E-mail
        if (!customerEmail || !customerEmail.includes('@') || !customerEmail.includes('.')) {
            alert('Por favor, insira um e-mail válido para a entrega.');
            return;
        }

        setIsLoading(true);
        
        // Prepara a chamada de API
        const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];
        
        const orderData = {
            items: items.map(i => ({ id: i.id, price: i.price })),
            total: total,
            customerEmail: customerEmail,
        };

        try {
            const res = await fetch("http://localhost:3000/orders", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // Envia o token para autenticar no backend
                    "Authorization": `Bearer ${token}`, 
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                const data = await res.json();
                clearCart();
                // 3. Sucesso: Redireciona para a tela de sucesso (entrega do produto)
                router.push(`/checkout/success/${data.id}`); 
            } else {
                alert(`Falha ao processar o pedido. Status: ${res.status}.`);
            }
        } catch (error) {
            alert("Erro de conexão com a API.");
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 p-8 py-20">
            <div className='max-w-4xl mx-auto'>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-8">
                    Finalizar Compra
                </h1>

                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* Coluna 1: Formulário de Contato e Pagamento */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl space-y-6">
                            <h2 className="text-xl font-semibold text-white border-b border-white/5 pb-3">1. Dados de Entrega</h2>
                            
                            <form onSubmit={handleFinalizePurchase} className="space-y-4">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">E-mail de Entrega</label>
                                <div className='flex items-center gap-3'>
                                    <Mail size={20} className='text-indigo-400' />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Seu e-mail para receber o produto"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full bg-transparent border-b border-white/[0.1] pb-2 text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                    />
                                </div>

                                <h2 className="text-xl font-semibold text-white border-b border-white/5 pt-6 pb-3">2. Método de Pagamento</h2>
                                
                                {/* Placeholder de Pagamento */}
                                <div className='bg-white/[0.05] p-4 rounded-lg flex items-center gap-3 border border-indigo-500/50 cursor-pointer'>
                                    <CreditCard size={20} className='text-emerald-400' />
                                    <span className='font-medium text-white'>PIX / Cartão de Crédito (Gateway Stripe Test)</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !customerEmail}
                                    className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-3 mt-8 transition-all ${
                                        isLoading 
                                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                                    }`}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pagar R$ {total.toFixed(2)} e Receber Produto</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Coluna 2: Resumo do Pedido */}
                    <div className="md:col-span-1">
                        <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-xl space-y-4 sticky top-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                                <ShoppingCart size={18} /> Resumo
                            </h2>
                            
                            {/* Lista de Itens */}
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 line-clamp-1">{item.name}</span>
                                    <span className='font-medium text-white'>R$ {item.price.toFixed(2)}</span>
                                </div>
                            ))}
                            
                            {/* Total */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xl font-bold">
                                <span>Total</span>
                                <span className='text-indigo-400'>R$ {total.toFixed(2)}</span>
                            </div>
                        </div>
                        <p className='text-xs text-zinc-500 mt-4 px-2'>
                            Ao clicar em Pagar, você concorda com nossos Termos de Serviço.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}