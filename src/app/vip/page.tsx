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
  accentColor: string;
  tierId: string;
  onPurchase: (tierId: string, price: number) => Promise<void>;
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
      const response = await fetch("https://lunna-api.discloud.app/auth/me", {
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
      const response = await fetch('https://lunna-api.discloud.app/vip/tiers', {
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

      const response = await fetch('https://lunna-api.discloud.app/vip/purchase', {
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
    <div className="shop-container">
      <div className="shop-content">
        <header className="shop-header">
          <h1 className="text-4xl md:text-5xl font-bold text-[#fffffe] mb-4">
            {t.shopTitle}
          </h1>
          <p className="text-[#94a1b2] text-lg max-w-2xl mx-auto">
            {t.shopDescription}
          </p>
          {error && (
            <div className="text-red-500 mt-4 text-center bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
        </header>

        <main className="shop-sections">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-[#fffffe] mb-8 text-center">
            VIP Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <PlanCard
                  key={tier.id}
                  icon={getIconForTier(index)}
                  title={tier.name}
                  price={tier.price}
                  period="month"
                  features={tier.benefits}
                  featured={index === 1}
                  accentColor={index === 1 ? "#2cb67d" : "#7f5af0"}
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
  <div className={`card ${featured ? 'featured' : ''}`}>
    <div className="card-icon">{icon}</div>
    <p className='price'>{title}</p>
    <h3>R${price.toFixed(2)} <span>/{period}</span></h3>     
    <ul>
      {features.map((feature, index) => (
        <li key={index}><Zap className="w-4 h-4" />{feature}</li>
      ))}
    </ul>
    <button 
      onClick={() => {
        console.log('Clicou no botão de compra:', { tierId, price });
        onPurchase(tierId, price);
      }}
      disabled={loading}
      className={`purchase-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        'Processing...'
      ) : (
        <>
          <Rocket className="w-5 h-5" />
          {purchase_label}
        </>
      )}
    </button>
  </div>
);

export default VipPage;