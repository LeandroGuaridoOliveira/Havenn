import Link from "next/link";
import { ArrowLeft, ShieldCheck, Play, Download, CheckCircle2, Zap } from "lucide-react";
import AddToCartButton from "../../components/AddToCartButton";

async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function getYoutubeId(url: string | undefined) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const youtubeId = getYoutubeId(product?.videoUrl);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <p>Produto não encontrado.</p>
        <Link href="/" className="text-indigo-400 hover:underline">Voltar ao catálogo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 selection:bg-indigo-500/30 pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/05 blur-[120px] rounded-full"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para o Catálogo
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-7 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-white/[0.05] border border-white/[0.1] text-zinc-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {product.category || "Software"}
              </span>
              <span className="text-emerald-400/80 text-xs flex items-center gap-1 font-medium tracking-wide bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck size={12} /> Verificado
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-6 leading-tight">
              {product.name}
            </h1>

            <p className="text-lg text-zinc-400 font-light leading-relaxed border-l-2 border-white/10 pl-6">
              {product.description}
            </p>
          </div>

          <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
            {youtubeId ? (
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video" allowFullScreen
                className="absolute inset-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-800 bg-zinc-900/50 backdrop-blur">
                <Play size={64} strokeWidth={1} />
                <span className="text-xs mt-4 uppercase tracking-widest font-bold opacity-50">Preview Indisponível</span>
              </div>
            )}
          </div>

          <div className="prose prose-invert prose-zinc max-w-none pt-8 border-t border-white/[0.05]">
            <h3 className="text-xl font-medium text-white mb-4">Especificações & Detalhes</h3>
            <div className="text-zinc-400 font-light whitespace-pre-line leading-8">
              {product.details || "Sem detalhes adicionais registrados para este asset."}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="bg-[#0c0c0e]/80 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/50">

              <div className="mb-8">
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-2 block">Investimento</span>
                <div className="text-5xl font-medium text-white tracking-tighter flex items-start gap-1">
                  <span className="text-2xl mt-2 text-zinc-500">R$</span>
                  {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* INTEGRAÇÃO DO CARRINHO */}
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  category: product.category || 'Software'
                }}
              />

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <CheckCircle2 size={20} className="text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="text-white text-sm font-medium">Entrega Instantânea</h4>
                    <p className="text-zinc-500 text-xs mt-1">Link de download enviado automaticamente para seu e-mail após a confirmação.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <ShieldCheck size={20} className="text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="text-white text-sm font-medium">Privacidade Havenn</h4>
                    <p className="text-zinc-500 text-xs mt-1">Transação criptografada.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                  Pagamento Seguro via PIX ou Cartão
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}