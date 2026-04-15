'use client';
import { useState, useEffect } from 'react';
import { Crown, Star, Zap, Diamond, Rocket, User } from 'lucide-react';
import { getCookie } from 'cookies-next';
import { ReactElement } from 'react';
import '@/src/styles/Shop.css'; 
import '@/src/styles/globals.css' 


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
    purchase: "Get Started"
  },
  pt: {
    shopTitle: "Loja da Lunna",
    shopDescription: "Melhore sua experiência Lunna com recursos premium e Lunar Coins",
    coinPackageBonus: "Bônus Coins",
    purchase: "Comece agora"
  }
};

interface VipTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  durationDays: number;
}

interface VipProps {
  icon: ReactElement;
  title: string;
  price: number;
  period: string;
  features: string[];
  featured?: boolean;
  accentColor?: string;
  tierId: string;
  onPurchase: (tierId: string) => Promise<void>;
  loading?: boolean;
  purchase_label: string;
}

interface User {
  userId: string;
  username: string;
  avatar?: string;
}

function VipPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tiers, setTiers] = useState<VipTier[]>([]);
 const [language, setLanguage] = useState<string>("en");
  
  useEffect(() => {

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguage(savedLanguage);
    }
    
    const handleStorageChange = () => {
      const currentLanguage = localStorage.getItem('language');
      if (currentLanguage && (currentLanguage === 'en' || currentLanguage === 'pt')) {
        setLanguage(currentLanguage);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    
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
  useEffect(() => {
    fetchTiers();
    fetchUserData();
  }, []);



  const fetchUserData = async () => {
   
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      console.log("No token found");
      setUser(null);

      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.data.avatar)
        setUser(data.data);
      } else {
        console.log("User not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.log("Error fetching user data", error);
      setUser(null);
    } finally {

    }
  };

  const fetchTiers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/vip/tiers`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      

      if (result.success && Array.isArray(result.data)) {
        setTiers(result.data);
      } else {
        console.error('Unexpected API response format:', result);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      setError('Failed to load VIP plans');
      console.error('Error fetching tiers:', err);
    }
  };
  const handlePurchase = async (tierId: string) => {
    if (!tierId) {
      setError('Invalid tier selected');
      return;
    }
  
    try {
      setLoading(tierId);
      setError(null);
  
      const token = getCookie('token');
      
   
      if (!token) {
        throw new Error("Please login to your discord account");
      }
  
      console.log(user)

     
      const payload = {
        userId: user?.userId,
        tierId: tierId
      };
  
      console.log(payload)

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/vip/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        let errorText = await response.text();
        if (response.status === 401) errorText = "Please login to your discord account";
        throw new Error(errorText);
      }
  
      const data = await response.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not provided');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(null);
    }
  };


  const getIconForTier = (index: number) => {
    switch(index) {
      case 0: return <Star className="w-8 h-8" />;
      case 1: return <Crown className="w-8 h-8" />;
      case 2: return <Diamond className="w-8 h-8" />;
      default: return <Star className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 py-20 px-6 sm:px-12 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-20">
            <header className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="inline-flex items-center space-x-2 bg-brand-purple/10 border border-brand-purple/20 px-4 py-1.5 rounded-full">
                    <Crown className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">Ascensão Premium</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none italic uppercase">
                    {t.shopTitle}
                </h1>
                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                    {t.shopDescription}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}
            </header>

            <main className="space-y-24">
                <section className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier, index) => (
                            <PlanCard
                                key={tier.id}
                                icon={getIconForTier(index)}
                                title={tier.name}
                                price={tier.price}
                                period="mês"
                                features={tier.benefits}
                                featured={index === 1}
                                tierId={tier.id}
                                onPurchase={handlePurchase}
                                loading={loading === tier.id}
                                purchase_label={t.purchase}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    </div>
  );
};

const PlanCard = ({ 
  icon, 
  title, 
  price, 
  period, 
  features, 
  featured, 
  tierId,
  onPurchase,
  loading,
  purchase_label,
}: VipProps) => (
  <div className={`relative group bg-brand-card/40 backdrop-blur-xl rounded-[3rem] border transition-all duration-700 p-10 flex flex-col justify-between min-h-[550px] overflow-hidden ${
      featured 
      ? 'border-brand-purple/40 shadow-[0_30px_60px_rgba(127,90,240,0.15)] scale-105 z-10' 
      : 'border-white/5 hover:border-white/20'
  }`}>
    {/* Internal decorative glows */}
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 ${featured ? 'bg-brand-purple' : 'bg-gray-400'}`} />
    
    <div className="relative z-10 space-y-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110 ${
            featured 
            ? 'bg-brand-purple/20 border-brand-purple/30 text-brand-purple' 
            : 'bg-white/5 border-white/10 text-gray-500'
        }`}>
            {icon}
        </div>

        <div className="space-y-2">
            <p className="text-gray-500 text-xs font-black uppercase tracking-[.25em]">{title}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white italic">R${price.toFixed(2)}</span>
                <span className="text-gray-500 text-sm font-bold lowercase tracking-wider">/{period}</span>
            </div>
        </div>

        <ul className="space-y-4">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                    <Zap className={`w-4 h-4 flex-shrink-0 ${featured ? 'text-brand-purple' : 'text-gray-600'}`} />
                    {feature}
                </li>
            ))}
        </ul>
    </div>

    <button 
      onClick={() => onPurchase(tierId)}
      disabled={loading}
      className={`relative w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 overflow-hidden mt-8 group/btn ${
          featured 
          ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.02]' 
          : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
            <>
                <Rocket className="w-4 h-4" />
                {purchase_label}
            </>
        )}
      </span>
    </button>
  </div>
);

export default VipPage;