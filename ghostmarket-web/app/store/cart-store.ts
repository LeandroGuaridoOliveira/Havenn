import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) => set((state) => {
        // Evita duplicar o mesmo produto
        const exists = state.items.find((i) => i.id === item.id);
        if (exists) return { isOpen: true }; // Só abre o carrinho se já existe
        return { items: [...state.items, item], isOpen: true };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'havenn-cart-storage', // Nome para salvar no navegador
    }
  )
);