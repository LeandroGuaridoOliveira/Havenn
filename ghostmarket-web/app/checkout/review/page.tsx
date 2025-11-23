// src/app/checkout/review/page.tsx
"use client";
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart-store';
import { Mail, ArrowRight, CreditCard, ShoppingCart, Loader2, Zap, Lock, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Helper para formatação de moeda (ajuste o caminho se necessário)
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(amount);
};

// =========================================================================
// Tipos de Pagamento
type PaymentMethod = 'credit_card' | 'pix';
// =========================================================================

export default function CheckoutReviewPage() {
    const { items, total, clearCart } = useCartStore();
    const router = useRouter();
    
    // ESTADOS: Adicionamos o método de pagamento
    const [customerEmail, setCustomerEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card'); // Padrão: Cartão

    // Campos do Cartão (Simulação)
    const [cardData, setCardData] = useState({
        number: '', name: '', expiry: '', cvc: ''
    });


    // Redireciona se o carrinho estiver vazio
    useEffect(() => {
        if (items.length === 0 && !isLoading) {
            router.push('/');
        }
    }, [items.length, isLoading, router]);


    // =========================================================================
    // FUNÇÃO DE PAGAMENTO FINAL
    // =========================================================================
    const handleFinalizePurchase = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validação básica do e-mail
        if (!customerEmail || !customerEmail.includes('@') || !customerEmail.includes('.')) {
            alert('Por favor, insira um e-mail válido para a entrega.');
            return;
        }

        // Validação do Método de Pagamento (Se for cartão, valida os campos)
        if (paymentMethod === 'credit_card' && (!cardData.number || !cardData.name || !cardData.cvc)) {
            alert('Preencha todos os dados do cartão (simulado).');
            return;
        }
        
        setIsLoading(true);
        
        const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];
        
        const orderData = {
            items: items.map(i => ({ id: i.id, price: i.price })),
            total: total,
            customerEmail: customerEmail,
            paymentMethod: paymentMethod, // Envia o método escolhido para o Backend
            // Aqui entraria a chamada ao Stripe para gerar a sessão...
        };

        try {
            // Chamada à API de criação de pedido (Backend)
            const res = await fetch("http://localhost:3000/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                const data = await res.json();
                clearCart();
                // Redireciona para sucesso (Entrega do produto)
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

    // Estilos de Input
    const inputClass = "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-zinc-500 transition duration-150 ease-in-out";
    const selectedMethodClass = "bg-indigo-600/20 ring-2 ring-indigo-500/70 border-indigo-500/50";
    const unselectedMethodClass = "bg-zinc-900 hover:bg-zinc-800 border-white/10";
    
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 p-8 py-20">
            <div className='max-w-4xl mx-auto'>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Checkout Havenn
                    </h1>
                    <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">Voltar à Loja</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* Coluna 1: Dados de Contato e Pagamento */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-xl shadow-lg space-y-8">
                            
                            {/* 1. Dados de Entrega */}
                            <h2 className="text-xl font-semibold text-white border-b border-white/5 pb-3 flex items-center gap-2"><Mail size={20} className='text-emerald-400' /> E-mail de Entrega</h2>
                            
                            <input
                                type="email"
                                required
                                placeholder="Seu e-mail para receber a chave de licença"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className={inputClass}
                            />
                            
                            {/* 2. Método de Pagamento */}
                            <h2 className="text-xl font-semibold text-white border-b border-white/5 pt-6 pb-3 flex items-center gap-2"><CreditCard size={20} className='text-yellow-400' /> Escolha o Método</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {/* OPÇÃO CARTÃO */}
                                <div
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'credit_card' ? selectedMethodClass : unselectedMethodClass}`}
                                >
                                    <h3 className="font-semibold flex items-center gap-2 text-white"><CreditCard size={18} className='text-indigo-400' /> Cartão de Crédito</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Processado pelo Stripe.</p>
                                </div>
                                
                                {/* OPÇÃO PIX */}
                                <div
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'pix' ? selectedMethodClass : unselectedMethodClass}`}
                                >
                                    <h3 className="font-semibold flex items-center gap-2 text-white"><DollarSign size={18} className='text-emerald-400' /> PIX (Pagamento Instantâneo)</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Entrega mais rápida.</p>
                                </div>
                            </div>

                            {/* CAMPOS CONDICIONAIS */}
                            <form onSubmit={handleFinalizePurchase}>
                                {paymentMethod === 'credit_card' && (
                                    <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
                                        <h3 className="text-lg font-medium text-white flex items-center gap-2"><Lock size={16} /> Dados do Cartão (Simulação)</h3>
                                        
                                        <input type="text" placeholder="Número do Cartão" required value={cardData.number} onChange={(e) => setCardData({...cardData, number: e.target.value})} className={inputClass} />
                                        <input type="text" placeholder="Nome Impresso no Cartão" required value={cardData.name} onChange={(e) => setCardData({...cardData, name: e.target.value})} className={inputClass} />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="MM/AA" required value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} className={inputClass} />
                                            <input type="text" placeholder="CVC" required value={cardData.cvc} onChange={(e) => setCardData({...cardData, cvc: e.target.value})} className={inputClass} />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'pix' && (
                                    <div className="mt-6 space-y-4 pt-4 border-t border-white/5 text-center p-4 bg-white/[0.05] rounded-xl">
                                        <Zap size={32} className="text-yellow-400 mx-auto mb-2" />
                                        <p className="text-white font-medium">Você será redirecionado para a tela de geração do QR Code Pix após a confirmação.</p>
                                    </div>
                                )}

                                {/* BOTÃO FINAL */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !customerEmail}
                                    className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-3 mt-8 transition-all ${
                                        isLoading 
                                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                                    }`}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar e Pagar {formatCurrency(total)}</>}
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
                                    <span className='font-medium text-white'>{formatCurrency(item.price)}</span>
                                </div>
                            ))}
                            
                            {/* Total */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xl font-bold">
                                <span>Total</span>
                                <span className='text-indigo-400'>{formatCurrency(total)}</span>
                            </div>
                        </div>
                        <p className='text-xs text-zinc-500 mt-4 px-2'>
                            A chave de licença é gerada após a confirmação do pagamento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}