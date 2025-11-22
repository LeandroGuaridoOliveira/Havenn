"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cart-store";
import { useEffect, useState } from "react";

export default function CartTrigger() {
  const { toggleCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button onClick={toggleCart} className="text-white hover:text-zinc-300 transition relative group">
      <ShoppingCart size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
      {mounted && items.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold animate-in zoom-in">
          {items.length}
        </span>
      )}
    </button>
  );
}