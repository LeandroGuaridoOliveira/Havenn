import { Github, Twitter, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Coluna 1: Marca */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold text-white tracking-tighter mb-4">Vanta Market</h2>
          <p className="text-zinc-400 max-w-sm">
            Marketplace descentralizado de ativos digitais de alta performance. 
            Segurança, privacidade e automação em cada transação.
          </p>
          <div className="flex gap-4 mt-6">
            <Twitter className="text-zinc-500 hover:text-white cursor-pointer transition" size={20} />
            <Github className="text-zinc-500 hover:text-white cursor-pointer transition" size={20} />
          </div>
        </div>

        {/* Coluna 2: Categorias */}
        <div>
          <h3 className="text-white font-semibold mb-4">Categorias</h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition">Scripts & Cheats</li>
            <li className="hover:text-emerald-400 cursor-pointer transition">Utilitários</li>
            <li className="hover:text-emerald-400 cursor-pointer transition">E-books</li>
            <li className="hover:text-emerald-400 cursor-pointer transition">Source Codes</li>
          </ul>
        </div>

        {/* Coluna 3: Suporte */}
        <div>
          <h3 className="text-white font-semibold mb-4">Suporte</h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="hover:text-white cursor-pointer transition">FAQ</li>
            <li className="hover:text-white cursor-pointer transition">Termos de Uso</li>
            <li className="hover:text-white cursor-pointer transition flex items-center gap-2">
              <ShieldCheck size={14} /> Garantia Vanta
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-zinc-600 text-xs mt-16 border-t border-white/5 pt-8">
        &copy; 2024 Vanta Market. Todos os direitos reservados.
      </div>
    </footer>
  );
}