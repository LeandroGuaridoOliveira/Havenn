"use client";
import { Zap } from "lucide-react";
import { useCartStore } from "../store/cart-store";

interface Props {
  product: { id: string; name: string; price: number; category: string };
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button 
      onClick={() => addItem(product)}
      className="group w-full bg-white text-black h-14 rounded-xl font-bold text-base hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95"
    >
      <Zap size={20} className="text-indigo-600 group-hover:scale-110 transition-transform" /> 
      Adicionar à Sacola
    </button>
  );
}