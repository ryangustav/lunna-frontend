"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Settings, LayoutDashboard } from "lucide-react";

export default function GuildDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { guildId: string };
}) {
  const pathname = usePathname();
  const { guildId } = params;

  const links = [
    { name: "Overview", href: `/dashboard/${guildId}`, icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: "Moderação e Anti-Raid", href: `/dashboard/${guildId}/moderation`, icon: <ShieldAlert className="w-5 h-5 mr-3" /> },
    { name: "Preferências Locais", href: `/dashboard/${guildId}/settings`, icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0C10] text-gray-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1F2833]/50 border-r border-gray-800 backdrop-blur-xl hidden md:block">
        <div className="p-6">
          <Link href="/dashboard" className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center mb-8">
            &larr; Voltar aos Servidores
          </Link>
          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" 
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/20 rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
           {children}
        </div>
      </main>
      
    </div>
  );
}
