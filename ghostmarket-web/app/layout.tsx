import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Importação dos Componentes Globais
import VantaBackground from "./components/VantaBackground";
import CartDrawer from "./components/CartDrawer";

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
        
        <VantaBackground />

        <CartDrawer />
        
        <div className="relative z-10"> 
          {children}
        </div>

      </body>
    </html>
  );
}