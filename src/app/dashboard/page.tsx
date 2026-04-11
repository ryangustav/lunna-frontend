"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Server, Settings, PlusCircle } from "lucide-react";
import { getCookie } from 'cookies-next';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  isBotIn: boolean;
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      
      if (!token) {
        window.location.href = '/'; // Redirecionar se não houver token
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/guilds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar servidores');
      }

      const result = await response.json();
      if (result.success) {
        setGuilds(result.data);
      }
    } catch (err) {
      console.error('Erro ao buscar servidores:', err);
      setError('Não foi possível carregar seus servidores. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.24))] text-gray-200 pb-24 px-6 sm:px-12 relative overflow-hidden">
      
      {/* Absolute Background Elements for "Wow" Factor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="space-y-4 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center space-x-2 bg-brand-purple/10 border border-brand-purple/20 px-4 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">Painel de Comando</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tight leading-none">
            Seus Reinos <span className="text-brand-purple group-hover:animate-pulse">Místicos</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">
            Selecione um servidor para gerenciar as forças da Lunna e configurar as proteções ancestrais do seu reino.
          </p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-[2rem] flex items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-semibold text-lg">{error}</span>
            </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-brand-card/20 rounded-[3rem] h-[350px] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Guild Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {guilds.map((guild, index) => (
              <div 
                key={guild.id} 
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative bg-brand-card/30 backdrop-blur-xl rounded-[3rem] border border-white/5 hover:border-brand-purple/40 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(127,90,240,0.2)] p-10 flex flex-col items-center justify-between min-h-[380px] overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              >
                  {/* Internal Glows */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-purple/10 rounded-full blur-[60px] group-hover:bg-brand-purple/30 transition-all duration-700" />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-700" />
                  
                  <div className="relative flex flex-col items-center w-full space-y-6">
                    {guild.icon ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-brand-purple/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-brand-purple to-cyan-500 group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                            <img src={guild.icon} alt={guild.name} className="w-28 h-28 rounded-full border-4 border-brand-dark object-cover" />
                          </div>
                        </div>
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-brand-dark/80 flex items-center justify-center border-4 border-white/5 group-hover:border-brand-purple/30 transition-all duration-500 shadow-inner">
                          <Server className="w-12 h-12 text-gray-700 group-hover:text-brand-purple transition-colors duration-500" />
                        </div>
                    )}
                    
                    <h3 className="text-2xl font-black text-white group-hover:text-brand-purple transition-colors text-center line-clamp-2 px-2 tracking-tight">
                        {guild.name}
                    </h3>
                  </div>
                  
                  <div className="w-full relative pt-8">
                      {guild.isBotIn ? (
                          <Link 
                            href={`/dashboard/${guild.id}/moderation`} 
                            className="flex items-center justify-center w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-gray-300 hover:bg-brand-purple hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-brand-purple/40 transition-all duration-500 font-black text-xs tracking-widest uppercase group-hover:scale-[1.05]"
                          >
                               <Settings className="w-4 h-4 mr-3" /> Abrir Painel
                          </Link>
                      ) : (
                          <a 
                            href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-8 py-5 bg-gradient-to-r from-brand-purple to-cyan-600 rounded-[2rem] text-white shadow-xl shadow-brand-purple/20 hover:shadow-brand-purple/50 hover:brightness-110 active:scale-[0.95] transition-all duration-500 font-black text-xs tracking-widest uppercase"
                          >
                               <PlusCircle className="w-4 h-4 mr-3" /> Invocar Lunna
                          </a>
                      )}
                  </div>
              </div>
            ))}

            {/* Empty State / Add New */}
            <div className="group border-2 border-dashed border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-30 hover:opacity-100 hover:border-brand-purple/30 transition-all duration-700 cursor-pointer min-h-[380px] bg-brand-card/10 hover:bg-brand-card/20 hover:scale-[1.02]">
                <PlusCircle className="w-16 h-16 text-gray-700 group-hover:text-brand-purple transition-all duration-700 group-hover:rotate-90" />
                <div className="space-y-1">
                  <p className="text-white font-black text-xl tracking-tight">Novo Reino?</p>
                  <p className="text-gray-500 font-medium text-sm px-4">Não encontrou sua guilda?<br/>Tente atualizar sua sessão.</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
