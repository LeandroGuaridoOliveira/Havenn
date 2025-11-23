// src/store/cart-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Tipagem (Se você estiver usando TypeScript)
interface CartItem {
    id: string;
    name: string;
    price: number;
    category: string; // Adicionado para exibição na gaveta
}

interface CartState {
    // Estado
    items: CartItem[];
    isOpen: boolean;
    
    // Getters (para simplificar o uso)
    total: number;

    // Ações
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    toggleCart: () => void; // Ação para abrir/fechar a gaveta
}

// 2. Criação do Store
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Estado Inicial
            items: [],
            isOpen: false,
            
            // Getter (Total é calculado dinamicamente aqui)
            get total() {
                return get().items.reduce((acc, item) => acc + item.price, 0);
            },

            // Ações
            addItem: (item) => set((state) => {
                // Adicionar lógica de item único (Se o produto já estiver no carrinho, apenas um é permitido)
                const existingItem = state.items.find(i => i.id === item.id);
                if (existingItem) {
                    return state; // Não faz nada se já existe
                }
                
                // Adiciona o item e abre o carrinho
                return { items: [...state.items, item], isOpen: true };
            }),

            removeItem: (itemId) => set((state) => ({
                items: state.items.filter((item) => item.id !== itemId),
            })),
            
            clearCart: () => set({ items: [] }),

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        }),
        {
            name: 'havenn-cart-storage', // Nome da chave no Local Storage
            partialize: (state) => ({ 
                items: state.items,
                // Não persistimos o estado 'isOpen', ele deve ser falso por padrão ao carregar a página
            }),
            // Adicionar o `total` como getter, não como estado persistido.
            // Para que o getter funcione corretamente fora da persistência, 
            // ele precisa ser acessado através de `useCartStore(state => state.total)`.
        }
    )
);

// 3. Hook para acessar o total (Exemplo de como usar o getter)
// É mais robusto e garante que o total é reativo.
export function useCartTotal() {
    return useCartStore(state => state.items.reduce((acc, item) => acc + item.price, 0));
}