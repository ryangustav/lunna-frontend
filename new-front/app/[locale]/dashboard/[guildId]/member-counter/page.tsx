"use client"

import React, { use, useEffect, useState } from "react"
import { Users, Save, AlertTriangle, ChevronLeft, Check, Lock, Edit2, Crown } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

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
  const t = useT()
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
        setError(err.message || t("Não foi possível carregar as configurações do servidor.", "Couldn't load the server settings."))
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
      topic: t("Tópico do canal: {counter} membros!", "Channel topic: {counter} members!"),
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
        title: t("Limite Excedido", "Limit reached"),
        description: t(`Seu servidor (Plano: ${premiumType.toUpperCase()}) atingiu o limite de ${limit} contadores ativos. Faça upgrade!`, `Your server (plan: ${premiumType.toUpperCase()}) reached the limit of ${limit} active counters. Upgrade for more!`),
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
        title: t("Configurações salvas!", "Settings saved!"),
        description: t("Contadores de membros atualizados com sucesso.", "Member counters updated."),
      })
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      toast({
        title: t("Erro ao salvar", "Couldn't save"),
        description: err.message || t("Ocorreu um erro ao salvar as configurações.", "Something went wrong while saving the settings."),
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Previews mapping
  const renderFormattedNumber = (num: number, padding: number, theme: string) => {
    let str = String(num).padStart(padding, "0")
    if (theme === "lunna") {
      const ids: Record<string, string> = {
        "0": "1521149894545379328",
        "1": "1521150130638815344",
        "2": "1521150106387349646",
        "3": "1521150080768278779",
        "4": "1521150037395243220",
        "5": "1521150006302871642",
        "6": "1521149982194012201",
        "7": "1521149956839309382",
        "8": "1521149932659020019",
        "9": "1521149913436655700"
      }
      return (
        <span className="flex items-center gap-0.5 inline-flex">
          {str.split("").map((c, i) => (
            <img 
              key={i} 
              src={`https://cdn.discordapp.com/emojis/${ids[c]}.png`} 
              alt={c} 
              className="h-5 w-5 inline-block object-contain" 
            />
          ))}
        </span>
      )
    }
    if (theme === "emoji") {
      const emojiMap: Record<string, string> = {
        "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
        "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣"
      }
      return <span>{str.split("").map(c => emojiMap[c] || c).join("")}</span>
    }
    if (theme === "circle") {
      const circleMap: Record<string, string> = {
        "0": "⓪", "1": "①", "2": "②", "3": "③", "4": "④",
        "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨"
      }
      return <span>{str.split("").map(c => circleMap[c] || c).join("")}</span>
    }
    if (theme === "gothic") {
      const gothicMap: Record<string, string> = {
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒",
        "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
      }
      return <span>{str.split("").map(c => gothicMap[c] || c).join("")}</span>
    }
    return <span>{str}</span>
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-64 w-full rounded-[14px] bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[14px] border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-[15px] font-bold text-foreground">{t("Falha de Conexão", "Connection failed")}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          {t("Tentar Novamente", "Try again")}
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
      <div className="animate-in fade-in space-y-8 duration-300">
        <button
          onClick={() => setActiveChannelId(null)}
          className="group flex items-center text-xs font-semibold tracking-[2px] uppercase text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("Voltar para a lista de canais", "Back to the channel list")}
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
              <span className="text-violet-500">#</span> {activeChannel.name}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("Personalize o contador de membros específico para este canal.", "Customize the member counter for this channel.")}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto h-10 rounded-full font-bold rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("Salvando...", "Saving...") : t("Salvar Configurações", "Save settings")}
          </Button>
        </div>

        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6">
          {/* Toggle Counter */}
          <div className="flex justify-between items-center pb-4 border-b border-border/40">
            <div className="space-y-1 pr-4">
              <h3 className="text-sm font-semibold text-foreground">{t("Ativar contador de membros", "Turn on the member counter")}</h3>
              <p className="text-xs text-muted-foreground">{t("Após ativar, utilize", "Once on, put")} <code>{"{counter}"}</code> {t("no texto do seu tópico para ativar o contador!", "in your topic text to show the counter!")}</p>
            </div>
            <input
              type="checkbox"
              checked={activeConfig.enabled}
              onChange={(e) => updateCounterConfig(activeChannel.id, { enabled: e.target.checked })}
              className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-violet-600 transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
            />
          </div>

          {activeConfig.enabled && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">{t("Tópico do Canal (Será utilizado após alguém entrar/sair)", "Channel topic (updated when someone joins or leaves)")}</label>
                <textarea
                  value={activeConfig.topic}
                  onChange={(e) => updateCounterConfig(activeChannel.id, { topic: e.target.value })}
                  rows={2}
                  placeholder={t("Ex: Membros: {counter}", "E.g.: Members: {counter}")}
                  className="w-full rounded-[10px] border border-border bg-secondary/20 px-4 py-3 text-xs font-medium text-foreground outline-none transition focus:border-violet-500"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span>{t("Tema do Contador de Membros", "Counter theme")}</span>
                  {activeConfig.theme !== "default" && premiumType === "free" && (
                    <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[2px] px-2 py-0.5 rounded bg-violet-600/15 text-violet-400">
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
                        title: t("Tema Premium Bloqueado", "Premium theme locked"),
                        description: t("Upgrade para o plano Básico ou superior para usar temas customizados de números!", "Upgrade to Basic or higher to use custom number themes!"),
                        variant: "destructive"
                      })
                      return
                    }
                    updateCounterConfig(activeChannel.id, { theme: val })
                  }}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/20 px-4 text-xs font-semibold text-foreground outline-none transition focus:border-violet-500"
                >
                  <option value="default">{t("Padrão (123)", "Default (123)")}</option>
                  <option value="lunna">{t("Lunna Emojis (Exclusivo) [Premium]", "Lunna emojis (exclusive) [Premium]")}</option>
                  <option value="emoji">Emojis/Keycaps (1️⃣2️⃣3️⃣) [Premium]</option>
                  <option value="circle">{t("Círculos (①②③) [Premium]", "Circles (①②③) [Premium]")}</option>
                  <option value="gothic">{t("Negrito (𝟏𝟐𝟑) [Premium]", "Bold (𝟏𝟐𝟑) [Premium]")}</option>
                </select>
              </div>

              {/* Zero Padding */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">{t("Preenchimento com Zeros (Zero Padding)", "Zero padding")}</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={activeConfig.zero_padding}
                  onChange={(e) => updateCounterConfig(activeChannel.id, { zero_padding: Number(e.target.value) })}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/20 px-4 text-xs font-semibold text-foreground outline-none transition focus:border-violet-500"
                />
              </div>

              {/* Preview Rendering */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-[2px]">{t("Pré-visualização do Formato", "Format preview")}</label>
                <div className="flex flex-col gap-2 p-4 rounded-[14px] bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">{t("5 membros:", "5 members:")}</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15 flex items-center min-h-[28px]">
                      {renderFormattedNumber(5, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">{t("10 membros:", "10 members:")}</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15 flex items-center min-h-[28px]">
                      {renderFormattedNumber(10, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">{t("34 membros:", "34 members:")}</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15 flex items-center min-h-[28px]">
                      {renderFormattedNumber(34, activeConfig.zero_padding, activeConfig.theme)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                    <span className="text-xs text-muted-foreground font-medium">{t("250 membros:", "250 members:")}</span>
                    <span className="bg-violet-600/10 px-2 py-0.5 rounded text-violet-400 border border-violet-500/15 flex items-center min-h-[28px]">
                      {renderFormattedNumber(250, activeConfig.zero_padding, activeConfig.theme)}
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
    <div className="animate-in fade-in space-y-8 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
            {t("Contador de Membros", "Member counter")}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Configure e ative contadores de membros dinâmicos nos tópicos de seus canais.", "Set up live member counters in your channel topics.")}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto h-10 rounded-full font-bold rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? t("Salvando...", "Saving...") : t("Salvar Configurações", "Save settings")}
        </Button>
      </div>

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-border/80 bg-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground font-semibold">{t("Plano do Servidor", "Server plan")}</span>
            <div className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-semibold uppercase text-foreground">{premiumType}</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full uppercase tracking-[2px]">
            {premiumType === "free" ? t("Grátis", "Free") : premiumType}
          </span>
        </div>

        <div className="rounded-[14px] border border-border/80 bg-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground font-semibold">{t("Contadores Ativos", "Active counters")}</span>
            <p className="text-sm font-semibold text-foreground">
              {activeCount} <span className="text-muted-foreground text-xs font-medium">/ {limit === Infinity ? t("Ilimitados", "Unlimited") : limit}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">
            {activeCount}
          </div>
        </div>
      </div>

      {/* Limit Alert Warning Banner */}
      {premiumType === "free" && limitReached && (
        <div className="rounded-[14px] border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">{t("Atingiu o Limite do Plano Grátis", "Free plan limit reached")}</h4>
            <p className="text-[10px] text-muted-foreground">{t("Você está utilizando os 3 contadores permitidos no plano Grátis. Faça upgrade para adicionar mais!", "You're using the 3 counters the free plan allows. Upgrade to add more!")}</p>
          </div>
          <a
            href={t(`/dashboard/${guildId}/premium`, `/en/dashboard/${guildId}/premium`)}
            className="flex-shrink-0 text-[10px] font-semibold uppercase bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            {t("Ver Planos", "See plans")}
          </a>
        </div>
      )}

      {/* Channels List Table (Image 2 mockup style) */}
      <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold text-foreground">{t("Canais do servidor com tópico", "Server channels with a topic")}</h3>
          <p className="text-xs text-muted-foreground">{t(`${channels.length} canais elegíveis encontrados.`, `${channels.length} eligible channels found.`)}</p>
        </div>

        <div className="divide-y divide-border/40">
          {channels.length === 0 ? (
            <p className="py-6 text-center text-xs font-semibold text-muted-foreground">{t("Nenhum canal com suporte a tópico encontrado no servidor.", "No channels with topics found in the server.")}</p>
          ) : (
            channels.map((ch) => {
              const conf = getOrCreateCounterConfig(ch.id)
              return (
                <div key={ch.id} className="py-4 flex items-center justify-between gap-4 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-semibold">#</span>
                      <span className="text-sm font-semibold text-foreground group-hover:text-violet-400 transition-colors">
                        {ch.name}
                      </span>
                      {conf.enabled && (
                        <span className="text-[9px] font-semibold uppercase tracking-[2px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                          {t("Ativo", "On")}
                        </span>
                      )}
                    </div>
                    {conf.enabled && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-md">
                        {t("Modelo", "Template")}: <code className="bg-secondary/40 px-1 rounded">{conf.topic}</code>
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => setActiveChannelId(ch.id)}
                    className="h-9 rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-foreground hover:bg-secondary"
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    {t("Editar", "Edit")}
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
