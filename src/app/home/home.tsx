'use client';

import { useEffect, useState } from 'react';
import { Coins, Brain, Dices } from 'lucide-react';
import ButtonLink from '@/src/components/ButtonLink';
import FeatureCard from '@/src/components/FeaturedCard';
import '@/src/styles/globals.css';

interface Translation {
  title: string;
  description: string;
  addToDiscord: string;
  vote: string;
  keyFeatures: string;
  economy: {
    title: string;
    description: string;
  };
  ai: {
    title: string;
    description: string;
  };
  casino: {
    title: string;
    description: string;
  };
}

const translations: Record<string, Translation> = {
  en: {
    title: "Lunna Bot",
    description: "Enhance your Discord server with powerful multipurpose bot.",
    addToDiscord: "Add to Discord",
    vote: "Vote",
    keyFeatures: "Key Features",
    economy: {
      title: "Economy",
      description: "Rich and easy to play economy."
    },
    ai: {
      title: "Artificial intelligence",
      description: "Fast and easy to use artificial intelligence"
    },
    casino: {
      title: "Casino",
      description: "Multiple commands to create a super easy to play casino with the ability to play against your friends."
    }
  },
  pt: {
    title: "Lunna Bot",
    description: "Melhore seu servidor do Discord com um bot multifuncional poderoso.",
    addToDiscord: "Adicionar ao Discord",
    vote: "Votar",
    keyFeatures: "Principais Recursos",
    economy: {
      title: "Economia",
      description: "Sistema de economia rico e fácil de jogar."
    },
    ai: {
      title: "Inteligência artificial",
      description: "Inteligência artificial rápida e fácil de usar"
    },
    casino: {
      title: "Cassino",
      description: "Múltiplos comandos para criar um cassino super fácil de jogar com a capacidade de jogar contra seus amigos."
    }
  }
};

export default function Home() {
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
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">{t.title}</h1>
          <p className="hero-description">
            {t.description}
          </p>
          <div className="button-group">
            <ButtonLink 
              href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&scope=bot&permissions=1099511627775"
            >
              {t.addToDiscord}
            </ButtonLink>
            <ButtonLink 
              href="https://top.gg/bot/1222333304028659792"
            >
              {t.vote}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="features-title">{t.keyFeatures}</h2>
          <div className="features-grid">
            <FeatureCard
              icon={<Coins size={32} />}
              title={t.economy.title}
              description={t.economy.description}
            />
            <FeatureCard
              icon={<Brain size={32} />}
              title={t.ai.title}
              description={t.ai.description}
            />
            <FeatureCard
              icon={<Dices size={32} />}
              title={t.casino.title}
              description={t.casino.description}
            />
          </div>
        </div>
      </section>
    </main>
  );
}