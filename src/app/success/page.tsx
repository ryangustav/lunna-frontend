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
    <div className="shop-container">
      <div className="shop-content">
        <header className="shop-header">
          <div className="success-animation-container">
            {showConfetti && (
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      backgroundColor: ['#7f5af0', '#2cb67d', '#ffb800', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 5)]
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="tada-animation">
              <div className="tada-icon">🎉</div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#fffffe] mb-4">
              Compra Realizada com Sucesso!
            </h1>
            
            <p className="text-[#94a1b2] text-lg max-w-2xl mx-auto mb-6">
              Obrigado pela sua compra! Seu {purchaseType === 'vip' ? 'plano VIP' : purchaseType === 'coins' ? 'coins' : 'produto'} foi processado com sucesso.
            </p>

            {sessionId && (
              <div className="session-info-card">
                <h3 className="text-sm font-semibold text-[#fffffe] mb-2">
                  ID da Sessão:
                </h3>
                <p className="text-xs text-[#94a1b2] font-mono break-all">
                  {sessionId}
                </p>
              </div>
            )}
          </div>
        </header>

        <main className="shop-sections">
          <section className="mb-16">
            <div className="success-benefits-card">
              <h2 className="text-2xl font-bold text-[#fffffe] mb-6 text-center">
                O que você ganhou:
              </h2>
              
              <div className="benefits-grid">
                {purchaseType === 'vip' ? (
                  <>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Acesso completo ao plano VIP</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Recursos premium desbloqueados</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Suporte prioritário</span>
                    </div>
                  </>
                ) : purchaseType === 'coins' ? (
                  <>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Coins adicionados à sua conta</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Use para compras na plataforma</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Saldo disponível imediatamente</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Produto adicionado à sua conta</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Acesso imediato ao conteúdo</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="text-center">
            <div className="button-group">
              <Link href="/" className="button-primary">
                Voltar ao Início
              </Link>
              
              {purchaseType === 'vip' && (
                <Link href="/vip" className="button-secondary">
                  Ver Plano VIP
                </Link>
              )}
              
              {purchaseType === 'coins' && (
                <Link href="/coins" className="button-secondary">
                  Ver Coins
                </Link>
              )}
            </div>
            
            <div className="success-footer">
              <p className="text-sm text-[#94a1b2]">
                Se você tiver alguma dúvida sobre sua compra, entre em contato conosco.
              </p>
              <p className="text-xs text-[#7f5af0] mt-2">
                Um email de confirmação foi enviado para você.
              </p>
            </div>
          </section>
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
