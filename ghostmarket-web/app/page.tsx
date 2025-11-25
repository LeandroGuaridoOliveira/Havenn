import Link from "next/link";
import Footer from "./components/Footer";
// VantaBackground removed
import CartTrigger from "./components/CartTrigger";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // Import necessário para verificar o admin

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string | null;
}

// Função para decodificar o token e ver se é admin
function getUserRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson);
    return payload.role || null;
  } catch (e) {
    return null;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

async function getProducts(search?: string, category?: string): Promise<Product[]> {
  const url = new URL(`${API_URL}/products`);
  if (search) url.searchParams.append("search", search);
  if (category) url.searchParams.append("category", category);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export default async function Home(props: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await props.searchParams;
  const currentCategory = params.category || 'Todos';
  const currentSearch = params.search || '';
  const products = await getProducts(currentSearch, currentCategory);

  // 1. Verificação de Admin no Servidor
  const cookieStore = await cookies();
  const token = cookieStore.get("havenn_token")?.value;
  const userRole = getUserRoleFromToken(token);
  const isAdmin = userRole === 'ADMIN';

  async function searchAction(formData: FormData) {
    "use server";
    const query = formData.get("q")?.toString();
    redirect(`/?search=${query || ""}`);
  }

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 bg-[#09090b]">

      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-sm border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.05em] text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            Havenn.
          </Link>

          <form action={searchAction} className="hidden md:flex items-center bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 w-96 hover:border-white/[0.1] transition-colors focus-within:border-white/20 focus-within:bg-white/[0.05]">
            <Search size={14} className="text-zinc-500" />
            <input
              name="q"
              type="text"
              placeholder="Buscar no catálogo..."
              defaultValue={currentSearch}
              className="bg-transparent border-none outline-none text-sm ml-3 text-zinc-200 w-full placeholder:text-zinc-600 font-light"
            />
          </form>

          <div className="flex items-center gap-6">

            {/* 2. Link Admin Condicional */}
            {isAdmin && (
              <Link href="/admin" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition duration-300">
                Admin
              </Link>
            )}

            <CartTrigger />
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-48 pb-24 px-6 text-center border-b border-white/[0.05]">
        {/* CSS Animated Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/[0.1] text-[10px] font-medium text-zinc-300 mb-8 uppercase tracking-widest backdrop-blur-md">
            <Sparkles size={10} className="text-indigo-400" /> Nova Coleção Disponível
          </div>
          <h1 className="text-5xl md:text-7xl font-medium text-white tracking-[-0.04em] mb-6 leading-[1.1] drop-shadow-lg">
            Liberdade digital <br />
            <span className="text-zinc-400">sem fronteiras.</span>
          </h1>
          <p className="text-zinc-300 text-lg font-light max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Curadoria premium de softwares, scripts e assets exclusivos.
            Acesso imediato, privacidade total e segurança garantida.
          </p>
        </div>
      </header>

      <div className="sticky top-20 z-40 bg-[#09090b]/90 backdrop-blur-sm border-y border-white/[0.02] py-4">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto no-scrollbar justify-center">
          {['Todos', 'Software', 'Script', 'E-book', 'Source Code'].map(cat => (
            <Link
              key={cat}
              href={`/?category=${cat}`}
              className={`px-5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${currentCategory === cat
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
                }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 min-h-[50vh]">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
            <div className="w-16 h-16 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Search size={24} strokeWidth={1} />
            </div>
            <p className="font-light">Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] flex flex-col h-full">

                  <div className="aspect-[4/3] bg-[#0c0c0e] relative overflow-hidden p-8 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {product.imageUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900/30 border border-white/[0.03] rounded-xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                        <span className="text-4xl font-light text-white/20 group-hover:text-white transition-colors duration-500">
                          Aa
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm line-clamp-2 font-light leading-relaxed mb-6 flex-grow">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium group-hover:text-indigo-400 transition-colors uppercase tracking-wider mt-auto">
                      Ver Detalhes <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div >
  );
}