import { useTranslations } from 'next-intl';
import { FeatureCard } from './feature-card';
import { Coins, Swords, Shield } from 'lucide-react';

export function Features() {
  const t = useTranslations('Features');

  const features = [
    {
      icon: Coins,
      title: t('economy.title'),
      description: t('economy.description'),
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Swords,
      title: t('rpg.title'),
      description: t('rpg.description'),
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Shield,
      title: t('moderation.title'),
      description: t('moderation.description'),
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
