import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/src/i18n/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>{t('badge')}</span>
          </div>

          {/* Title */}
          <h1 className="animate-slide-up text-balance max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: '0.1s' }}>
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="animate-slide-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className="glow-primary group text-base" asChild>
              <a
                href="https://discord.com/oauth2/authorize"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('cta')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/dashboard">
                {t('secondaryCta')}
              </Link>
            </Button>
          </div>

          {/* Bot Visual */}
          <div className="animate-slide-up mt-16 lg:mt-24" style={{ animationDelay: '0.3s' }}>
            <div className="relative mx-auto w-full max-w-3xl">
              {/* Glow effect behind */}
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-3xl" />
              
              {/* Mock Discord interface */}
              <div className="relative glass rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">BotName</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="glass rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">/trabalhar</span> - Voce trabalhou e ganhou <span className="text-green-400 font-bold">5.000 moedas</span>!
                    </p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">/dungeon entrar</span> - Voce entrou na <span className="text-foreground font-bold">Caverna do Dragao</span>!
                    </p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">/ban</span> - Usuario banido com sucesso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
