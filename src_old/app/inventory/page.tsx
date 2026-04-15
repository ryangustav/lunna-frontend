"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Backpack, Shield, Sword, FlaskConical, CircleDot, Info } from "lucide-react";
import { getCookie } from 'cookies-next';


// Categorias de itens
type Category = "Todos" | "Equipamentos" | "Consumíveis" | "Acessórios";

// Tipos de raridade para validação
type Rarity = "Comum" | "Raro" | "Épico" | "Lendário";


const rarityStyles = {
  Lendário: "ring-2 ring-yellow-400/50 shadow-[0_0_20px_-5px_rgba(250,204,21,0.4)] border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent",
  Épico: "ring-2 ring-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent",
  Raro: "ring-1 ring-blue-500/50 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent",
  Comum: "ring-1 ring-gray-600/50 border-gray-700/50 bg-[#1F2833]/40",
};

const rarityText = {
  Lendário: "text-yellow-400",
  Épico: "text-purple-400",
  Raro: "text-blue-400",
  Comum: "text-gray-400",
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Category>("Todos");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      if (!token) throw new Error("Acesse sua conta para ver seu inventário.");

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/rpg/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Falha ao comunicar com o servidor.");

      const result = await response.json();
      if (result.success) {
        setInventory(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (userItemId: string) => {
    try {
        const token = getCookie('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}/rpg/equip/${userItemId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.ok) {
            setInventory(prev => prev.map(inv => 
                inv.id === userItemId ? { ...inv, equipped: !inv.equipped } : inv
            ));
            if (selectedItem?.id === userItemId) {
                setSelectedItem((prev: any) => ({ ...prev, equipped: !prev.equipped }));
            }
        }
    } catch (err) {
        console.error("Erro ao equipar:", err);
    }
  };

  const filteredItems = inventory.filter(inv => 
    activeTab === "Todos" || inv.item.category === activeTab
  );


  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 py-12 px-6 sm:px-12 font-sans relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-3">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-purple/20 rounded-2xl border border-brand-purple/20">
                        <Backpack className="w-8 h-8 text-brand-purple" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white italic capitalize">Teu Arsenal</h1>
                </div>
                <p className="text-gray-400 font-medium text-lg">Gerencie seus artefatos e equipamentos coletados em suas jornadas.</p>
            </div>

            {/* Premium Tabs */}
            <div className="flex p-1.5 bg-brand-card/30 backdrop-blur-xl rounded-[1.5rem] border border-white/5 w-fit">
                {(["Todos", "Equipamentos", "Consumíveis", "Acessórios"] as Category[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-2xl transition-all text-sm font-bold uppercase tracking-wider ${
                            activeTab === tab 
                            ? "bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-xl shadow-brand-purple/20" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Item Grid Area */}
            <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-left-4 duration-1000">
                    {filteredItems.map(inv => (
                        <button
                            key={inv.id}
                            onClick={() => setSelectedItem(inv)}
                            className={`relative aspect-square rounded-[2rem] p-6 transition-all duration-500 hover:scale-105 flex items-center justify-center border group overflow-hidden bg-brand-card/20 backdrop-blur-sm ${
                                selectedItem?.id === inv.id 
                                ? "ring-2 ring-brand-purple border-brand-purple shadow-[0_0_30px_rgba(127,90,240,0.2)]" 
                                : rarityStyles[inv.item.rarity as Rarity]
                            }`}
                        >
                            {/* Rare Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <img 
                                src={inv.item.icon} 
                                alt={inv.item.name}
                                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] group-hover:rotate-3 transition-transform duration-500"
                            />
                            
                            {inv.equipped && (
                                <div className="absolute top-3 right-3 bg-brand-purple text-white p-1 rounded-lg border border-white/20 shadow-lg">
                                    <Shield size={12} className="fill-current" />
                                </div>
                            )}
                        </button>
                    ))}
                    
                    {/* Placeholder Slots */}
                    {Array.from({ length: Math.max(0, 12 - filteredItems.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded-[2rem] bg-white/[0.02] border border-white/[0.03] flex items-center justify-center opacity-20">
                            <CircleDot className="w-6 h-6 text-gray-800" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-4 self-start sticky top-24">
                {selectedItem ? (
                    <div className="bg-brand-card/40 backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-10 space-y-10 animate-in fade-in zoom-in-95 duration-500 shadow-2xl overflow-hidden relative">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-purple/10 rounded-full blur-[60px]" />
                        
                        <div className="relative aspect-square w-full bg-black/20 rounded-[2.5rem] p-10 border border-white/5 shadow-inner flex items-center justify-center">
                             <img 
                                src={selectedItem.item.icon} 
                                alt={selectedItem.item.name}
                                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            />
                        </div>

                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${rarityStyles[selectedItem.item.rarity as Rarity]} bg-transparent`}>
                                    {selectedItem.item.rarity}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                                {selectedItem.item.name}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                                {selectedItem.item.category}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-400 leading-relaxed text-sm italic text-center px-4">
                                "{selectedItem.item.description}"
                            </p>
                        </div>

                        {selectedItem.item.stats && (
                             <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedItem.item.stats).map(([key, value]: [string, any]) => (
                                    <div key={key} className="bg-white/5 p-4 rounded-3xl flex flex-col items-center justify-center border border-white/5 transition-colors hover:bg-white/10">
                                        <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">
                                            {key}
                                        </span>
                                        <span className="text-xl font-black text-brand-purple italic">
                                            +{value}
                                        </span>
                                    </div>
                                ))}
                             </div>
                        )}

                        <button 
                            onClick={() => handleEquip(selectedItem.id)}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all relative group overflow-hidden ${
                                selectedItem.equipped 
                                ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20" 
                                : "bg-gradient-to-r from-brand-purple to-cyan-600 text-white hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                        >
                            <span className="relative z-10">{selectedItem.equipped ? "Remover Equipamento" : "Equipar Artefato"}</span>
                            {!selectedItem.equipped && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>

                    </div>

                ) : (
                    <div className="h-[600px] bg-brand-card/10 backdrop-blur-sm border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-40">
                        <div className="p-6 bg-white/5 rounded-full">
                            <Backpack size={48} className="text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-medium max-w-[200px]">Invoque a informação selecionando um item do seu arsenal.</p>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>

  );
}
