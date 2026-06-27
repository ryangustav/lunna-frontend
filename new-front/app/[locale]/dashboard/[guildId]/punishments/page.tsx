"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, FileText, ShieldAlert, Ban, UserMinus, ShieldAlert as WarnIcon, VolumeX, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Channel {
  id: string
  name: string
  type: number
}

export default function PunishmentsLogPage({
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

  // States
  const [modLogChannel, setModLogChannel] = useState<string>("")
  const [logModBanChannel, setLogModBanChannel] = useState<string>("")
  const [logModUnbanChannel, setLogModUnbanChannel] = useState<string>("")
  const [logModKickChannel, setLogModKickChannel] = useState<string>("")
  const [logModMuteChannel, setLogModMuteChannel] = useState<string>("")
  const [logModWarnChannel, setLogModWarnChannel] = useState<string>("")

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
          setModLogChannel(settingsRes.mod_log_channel || "")
          setLogModBanChannel(settingsRes.log_mod_ban_channel || "")
          setLogModUnbanChannel(settingsRes.log_mod_unban_channel || "")
          setLogModKickChannel(settingsRes.log_mod_kick_channel || "")
          setLogModMuteChannel(settingsRes.log_mod_mute_channel || "")
          setLogModWarnChannel(settingsRes.log_mod_warn_channel || "")
        }

        if (channelsRes.success) setChannels(channelsRes.data)

      } catch (err: any) {
        console.error("Failed to load punishments log settings:", err)
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
        mod_log_channel: modLogChannel || null,
        log_mod_ban_channel: logModBanChannel || null,
        log_mod_unban_channel: logModUnbanChannel || null,
        log_mod_kick_channel: logModKickChannel || null,
        log_mod_mute_channel: logModMuteChannel || null,
        log_mod_warn_channel: logModWarnChannel || null
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Sucesso!",
        description: "Configurações de registro de punições salvas com sucesso.",
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

  return (
    <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            Registro de Punições
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure canais específicos para cada tipo de punição. Se um canal específico não for selecionado, ele usará o Canal Geral de Punições.
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
        
        {/* Canal Geral de Punições */}
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-colors" />

          <div className="space-y-4 max-w-md">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Canal Geral de Punições
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Canal Padrão (Fallback)</label>
              <select
                value={modLogChannel}
                onChange={(e) => setModLogChannel(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value="" className="bg-card text-muted-foreground">Desativado</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Canais Específicos por Punição */}
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Canais Específicos por Tipo de Punição
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Banimento */}
            <div className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Ban className="h-4 w-4 text-red-400" />
                Logs de Banimento
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Canal de Banimentos</label>
                <select
                  value={logModBanChannel}
                  onChange={(e) => setLogModBanChannel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">Usar Canal Geral (Padrão)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desbanimento */}
            <div className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                Logs de Desbanimento
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Canal de Desbanimentos</label>
                <select
                  value={logModUnbanChannel}
                  onChange={(e) => setLogModUnbanChannel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">Usar Canal Geral (Padrão)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expulsão (Kick) */}
            <div className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-orange-400" />
                Logs de Expulsão (Kick)
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Canal de Expulsões</label>
                <select
                  value={logModKickChannel}
                  onChange={(e) => setLogModKickChannel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">Usar Canal Geral (Padrão)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Silenciamento (Mute/Timeout) */}
            <div className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-purple-400" />
                Logs de Silenciamento (Timeout)
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Canal de Silenciamentos</label>
                <select
                  value={logModMuteChannel}
                  onChange={(e) => setLogModMuteChannel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">Usar Canal Geral (Padrão)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aviso (Warn) */}
            <div className="rounded-2xl border border-border/60 bg-secondary/10 p-5 space-y-4 md:col-span-2 max-w-xl mx-auto w-full">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <WarnIcon className="h-4 w-4 text-yellow-400" />
                Logs de Aviso (Warn)
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Canal de Avisos</label>
                <select
                  value={logModWarnChannel}
                  onChange={(e) => setLogModWarnChannel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">Usar Canal Geral (Padrão)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

      </div>
    </form>
  )
}
