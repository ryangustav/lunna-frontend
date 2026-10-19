"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Ban, Trash2, Plus, MessageSquare } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

interface Channel {
  id: string
  name: string
  type: number
}

export default function AntiInvitePage({
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
  const [antiInviteEnabled, setAntiInviteEnabled] = useState(false)
  const [allowGuildInvites, setAllowGuildInvites] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState(true)
  const [sendWarnMessage, setSendWarnMessage] = useState(true)
  const [antiInviteWhitelist, setAntiInviteWhitelist] = useState<string[]>([])
  const [antiInviteMessage, setAntiInviteMessage] = useState("")
  const [antiInviteAction, setAntiInviteAction] = useState("none")

  // Local helper state
  const [selectedChannel, setSelectedChannel] = useState("")
  const [currentTime, setCurrentTime] = useState("09:07")

  // Set current time for Discord preview on load
  useEffect(() => {
    const now = new Date()
    const hrs = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    setCurrentTime(`${hrs}:${mins}`)
  }, [])

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
          const inviteCfg = settingsRes.anti_invite || {}
          setAntiInviteEnabled(inviteCfg.enabled ?? false)
          setAntiInviteAction(inviteCfg.action ?? "none")
          setAntiInviteWhitelist(inviteCfg.whitelisted_channels ?? [])
          setAntiInviteMessage(inviteCfg.message || "")
          setAllowGuildInvites(inviteCfg.allow_guild_invites ?? false)
          setDeleteMessage(inviteCfg.delete_message ?? true)
          setSendWarnMessage(inviteCfg.send_warn_message ?? true)
        }

        if (channelsRes.success) {
          setChannels(channelsRes.data.filter((c: any) => c.type === 0 || c.type === 5)) // Text channels
        }

      } catch (err: any) {
        console.error("Failed to load anti-invite settings:", err)
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
        anti_invite: {
          enabled: antiInviteEnabled,
          action: antiInviteAction,
          whitelisted_channels: antiInviteWhitelist,
          message: antiInviteMessage,
          allow_guild_invites: allowGuildInvites,
          delete_message: deleteMessage,
          send_warn_message: sendWarnMessage
        }
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: t("Sucesso!", "Saved!"),
        description: t("Configurações do bloqueador de convites salvas com sucesso.", "Invite blocker settings saved."),
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

  const handleAddChannel = () => {
    if (!selectedChannel) return
    if (antiInviteWhitelist.includes(selectedChannel)) {
      toast({
        title: t("Canal já adicionado", "Channel already added"),
        description: t("Este canal já está na lista de permissões.", "This channel is already on the allow list."),
        variant: "destructive"
      })
      return
    }
    setAntiInviteWhitelist([...antiInviteWhitelist, selectedChannel])
    setSelectedChannel("")
  }

  const handleRemoveChannel = (chId: string) => {
    setAntiInviteWhitelist(antiInviteWhitelist.filter(id => id !== chId))
  }

  // Renders the warning message preview highlighting the @user mention in Discord-style
  const renderMessageContent = () => {
    // empty = the bot's default notice, in the server's language
    const text = antiInviteMessage || t("Você não pode enviar convites neste servidor.", "You can't send invites in this server.")
    
    // Split by @user or {user} to style the mention
    const parts = text.split(/(@user|{user})/g)
    return parts.map((part, index) => {
      if (part === "@user" || part === "{user}") {
        return (
          <span 
            key={index} 
            className="bg-[#5865F2]/30 text-[#dee0fc] rounded px-1 py-0.5 text-xs font-semibold cursor-pointer hover:bg-[#5865F2] hover:text-white transition-colors"
          >
            {t("@Membro", "@Member")}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
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
            {t("Bloqueador de Convites", "Invite blocker")}
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.7] text-muted-foreground">
            {t("Bloqueia convites de outros servidores do Discord em seus canais de chat.", "Blocks invites to other Discord servers in your chat channels.")}
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
        
        {/* Painel Principal de Configurações */}
        <div className="rounded-[14px] border border-border/60 bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">

          {/* Switch 1: Ativar Bloqueador */}
          <div className="flex items-center justify-between p-4 rounded-[14px] bg-secondary/10 border border-border/40">
            <div className="space-y-1">
              <label htmlFor="invite-toggle" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                {t("Ativar Bloqueador de Convites", "Turn on the invite blocker")}
              </label>
              <p className="text-xs text-muted-foreground">{t("Liga ou desliga o filtro contra links de outros servidores.", "Turns the filter against other servers' invites on or off.")}</p>
            </div>
            <input
              id="invite-toggle"
              type="checkbox"
              checked={antiInviteEnabled}
              onChange={(e) => setAntiInviteEnabled(e.target.checked)}
              className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-[#7c3aed] transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
            />
          </div>

          {antiInviteEnabled && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Switch 2: Permitir convites do servidor atual */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-secondary/10 border border-border/40">
                <div className="space-y-1">
                  <label htmlFor="allow-guild-toggle" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                    {t("Permitir compartilhar convites do servidor atual", "Allow invites to this server")}
                  </label>
                  <p className="text-xs text-muted-foreground">{t("O bot não apagará convites que direcionam para este mesmo servidor.", "The bot won't delete invites that lead to this same server.")}</p>
                </div>
                <input
                  id="allow-guild-toggle"
                  type="checkbox"
                  checked={allowGuildInvites}
                  onChange={(e) => setAllowGuildInvites(e.target.checked)}
                  className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-[#7c3aed] transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                />
              </div>

              {/* Switch 3: Deletar mensagem ao detectar */}
              <div className="flex items-center justify-between p-4 rounded-[14px] bg-secondary/10 border border-border/40">
                <div className="space-y-1">
                  <label htmlFor="delete-msg-toggle" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                    {t("Deletar a mensagem do usuário quando um invite for detectado", "Delete the member's message when an invite is found")}
                  </label>
                  <p className="text-xs text-muted-foreground">{t("Remove automaticamente a mensagem infratora do chat.", "Removes the offending message from chat automatically.")}</p>
                </div>
                <input
                  id="delete-msg-toggle"
                  type="checkbox"
                  checked={deleteMessage}
                  onChange={(e) => setDeleteMessage(e.target.checked)}
                  className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-[#7c3aed] transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                />
              </div>

              {/* Whitelist section */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-semibold text-foreground">{t("Canais aonde são permitidos enviar convites", "Channels where invites are allowed")}</label>
                <div className="flex gap-2">
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="flex-1 h-12 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">{t("Selecione um canal...", "Select a channel...")}</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddChannel}
                    className="h-10 px-6 rounded-full font-bold rounded-full bg-[#7c3aed] px-5 text-[13px] font-semibold text-white hover:bg-[#7c3aed]/90"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t("Adicionar", "Add")}
                  </Button>
                </div>

                {/* Whitelist Container / Empty state */}
                <div className="rounded-[14px] border border-border bg-secondary/15 p-4 min-h-[14rem]">
                  {antiInviteWhitelist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                      <svg className="h-20 w-20 opacity-60 text-muted-foreground" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.07" stroke="currentColor" strokeWidth="2.5" />
                        <path d="M32 46 Q37 54 42 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M58 46 Q63 54 68 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M37 52 V64" stroke="#3498db" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <path d="M63 52 V64" stroke="#3498db" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <circle cx="37" cy="67" r="2.5" fill="#3498db" />
                        <circle cx="63" cy="67" r="2.5" fill="#3498db" />
                        <path d="M46 62 Q50 68 54 62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <ellipse cx="28" cy="52" rx="4" ry="3" fill="#e74c3c" opacity="0.3" />
                        <ellipse cx="72" cy="52" rx="4" ry="3" fill="#e74c3c" opacity="0.3" />
                      </svg>
                      <p className="text-sm font-semibold text-muted-foreground">{t("Vazio, igualzinho a minha conta bancária", "Empty, just like my bank account")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {antiInviteWhitelist.map((chId) => {
                        const channel = channels.find(c => c.id === chId)
                        return (
                          <div key={chId} className="flex items-center justify-between p-3.5 rounded-[10px] border border-border bg-secondary/30 text-sm font-semibold">
                            <span className="text-foreground text-xs truncate">#{channel ? channel.name : chId}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveChannel(chId)}
                              className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action config (kept in background or optional menu) */}
              <div className="space-y-2 max-w-sm pt-2">
                <label className="text-sm font-semibold text-foreground">{t("Sanção Automática (Além de deletar)", "Automatic punishment (besides deleting)")}</label>
                <select
                  value={antiInviteAction}
                  onChange={(e) => setAntiInviteAction(e.target.value)}
                  className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-3.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="none" className="bg-card text-foreground">{t("Nenhuma (Apenas Deletar)", "None (just delete)")}</option>
                  <option value="warn" className="bg-card text-foreground">{t("Dar Aviso (Warn)", "Warn")}</option>
                  <option value="mute" className="bg-card text-foreground">{t("Silenciar por 1 Hora (Mute)", "Time out for 1 hour (mute)")}</option>
                  <option value="kick" className="bg-card text-foreground">{t("Expulsar (Kick)", "Kick")}</option>
                  <option value="ban" className="bg-card text-foreground">{t("Banir (Ban)", "Ban")}</option>
                </select>
              </div>

              {/* Switch 4: Enviar mensagem ao usuário */}
              <div className="border-t border-border/40 pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[14px] bg-secondary/10 border border-border/40">
                  <div className="space-y-1">
                    <label htmlFor="send-warn-toggle" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                      {t("Enviar uma mensagem ao usuário quando ele enviar um invite", "Send the member a message when they post an invite")}
                    </label>
                    <p className="text-xs text-muted-foreground">{t("Dispara um aviso no chat alertando sobre a restrição.", "Shows a notice about the rule.")}</p>
                  </div>
                  <input
                    id="send-warn-toggle"
                    type="checkbox"
                    checked={sendWarnMessage}
                    onChange={(e) => setSendWarnMessage(e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-[#7c3aed] transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                  />
                </div>

                {sendWarnMessage && (
                  <div className="space-y-4 pt-2 animate-in duration-300">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          {t("Mensagem", "Message")}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={antiInviteMessage}
                        onChange={(e) => setAntiInviteMessage(e.target.value)}
                        placeholder={t("Você não pode enviar convites neste servidor.", "You can't send invites in this server.")}
                        className="w-full h-12 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                      />
                    </div>

                    {/* Discord message preview rendering */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t("Pré-visualização do Alerta", "Notice preview")}</span>
                      <div className="bg-[#313338] text-[#dbdee1] p-4 rounded-[10px] border border-black/35 font-sans space-y-1 select-none">
                        <div className="flex items-start gap-3.5">
                          {/* Cute avatar simulation */}
                          <div className="h-10 w-10 rounded-full bg-[#7c3aed] flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                            LN
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#f2f3f5] hover:underline cursor-pointer">Lunna</span>
                              <span className="bg-[#5865f2] text-[10px] text-white px-1 py-0.5 rounded font-semibold uppercase scale-90">✔ APP</span>
                              <span className="text-[10px] text-[#949ba4] font-medium">{t("Hoje às", "Today at")} {currentTime}</span>
                            </div>
                            <div className="text-sm leading-relaxed text-[#dbdee1] break-all">
                              {renderMessageContent()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </form>
  )
}
