"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Activity, MessageSquare, Mic, User, ShieldAlert, FolderClosed } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

interface Channel {
  id: string
  name: string
  type: number
}

export default function LogsPage({
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

  // Granular Logs states
  const [logMsgDeleteChannel, setLogMsgDeleteChannel] = useState<string>("")
  const [logMsgEditChannel, setLogMsgEditChannel] = useState<string>("")
  const [logVoiceChannel, setLogVoiceChannel] = useState<string>("")
  const [logMemberNicknameChannel, setLogMemberNicknameChannel] = useState<string>("")
  const [logMemberAvatarChannel, setLogMemberAvatarChannel] = useState<string>("")
  const [logServerChannelCreateChannel, setLogServerChannelCreateChannel] = useState<string>("")
  const [logServerChannelDeleteChannel, setLogServerChannelDeleteChannel] = useState<string>("")
  const [logServerRoleCreateChannel, setLogServerRoleCreateChannel] = useState<string>("")
  const [logServerRoleDeleteChannel, setLogServerRoleDeleteChannel] = useState<string>("")

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
          setLogMsgDeleteChannel(settingsRes.log_msg_delete_channel || "")
          setLogMsgEditChannel(settingsRes.log_msg_edit_channel || "")
          setLogVoiceChannel(settingsRes.log_voice_channel || "")
          setLogMemberNicknameChannel(settingsRes.log_member_nickname_channel || "")
          setLogMemberAvatarChannel(settingsRes.log_member_avatar_channel || "")
          setLogServerChannelCreateChannel(settingsRes.log_server_channel_create_channel || "")
          setLogServerChannelDeleteChannel(settingsRes.log_server_channel_delete_channel || "")
          setLogServerRoleCreateChannel(settingsRes.log_server_role_create_channel || "")
          setLogServerRoleDeleteChannel(settingsRes.log_server_role_delete_channel || "")
        }

        if (channelsRes.success) setChannels(channelsRes.data)

      } catch (err: any) {
        console.error("Failed to load logs settings:", err)
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
        log_msg_delete_channel: logMsgDeleteChannel || null,
        log_msg_edit_channel: logMsgEditChannel || null,
        log_voice_channel: logVoiceChannel || null,
        log_member_nickname_channel: logMemberNicknameChannel || null,
        log_member_avatar_channel: logMemberAvatarChannel || null,
        log_mod_ban_channel: null,
        log_mod_unban_channel: null,
        log_mod_kick_channel: null,
        log_server_channel_create_channel: logServerChannelCreateChannel || null,
        log_server_channel_delete_channel: logServerChannelDeleteChannel || null,
        log_server_role_create_channel: logServerRoleCreateChannel || null,
        log_server_role_delete_channel: logServerRoleDeleteChannel || null
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: t("Sucesso!", "Saved!"),
        description: t("Configurações de registros e auditoria salvas com sucesso.", "Log settings saved."),
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
            {t("Registro de Eventos (Logs)", "Event logs")}
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.7] text-muted-foreground">
            {t("Configure canais de texto específicos para registrar as ações do servidor de forma intuitiva.", "Pick text channels to log what happens in the server. Logs are posted in the server's language.")}
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
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">

          <div className="grid grid-cols-1 gap-8">
            
            {/* Logs de Mensagens */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-400" />
                {t("Logs de Mensagens", "Message logs")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Mensagens Excluídas", "Deleted messages")}</label>
                  <select
                    value={logMsgDeleteChannel}
                    onChange={(e) => setLogMsgDeleteChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Mensagens Editadas", "Edited messages")}</label>
                  <select
                    value={logMsgEditChannel}
                    onChange={(e) => setLogMsgEditChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logs de Canais de Voz */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Mic className="h-5 w-5 text-indigo-400" />
                {t("Logs de Canais de Voz", "Voice channel logs")}
              </h3>
              
              <div className="space-y-2 max-w-md">
                <label className="text-xs font-semibold text-muted-foreground">{t("Entrada, Saída e Movimentação", "Joins, leaves and moves")}</label>
                <select
                  value={logVoiceChannel}
                  onChange={(e) => setLogVoiceChannel(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logs de Membros */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                {t("Logs de Membros", "Member logs")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Alteração de Apelido (Nickname)", "Nickname changes")}</label>
                  <select
                    value={logMemberNicknameChannel}
                    onChange={(e) => setLogMemberNicknameChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Alteração de Avatar (Foto)", "Avatar changes")}</label>
                  <select
                    value={logMemberAvatarChannel}
                    onChange={(e) => setLogMemberAvatarChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logs de Estrutura do Servidor */}
            <div className="rounded-[14px] border border-border/60 bg-secondary/10 p-5 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FolderClosed className="h-5 w-5 text-yellow-400" />
                {t("Logs de Estrutura (Servidor)", "Server structure logs")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Canais Criados", "Channels created")}</label>
                  <select
                    value={logServerChannelCreateChannel}
                    onChange={(e) => setLogServerChannelCreateChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Canais Excluídos", "Channels deleted")}</label>
                  <select
                    value={logServerChannelDeleteChannel}
                    onChange={(e) => setLogServerChannelDeleteChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Cargos Criados", "Roles created")}</label>
                  <select
                    value={logServerRoleCreateChannel}
                    onChange={(e) => setLogServerRoleCreateChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">{t("Cargos Excluídos", "Roles deleted")}</label>
                  <select
                    value={logServerRoleDeleteChannel}
                    onChange={(e) => setLogServerRoleDeleteChannel(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border/80 bg-secondary/30 px-3.5 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Desativado", "Off")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </form>
  )
}
