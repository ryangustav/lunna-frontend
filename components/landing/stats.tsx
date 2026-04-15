import { useTranslations } from 'next-intl';

export function Stats() {
  const t = useTranslations('Stats');

  const stats = [
    { value: '10K+', label: t('servers') },
    { value: '500K+', label: t('users') },
    { value: '1M+', label: t('commands') },
    { value: '99.9%', label: t('uptime') },
  ];

  return (
    <section className="relative py-16 lg:py-24">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="glass rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
