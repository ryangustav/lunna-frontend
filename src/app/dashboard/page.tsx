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
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 drop-shadow-md">
            Meus Servidores
          </h1>
          <p className="text-gray-400 text-lg">Selecione um servidor para gerenciar as configurações da bot.</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                {error}
            </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-gray-800/40 rounded-xl h-44 border border-gray-700/50" />
            ))}
          </div>
        ) : (
          /* Guild Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <div key={guild.id} className="group relative overflow-hidden bg-[#1F2833] rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] flex flex-col items-center justify-center p-6 text-center">
                  
                  {/* Glowing core effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:to-cyan-500/5 transition-colors duration-500" />
                  
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-20 h-20 rounded-full shadow-lg ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all duration-300" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all duration-300">
                      <Server className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <h3 className="mt-4 text-xl font-bold text-gray-100 group-hover:text-white transition-colors truncate w-full px-4">
                    {guild.name}
                  </h3>
                  
                  <div className="mt-6 w-full">
                      {guild.isBotIn ? (
                          <Link href={`/dashboard/${guild.id}/moderation`} className="flex items-center justify-center w-full px-4 py-2 border border-purple-500/50 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all font-semibold">
                              <Settings className="w-4 h-4 mr-2" /> Configurar
                          </Link>
                      ) : (
                          <a 
                            href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white hover:from-purple-500 hover:to-cyan-500 transition-all font-bold"
                          >
                              <PlusCircle className="w-4 h-4 mr-2" /> Convidar
                          </a>
                      )}
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
