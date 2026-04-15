'use client';

import { useTranslations } from 'next-intl';
import { Coins, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CoinPackage {
  amount: string;
  price: string;
  bonus: string;
  popular?: boolean;
}

const POOL_PACKAGES: CoinPackage[] = [
  { amount: "10,000", price: "4.99", bonus: "500" },
  { amount: "50,000", price: "9.99", bonus: "5,000", popular: true },
  { amount: "100,000", price: "17.99", bonus: "10,500" },
  { amount: "250,000", price: "34.99", bonus: "50,000" },
  { amount: "500,000", price: "79.99", bonus: "100,000" },
  { amount: "1,000,000", price: "149.99", bonus: "200,000" },
  { amount: "5,000,000", price: "249.99", bonus: "500,000" },
  { amount: "10,000,000", price: "449.99", bonus: "750,000" },
];

export default function CoinsPage() {
  const t = useTranslations('Coins');

  return (
    <div className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="px-4 py-1.5 border-amber-500/30 bg-amber-500/5 text-amber-500 gap-2">
            <Coins className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">{t('badge')}</span>
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-black text-foreground italic uppercase tracking-tighter">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-medium">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POOL_PACKAGES.map((pkg, idx) => (
            <Card 
              key={idx}
              className={`relative overflow-hidden glass-strong border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-amber-500/30 group ${
                pkg.popular ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Coins className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-3xl font-black italic tracking-tight">{pkg.amount}</CardTitle>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coins</div>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                {parseInt(pkg.bonus.replace(',', '')) > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase">
                    +{pkg.bonus} {t('bonus')}
                  </Badge>
                )}
                <div className="h-px bg-white/5 w-full mx-auto" />
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-muted-foreground">R$</span>
                  <span className="text-4xl font-black italic">{pkg.price}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button 
                  className="w-full h-12 rounded-xl bg-background border border-amber-500/30 text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all gap-2 group/btn"
                >
                  <Gift className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  {t('purchase')}
                </Button>
              </CardFooter>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
