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
    <div className="min-h-screen bg-brand-dark text-gray-200 py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Meus Servidores
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl">
            Selecione seu reino para gerenciar as forças da Lunna e configurar as proteções místicas do servidor.
          </p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
            </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="bg-brand-card/20 rounded-3xl h-64 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Guild Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {guilds.map((guild) => (
              <div 
                key={guild.id} 
                className="group relative bg-brand-card/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 hover:border-brand-purple/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(127,90,240,0.15)] p-8 flex flex-col items-center justify-between min-h-[320px] overflow-hidden"
              >
                  {/* Decorative Background Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-purple/10 rounded-full blur-[80px] group-hover:bg-brand-purple/20 transition-all duration-700" />
                  
                  <div className="relative flex flex-col items-center w-full">
                    {guild.icon ? (
                        <div className="p-1 rounded-full bg-gradient-to-tr from-white/10 to-transparent group-hover:from-brand-purple/40 transition-all duration-500">
                          <img src={guild.icon} alt={guild.name} className="w-24 h-24 rounded-full border-4 border-brand-dark object-cover shadow-2xl" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-black/40 flex items-center justify-center border-4 border-white/5 group-hover:border-brand-purple/20 transition-all duration-500">
                          <Server className="w-10 h-10 text-gray-600 group-hover:text-brand-purple transition-colors" />
                        </div>
                    )}
                    
                    <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-white transition-colors text-center line-clamp-2 px-2">
                        {guild.name}
                    </h3>
                  </div>
                  
                  <div className="w-full pt-6 relative">
                      {guild.isBotIn ? (
                          <Link 
                            href={`/dashboard/${guild.id}/moderation`} 
                            className="flex items-center justify-center w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 hover:bg-brand-purple/10 hover:text-white hover:border-brand-purple/30 transition-all font-bold text-sm tracking-wide uppercase group-hover:scale-[1.02]"
                          >
                               <Settings className="w-4 h-4 mr-2 text-brand-purple" /> Painel de Controle
                          </Link>
                      ) : (
                          <a 
                            href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-brand-purple to-cyan-600 rounded-2xl text-white shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/30 hover:brightness-110 active:scale-[0.98] transition-all font-bold text-sm tracking-wide uppercase"
                          >
                               <PlusCircle className="w-4 h-4 mr-2" /> Ativar Lunna
                          </a>
                      )}
                  </div>
              </div>
            ))}

            {/* Empty State / Add New */}
            <div className="group border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-40 hover:opacity-100 hover:border-brand-purple/20 transition-all duration-500 cursor-pointer min-h-[320px]">
                <PlusCircle className="w-12 h-12 text-gray-600 group-hover:text-brand-purple transition-colors" />
                <p className="text-gray-500 font-medium">Não achou seu servidor?<br/>Tente atualizar a lista.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
