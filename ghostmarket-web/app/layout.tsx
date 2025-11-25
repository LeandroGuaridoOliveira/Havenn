import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Importação dos Componentes
import CartDrawer from "./components/CartDrawer"; // Carrinho Lateral

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



        {/* Carrinho Lateral (Global - abre em cima de tudo) */}
        <CartDrawer />

        {/* Conteúdo das Páginas */}
        <div className="relative">
          {children}
        </div>

      </body>
    </html>
  );
}