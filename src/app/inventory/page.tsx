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
    <div className="min-h-screen bg-brand-dark text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <Backpack className="w-8 h-8 text-brand-purple" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Inventário</h1>
                </div>
                <p className="text-gray-400">Gerencie seus equipamentos e itens mágicos coletados no RPG.</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                {(["Todos", "Equipamentos", "Consumíveis", "Acessórios"] as Category[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                            activeTab === tab 
                            ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Grid de Itens */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map(inv => (
                        <button
                            key={inv.id}
                            onClick={() => setSelectedItem(inv)}
                            className={`relative aspect-square rounded-2xl p-4 transition-all duration-300 hover:scale-105 flex items-center justify-center border group overflow-hidden ${
                                selectedItem?.id === inv.id ? "ring-2 ring-brand-purple border-brand-purple animate-pulse" : rarityStyles[inv.item.rarity as Rarity]
                            }`}
                        >
                            <img 
                                src={inv.item.icon} 
                                alt={inv.item.name}
                                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] max-h-32"
                            />
                            
                            {/* Rarity Label (Mobile) */}
                            <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                {inv.item.rarity}
                            </span>
                        </button>
                    ))}
                    
                    {/* Placeholder Slots */}
                    {Array.from({ length: 12 - filteredItems.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-brand-card/20 border border-white/5 flex items-center justify-center opacity-30">
                            <CircleDot className="w-6 h-6 text-gray-700" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar de Detalhes */}
            <div className="lg:col-span-4 self-start sticky top-24">
                {selectedItem ? (
                    <div className="bg-brand-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-right-4">
                        
                        <div className="relative aspect-square w-48 mx-auto bg-white/5 rounded-3xl p-6 border border-white/5 shadow-2xl">
                             <img 
                                src={selectedItem.item.icon} 
                                alt={selectedItem.item.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${rarityText[selectedItem.item.rarity as Rarity]}`}>
                                {selectedItem.item.rarity}
                            </span>
                            <h2 className="text-2xl font-bold text-white leading-tight">
                                {selectedItem.item.name}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 bg-white/5 py-1 px-3 rounded-full w-fit mx-auto">
                                {selectedItem.item.category === "Equipamentos" && <Sword size={14} />}
                                {selectedItem.item.category === "Consumíveis" && <FlaskConical size={14} />}
                                {selectedItem.item.category === "Acessórios" && <Shield size={14} />}
                                {selectedItem.item.category}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                                <span className="text-brand-purple"><Info size={16} /></span>
                                <span>Descrição</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-sm italic">
                                "{selectedItem.item.description}"
                            </p>
                        </div>

                        {selectedItem.item.stats && (
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(selectedItem.item.stats).map(([key, value]: [string, any]) => (
                                        <div key={key} className="bg-white/5 p-3 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                                {key}
                                            </span>
                                            <span className="text-lg font-bold text-brand-purple">
                                                +{value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}

                        <button 
                            onClick={() => handleEquip(selectedItem.id)}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${
                                selectedItem.equipped 
                                ? "bg-red-500/20 border border-red-500/50 hover:bg-red-500/30" 
                                : "bg-gradient-to-r from-brand-purple to-cyan-600 hover:shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                        >
                            {selectedItem.equipped ? "Desequipar Item" : "Equipar Item"}
                        </button>

                    </div>

                ) : (
                    <div className="h-[500px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                        <Backpack size={48} className="text-gray-700" />
                        <p className="text-gray-500">Selecione um item para ver detalhes e estatísticas.</p>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
}
