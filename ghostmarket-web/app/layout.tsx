import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Importação dos Componentes Globais
import VantaBackground from "./components/VantaBackground"; // Fundo Animado
import CartDrawer from "./components/CartDrawer";         // Carrinho Lateral

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Havenn | Digital Assets",
  description: "Marketplace de ativos digitais high-end.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        
        {/* 1. Fundo Animado (Renderiza atrás de tudo) */}
        <VantaBackground />

        {/* 2. Carrinho Lateral (Global - abre em cima de tudo) */}
        <CartDrawer />
        
        {/* 3. Conteúdo das Páginas (Envolto em z-10 para ficar acima do fundo) */}
        <div className="relative z-10"> 
          {children}
        </div>

      </body>
    </html>
  );
}