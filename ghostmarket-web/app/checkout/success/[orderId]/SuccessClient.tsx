"use client";
import { useEffect, useState } from 'react';
import { CheckCircle, Download, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DownloadInfo {
    downloadUrl: string;
    fileName: string;
}

// Função assíncrona que processa o pedido e busca o link seguro
async function processOrderAndGetLink(orderId: string, setDownloadInfo: any, setError: any, setLoading: any) {
    setLoading(true);

    // 1. Extração do Token
    const token = document.cookie.split('; ').find(row => row.startsWith('havenn_token='))?.split('=')[1];

    if (!token) {
        setError('Token de sessão não encontrado. O login pode ter expirado.');
        setLoading(false);
        return;
    }

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    try {
        // --- 1. DELAY ESTRATÉGICO PARA O BANCO COMMITAR ---
        await new Promise(resolve => setTimeout(resolve, 500));
        // ----------------------------------------------------

        // A. Buscar Detalhes do Pedido (PRIMEIRA CHAMADA - AGORA COM AUTH HEADER)
        const orderDetailsRes = await fetch(`http://localhost:3333/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!orderDetailsRes.ok) throw new Error('Pedido não encontrado no banco de dados. (ID inválido)');
        const orderDetails = await orderDetailsRes.json();
        const firstItem = orderDetails.items[0];
        if (!firstItem) throw new Error('O pedido está vazio.');

        // B. Simular Webhook (PATCH para PAID) - Requer Autenticação
        const webhookRes = await fetch(`http://localhost:3333/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({ status: 'PAID' }),
        });

        if (!webhookRes.ok) throw new Error('Falha ao simular pagamento.');

        // C. Buscar o Link de Download Seguro (GET) - Requer Autenticação
        const downloadRes = await fetch(`http://localhost:3333/orders/${orderId}/download/${firstItem.productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!downloadRes.ok) throw new Error('Falha ao gerar link seguro.');

        const info = await downloadRes.json();
        setDownloadInfo(info);

    } catch (e: any) {
        setError(e.message || 'Erro desconhecido.');
    } finally {
        setLoading(false); // Garante que o loading para
    }
}


export default function SuccessClient({ orderId }: { orderId: string }) {
    const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (orderId) {
            processOrderAndGetLink(orderId, setDownloadInfo, setError, setLoading);
        }
    }, [orderId]);


    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 flex items-center justify-center p-8">
            <div className="w-full max-w-lg bg-zinc-900/50 border border-white/[0.08] rounded-3xl p-10 text-center shadow-2xl">

                {/* Lógica de Carregamento */}
                {loading && !error ? (
                    <div className='flex flex-col items-center gap-4'>
                        <Zap size={40} className="text-indigo-400 animate-spin" />
                        <h2 className="text-xl font-medium text-white">Processando Pagamento...</h2>
                        <p className="text-zinc-500 text-sm">Validando status e gerando link seguro.</p>
                    </div>
                ) : error ? (
                    /* Lógica de Erro */
                    <div className='flex flex-col items-center gap-4'>
                        <XCircle size={40} className="text-red-500" />
                        <h2 className="text-xl font-medium text-white">Falha na Transação</h2>
                        <p className="text-zinc-400 text-sm">{error}</p>
                        <Link href="/" className="text-indigo-400 hover:underline">Tentar novamente</Link>
                    </div>
                ) : (
                    /* Lógica de Sucesso */
                    <div className='space-y-8'>
                        <div className='flex flex-col items-center gap-4'>
                            <CheckCircle size={48} className="text-emerald-500" />
                            <h2 className="text-3xl font-bold text-white tracking-tight">Pedido Confirmado!</h2>
                            <p className="text-zinc-400">Seu acesso digital está pronto. ID: <span className='font-mono text-xs bg-white/5 px-2 py-1 rounded'>{orderId.substring(0, 8)}...</span></p>
                        </div>

                        <a
                            href={downloadInfo?.downloadUrl}
                            target="_blank"
                            className="w-full h-14 bg-emerald-500 text-black rounded-xl font-bold flex items-center justify-center gap-3 text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/50"
                        >
                            <Download size={20} /> Baixar {downloadInfo?.fileName}
                        </a>

                        <div className='mt-8 text-zinc-600 text-xs border-t border-white/5 pt-4'>
                            O link de download é temporário. Salve o arquivo imediatamente.
                            <p className='mt-1 text-zinc-500'>Para re-download, use a página de <Link href="/dashboard" className='text-indigo-400 hover:underline'>Minhas Compras</Link>.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}