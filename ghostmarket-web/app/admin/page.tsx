"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, CheckCircle, AlertCircle, PackagePlus, LogOut,
  Image as ImageIcon, FileText, ArrowLeft, LayoutDashboard,
  ShoppingBag, DollarSign, TrendingUp, Calendar
} from "lucide-react";

// --- INTERFACES ---
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  recentOrders: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Auth is now handled by server-side middleware in middleware.ts

  // --- FETCH STATS ---
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];
      const res = await fetch("http://localhost:3333/orders/stats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas", error);
    } finally {
      setLoadingStats(false);
    }
  }

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: "",
    category: "Software",
    videoUrl: "",
    price: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | '', msg: string }>({ type: '', msg: '' });

  // --- SUBMIT HANDLER ---
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', msg: "É obrigatório anexar o arquivo do produto (.zip, .rar, .exe)." });
      return;
    }

    setStatus({ type: 'loading', msg: "Enviando produto e arquivos..." });

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("details", formData.details);
    data.append("category", formData.category);
    data.append("videoUrl", formData.videoUrl);
    data.append("price", formData.price);
    data.append("file", file);
    if (image) {
      data.append("image", image);
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];

      const res = await fetch("http://localhost:3333/products", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: "Produto cadastrado com sucesso!" });
        setFormData({ name: "", description: "", details: "", category: "Software", videoUrl: "", price: "" });
        setFile(null);
        setImage(null);
        (document.getElementById('fileInput') as HTMLInputElement).value = "";
        (document.getElementById('imageInput') as HTMLInputElement).value = "";
      } else {
        const errorData = await res.json();
        console.error("Erro API:", errorData);
        setStatus({ type: 'error', msg: `Erro ao cadastrar: ${errorData.message || 'Erro desconhecido'}` });
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setStatus({ type: 'error', msg: "Erro de conexão com o servidor." });
    }
  }

  function handleLogout() {
    document.cookie = "havenn_token=; path=/; max-age=0";
    router.push('/login');
  }

  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1";
  const inputClass = "w-full bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-700 text-sm";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 selection:bg-indigo-500/30 pb-20">
      {/* Navbar Admin */}
      <nav className="border-b border-white/[0.05] bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              title="Voltar para a Loja"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-white tracking-tight">Havenn Admin</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
            >
              Produtos
            </button>
          </div>

          <button onClick={handleLogout} className="text-xs font-medium text-zinc-500 hover:text-red-400 flex items-center gap-2 transition">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-medium text-white mb-2 flex items-center gap-3">
                <LayoutDashboard className="text-indigo-500" /> Visão Geral
              </h1>
              <p className="text-zinc-500 text-sm">Acompanhe o desempenho de vendas e pedidos recentes.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-white/[0.05] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-500 text-sm font-medium">Receita Total</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {loadingStats ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue || 0)}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/[0.05] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-500 text-sm font-medium">Total de Pedidos</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {loadingStats ? "..." : stats?.totalOrders || 0}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/[0.05] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-500 text-sm font-medium">Ticket Médio</span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {loadingStats ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders) : 0
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-zinc-900/50 border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.05]">
                <h2 className="text-lg font-medium text-white">Pedidos Recentes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-white/[0.02] text-zinc-500 uppercase text-xs font-medium">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {loadingStats ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center">Carregando...</td></tr>
                    ) : stats?.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-600">{order.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-white">{order.user?.email || order.customerEmail || 'N/A'}</td>
                        <td className="px-6 py-4">{order.items[0]?.product.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-white font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.totalAmount))}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                    {!loadingStats && stats?.recentOrders.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-600">Nenhum pedido encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB (Existing Form) */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-medium text-white mb-2 flex items-center gap-3">
                <PackagePlus className="text-indigo-500" /> Novo Asset
              </h1>
              <p className="text-zinc-500 text-sm">Preencha os detalhes e faça upload do arquivo para disponibilizar na loja.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl shadow-2xl">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nome do Produto</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ex: Aimbot Premium v2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="row-span-2">
                  <label className={labelClass}>Imagem de Capa (Opcional)</label>
                  <div className="relative group h-full min-h-[130px]">
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${image ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 bg-[#0c0c0e] group-hover:border-zinc-600'}`}>
                      {image ? (
                        <>
                          <CheckCircle className="text-indigo-500 mb-2" size={24} />
                          <span className="text-white font-medium text-sm truncate max-w-[80%]">{image.name}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-zinc-500 mb-2 group-hover:text-white transition-colors" size={24} />
                          <span className="text-zinc-400 text-xs font-medium group-hover:text-white transition-colors">Imagem (.jpg, .png)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Categoria</label>
                  <div className="relative">
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Software</option>
                      <option>Script</option>
                      <option>E-book</option>
                      <option>Source Code</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-500">▼</div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Descrição Curta (Card)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Resumo de uma linha..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Detalhes Técnicos (Página do Produto)</label>
                  <textarea
                    rows={6}
                    className={inputClass}
                    placeholder="Funcionalidades, requisitos, tutorial de instalação..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Vídeo Preview (YouTube URL)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Uploads Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.05]">
                <div className="md:col-span-2">
                  <label className={labelClass}>Arquivo do Produto (Obrigatório)</label>
                  <div className="relative group h-32">
                    <input
                      id="fileInput"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-[#0c0c0e] group-hover:border-zinc-600'}`}>
                      {file ? (
                        <>
                          <CheckCircle className="text-emerald-500 mb-2" size={24} />
                          <span className="text-white font-medium text-sm truncate max-w-[80%]">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="text-zinc-500 mb-2 group-hover:text-white transition-colors" size={24} />
                          <span className="text-zinc-400 text-xs font-medium group-hover:text-white transition-colors">Arquivo (.zip, .rar)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button & Status */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full bg-white text-black font-bold h-12 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status.type === 'loading' ? "Processando..." : "Publicar Produto"}
                </button>

                {status.msg && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.msg}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}