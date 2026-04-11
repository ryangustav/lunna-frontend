'use client';

import { useEffect, useState } from 'react';
import { Coins, Brain, Dices, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
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
    title: "The Ultimate Edge for your Server",
    description: "Enhance your Discord community with Lunna. A powerful, multipurpose bot blending intelligent moderation, rich economy, and dynamic RPG features into a seamless premium experience.",
    addToDiscord: "Invoke Lunna",
    vote: "Support the Project",
    keyFeatures: "Core Systems",
    economy: {
      title: "Galactic Economy",
      description: "A meticulously balanced economy system. Trade, earn, and build your wealth across the cosmos with an engaging market structure."
    },
    ai: {
      title: "Neural Intelligence",
      description: "Advanced AI capabilities at your fingertips. From natural conversations to smart moderation, Lunna learns and adapts to your server."
    },
    casino: {
      title: "High-Stakes Casino",
      description: "Bet your coins in thrilling casino games. Challenge friends, beat the house, and climb the leaderboards in style."
    }
  },
  pt: {
    title: "A Vantagem Definitiva para seu Servidor",
    description: "Eleve sua comunidade do Discord com a Lunna. Um bot multifuncional poderoso que une moderação inteligente, economia rica e sistemas de RPG dinâmicos em uma experiência premium.",
    addToDiscord: "Invocar Lunna",
    vote: "Apoiar o Projeto",
    keyFeatures: "Sistemas Principais",
    economy: {
      title: "Economia Galáctica",
      description: "Um sistema econômico meticulosamente balanceado. Negocie, ganhe e construa sua riqueza pelo cosmos com um mercado envolvente."
    },
    ai: {
      title: "Inteligência Neural",
      description: "Recursos avançados de IA ao seu alcance. De conversas naturais a moderação inteligente, a Lunna aprende e se adapta ao seu servidor."
    },
    casino: {
      title: "Cassino High-Stakes",
      description: "Aposte suas moedas em jogos emocionantes. Desafie amigos, vença a casa e suba nos placares de líderes com muito estilo."
    }
  }
};

export default function Home() {
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

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] bg-brand-dark text-gray-200 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-purple/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-20 pb-32">
            
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center space-y-10 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                <div className="inline-flex items-center space-x-2 bg-brand-purple/10 border border-brand-purple/20 px-4 py-1.5 rounded-full">
                    <Zap className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">Next Generation Discord Bot</span>
                </div>

                <div className="space-y-6 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
                        {t.title.split(' ').map((word, i) => (
                           <span key={i} className={i % 3 === 0 ? "text-brand-purple" : ""}>{word} </span>
                        ))}
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
                        {t.description}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
                    <a 
                        href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&scope=bot&permissions=1099511627775"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center px-10 py-5 bg-gradient-to-r from-brand-purple to-cyan-600 rounded-[2rem] text-white shadow-xl shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:brightness-110 active:scale-[0.98] transition-all font-black text-sm tracking-widest uppercase overflow-hidden w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">{t.addToDiscord}</span>
                        <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </a>
                    
                    <a 
                        href="https://top.gg/bot/1222333304028659792"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center px-10 py-5 bg-brand-card/50 border border-white/10 rounded-[2rem] text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all font-black text-sm tracking-widest uppercase w-full sm:w-auto"
                    >
                        {t.vote}
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section className="pt-24 space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black text-white">{t.keyFeatures}</h2>
                    <div className="h-1 w-24 bg-brand-purple rounded-full mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Economy Card */}
                    <div className="group relative bg-brand-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 hover:border-brand-purple/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-colors" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Coins className="w-8 h-8 text-amber-400" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{t.economy.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{t.economy.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Card */}
                    <div className="group relative bg-brand-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden transform md:-translate-y-8">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-500/10 rounded-full blur-[50px] group-hover:bg-cyan-500/20 transition-colors" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Brain className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{t.ai.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{t.ai.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Casino Card */}
                    <div className="group relative bg-brand-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/5 border border-purple-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Dices className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{t.casino.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{t.casino.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );
}