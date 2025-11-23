import { Github, Twitter, ShieldCheck, Zap, Heart, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090b] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

        {/* Coluna 1: Marca */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2">
              <Zap className="text-indigo-500 fill-indigo-500/20" size={24} />
              Havenn
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Digital Assets Marketplace</p>
          </div>

          <p className="text-zinc-400 max-w-sm leading-relaxed text-sm">
            A plataforma definitiva para ativos digitais de alta performance.
            Segurança, privacidade e automação para elevar seu nível.
          </p>

          <div className="flex gap-4">
            <SocialIcon icon={<Twitter size={18} />} href="#" />
            <SocialIcon icon={<Github size={18} />} href="#" />
            <SocialIcon icon={<Instagram size={18} />} href="#" />
          </div>
        </div>

        {/* Coluna 2: Navegação */}
        <div>
          <h3 className="text-white font-semibold mb-6">Explorar</h3>
          <ul className="space-y-3 text-zinc-400 text-sm">
            <FooterLink href="#">Scripts & Cheats</FooterLink>
            <FooterLink href="#">Utilitários</FooterLink>
            <FooterLink href="#">Source Codes</FooterLink>
            <FooterLink href="#">Contas Premium</FooterLink>
          </ul>
        </div>

        {/* Coluna 3: Suporte & Legal */}
        <div>
          <h3 className="text-white font-semibold mb-6">Suporte</h3>
          <ul className="space-y-3 text-zinc-400 text-sm">
            <FooterLink href="#">Central de Ajuda</FooterLink>
            <FooterLink href="#">Termos de Serviço</FooterLink>
            <FooterLink href="#">Política de Privacidade</FooterLink>
            <li className="flex items-center gap-2 text-emerald-400 pt-2">
              <ShieldCheck size={14} /> Garantia Havenn
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} Havenn Digital. Todos os direitos reservados.
        </p>
        <p className="text-zinc-700 text-xs flex items-center gap-1">
          Feito com <Heart size={10} className="text-red-900 fill-red-900" /> para a comunidade.
        </p>
      </div>
    </footer>
  );
}

// Componentes Auxiliares para manter o código limpo
function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300"
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="hover:text-indigo-400 transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  );
}