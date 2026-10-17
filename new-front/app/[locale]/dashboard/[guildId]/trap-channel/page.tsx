"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Skull, Shield, Check, Info, ShieldAlert, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: number
}

interface TrapChannelConfig {
  enabled: boolean
  channel_id: string | null
  action: "warn" | "mute" | "kick" | "ban"
  punishments_count: number
  message_id?: string | null
}

export default function TrapChannelPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [channels, setChannels] = useState<Channel[]>([])
  const [enabled, setEnabled] = useState<boolean>(false)
  const [channelId, setChannelId] = useState<string>("")
  const [action, setAction] = useState<"warn" | "mute" | "kick" | "ban">("warn")
  const [punishmentsCount, setPunishmentsCount] = useState<number>(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [settingsRes, channelsRes] = await Promise.all([
          api.getGuildSettings(guildId),
          api.getGuildChannels(guildId)
        ])

        if (settingsRes && settingsRes.trap_channel) {
          const trap: TrapChannelConfig = settingsRes.trap_channel
          setEnabled(trap.enabled ?? false)
          setChannelId(trap.channel_id || "")
          setAction(trap.action || "warn")
          setPunishmentsCount(trap.punishments_count || 0)
        }

        if (channelsRes?.success) {
          setChannels(channelsRes.data.filter((c: Channel) => c.type === 0))
        }

      } catch (err: any) {
        console.error("Failed to load trap channel data:", err)
        setError(err.message || "Não foi possível carregar as configurações do canal armadilha.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [guildId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        trap_channel: {
          enabled,
          channel_id: channelId || null,
          action,
          punishments_count: punishmentsCount
        }
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Salvo com sucesso!",
        description: "As configurações do Canal Armadilha foram atualizadas.",
      })
    } catch (err: any) {
      console.error("Failed to save trap channel settings:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const actionLabels: Record<string, string> = {
    warn: "aviso (warn)",
    mute: "silenciamento por 1 hora (mute)",
    kick: "expulsão (kick)",
    ban: "banimento permanente (ban)"
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-48 w-full rounded-[14px] bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[14px] border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-[15px] font-bold text-foreground">Falha de Conexão</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="animate-in fade-in space-y-8 duration-300">
      

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
            Canais de Armadilha
            <span className="text-xs bg-red-500/20 text-red-400 font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30">
              NOVO!
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl font-medium">
            Defina um canal que servirá de armadilha contra bots de spam. Qualquer conta que enviar mensagem nele receberá uma punição automática pré-definida!
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-10 rounded-full font-bold transition-all rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Card 1: Enable & Select Channel */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-500/10 text-red-400 text-sm font-semibold">1</span>
                Ativar Canal Armadilha
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Se ativado, o bot monitorará o canal selecionado e punirá automaticamente quem enviar mensagens.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => setEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {enabled && (
            <div className="space-y-4 pt-4 border-t border-border/40 animate-in fade-in duration-300">
              <label className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">Selecione o Canal Armadilha</label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/20 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-red-500/50"
              >
                <option value="" className="bg-card text-muted-foreground">Selecione um canal de texto...</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Card 2: Punishment Action Selector */}
        {enabled && (
          <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-colors duration-300 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-500/10 text-red-400 text-sm font-semibold">2</span>
                Tipo de Punição
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Escolha qual sanção a Lunna aplicará à conta que postar mensagem no canal armadilha.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "warn", title: "Aviso (Warn)", desc: "Aplica um aviso no servidor" },
                { id: "mute", title: "Silenciar (Mute 1h)", desc: "Aplica um timeout de 1 hora" },
                { id: "kick", title: "Expulsar (Kick)", desc: "Expulsa o membro do servidor" },
                { id: "ban", title: "Banir (Ban)", desc: "Bane o membro permanentemente" },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setAction(item.id as any)}
                  className={`cursor-pointer rounded-[14px] border p-4 transition-all duration-200 flex flex-col justify-between ${ action === item.id ? "border-red-500 bg-red-500/10 shadow-red-500/10" : "border-border bg-secondary/10 hover:border-border/80" }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{item.title}</span>
                      {action === item.id && <Check className="h-4 w-4 text-red-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card 3: Preview of the Announcement in Discord */}
        {enabled && (
          <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-colors duration-300 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-500/10 text-red-400 text-sm font-semibold">3</span>
                Prévia da Mensagem no Discord
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Assim que salvar as configurações, a Lunna enviará a seguinte mensagem oficial no canal selecionado:
              </p>
            </div>

            {/* Discord Container Mockup */}
            <div className="rounded-[14px] border border-zinc-800 bg-[#1e1f22] p-4 font-sans text-white space-y-3 max-w-lg">
              <div className="flex items-start gap-3 bg-[#2b2d31] p-4 rounded-[10px] border border-zinc-700/50">
                <img 
                  src="http://cdn.discordapp.com/emojis/1520449039416426626.webp?size=2048" 
                  alt="Officer" 
                  className="w-12 h-12 rounded-lg object-cover shrink-0" 
                />
                <div className="space-y-1">
                  <h3 className="font-semibold text-red-500 text-base"># NÃO ENVIE MENSAGEM NESTE CANAL!!!</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Este canal é usado para detectar bots de spam. Qualquer mensagem enviada aqui resultará em <strong className="text-red-400">{actionLabels[action]}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-[#35363c] hover:bg-[#404249] text-xs font-semibold rounded-md flex items-center gap-2 text-zinc-200 transition"
                >
                  <img src="http://cdn.discordapp.com/emojis/1520449039416426626.webp?size=2048" alt="emoji" className="w-4 h-4" />
                  <span>Punições: {punishmentsCount}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </form>
  )
}
