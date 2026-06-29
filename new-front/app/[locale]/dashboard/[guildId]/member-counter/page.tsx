"use client"

import React, { use, useEffect, useState } from "react"
import { Users, Save, AlertTriangle, ChevronLeft, Check, Lock, Edit2, Crown } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: number
}

interface CounterConfig {
  enabled: boolean
  topic: string
  theme: string
  zero_padding: number
}

export default function MemberCounterPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Lists
  const [channels, setChannels] = useState<Channel[]>([])
  const [premiumType, setPremiumType] = useState<string>("free")
  const [memberCounters, setMemberCounters] = useState<Record<string, CounterConfig>>({})

  // Active channel edit context
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  // Fetch all required data on load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [settingsRes, channelsRes] = await Promise.all([
          api.getGuildSettings(guildId),
          api.getGuildChannels(guildId)
        ])

        if (settingsRes) {
          setPremiumType(settingsRes.premium_type || "free")
          setMemberCounters(settingsRes.member_counters || {})
        }

        if (channelsRes.success) {
          setChannels(channelsRes.data)
        }
      } catch (err: any) {
        console.error("Failed to load settings data:", err)
        setError(err.message || "Não foi possível carregar as configurações do servidor.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [guildId])

  // Count active counters
  const activeCount = Object.values(memberCounters).filter(c => c && c.enabled).length

  // Limits based on premium tier
  let limit = 3
  if (premiumType === "basico") limit = 10
  if (premiumType === "completo") limit = Infinity

  const limitReached = activeCount >= limit

  // Handler for channel row toggle/edit
  const getOrCreateCounterConfig = (chId: string): CounterConfig => {
    return memberCounters[chId] || {
      enabled: false,
      topic: "Tópico do canal: {counter} membros!",
      theme: "default",
      zero_padding: 5
    }
  }

  const updateCounterConfig = (chId: string, updates: Partial<CounterConfig>) => {
    const current = getOrCreateCounterConfig(chId)
    const updated = { ...current, ...updates }
    
    // Check if enabling exceeds limits
    if (updates.enabled === true && !current.enabled && limitReached) {
      toast({
        title: "Limite Excedido",
        description: `Seu servidor (Plano: ${premiumType.toUpperCase()}) atingiu o limite de ${limit} contadores ativos. Faça upgrade!`,
        variant: "destructive"
      })
      return
    }

    setMemberCounters(prev => ({
      ...prev,
      [chId]: updated
    }))
  }

  // Save changes
  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateGuildSettings(guildId, {
        member_counters: memberCounters
      })
      toast({
        title: "Configurações salvas!",
        description: "Contadores de membros atualizados com sucesso.",
      })
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Previews mapping
  const formatNumberTheme = (num: number, padding: number, theme: string) => {
    let str = String(num).padStart(padding, "0")
    if (theme === "emoji") {
      const emojiMap: Record<string, string> = {
        "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
        "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣"
      }
      return str.split("").map(c => emojiMap[c] || c).join("")
    }
    if (theme === "circle") {
      const circleMap: Record<string, string> = {
        "0": "⓪", "1": "①", "2": "②", "3": "③", "4": "④",
        "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨"
      }
      return str.split("").map(c => circleMap[c] || c).join("")
    }
    if (theme === "gothic") {
      const gothicMap: Record<string, string> = {
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒",
        "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
      }
      return str.split("").map(c => gothicMap[c] || c).join("")
    }
    return str
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-64 w-full rounded-3xl bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Falha de Conexão</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  // Active channel context
  const activeChannel = channels.find(c => c.id === activeChannelId)
  const activeConfig = activeChannelId ? getOrCreateCounterConfig(activeChannelId) : null

  if (activeChannel && activeConfig) {
    // RENDER DETAILED CHANNEL EDIT VIEW (IMAGE 3)
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
        <button
          onClick={() => setActiveChannelId(null)}
          className="group flex items-center text-xs font-black tracking-wider uppercase text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar para a lista de canais
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span className="text-violet-500">#</span> {activeChannel.name}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Personalize o contador de membros específico para este canal.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-8 space-y-6">
          {/* Toggle Counter */}
          <div className="flex justify-between items-center pb-4 border-b border-border/40">
            <div className="space-y-1 pr-4">
              <h3 className="text-sm font-bold text-foreground">Ativar contador de membros</h3>
              <p className="text-xs text-muted-foreground">Após ativar, utilize <code>{"{counter}"}</code> no texto do seu tópico para ativar o contador!</p>
            </div>
            <input
              type="checkbox"
              checked={activeConfig.enabled}
              onChange={(e) => updateCounterConfig(activeChannel.id, { enabled: e.target.checked })}
              className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-violet-600 transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
            />
          </div>

          {activeConfig.enabled && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Tópico do Canal (Será utilizado após alguém entrar/sair)</label>
                <textarea
                  value={activeConfig.topic}
                  onChange={(e) => updateCounterConfig(activeChannel.id, { topic: e.target.value })}
                  rows={2}
                  placeholder="Ex: Reino da Lunna tem {counter} aventureiros!"
                  className="w-full rounded-xl border border-border bg-secondary/20 px-4 py-3 text-xs font-medium text-foreground outline-none transition focus:border-violet-500"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>Tema do Contador de Membros</span>
                  {activeConfig.theme !== "default" && premiumType === "free" && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-violet-600/15 text-violet-400">
                      <Crown className="h-2.5 w-2.5" /> Premium
                    </span>
                  )}
                </label>
                <select
                  value={activeConfig.theme}
                  onChange={(e) => {
                    // Lock premium themes for free users
                    const val = e.target.value
                    if (val !== "default" && premiumType === "free") {
                      toast({
                        title: "Tema Premium Bloqueado",
                        description: "Upgrade para o plano Básico ou superior para usar temas customizados de números!",
                        variant: "destructive"
                      })
                      return
                    }
                    updateCounterConfig(activeChannel.id, { theme: val })
                  }}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/20 px-4 text-xs font-semibold text-foreground outline-none transition focus:border-violet-500"
                >
                  <option value="default">Padrão (123)</option>
                  <option value="emoji">Emojis/Keycaps (1️⃣2️⃣3️⃣) [Premium]</option>
                  <option value="circle">Círculos (①②③) [Premium]</option>
                  <option value="gothic">Negrito (𝟏𝟐𝟑) [Premium]</option>
                </select>
              </div>

              {/* Zero Padding */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Preenchimento com Zeros (Zero Padding)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={activeConfig.zero_padding}
                  onChange={(e) => updateCounterConfig(activeChannel.id, { zero_padding: Number(e.target.value) })}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/20 px-4 text-xs font-semibold text-foreground outline-none transition focus:border-violet-500"
                />
              </div>

              {/* Preview Rendering */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pré-visualização do Formato</label>
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">5 membros:</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15">
                      {formatNumberTheme(5, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">10 membros:</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15">
                      {formatNumberTheme(10, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">34 membros:</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15">
                      {formatNumberTheme(34, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">250 membros:</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15">
                      {formatNumberTheme(250, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // RENDER CANALS LIST VIEW (IMAGE 2)
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-violet-500" />
            Contador de Membros
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Configure e ative contadores de membros dinâmicos nos tópicos de seus canais.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground font-bold">Plano do Servidor</span>
            <div className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-black uppercase text-foreground">{premiumType}</span>
            </div>
          </div>
          <span className="text-[10px] font-black bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full uppercase tracking-wider">
            {premiumType === "free" ? "Grátis" : premiumType}
          </span>
        </div>

        <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground font-bold">Contadores Ativos</span>
            <p className="text-sm font-black text-foreground">
              {activeCount} <span className="text-muted-foreground text-xs font-medium">/ {limit === Infinity ? "Ilimitados" : limit}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">
            {activeCount}
          </div>
        </div>
      </div>

      {/* Limit Alert Warning Banner */}
      {premiumType === "free" && limitReached && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-foreground">Atingiu o Limite do Plano Grátis</h4>
            <p className="text-[10px] text-muted-foreground">Você está utilizando os 3 contadores permitidos no plano Grátis. Faça upgrade para adicionar mais!</p>
          </div>
          <a
            href={`/dashboard/${guildId}/premium`}
            className="flex-shrink-0 text-[10px] font-black uppercase bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Ver Planos
          </a>
        </div>
      )}

      {/* Channels List Table (Image 2 mockup style) */}
      <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-foreground">Canais do servidor com tópico</h3>
          <p className="text-xs text-muted-foreground">{channels.length} canais elegíveis encontrados.</p>
        </div>

        <div className="divide-y divide-border/40">
          {channels.length === 0 ? (
            <p className="py-6 text-center text-xs font-semibold text-muted-foreground">Nenhum canal com suporte a tópico encontrado no servidor.</p>
          ) : (
            channels.map((ch) => {
              const conf = getOrCreateCounterConfig(ch.id)
              return (
                <div key={ch.id} className="py-4 flex items-center justify-between gap-4 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-black">#</span>
                      <span className="text-sm font-bold text-foreground group-hover:text-violet-400 transition-colors">
                        {ch.name}
                      </span>
                      {conf.enabled && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                          Ativo
                        </span>
                      )}
                    </div>
                    {conf.enabled && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-md">
                        Template: <code className="bg-secondary/40 px-1 rounded">{conf.topic}</code>
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => setActiveChannelId(ch.id)}
                    className="h-10 rounded-xl px-4 text-xs font-bold bg-secondary hover:bg-violet-600 hover:text-white text-foreground transition-all"
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
