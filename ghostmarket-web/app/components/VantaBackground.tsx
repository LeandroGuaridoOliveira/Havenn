"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Função unificada de inicialização
  const initVanta = () => {
    // Se não tiver a lib ou o elemento, ou se já estiver rodando, para.
    if (!window.VANTA || !vantaRef.current || vantaEffect) return;

    try {
      const effect = window.VANTA.FOG({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        
        // --- CONFIGURAÇÃO DARK "HAVENN" ---
        highlightColor: 0x333333, 
        midtoneColor: 0x1a1a1a,   
        lowlightColor: 0x09090b,  
        baseColor: 0x09090b,      
        blurFactor: 0.6,          
        speed: 1.5,               
        zoom: 1.2,                
      });
      setVantaEffect(effect);
    } catch (error) {
      console.error("Erro ao iniciar Vanta:", error);
    }
  };

  // Efeito para detectar navegação (Voltar para Home)
  useEffect(() => {
    // Tenta iniciar imediatamente caso os scripts já estejam em cache
    const timer = setTimeout(() => {
        if (window.VANTA) initVanta();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null);
      }
    };
  }, []); // Roda apenas na montagem do componente

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
            // Esse onLoad só roda na PRIMEIRA vez que o site abre
            initVanta();
        }}
      />

      <div 
        ref={vantaRef} 
        className="absolute inset-0 -z-10 h-full w-full"
        style={{ 
            opacity: 0.8,
            pointerEvents: 'none'
        }} 
      />
    </>
  );
}