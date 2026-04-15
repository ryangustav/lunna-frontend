import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { Zap } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-white/5 bg-card/30 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow-primary transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Lunna</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('links')}</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('features') || 'Features'}
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  VIP
                </Link>
              </li>
              <li>
                <Link href="/coins" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Coins
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('legal')}</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                   {t('guidelines')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t('support')}</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://discord.gg/DaUhFcjJfH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('discord')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Lunna. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
