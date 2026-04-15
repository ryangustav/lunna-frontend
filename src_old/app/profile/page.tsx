"use client";

import React, { useState } from "react";
import { User, Languages, Save, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    aboutme: "Apenas um viajante estelar explorando o cosmos da Lunna.",
    language: "pt-BR",
    isSaving: false
  });

  const handleSave = () => {
    setProfile(p => ({ ...p, isSaving: true }));
    setTimeout(() => {
      setProfile(p => ({ ...p, isSaving: false }));
    }, 800);
  };

  return (
    <div className="min-h-screen text-gray-200 pb-24 px-6 sm:px-12 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-16">
        
        {/* Profile Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 py-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-2xl group-hover:bg-brand-purple/40 transition-all duration-700" />
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-brand-purple to-cyan-500 p-1.5 shadow-2xl">
              <img 
                src="https://cdn.discordapp.com/embed/avatars/0.png" 
                className="w-full h-full rounded-full bg-brand-dark object-cover border-4 border-brand-dark" 
                alt="Avatar"
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-brand-card rounded-full p-3 border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-brand-purple" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tight">
              Meu Perfil Visual
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Ajuste sua presença mística no cosmos da Lunna.
            </p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
          <div className="bg-brand-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-purple/5 rounded-full blur-[80px]" />
            
            <div className="space-y-10 relative">
              {/* About Me Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-bold text-white group/label">
                  <User className="w-6 h-6 mr-3 text-brand-purple group-hover/label:scale-110 transition-transform" /> 
                  Sobre Mim
                </label>
                <div className="relative">
                  <textarea 
                    maxLength={200}
                    className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-gray-300 focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple/30 outline-none resize-none transition-all text-lg leading-relaxed placeholder:text-gray-600 shadow-inner"
                    value={profile.aboutme}
                    onChange={(e) => setProfile(p => ({...p, aboutme: e.target.value}))}
                    placeholder="Conte sua história para o mundo..."
                  />
                  <div className="absolute bottom-4 right-6 text-xs font-mono text-gray-600 bg-brand-dark/50 px-2 py-1 rounded-md">
                    {profile.aboutme.length}/200
                  </div>
                </div>
              </div>

              {/* Language Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-bold text-white group/label">
                  <Languages className="w-6 h-6 mr-3 text-cyan-400 group-hover/label:scale-110 transition-transform" /> 
                  Idioma da Bot
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-gray-300 focus:ring-2 focus:ring-brand-purple/30 outline-none appearance-none cursor-pointer text-lg font-medium shadow-inner"
                    value={profile.language}
                    onChange={(e) => setProfile(p => ({...p, language: e.target.value}))}
                  >
                    <option value="pt-BR">🇧🇷 Português Brasileiro</option>
                    <option value="en-US">🇺🇸 English</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                     <Languages size={20} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 border-t border-white/5">
                <button 
                  onClick={handleSave}
                  disabled={profile.isSaving}
                  className="w-full group/btn relative flex items-center justify-center bg-brand-dark border border-brand-purple/30 hover:bg-brand-purple/10 text-white px-8 py-5 rounded-[2rem] font-black tracking-widest uppercase transition-all overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  
                  {profile.isSaving ? (
                    <span className="flex items-center relative z-10">
                      <div className="w-5 h-5 border-3 border-brand-purple border-t-transparent rounded-full animate-spin mr-3"></div> 
                      Salvando...
                    </span>
                  ) : (
                    <span className="flex items-center relative z-10">
                      <Save className="w-5 h-5 mr-3 text-brand-purple" /> 
                      Salvar Alterações
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
