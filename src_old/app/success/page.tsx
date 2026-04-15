'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@/src/styles/globals.css';
import '@/src/styles/Shop.css';

function SuccessPageContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      
      const type = searchParams.get('type') || 'produto';
      setPurchaseType(type);
      
      // Trigger confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 py-24 px-6 sm:px-12 relative overflow-hidden flex items-center justify-center">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-3xl w-full">
        <header className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-tr from-brand-purple to-cyan-500 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-110 transition-transform">
                <span className="text-5xl">🎉</span>
            </div>
          </div>
            
          <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight italic uppercase">
                  Sucesso Celestial!
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                  Tua oferenda foi aceita. Ocosmos da Lunna agora ressoa com teus novos poderes de <span className="text-brand-purple">{purchaseType}</span>.
              </p>
          </div>

          {sessionId && (
            <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest mr-3">Protocolo Astral</span>
              <code className="text-xs text-brand-purple/80 font-mono italic">{sessionId}</code>
            </div>
          )}
        </header>

        <main className="mt-16 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <section className="bg-brand-card/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-2xl">
              <h2 className="text-xl font-black text-white uppercase tracking-widest italic mb-8 border-l-4 border-brand-purple pl-4">
                Manifestações Ativadas:
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(purchaseType === 'vip' ? [
                  'Acesso pleno ao reino VIP',
                  'Aura de prestígio global',
                  'Prioridade mística no suporte'
                ] : purchaseType === 'coins' ? [
                  'Lunar Coins creditados',
                  'Poder de troca imediato',
                  'Economia expandida'
                ] : [
                  'Artefato vinculado à conta',
                  'Acesso imediato ao poder',
                  'Histórico astral gravado'
                ]).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-brand-purple/20 transition-all">
                      <div className="p-2 bg-brand-purple/20 rounded-lg text-brand-purple">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="text-sm font-bold text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
          </section>

          <footer className="flex flex-col items-center space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link href="/" className="group relative w-full sm:w-auto px-10 py-5 bg-brand-purple text-white rounded-[2rem] font-black tracking-widest uppercase text-xs shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden flex items-center justify-center">
                <span className="relative z-10">Voltar ao Cosmos</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link href={purchaseType === 'vip' ? "/vip" : "/coins"} className="w-full sm:w-auto px-10 py-5 bg-brand-card/50 border border-white/10 text-gray-400 rounded-[2rem] font-black tracking-widest uppercase text-xs hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                Verificar {purchaseType}
              </Link>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500 font-medium italic">
                Um selo orbital de confirmação foi enviado para o teu e-mail cadastrado.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="shop-container"><div className="shop-content text-center">Carregando confirmação...</div></div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
