"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Save } from "lucide-react";

export default function ModerationPage({ params }: { params: { guildId: string } }) {
  const { guildId } = params;
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
    return <div className="text-gray-400 animate-pulse text-xl">Carregando Defesas Ativas...</div>;
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-800 pb-6 flex items-center space-x-4">
        <div className="p-3 bg-purple-500/10 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Moderação e Anti-Raid</h1>
            <p className="text-gray-400 mt-1">Configure as defesas automatizadas para proteger seu servidor.</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Anti-Spam Section */}
        <section className="bg-gray-800/20 border border-gray-700/40 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-2xl"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-100 flex items-center">
                Anti-Spam
              </h2>
              <p className="text-sm text-gray-400 mt-1">Detecta e bloqueia rajadas rápidas de mensagens enviadas por usuários maliciosos.</p>
            </div>
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.anti_spam.enabled} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, enabled: e.target.checked}})} />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-500 shadow-inner"></div>
            </label>
          </div>

          <div className={`transition-all duration-300 ${settings.anti_spam.enabled ? 'opacity-100 max-h-40' : 'opacity-40 max-h-0 overflow-hidden'} space-y-4`}>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Mensagens Máximas por Janela</label>
                   <input type="number" min="3" max="20" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition" value={settings.anti_spam.message_threshold} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, message_threshold: Number(e.target.value)}})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Ação Automática</label>
                   <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none" value={settings.anti_spam.action} onChange={(e) => setSettings({...settings, anti_spam: {...settings.anti_spam, action: e.target.value}})}>
                      <option value="warn">Aviso DM</option>
                      <option value="mute">Mute 1 Hora</option>
                      <option value="kick">Expulsão (Kick)</option>
                      <option value="ban">Banimento Total</option>
                   </select>
                </div>
             </div>
          </div>
        </section>

        {/* Anti-Invite Section */}
         <section className="bg-gray-800/20 border border-gray-700/40 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 rounded-l-2xl"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-100">Anti-Convite</h2>
              <p className="text-sm text-gray-400 mt-1">Impede a divulgação não autorizada de convites do Discord no servidor.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={settings.anti_invite.enabled} onChange={(e) => setSettings({...settings, anti_invite: {...settings.anti_invite, enabled: e.target.checked}})} />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
            </label>
          </div>
           <div className={`transition-all duration-300 ${settings.anti_invite.enabled ? 'opacity-100 max-h-40 mt-4' : 'opacity-40 max-h-0 overflow-hidden'} space-y-4`}>
                <div className="max-w-xs">
                   <label className="block text-sm font-medium text-gray-300 mb-2">Ação Automática</label>
                   <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none" value={settings.anti_invite.action} onChange={(e) => setSettings({...settings, anti_invite: {...settings.anti_invite, action: e.target.value}})}>
                      <option value="warn">Aviso DM e Deletar Mensagem</option>
                      <option value="mute">Mute 1 Hora</option>
                      <option value="ban">Banimento Total</option>
                   </select>
                </div>
           </div>
        </section>

      </div>

      <div className="pt-6 border-t border-gray-800 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-lg disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center"><div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin mr-3"></div> Salvando...</span>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Salvar Alterações</>
          )}
        </button>
      </div>

    </div>
  );
}
