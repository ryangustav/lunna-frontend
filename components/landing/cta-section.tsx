import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const t = useTranslations('CTA');

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          <div className="absolute inset-0 glass" />
          
          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
            <div className="mt-10">
              <Button size="lg" className="glow-primary-lg animate-glow-pulse group text-base px-8" asChild>
                <a
                  href="https://discord.com/oauth2/authorize"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('button')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
