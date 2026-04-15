'use client';

import { Coins, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import '@/src/styles/Shop.css';
import '@/src/styles/globals.css';

interface Translation {
  shopTitle: string;
  shopDescription: string;
  ShopAlert: string;
  coinPackageBonus: string;
  purchase: string;
}

const translations: Record<string, Translation> = {
  en: {
    shopTitle: "Lunna Shop",
    shopDescription: "Enhance your Lunna experience with premium features and Lunar Coins",
    ShopAlert: "",
    coinPackageBonus: "Bonus Coins",
    purchase: "Purchase"
  },
  pt: {
    shopTitle: "Loja da Lunna",
    shopDescription: "Melhore sua experiência Lunna com recursos premium e Lunar Coins",
    ShopAlert: "",
    coinPackageBonus: "Bônus Coins",
    purchase: "Comprar"
  }
};

interface CoinsProps {
  amount: string;
  price: string;
  bonus: string;
}

export default function LunnarCoins() {
  const [language, setLanguage] = useState<string>("en");
  
  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguage(savedLanguage);
    }
    
    // Add event listener to detect language changes
    const handleStorageChange = () => {
      const currentLanguage = localStorage.getItem('language');
      if (currentLanguage && (currentLanguage === 'en' || currentLanguage === 'pt')) {
        setLanguage(currentLanguage);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check for language changes every second (alternative method)
    const intervalId = setInterval(() => {
      const currentLanguage = localStorage.getItem('language');
      if (currentLanguage && currentLanguage !== language && 
          (currentLanguage === 'en' || currentLanguage === 'pt')) {
        setLanguage(currentLanguage);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [language]);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 py-20 px-6 sm:px-12 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-20">
            <header className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Tesouro Lunar</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none italic uppercase">
                    Lunar Coins
                </h1>
                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                    {t.shopDescription}
                </p>
            </header>

            <main className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <CoinPackage amount="10,000" price="4.99" bonus="500" language={language} />
                    <CoinPackage amount="50,000" price="9.99" bonus="5,000" language={language} />
                    <CoinPackage amount="100,000" price="17.99" bonus="10,500" language={language} />
                    <CoinPackage amount="250,000" price="34.99" bonus="50,000" language={language} />
                    <CoinPackage amount="500,000" price="79.99" bonus="100,000" language={language} />
                    <CoinPackage amount="1,000,000" price="149.99" bonus="200,000" language={language} />
                    <CoinPackage amount="5,000,000" price="249.99" bonus="500,000" language={language} />
                    <CoinPackage amount="10,000,000" price="449.99" bonus="750,000" language={language} />
                </div>
            </main>
        </div>
    </div>
  );
}

interface CoinPackageProps extends CoinsProps {
  language: string;
}

function CoinPackage({ amount, price, bonus, language }: CoinPackageProps) {
  const t = translations[language];

  return (
    <div className="group relative bg-brand-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-between min-h-[400px] transition-all duration-700 hover:border-amber-400/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(251,191,36,0.1)] overflow-hidden">
        {/* Glow inner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/5 rounded-full blur-[40px] group-hover:bg-amber-400/10 transition-colors" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Coins className="w-8 h-8 text-amber-400" />
            </div>
            
            <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-white italic tracking-tight">{amount}</h3>
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest px-2">Coins</p>
            </div>

            {parseInt(bonus.replace(',', '')) > 0 && (
                <div className="bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    +{bonus} Bônus
                </div>
            )}
        </div>

        <div className="relative z-10 w-full space-y-6 pt-6 mt-6 border-t border-white/5">
            <div className="text-center">
                <span className="text-gray-500 text-xs font-bold mr-1">R$</span>
                <span className="text-3xl font-black text-white italic">{price}</span>
            </div>
            
            <button className="relative w-full group/btn flex items-center justify-center gap-3 py-4 bg-brand-dark border border-amber-400/30 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all overflow-hidden hover:bg-amber-400 hover:text-brand-dark">
                <Gift className="w-4 h-4" />
                {t.purchase}
            </button>
        </div>
    </div>
  );
}