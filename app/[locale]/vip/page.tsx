'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Star,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface PlanConfig {
  key: 'vip' | 'premium' | 'gods';
  icon: React.ReactNode;
  priceMonthly: number;
  accent: string;
  glowColor: string;
  borderColor: string;
  badgeBg: string;
  popular?: boolean;
}

interface FaqItemProps {
  question: string;
  answer: string;
}

/* ------------------------------------------------------------------ */
/*  FAQ Item                                                            */
/* ------------------------------------------------------------------ */
function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground">{question}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-primary" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan Card                                                           */
/* ------------------------------------------------------------------ */
function PlanCard({
  plan,
  billing,
  t,
}: {
  plan: PlanConfig;
  billing: 'monthly' | 'yearly';
  t: ReturnType<typeof useTranslations<'VIP'>>;
}) {
  const price = billing === 'yearly'
    ? (plan.priceMonthly * 12 * 0.8).toFixed(0)
    : plan.priceMonthly.toFixed(2).replace('.', ',');

  const suffix = billing === 'yearly' ? t('perYear') : t('perMonth');

  const planT = t.raw(`plans.${plan.key}`) as {
    name: string;
    description: string;
    features: string[];
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-px transition-transform duration-300 hover:-translate-y-1 ${
        plan.popular ? plan.borderColor : 'border border-border'
      }`}
      style={plan.popular ? { background: `linear-gradient(135deg, ${plan.glowColor}55, transparent 60%)` } : {}}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className={`rounded-full px-4 py-1 text-xs font-bold text-white ${plan.badgeBg}`}>
            {t('mostPopular')}
          </span>
        </div>
      )}

      <div className="flex h-full flex-col rounded-2xl bg-card p-7 gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: `${plan.glowColor}22`, border: `1px solid ${plan.glowColor}44` }}
            >
              <span style={{ color: plan.glowColor }}>{plan.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{planT.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{planT.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-foreground">
            R$ {price}
          </span>
          <span className="mb-1 text-sm text-muted-foreground">{suffix}</span>
        </div>

        {/* CTA */}
        <Button
          className="w-full font-semibold"
          style={
            plan.popular
              ? { background: plan.glowColor, boxShadow: `0 0 20px ${plan.glowColor}55` }
              : {}
          }
          variant={plan.popular ? 'default' : 'outline'}
        >
          {t('getStarted')}
        </Button>

        {/* Features */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('featuresTitle')}
          </span>
          <ul className="flex flex-col gap-2.5">
            {planT.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: plan.glowColor }}
                />
                <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function VipPage() {
  const t = useTranslations('VIP');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PlanConfig[] = [
    {
      key: 'vip',
      icon: <Star className="h-6 w-6" />,
      priceMonthly: 9.90,
      accent: '#2cb67d',
      glowColor: '#2cb67d',
      borderColor: 'border border-[#2cb67d44]',
      badgeBg: 'bg-[#2cb67d]',
    },
    {
      key: 'premium',
      icon: <Zap className="h-6 w-6" />,
      priceMonthly: 19.90,
      accent: '#7f5af0',
      glowColor: '#7f5af0',
      borderColor: 'border-0',
      badgeBg: 'bg-primary',
      popular: true,
    },
    {
      key: 'gods',
      icon: <Crown className="h-6 w-6" />,
      priceMonthly: 39.90,
      accent: '#ffb800',
      glowColor: '#ffb800',
      borderColor: 'border border-[#ffb80044]',
      badgeBg: 'bg-[#ffb800]',
    },
  ];

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(127,90,240,0.15) 0%, transparent 70%)',
            }}
          />

          <div className="animate-fade-in flex flex-col items-center gap-6">
            <Badge
              variant="secondary"
              className="gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ background: 'rgba(127,90,240,0.15)', color: '#7f5af0', border: '1px solid rgba(127,90,240,0.3)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('badge')}
            </Badge>

            <h1 className="text-balance text-4xl font-extrabold text-foreground md:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>

            {/* Billing toggle */}
            <div className="glass mt-2 flex items-center gap-1 rounded-full p-1">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  billing === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('monthlyLabel')}
              </button>
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  billing === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('yearlyLabel')}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(44,182,125,0.2)', color: '#2cb67d' }}
                >
                  {t('yearlySave')}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Plans grid */}
        <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.key} plan={plan} billing={billing} t={t} />
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border bg-card/40 py-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 lg:px-8">
            {[
              { icon: <Shield className="h-5 w-5 text-primary" />, text: 'Pagamento 100% seguro' },
              { icon: <Check className="h-5 w-5 text-[#2cb67d]" />, text: 'Cancele quando quiser' },
              { icon: <Zap className="h-5 w-5 text-[#ffb800]" />, text: 'Ativação imediata' },
              { icon: <Star className="h-5 w-5 text-primary" />, text: '+12.000 assinantes ativos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">{t('faqTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('faqSubtitle')}</p>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
