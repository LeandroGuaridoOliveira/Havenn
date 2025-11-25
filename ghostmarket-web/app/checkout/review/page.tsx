"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../store/cart-store';
import { formatCurrency } from '@/app/utils/formatters';
import {
    Lock,
    ShieldCheck,
    CreditCard,
    Zap,
    Mail,
    MapPin,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    Info
} from 'lucide-react';

// =========================================================================
// TYPES
// =========================================================================
type PaymentMethod = 'credit_card' | 'pix';

interface BillingInfo {
    address: string;
    city: string;
    zip: string;
    country: string;
}

interface CardData {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
}

interface FormErrors {
    email?: string;
    address?: string;
    zip?: string;
    city?: string;
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCvc?: string;
    terms?: string;
}

export default function CheckoutReviewPage() {
    const { items, total, clearCart } = useCartStore();
    const router = useRouter();

    // =========================================================================
    // STATE
    // =========================================================================
    const [customerEmail, setCustomerEmail] = useState('');
    const [billingAddress, setBillingAddress] = useState<BillingInfo>({
        address: '', city: '', zip: '', country: 'BR'
    });
    const [cardData, setCardData] = useState<CardData>({ number: '', name: '', expiry: '', cvc: '' });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Redirect if cart is empty, but NOT if we just successfully purchased
    useEffect(() => {
        if (items.length === 0 && !isLoading && !isSuccess) {
            router.push('/');
        }
    }, [items.length, isLoading, router, isSuccess]);

    // =========================================================================
    // TEST HELPER
    // =========================================================================
    const fillTestData = () => {
        setCustomerEmail('lele.guarido@gmail.com');
        setBillingAddress({
            address: 'Rua de Teste, 123',
            city: 'São Paulo',
            zip: '01000-000',
            country: 'BR'
        });
        setCardData({
            number: '4242 4242 4242 4242',
            name: 'TESTE USER',
            expiry: '12/30',
            cvc: '123'
        });
        setAgreedToTerms(true);
    };

    // =========================================================================
    // VALIDATION
    // =========================================================================
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        // Email
        if (!customerEmail) {
            newErrors.email = 'O e-mail é obrigatório.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
            newErrors.email = 'Insira um e-mail válido.';
            isValid = false;
        }

        // Terms
        if (!agreedToTerms) {
            newErrors.terms = 'Você deve aceitar os termos.';
            isValid = false;
        }

        // Credit Card Specifics
        if (paymentMethod === 'credit_card') {
            if (!billingAddress.address) { newErrors.address = 'Endereço obrigatório.'; isValid = false; }
            if (!billingAddress.city) { newErrors.city = 'Cidade obrigatória.'; isValid = false; }
            if (!billingAddress.zip) { newErrors.zip = 'CEP obrigatório.'; isValid = false; }

            if (!cardData.number) { newErrors.cardNumber = 'Número do cartão obrigatório.'; isValid = false; }
            if (!cardData.name) { newErrors.cardName = 'Nome no cartão obrigatório.'; isValid = false; }
            if (!cardData.expiry) { newErrors.cardExpiry = 'Validade obrigatória.'; isValid = false; }
            if (!cardData.cvc) { newErrors.cardCvc = 'CVC obrigatório.'; isValid = false; }
        }

        setErrors(newErrors);
        return isValid;
    };

    // =========================================================================
    // SUBMIT HANDLER
    // =========================================================================
    const handleFinalizePurchase = async (e: any) => {
        e.preventDefault && e.preventDefault();
        console.log("handleFinalizePurchase called");
        alert("Iniciando processamento do pedido...");

        if (!validateForm()) {
            console.log("Validation failed", errors);
            alert("Validação falhou! Verifique os campos em vermelho.");
            return;
        }

        setIsLoading(true);

        const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];

        const orderData = {
            items: items.map(i => ({ productId: i.id, quantity: 1 })),
            customerEmail: customerEmail,
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                const data = await res.json();
                setIsSuccess(true);
                clearCart();
                router.push(`/checkout/success/${data.id}`);
            } else {
                alert(`Falha ao processar o pedido. Status: ${res.status}.`);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Erro de conexão com a API.");
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) return null;

    // =========================================================================
    // UI HELPERS
    // =========================================================================
    const InputError = ({ message }: { message?: string }) => {
        if (!message) return null;
        return <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {message}</p>;
    };

    const inputClass = (hasError: boolean) => `
        w-full px-4 py-3 bg-zinc-900/50 border rounded-lg text-sm text-white placeholder-zinc-500 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${hasError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}
    `;

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-indigo-500/30">

            {/* TOP BANNER - TRUST INDICATOR */}
            <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-2 text-center">
                <p className="text-xs font-medium text-indigo-400 flex items-center justify-center gap-2">
                    <Lock size={12} /> Ambiente Seguro SSL de 256-bits
                </p>
            </div>

            <div className="max-w-6xl mx-auto p-6 lg:p-12">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-white">
                            <ChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Finalizar Compra</h1>
                            <p className="text-zinc-400 text-sm">Complete seus dados para receber seu produto.</p>
                        </div>
                    </div>

                    {/* TEST MODE BADGE & FILL DATA BUTTON */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fillTestData}
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline"
                        >
                            Preencher Dados de Teste
                        </button>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                            <Info size={16} className="text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Modo de Teste</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN - FORMS */}
                    <div className="lg:col-span-8 space-y-8">

                        <form className="space-y-8">

                            {/* SECTION 1: CONTACT */}
                            <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
                                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Mail className="text-emerald-500" size={20} /> Informações de Entrega
                                </h2>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">E-mail para recebimento</label>
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className={inputClass(!!errors.email)}
                                    />
                                    <InputError message={errors.email} />
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Sua chave de licença e instruções serão enviadas para este endereço imediatamente após a confirmação.
                                    </p>
                                </div>
                            </section>

                            {/* SECTION 2: PAYMENT METHOD */}
                            <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors"></div>
                                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-indigo-500" size={20} /> Método de Pagamento
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('credit_card')}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 ${paymentMethod === 'credit_card'
                                            ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20'
                                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <CreditCard size={24} className={paymentMethod === 'credit_card' ? 'text-indigo-400' : 'text-zinc-500'} />
                                            {paymentMethod === 'credit_card' && <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"><CheckCircle2 size={10} className="text-white" /></div>}
                                        </div>
                                        <div>
                                            <span className={`block font-semibold ${paymentMethod === 'credit_card' ? 'text-white' : 'text-zinc-400'}`}>Cartão de Crédito</span>
                                            <span className="text-xs text-zinc-500">Processamento seguro via Stripe</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 ${paymentMethod === 'pix'
                                            ? 'bg-emerald-600/10 border-emerald-500/50 ring-1 ring-emerald-500/20'
                                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10 hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <Zap size={24} className={paymentMethod === 'pix' ? 'text-emerald-400' : 'text-zinc-500'} />
                                            {paymentMethod === 'pix' && <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 size={10} className="text-white" /></div>}
                                        </div>
                                        <div>
                                            <span className={`block font-semibold ${paymentMethod === 'pix' ? 'text-white' : 'text-zinc-400'}`}>PIX</span>
                                            <span className="text-xs text-zinc-500">Aprovação imediata e automática</span>
                                        </div>
                                    </button>
                                </div>

                                {/* CREDIT CARD FORM */}
                                {paymentMethod === 'credit_card' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">

                                        {/* Billing Address */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <MapPin size={14} /> Endereço de Cobrança
                                            </h3>

                                            <div className="grid gap-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Endereço (Rua, Número, Bairro)"
                                                        value={billingAddress.address}
                                                        onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                                                        className={inputClass(!!errors.address)}
                                                    />
                                                    <InputError message={errors.address} />
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-1">
                                                        <input
                                                            type="text"
                                                            placeholder="CEP"
                                                            value={billingAddress.zip}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                                                            className={inputClass(!!errors.zip)}
                                                        />
                                                        <InputError message={errors.zip} />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Cidade"
                                                            value={billingAddress.city}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                                            className={inputClass(!!errors.city)}
                                                        />
                                                        <InputError message={errors.city} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                                <Lock size={14} /> Dados do Cartão (Simulação)
                                            </h3>

                                            <div className="grid gap-4">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        value={cardData.number}
                                                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                                        className={inputClass(!!errors.cardNumber)}
                                                    />
                                                    <InputError message={errors.cardNumber} />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nome Impresso no Cartão"
                                                        value={cardData.name}
                                                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                                        className={inputClass(!!errors.cardName)}
                                                    />
                                                    <InputError message={errors.cardName} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/AA"
                                                            value={cardData.expiry}
                                                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                                            className={inputClass(!!errors.cardExpiry)}
                                                        />
                                                        <InputError message={errors.cardExpiry} />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="CVC"
                                                            value={cardData.cvc}
                                                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                                                            className={inputClass(!!errors.cardCvc)}
                                                        />
                                                        <InputError message={errors.cardCvc} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'pix' && (
                                    <div className="mt-6 p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-xl text-center animate-in fade-in zoom-in-95 duration-300">
                                        <Zap size={32} className="text-emerald-400 mx-auto mb-3" />
                                        <h3 className="text-emerald-400 font-medium mb-1">Pagamento Instantâneo</h3>
                                        <p className="text-zinc-400 text-sm">
                                            Ao confirmar, você será redirecionado para escanear o QR Code. A liberação é automática 24/7.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* TERMS CHECKBOX */}
                            <div className="flex items-start gap-3 px-2">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-sm text-zinc-400">
                                    Eu concordo com os <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline">Termos de Serviço</a> e a <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline">Política de Privacidade</a>. Entendo que esta é uma compra digital não reembolsável após o envio da chave.
                                </label>
                            </div>
                            {errors.terms && <div className="px-2"><InputError message={errors.terms} /></div>}

                            {/* SUBMIT BUTTON */}
                            <button
                                type="button"
                                onClick={handleFinalizePurchase}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${isLoading
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none translate-y-0'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" /> Pagar {formatCurrency(total)}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                                <Lock size={10} /> Seus dados estão protegidos por criptografia de ponta a ponta.
                            </p>

                        </form>
                    </div>

                    {/* RIGHT COLUMN - SUMMARY */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-6">

                            {/* ORDER SUMMARY CARD */}
                            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-white/5">Resumo do Pedido</h3>

                                <div className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                {/* Placeholder for product image if available, using icon for now */}
                                                <div className="text-zinc-500 text-xs font-bold">IMG</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-zinc-200 truncate">{item.name}</h4>
                                                <p className="text-xs text-zinc-500">Licença Vitalícia</p>
                                            </div>
                                            <div className="text-sm font-semibold text-white">
                                                {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-sm text-zinc-400">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-zinc-400">
                                        <span>Taxas</span>
                                        <span className="text-emerald-400">Grátis</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                        <span className="text-base font-semibold text-white">Total</span>
                                        <span className="text-xl font-bold text-indigo-400">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SECURITY BADGES */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-center">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xs font-medium text-zinc-300">Compra Segura</p>
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-center">
                                    <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                    <p className="text-xs font-medium text-zinc-300">Entrega Imediata</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}