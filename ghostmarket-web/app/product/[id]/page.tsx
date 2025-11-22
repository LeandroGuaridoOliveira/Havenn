import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Download, Play } from "lucide-react";

// Função para buscar UM produto específico
async function getProduct(id: string) {
  const res = await fetch(`http://localhost:3000/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

// Helper para pegar o ID do vídeo do YouTube
function getYoutubeId(url: string | undefined) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- A CORREÇÃO ESTÁ AQUI EMBAIXO ---
// Definimos params como uma Promise
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Aguardamos a resolução dos parâmetros antes de usar
  const { id } = await params;

  // 2. Agora usamos o 'id' limpo
  const product = await getProduct(id);
  
  const youtubeId = getYoutubeId(product?.videoUrl);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <h2 className="text-xl font-bold text-white">Produto não encontrado.</h2>
        <Link href="/" className="text-emerald-400 hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      {/* Navbar Simplificada */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl p-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Voltar para Loja
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLUNA DA ESQUERDA: Mídia e Descrição */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Player de Vídeo ou Placeholder */}
          <div className="aspect-video bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl shadow-emerald-900/20">
            {youtubeId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-700">
                <Play size={48} className="opacity-20 mb-2" />
                <span className="text-sm">Sem vídeo demonstrativo</span>
              </div>
            )}
          </div>

          {/* Título e Infos */}
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                 {product.category || "Software"}
               </span>
               <span className="text-zinc-500 text-xs flex items-center gap-1">
                 <ShieldCheck size={14} /> Verificado Vanta
               </span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">{product.name}</h1>
            
            <div className="prose prose-invert prose-zinc max-w-none">
              <h3 className="text-xl font-semibold text-white mb-2">Sobre o produto</h3>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                {product.details || product.description}
              </p>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: Checkout (Sticky) */}
        <div className="relative">
          <div className="sticky top-8 bg-zinc-900/30 border border-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6">
            <div>
              <span className="text-zinc-400 text-sm block mb-1">Preço total</span>
              <div className="text-4xl font-bold text-white flex items-end gap-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 transition flex items-center justify-center gap-2">
                <Zap size={20} /> Comprar Agora
              </button>
              <p className="text-center text-xs text-zinc-500">
                Entrega automática via e-mail após o pagamento.
              </p>
            </div>

            <hr className="border-white/5" />

            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <Download size={18} className="text-emerald-400" /> 
                Download Imediato
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-400" /> 
                Seguro & Sem Logs
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}