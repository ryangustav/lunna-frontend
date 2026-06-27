"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Ban, Trash2, Plus, MessageSquare } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

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
        title: "Sucesso!",
        description: "Configurações do bloqueador de convites salvas com sucesso.",
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

  const handleAddChannel = () => {
    if (!selectedChannel) return
    if (antiInviteWhitelist.includes(selectedChannel)) {
      toast({
        title: "Canal já adicionado",
        description: "Este canal já está na lista de permissões.",
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
    const text = antiInviteMessage || "<:lunna_policial:1520449039416426626> | Hey, @user you can't send invites in this server."
    
    // Split by @user or {user} to style the mention
    const parts = text.split(/(@user|{user})/g)
    return parts.map((part, index) => {
      if (part === "@user" || part === "{user}") {
        return (
          <span 
            key={index} 
            className="bg-[#5865F2]/30 text-[#dee0fc] rounded px-1 py-0.5 text-xs font-semibold cursor-pointer hover:bg-[#5865F2] hover:text-white transition-colors"
          >
            @Membro
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
            <Ban className="mr-3 h-8 w-8 text-primary" />
            Bloqueador de Convites
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitore o reino impedindo que convites de outras vilas sejam compartilhados em seus canais de chat.
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
        
        {/* Painel Principal de Configurações */}
        <div className="rounded-[2.5rem] border border-border/60 bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

          {/* Switch 1: Ativar Bloqueador */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/40">
            <div className="space-y-1">
              <label htmlFor="invite-toggle" className="text-sm font-bold text-foreground cursor-pointer select-none">
                Ativar Bloqueador de Convites
              </label>
              <p className="text-xs text-muted-foreground">Liga ou desliga o filtro contra links de outros servidores.</p>
            </div>
            <input
              id="invite-toggle"
              type="checkbox"
              checked={antiInviteEnabled}
              onChange={(e) => setAntiInviteEnabled(e.target.checked)}
              className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
            />
          </div>

          {antiInviteEnabled && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Switch 2: Permitir convites do servidor atual */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/40">
                <div className="space-y-1">
                  <label htmlFor="allow-guild-toggle" className="text-sm font-bold text-foreground cursor-pointer select-none">
                    Permitir compartilhar convites do servidor atual
                  </label>
                  <p className="text-xs text-muted-foreground">O bot não apagará convites que direcionam para este mesmo servidor.</p>
                </div>
                <input
                  id="allow-guild-toggle"
                  type="checkbox"
                  checked={allowGuildInvites}
                  onChange={(e) => setAllowGuildInvites(e.target.checked)}
                  className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                />
              </div>

              {/* Switch 3: Deletar mensagem ao detectar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/40">
                <div className="space-y-1">
                  <label htmlFor="delete-msg-toggle" className="text-sm font-bold text-foreground cursor-pointer select-none">
                    Deletar a mensagem do usuário quando um invite for detectado
                  </label>
                  <p className="text-xs text-muted-foreground">Remove automaticamente a mensagem infratora do chat.</p>
                </div>
                <input
                  id="delete-msg-toggle"
                  type="checkbox"
                  checked={deleteMessage}
                  onChange={(e) => setDeleteMessage(e.target.checked)}
                  className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                />
              </div>

              {/* Whitelist section */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-bold text-foreground">Canais aonde são permitidos enviar convites</label>
                <div className="flex gap-2">
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="flex-1 h-12 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="" className="bg-card text-muted-foreground">Selecione um canal...</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddChannel}
                    className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {/* Whitelist Container / Empty state */}
                <div className="rounded-2xl border border-border bg-secondary/15 p-4 min-h-[14rem]">
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
                      <p className="text-sm font-bold text-muted-foreground">Vazio, igualzinho a minha conta bancária</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {antiInviteWhitelist.map((chId) => {
                        const channel = channels.find(c => c.id === chId)
                        return (
                          <div key={chId} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-secondary/30 text-sm font-semibold">
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
                <label className="text-sm font-bold text-foreground">Sanção Automática (Além de deletar)</label>
                <select
                  value={antiInviteAction}
                  onChange={(e) => setAntiInviteAction(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-3.5 text-xs font-bold text-foreground outline-none transition focus:border-primary/50"
                >
                  <option value="none" className="bg-card text-foreground">Nenhuma (Apenas Deletar)</option>
                  <option value="warn" className="bg-card text-foreground">Dar Aviso (Warn)</option>
                  <option value="mute" className="bg-card text-foreground">Silenciar por 1 Hora (Mute)</option>
                  <option value="kick" className="bg-card text-foreground">Expulsar (Kick)</option>
                  <option value="ban" className="bg-card text-foreground">Banir (Ban)</option>
                </select>
              </div>

              {/* Switch 4: Enviar mensagem ao usuário */}
              <div className="border-t border-border/40 pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/40">
                  <div className="space-y-1">
                    <label htmlFor="send-warn-toggle" className="text-sm font-bold text-foreground cursor-pointer select-none">
                      Enviar uma mensagem ao usuário quando ele enviar um invite
                    </label>
                    <p className="text-xs text-muted-foreground">Dispara um aviso no chat alertando sobre a restrição.</p>
                  </div>
                  <input
                    id="send-warn-toggle"
                    type="checkbox"
                    checked={sendWarnMessage}
                    onChange={(e) => setSendWarnMessage(e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                  />
                </div>

                {sendWarnMessage && (
                  <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Mensagem
                        </label>
                      </div>
                      <input
                        type="text"
                        value={antiInviteMessage}
                        onChange={(e) => setAntiInviteMessage(e.target.value)}
                        placeholder="<:lunna_policial:1520449039416426626> | Hey, @user you can't send invites in this server."
                        className="w-full h-12 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                      />
                    </div>

                    {/* Discord message preview rendering */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted-foreground">Pré-visualização do Alerta</span>
                      <div className="bg-[#313338] text-[#dbdee1] p-4 rounded-xl border border-black/35 font-sans space-y-1 select-none">
                        <div className="flex items-start gap-3.5">
                          {/* Cute avatar simulation */}
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-extrabold text-sm shadow-md">
                            LN
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#f2f3f5] hover:underline cursor-pointer">Lunna</span>
                              <span className="bg-[#5865f2] text-[10px] text-white px-1 py-0.5 rounded font-bold uppercase scale-90">✔ APP</span>
                              <span className="text-[10px] text-[#949ba4] font-medium">Hoje às {currentTime}</span>
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
