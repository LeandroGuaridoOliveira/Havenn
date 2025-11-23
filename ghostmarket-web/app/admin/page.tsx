"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle, AlertCircle, PackagePlus, LogOut, Image as ImageIcon, FileText, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- AUTH CHECK ---
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('havenn_token='));

    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

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
  const [image, setImage] = useState<File | null>(null); // New state for image
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

      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: "Produto cadastrado com sucesso!" });
        // Reset form
        setFormData({ name: "", description: "", details: "", category: "Software", videoUrl: "", price: "" });
        setFile(null);
        setImage(null);
        // Reset file inputs visually
        (document.getElementById('fileInput') as HTMLInputElement).value = "";
        (document.getElementById('imageInput') as HTMLInputElement).value = "";
      } else {
        setStatus({ type: 'error', msg: "Erro ao cadastrar produto na API." });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "Erro de conexão com o servidor." });
    }
  }

  function handleLogout() {
    document.cookie = "havenn_token=; path=/; max-age=0";
    router.push('/login');
  }

  if (!isAuthorized) return null;

  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1";
  const inputClass = "w-full bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-700 text-sm";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 selection:bg-indigo-500/30 pb-20">

      {/* Navbar Admin */}
      <nav className="border-b border-white/[0.05] bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <button onClick={handleLogout} className="text-xs font-medium text-zinc-500 hover:text-red-400 flex items-center gap-2 transition">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12">
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

            {/* Image Upload - Moved here */}
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

            {/* Product File Upload */}
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
      </main>
    </div>
  );
}