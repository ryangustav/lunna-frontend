"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, ShieldAlert, ShieldCheck, Zap, Mail, Trash2, Plus } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: number
}

interface WarnPunishment {
  warn_count: number
  action: string
  duration: number // in seconds
}

interface PunishmentDM {
  ban: boolean
  kick: boolean
  mute: boolean
  warn: boolean
  unban: boolean
  unmute: boolean
  unwarn: boolean
  softban: boolean
}

export default function ModerationPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  // Loading / Saving states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discord lists
  const [channels, setChannels] = useState<Channel[]>([])



  // Punishment DM states
  const [punishmentDM, setPunishmentDM] = useState<PunishmentDM>({
    ban: false,
    kick: false,
    mute: false,
    warn: false,
    unban: false,
    unmute: false,
    unwarn: false,
    softban: false
  })

  // Warn Punishments states
  const [warnPunishments, setWarnPunishments] = useState<WarnPunishment[]>([])
  
  // Warn creation inputs
  const [newWarnCount, setNewWarnCount] = useState<number>(3)
  const [newWarnAction, setNewWarnAction] = useState<string>("mute")
  const [newWarnDuration, setNewWarnDuration] = useState<number>(60) // in minutes

  // Fetch data
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


          // Punishment DM
          const dmCfg = settingsRes.punishment_dm || {}
          setPunishmentDM({
            ban: dmCfg.ban ?? false,
            kick: dmCfg.kick ?? false,
            mute: dmCfg.mute ?? false,
            warn: dmCfg.warn ?? false,
            unban: dmCfg.unban ?? false,
            unmute: dmCfg.unmute ?? false,
            unwarn: dmCfg.unwarn ?? false,
            softban: dmCfg.softban ?? false
          })

          // Warn Punishments
          setWarnPunishments(settingsRes.warn_punishments || [])
        }

        if (channelsRes.success) setChannels(channelsRes.data)

      } catch (err: any) {
        console.error("Failed to load moderation settings:", err)
        setError(err.message || "Não foi possível carregar as configurações do servidor.")
        toast({
          title: "Erro ao carregar dados",
          description: err.message || "Por favor, verifique se o bot está no servidor.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [guildId])

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        punishment_dm: punishmentDM,
        warn_punishments: warnPunishments
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Sucesso!",
        description: "Configurações de moderação salvas com sucesso.",
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



  // Add warn punishment rule
  const handleAddWarnRule = () => {
    // Check if count already has a rule
    if (warnPunishments.some(p => p.warn_count === newWarnCount)) {
      toast({
        title: "Regra duplicada",
        description: `Já existe uma punição configurada para ${newWarnCount} avisos.`,
        variant: "destructive"
      })
      return
    }

    const newRule: WarnPunishment = {
      warn_count: newWarnCount,
      action: newWarnAction,
      duration: newWarnAction === "mute" ? newWarnDuration * 60 : 0
    }

    // Sort by warn_count ascending
    setWarnPunishments([...warnPunishments, newRule].sort((a, b) => a.warn_count - b.warn_count))
    toast({
      title: "Regra adicionada",
      description: `Regra para ${newWarnCount} avisos adicionada temporariamente. Lembre-se de salvar!`,
    })
  }

  // Remove warn punishment rule
  const handleRemoveWarnRule = (count: number) => {
    setWarnPunishments(warnPunishments.filter(p => p.warn_count !== count))
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-48 w-full rounded-3xl bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Falha de Comunicação</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const translateAction = (act: string, durationSec: number) => {
    switch (act) {
      case "warn": return "Aviso"
      case "mute": {
        const mins = durationSec / 60
        if (mins >= 60) {
          const hrs = Math.round(mins / 60)
          return `Silenciamento por ${hrs} hora(s)`
        }
        return `Silenciamento por ${mins} minuto(s)`
      }
      case "kick": return "Expulsão"
      case "ban": return "Banimento"
      default: return act
    }
  }

  return (
    <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
            <ShieldAlert className="mr-3 h-8 w-8 text-red-500" />
            Defesas & Moderação
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure punições automáticas e notificações diretas no privado dos membros.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        


        {/* 2. Mensagens no Privado (DMs de Punição) */}
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-colors" />

          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-400" />
              Notificações no Privado (DMs de Punição)
            </h2>
            <p className="text-sm text-muted-foreground">
              Escolha quais ações enviarão mensagens privadas avisando o usuário sobre o motivo e punição aplicada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(punishmentDM) as Array<keyof PunishmentDM>).map((type) => {
              const label = type === "ban" ? "Banimento" : 
                            type === "kick" ? "Expulsão" :
                            type === "mute" ? "Silenciamento" :
                            type === "warn" ? "Aviso" :
                            type === "unban" ? "Desbanimento" :
                            type === "unmute" ? "Dessilenciamento" :
                            type === "unwarn" ? "Desavisado" : "Expulsão c/ Msg Deletada";
              const isChecked = punishmentDM[type]
              return (
                <div
                  key={type}
                  onClick={() => setPunishmentDM({ ...punishmentDM, [type]: !isChecked })}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked 
                      ? "bg-primary/10 border-primary/45 text-primary shadow-sm" 
                      : "bg-secondary/15 border-border/40 text-foreground hover:bg-secondary/30"
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{label}</span>
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center bg-background transition-colors ${isChecked ? "border-primary" : "border-muted-foreground/30"}`}>
                    {isChecked && <div className="h-2.5 w-2.5 rounded-sm bg-primary" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Punições de Avisos (Warn Punishments) */}
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-colors" />

          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-400" />
              Punições de Avisos
            </h2>
            <p className="text-sm text-muted-foreground">
              Adicione regras automáticas de moderação baseadas na quantidade acumulada de avisos de um membro.
            </p>
          </div>

          {/* Rule Creator */}
          <div className="flex flex-wrap gap-4 items-end bg-secondary/15 p-5 rounded-2xl border border-border/50 max-w-3xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">Ao chegar em</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newWarnCount}
                  onChange={(e) => setNewWarnCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 h-10 rounded-lg border border-border bg-background px-2 text-center text-sm font-bold outline-none"
                />
                <span className="text-xs font-bold text-foreground">avisos</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground">Aplicar Ação</span>
              <select
                value={newWarnAction}
                onChange={(e) => setNewWarnAction(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="mute">Silenciar (Mute)</option>
                <option value="kick">Expulsar (Kick)</option>
                <option value="ban">Banir (Ban)</option>
              </select>
            </div>

            {newWarnAction === "mute" && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">Duração (Minutos)</span>
                <input
                  type="number"
                  min={5}
                  value={newWarnDuration}
                  onChange={(e) => setNewWarnDuration(Math.max(5, Number(e.target.value)))}
                  className="w-24 h-10 rounded-lg border border-border bg-background px-2 text-center text-sm font-bold outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddWarnRule}
              className="h-10 rounded-lg bg-primary text-primary-foreground font-bold px-4 text-xs hover:bg-primary/95 flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Regra
            </button>
          </div>

          {/* Rule List */}
          <div className="space-y-3 max-w-3xl">
            <h4 className="text-sm font-bold text-foreground">Regras de Ações Automáticas Ativas</h4>
            
            {warnPunishments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-secondary/10 p-4 rounded-xl border border-dashed text-center">
                Nenhuma regra automática configurada. Usuários que receberem avisos acumularão avisos indefinidamente.
              </p>
            ) : (
              <div className="space-y-2">
                {warnPunishments.map((rule) => (
                  <div
                    key={rule.warn_count}
                    className="flex justify-between items-center bg-secondary/20 p-4 rounded-xl border border-border/60 hover:bg-secondary/35 transition"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      Ao atingir <strong className="text-red-400 font-extrabold">{rule.warn_count}</strong> aviso(s), o usuário será punido com: <strong>{translateAction(rule.action, rule.duration).toUpperCase()}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWarnRule(rule.warn_count)}
                      className="text-xs text-red-400 hover:text-red-500 font-bold flex items-center gap-1 transition p-1 hover:bg-red-500/5 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </form>
  )
}
