"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, FileText, ShieldAlert, Ban, UserMinus, ShieldAlert as WarnIcon, VolumeX, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

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
  const t = useT()
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
        setError(err.message || t("Não foi possível carregar as configurações do servidor.", "Couldn't load the server settings."))
        toast({
          title: t("Erro ao carregar dados", "Couldn't load the data"),
          description: err.message || t("Por favor, verifique se o bot está no servidor.", "Please check that the bot is in the server."),
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
        title: t("Sucesso!", "Saved!"),
        description: t("Configurações de registro de punições salvas com sucesso.", "Punishment log settings saved."),
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
        <h3 className="text-[15px] font-bold text-foreground">{t("Falha de Comunicação", "Connection failed")}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          {t("Tentar Novamente", "Try again")}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="animate-in fade-in space-y-8 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
            {t("Registro de Punições", "Punishment logs")}
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.7] text-muted-foreground">
            {t("Configure canais específicos para cada tipo de punição. Se um canal específico não for selecionado, ele usará o Canal Geral de Punições.", "Set a channel for each kind of punishment. Without one, the general punishment channel is used. Logs are posted in the server's language.")}
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-10 rounded-full font-bold transition-all rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? t("Salvando...", "Saving...") : t("Salvar Configurações", "Save settings")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Canal Geral de Punições */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">

          <div className="space-y-4 max-w-md">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              {t("Canal Geral de Punições", "General punishment channel")}
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t("Canal Padrão (Fallback)", "Default channel (fallback)")}</label>
              <select
                value={modLogChannel}
                onChange={(e) => setModLogChannel(e.target.value)}
                className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Canais Específicos por Punição */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">

          <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("Canais Específicos por Tipo de Punição", "Channels per punishment type")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Banimento */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ban className="h-4 w-4 text-red-400" />
                {t("Logs de Banimento", "Ban logs")}
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("Canal de Banimentos", "Ban channel")}</label>
                <select
                  value={logModBanChannel}
                  onChange={(e) => setLogModBanChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Usar Canal Geral (Padrão)", "Use the general channel (default)")}</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desbanimento */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                {t("Logs de Desbanimento", "Unban logs")}
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("Canal de Desbanimentos", "Unban channel")}</label>
                <select
                  value={logModUnbanChannel}
                  onChange={(e) => setLogModUnbanChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Usar Canal Geral (Padrão)", "Use the general channel (default)")}</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expulsão (Kick) */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserMinus className="h-4 w-4 text-orange-400" />
                {t("Logs de Expulsão (Kick)", "Kick logs")}
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("Canal de Expulsões", "Kick channel")}</label>
                <select
                  value={logModKickChannel}
                  onChange={(e) => setLogModKickChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Usar Canal Geral (Padrão)", "Use the general channel (default)")}</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Silenciamento (Mute/Timeout) */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-purple-400" />
                {t("Logs de Silenciamento (Timeout)", "Timeout logs")}
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("Canal de Silenciamentos", "Timeout channel")}</label>
                <select
                  value={logModMuteChannel}
                  onChange={(e) => setLogModMuteChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Usar Canal Geral (Padrão)", "Use the general channel (default)")}</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aviso (Warn) */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4 md:col-span-2 max-w-xl mx-auto w-full">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <WarnIcon className="h-4 w-4 text-yellow-400" />
                {t("Logs de Aviso (Warn)", "Warning logs")}
              </h4>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("Canal de Avisos", "Warning channel")}</label>
                <select
                  value={logModWarnChannel}
                  onChange={(e) => setLogModWarnChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Usar Canal Geral (Padrão)", "Use the general channel (default)")}</option>
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
