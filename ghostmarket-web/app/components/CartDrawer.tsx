"use client";

import { useCartStore } from "../store/cart-store";
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 

export default function CartDrawer() {
  const router = useRouter();
  const { items, clearCart, isOpen, toggleCart, removeItem } = useCartStore(); 
  
  // Estados para controle visual e persistência
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price, 0);

  // --- FUNÇÃO DE CHECKOUT ---
  async function handleCheckout() {
    setIsCheckingOut(true);

    // 1. Extração do Token
    const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];
    
    if (!token) { 
        alert("Erro de autenticação: Token não encontrado. Tente logar novamente.");
        setIsCheckingOut(false);
        return; 
    }

    const orderData = {
      items: items.map(i => ({ id: i.id, price: i.price })),
      total: total,
      customerEmail: 'cliente.teste@havenn.com.br'
    };

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        
        // --- LOG CRÍTICO PARA DEBUG ---
        console.log('--- Resposta da Criação do Pedido:', data); 

        // 2. Validação Crucial: O Backend retornou o ID?
        if (!data.id) {
            // Se o status for OK, mas o JSON não tiver ID, é erro de tipagem no Backend
            alert("ERRO CRÍTICO: Backend retornou objeto inválido (ID do Pedido ausente).");
            return; 
        }

        // 3. Sucesso e Redirecionamento
        clearCart(); 
        toggleCart();
        router.push(`/checkout/success/${data.id}`); 
        
      } else {
        // Se a requisição retornar 4xx/5xx (falha de permissão, etc.)
        alert(`⚠️ Erro ao criar o pedido. Status: ${res.status}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Erro de conexão com a API.");
    } finally {
      setIsCheckingOut(false);
    }
  }
  // --- FIM DA FUNÇÃO ---

  return (
    <>
      {/* Fundo Escuro (Backdrop) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={toggleCart}
      />

      {/* A Gaveta */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0e] border-l border-white/10 z-[70] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Cabeçalho e Lista (omiti por brevidade, mas o código é o mesmo) */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ShoppingBag size={18} /> Sua Sacola <span className="text-zinc-500">({items.length})</span>
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-white/10 rounded-full transition text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag size={24} className="opacity-50" />
              </div>
              <p>Seu carrinho está vazio.</p>
              <button onClick={toggleCart} className="text-indigo-400 text-sm hover:underline">
                Voltar ao catálogo
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl group hover:border-white/[0.1] transition">
                <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-700 border border-white/5 font-serif italic">Hv</div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{item.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{item.category}</span>
                  <div className="text-emerald-400 font-medium text-sm mt-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-400 transition self-start p-1"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total) */}
        {items.length > 0 && (
          <div className="p-6 bg-[#09090b] border-t border-white/10 space-y-4">
            <div className="flex justify-between items-end mb-6">
              <span className="text-zinc-400 text-sm">Total estimado</span>
              <span className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
            
            <button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className="w-full bg-white text-black h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition active:scale-95 disabled:opacity-50"
            >
                {isCheckingOut ? "Processando..." : <>Ir para Pagamento <ArrowRight size={18} /></>}
            </button>
            
            <div className="flex justify-center gap-4 text-[10px] text-zinc-600 uppercase tracking-widest">
              <span className="flex items-center gap-1"><ShieldCheck size={10}/> Seguro</span>
              <span>•</span>
              <span>Entrega Automática</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}