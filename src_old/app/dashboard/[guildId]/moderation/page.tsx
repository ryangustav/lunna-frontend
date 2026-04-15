"use client";

import React, { useState, useEffect, use } from "react";
import { ShieldAlert, Save, Activity, Link as LinkIcon } from "lucide-react";

export default function ModerationPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    anti_spam: { enabled: false, message_threshold: 5, action: "warn" },
    anti_invite: { enabled: false, action: "warn" },
    anti_link: { enabled: false, action: "warn" },
    quarantine_role: ""
  });

  useEffect(() => {
    // Fictional fetch replacing actual backend call for layout
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [guildId]);

  const handleSave = async () => {
    setSaving(true);
    // In actual implementation: await fetch(`/api/guilds/${guildId}/settings`, { method: "PATCH", body: JSON.stringify(settings) })
    setTimeout(() => {
      setSaving(false);
    }, 600);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse font-medium">Analisando defesas ativas do reino...</p>
        </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-brand-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px]" />
        
        <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-gradient-to-br from-brand-purple/20 to-purple-600/5 rounded-3xl border border-brand-purple/20 shadow-inner">
                <ShieldAlert className="w-10 h-10 text-brand-purple" />
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Defesas Místicas</h1>
                <p className="text-gray-400 mt-2 font-medium">Configure os automatismos de proteção do seu ecossistema.</p>
            </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto relative group flex items-center justify-center bg-brand-dark border border-brand-purple/30 hover:bg-brand-purple/10 text-white px-8 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden disabled:opacity-50 z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {saving ? (
            <span className="flex items-center relative z-10">
              <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mr-3"></div> Salvando
            </span>
          ) : (
            <span className="flex items-center relative z-10">
              <Save className="w-4 h-4 mr-3 text-brand-purple" /> Salvar
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Anti-Spam Card */}
        <section className={`transition-all duration-500 bg-brand-card/30 backdrop-blur-md rounded-[2.5rem] border ${settings.anti_spam.enabled ? 'border-brand-purple/30 shadow-[0_0_40px_rgba(127,90,240,0.1)]' : 'border-white/5'} p-8 relative overflow-hidden group`}>
          {settings.anti_spam.enabled && <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-[50px]" />}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-4">
               <div className={`mt-1 p-2 rounded-xl transition-colors ${settings.anti_spam.enabled ? 'bg-brand-purple/20 text-brand-purple' : 'bg-white/5 text-gray-500'}`}>
                  <Activity className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Escudo Anti-Spam</h2>
                  <p className="text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">Bloqueia conjurações muito rápidas (flood). Se um usuário enviar muitas mensagens em sequência, a Lunna intervirá.</p>
               </div>
            </div>
            
            {/* Elegant Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={settings.anti_spam.enabled} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, enabled: e.target.checked}})} />
              <div className="w-14 h-8 bg-black/40 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-purple peer-checked:border-brand-purple peer-checked:after:bg-white shadow-inner"></div>
            </label>
          </div>

          <div className={`transition-all duration-500 ease-in-out ${settings.anti_spam.enabled ? 'opacity-100 max-h-[500px] mt-8 pt-8 border-t border-white/5' : 'opacity-0 max-h-0 overflow-hidden'}`}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3">
                   <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">Limite de Mensagens</label>
                   <div className="relative">
                      <input type="number" min="3" max="20" className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-purple/50 outline-none transition font-medium" value={settings.anti_spam.message_threshold} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, message_threshold: Number(e.target.value)}})} />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/ 5s</span>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">Punição Automática</label>
                   <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-brand-purple/50 outline-none appearance-none cursor-pointer font-medium" value={settings.anti_spam.action} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, action: e.target.value}})}>
                      <option value="warn">Aviso Simples</option>
                      <option value="mute">Silenciar (1 Hora)</option>
                      <option value="kick">Expulsar do Servidor</option>
                      <option value="ban" className="text-red-400">Banimento Definitivo</option>
                   </select>
                </div>
             </div>
          </div>
        </section>

        {/* Anti-Invite Card */}
         <section className={`transition-all duration-500 bg-brand-card/30 backdrop-blur-md rounded-[2.5rem] border ${settings.anti_invite.enabled ? 'border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-white/5'} p-8 relative overflow-hidden group`}>
          {settings.anti_invite.enabled && <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-[50px]" />}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-4">
               <div className={`mt-1 p-2 rounded-xl transition-colors ${settings.anti_invite.enabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                  <LinkIcon className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Filtro de Convites</h2>
                  <p className="text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">Impede que usuários tentem atrair outras pessoas para reinos rivais enviando links do Discord.</p>
               </div>
            </div>
            
            {/* Elegant Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={settings.anti_invite.enabled} onChange={(e) => setSettings({...settings, anti_invite: {...settings.anti_invite, enabled: e.target.checked}})} />
              <div className="w-14 h-8 bg-black/40 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 peer-checked:border-cyan-500 peer-checked:after:bg-white shadow-inner"></div>
            </label>
          </div>

          <div className={`transition-all duration-500 ease-in-out ${settings.anti_invite.enabled ? 'opacity-100 max-h-[500px] mt-8 pt-8 border-t border-white/5' : 'opacity-0 max-h-0 overflow-hidden'}`}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                 <div className="space-y-3">
                   <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">Ação ao Interceptar</label>
                   <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer font-medium" value={settings.anti_invite.action} onChange={(e) => setSettings({...settings, anti_invite: {...settings.anti_invite, action: e.target.value}})}>
                      <option value="warn">Deletar e Avisar</option>
                      <option value="mute">Silenciar Imediatamente</option>
                      <option value="ban" className="text-red-400">Banimento Automático</option>
                   </select>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
