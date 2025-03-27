'use client';

import { Coins, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import '@/src/styles/Shop.css';
import '@/src/styles/globals.css';

interface Translation {
  shopTitle: string;
  shopDescription: string;
  coinPackageBonus: string;
  purchase: string;
}

const translations: Record<string, Translation> = {
  en: {
    shopTitle: "Lunna Shop",
    shopDescription: "Enhance your Lunna experience with premium features and Lunar Coins",
    coinPackageBonus: "Bonus Coins",
    purchase: "Purchase"
  },
  pt: {
    shopTitle: "Loja da Lunna",
    shopDescription: "Melhore sua experiência Lunna com recursos premium e Lunar Coins",
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
    <div className="shop-container">
      <div className="shop-content">
        {/* Shop Header */}
        <header className="shop-header">
          <h1 className="text-4xl md:text-5xl font-bold text-[#fffffe] mb-4">
            {t.shopTitle}
          </h1>
          <p className="text-[#94a1b2] text-lg max-w-2xl mx-auto">
            {t.shopDescription}
          </p>
        </header>
        {/* Main Shop Content */}
        <main className="shop-sections">
          {/* Lunar Coins Packages */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex justify-center">
                <CoinPackage amount="10,000" price="4.99" bonus="500" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="50,000" price="9.99" bonus="5000" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="100,000" price="17.99" bonus="10500" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="250,000" price="34.99" bonus="50000" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="500,000" price="79.99" bonus="100000" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="1,000,000" price="149.99" bonus="200000" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="5,000,000" price="249.99" bonus="500000" language={language} />
              </div>
              <div className="flex justify-center">
                <CoinPackage amount="10,000,000" price="449.99" bonus="750000" language={language} />
              </div>
            </div>
          </section>
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
    <div className="coin-card">
      <div className="icon">
        <Coins className="w-8 h-8 mx-auto" />
      </div>
      <h3>{amount} Lunnar Coins</h3>
      {parseInt(bonus) > 0 && (
        <p className="bonus">+{bonus} {t.coinPackageBonus}</p>
      )}
      <p className="price">R${price}</p>
      <button>
        <Gift className="w-5 h-5" />
        <h4>{t.purchase}</h4>
      </button>
    </div>
  );
}