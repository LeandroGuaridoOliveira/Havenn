import { Suspense, use } from 'react';
import SuccessClient from './SuccessClient'; // Importe o código original
import { Zap } from 'lucide-react';

// Este é o novo Server Component que resolve a URL assíncrona
export default async function SuccessWrapper({ params }: { params: Promise<{ orderId: string }> }) {
  // O Next.js nos instrui a usar o React.use() ou await para desempacotar
  const { orderId } = await params;

  return (
    <Suspense fallback={
        <div className='min-h-screen flex items-center justify-center bg-[#09090b]'>
            <Zap size={40} className="text-indigo-400 animate-spin" />
        </div>
    }>
      <SuccessClient orderId={orderId} />
    </Suspense>
  );
}