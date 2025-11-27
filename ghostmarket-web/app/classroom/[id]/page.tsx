"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Play, CheckCircle, ChevronLeft, ChevronRight, Download, FileText, Menu, X, Lock } from "lucide-react";
import VantaBackground from "../../components/VantaBackground";

interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    description: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    modules: Module[];
    storageKey?: string;
}

export default function ClassroomPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    async function fetchProduct() {
        try {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("havenn_token="))
                ?.split("=")[1];

            if (!token) {
                router.push("/login");
                return;
            }

            // Fetch product details including modules and lessons
            // Note: We are using the public product endpoint for now, but ideally this should be a protected endpoint 
            // verifying ownership. For MVP, we assume if they have the link and token, they can view (backend should verify access).
            // Actually, the user requirement said "Ensure the route that returns the product... includes modules".
            // We'll use the standard GET /products/:id which we updated.
            // However, we should probably check if the user owns it. 
            // For now, let's fetch.
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                // Set first lesson as active
                if (data.modules && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
                    setActiveLesson(data.modules[0].lessons[0]);
                    setExpandedModules([data.modules[0].id]);
                }
            } else {
                setError("Erro ao carregar curso.");
            }
        } catch (err) {
            setError("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    }

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleDownloadMaterial = async () => {
        if (!product?.storageKey) return;
        // Implement download logic similar to MyOrders
        try {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("havenn_token="))
                ?.split("=")[1];

            // We need an orderId to download. This is tricky because we are in the classroom.
            // The backend download endpoint requires orderId and productId.
            // We might need to fetch the user's order for this product first, or update the backend to allow download by productId if owned.
            // For now, let's alert the user or try to find the order.
            // A better approach for the pivot: The "storageKey" in Product is now the "Materials".
            // We can create a specific endpoint for course materials that checks ownership.
            // Since we didn't create that endpoint yet, we will just show a message or try a generic download if available.
            alert("Download de materiais será implementado em breve.");
        } catch (err) {
            alert("Erro ao baixar material.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Erro</h1>
                    <p className="text-zinc-400">{error || "Curso não encontrado"}</p>
                    <button onClick={() => router.push('/my-orders')} className="mt-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-lg truncate pr-4" title={product.name}>{product.name}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-4">
                    {product.modules?.map((module) => (
                        <div key={module.id} className="space-y-2">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                            >
                                <span className="font-medium text-sm text-zinc-200">{module.title}</span>
                                <ChevronRight size={16} className={`transform transition-transform ${expandedModules.includes(module.id) ? 'rotate-90' : ''}`} />
                            </button>

                            {expandedModules.includes(module.id) && (
                                <div className="pl-2 space-y-1">
                                    {module.lessons.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => {
                                                setActiveLesson(lesson);
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${activeLesson?.id === lesson.id
                                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                                                }`}
                                        >
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${activeLesson?.id === lesson.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800'
                                                }`}>
                                                <Play size={10} fill="currentColor" />
                                            </div>
                                            <span className="truncate">{lesson.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <VantaBackground />
                </div>

                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-white/10 flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md z-10">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg">
                        <Menu size={20} />
                    </button>
                    <span className="font-medium truncate">{activeLesson?.title || product.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {activeLesson ? (
                            <>
                                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 relative group">
                                    {activeLesson.videoUrl ? (
                                        activeLesson.videoUrl.endsWith('.mp4') ? (
                                            <video
                                                src={activeLesson.videoUrl}
                                                controls
                                                className="w-full h-full object-contain"
                                                autoPlay
                                            />
                                        ) : (
                                            <iframe
                                                src={activeLesson.videoUrl}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        )
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-500">
                                            <p>Sem vídeo disponível</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h1 className="text-2xl md:text-3xl font-bold">{activeLesson.title}</h1>
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" title="Anterior">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" title="Próxima">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-zinc-400 leading-relaxed">{activeLesson.description}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                                    <Play size={40} className="text-indigo-400 ml-1" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Bem-vindo ao curso!</h2>
                                <p className="text-zinc-400 max-w-md">Selecione uma aula no menu lateral para começar a assistir.</p>
                            </div>
                        )}

                        {/* Materials Section */}
                        <div className="border-t border-white/10 pt-8 mt-12">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-indigo-400" />
                                Materiais Complementares
                            </h3>
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Arquivos do Curso</p>
                                    <p className="text-sm text-zinc-400">Código fonte, slides e certificados.</p>
                                </div>
                                <button
                                    onClick={handleDownloadMaterial}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                                >
                                    <Download size={18} />
                                    <span>Baixar Materiais</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
