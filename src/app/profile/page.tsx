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
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center space-x-6 pb-8 border-b border-gray-800">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center p-1">
              <img src="https://cdn.discordapp.com/embed/avatars/0.png" className="w-full h-full rounded-full bg-black object-cover" alt="Avatar"/>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-2 border border-gray-800 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">Meu Perfil Visual</h1>
            <p className="text-cyan-400 font-medium">Personalize sua aparência na Lunna</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#1F2833]/40 rounded-2xl border border-gray-800/80 p-8 shadow-2xl backdrop-blur-sm space-y-8">
          
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-200 mb-3">
              <User className="w-5 h-5 mr-3 text-purple-400" /> Sobre Mim
            </label>
            <textarea 
              maxLength={200}
              className="w-full h-32 bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none resize-none transition-all"
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
              className="w-full bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer"
              value={profile.language}
              onChange={(e) => setProfile(p => ({...p, language: e.target.value}))}
            >
              <option value="pt-BR">🇧🇷 Português Brasileiro</option>
              <option value="en-US">🇺🇸 English</option>
            </select>
          </div>

           <div className="pt-6 border-t border-gray-800/50 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={profile.isSaving}
              className="flex items-center bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-lg disabled:opacity-50"
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
