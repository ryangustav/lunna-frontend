"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Server, Settings, ShieldAlert, Cpu } from "lucide-react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fictional call. In a real integration, this fetches the user's mutually shared guilds.
    setTimeout(() => {
      setGuilds([
        { id: "1234567890", name: "Servidor Teste", icon: "https://cdn.discordapp.com/embed/avatars/0.png" },
        { id: "0987654321", name: "Comunidade Lunna", icon: "https://cdn.discordapp.com/embed/avatars/1.png" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-gray-800/40 rounded-xl h-40 border border-gray-700/50" />
            ))}
          </div>
        ) : (
          /* Guild Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <Link key={guild.id} href={`/dashboard/${guild.id}/moderation`}>
                <div className="group relative overflow-hidden bg-[#1F2833] rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                  
                  {/* Glowing core effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:to-cyan-500/5 transition-colors duration-500" />
                  
                  {guild.icon ? (
                    <img src={guild.icon} alt={guild.name} className="w-20 h-20 rounded-full shadow-lg ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all duration-300" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center ring-4 ring-gray-800 group-hover:ring-purple-500/30 transition-all duration-300">
                      <Server className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <h3 className="mt-4 text-xl font-bold text-gray-100 group-hover:text-white transition-colors">
                    {guild.name}
                  </h3>
                  
                  <div className="mt-4 flex items-center space-x-4 text-gray-500 group-hover:text-cyan-400 transition-colors">
                     <span className="flex items-center text-sm"><Settings className="w-4 h-4 mr-1" /> Configurar</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
