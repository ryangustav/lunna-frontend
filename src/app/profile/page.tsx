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
    <div className="min-h-screen bg-brand-dark text-gray-200 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center space-x-6 pb-8 border-b border-white/5">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-purple to-cyan-500 flex items-center justify-center p-1">
              <img src="https://cdn.discordapp.com/embed/avatars/0.png" className="w-full h-full rounded-full bg-black object-cover" alt="Avatar"/>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-dark rounded-full p-2 border border-white/10 shadow-lg shadow-brand-purple/20">
              <Sparkles className="w-5 h-5 text-brand-purple" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">Meu Perfil Visual</h1>
            <p className="text-gray-400 font-medium pt-1">Personalize sua aparência na Lunna</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-brand-card/40 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-sm space-y-8">
          
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-200 mb-3">
              <User className="w-5 h-5 mr-3 text-brand-purple" /> Sobre Mim
            </label>
            <textarea 
              maxLength={200}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-300 focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50 outline-none resize-none transition-all"
              value={profile.aboutme}
              onChange={(e) => setProfile(p => ({...p, aboutme: e.target.value}))}
              placeholder="Escreva algo sobre você que aparecerá no comando /profile..."
            />
            <div className="text-right text-xs text-gray-500 mt-2">{profile.aboutme.length}/200 caracteres</div>
          </div>

          <div>
             <label className="flex items-center text-lg font-semibold text-gray-200 mb-3">
              <Languages className="w-5 h-5 mr-3 text-cyan-400" /> Idioma da Bot
            </label>
            <select 
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-300 focus:ring-2 focus:ring-brand-purple/50 outline-none appearance-none cursor-pointer"
              value={profile.language}
              onChange={(e) => setProfile(p => ({...p, language: e.target.value}))}
            >
              <option value="pt-BR">🇧🇷 Português Brasileiro</option>
              <option value="en-US">🇺🇸 English</option>
            </select>
          </div>

           <div className="pt-6 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={profile.isSaving}
              className="flex items-center bg-brand-purple hover:bg-brand-purple/90 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-brand-purple/20 active:scale-95 transition-all text-lg disabled:opacity-50"
            >
              {profile.isSaving ? (
                <span className="flex items-center"><div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin mr-3"></div> Salvando...</span>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Salvar Perfil</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
