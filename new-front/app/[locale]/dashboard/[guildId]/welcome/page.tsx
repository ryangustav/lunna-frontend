"use client"

import React, { use, useEffect, useState, useRef } from "react"
import { Save, AlertTriangle, MessageSquare, Image as ImageIcon, Type, Lock, Crown } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

interface Channel {
  id: string
  name: string
  type: number
}

export default function WelcomePage({
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

  // Config states
  const [welcomeChannel, setWelcomeChannel] = useState<string>("")
  const [welcomeMsg, setWelcomeMsg] = useState<string>("Bem-vindo {user_mention} ao servidor!")
  const [welcomeDeleteTime, setWelcomeDeleteTime] = useState<number>(0)

  const [leaveChannel, setLeaveChannel] = useState<string>("")
  const [leaveMsg, setLeaveMsg] = useState<string>("Adeus {user_mention}!")
  const [leaveDeleteTime, setLeaveDeleteTime] = useState<number>(0)

  // Welcome Banner states
  const [welcomeBannerEnabled, setWelcomeBannerEnabled] = useState<boolean>(false)
  const [welcomeBannerBackground, setWelcomeBannerBackground] = useState<string>("")
  const [welcomeBannerAvatarX, setWelcomeBannerAvatarX] = useState<number>(400)
  const [welcomeBannerAvatarY, setWelcomeBannerAvatarY] = useState<number>(150)
  const [welcomeBannerAvatarSize, setWelcomeBannerAvatarSize] = useState<number>(120)
  const [welcomeBannerTitleX, setWelcomeBannerTitleX] = useState<number>(400)
  const [welcomeBannerTitleY, setWelcomeBannerTitleY] = useState<number>(280)
  const [welcomeBannerTitleText, setWelcomeBannerTitleText] = useState<string>("Welcome")
  const [welcomeBannerTitleSize, setWelcomeBannerTitleSize] = useState<number>(30)
  const [welcomeBannerNameX, setWelcomeBannerNameX] = useState<number>(400)
  const [welcomeBannerNameY, setWelcomeBannerNameY] = useState<number>(320)
  const [welcomeBannerNameSize, setWelcomeBannerNameSize] = useState<number>(38)
  const [welcomeBannerSubX, setWelcomeBannerSubX] = useState<number>(400)
  const [welcomeBannerSubY, setWelcomeBannerSubY] = useState<number>(360)
  const [welcomeBannerSubText, setWelcomeBannerSubText] = useState<string>("Have a great moment here!")
  const [welcomeBannerSubSize, setWelcomeBannerSubSize] = useState<number>(20)
  const [welcomeBannerFont, setWelcomeBannerFont] = useState<string>("Uni Sans")
  const [activeTab, setActiveTab] = useState<string>("avatar")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgImageObj, setBgImageObj] = useState<HTMLImageElement | null>(null)
  const [avatarImageObj, setAvatarImageObj] = useState<HTMLImageElement | null>(null)

  // Refs for cursor variable insertion
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null)
  const leaveTextareaRef = useRef<HTMLTextAreaElement>(null)

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
          setWelcomeChannel(settingsRes.welcome_channel || "")
          // the stored default is Portuguese: on the English site, show (and save) the English one
          const wm = settingsRes.welcome_msg !== null && settingsRes.welcome_msg !== undefined ? settingsRes.welcome_msg : "Bem-vindo {user_mention} ao servidor!"
          setWelcomeMsg(wm === "Bem-vindo {user_mention} ao servidor!" ? t(wm, "Welcome {user_mention} to the server!") : wm)
          setWelcomeDeleteTime(settingsRes.welcome_delete_time || 0)

          setLeaveChannel(settingsRes.leave_channel || "")
          const lm = settingsRes.leave_msg !== null && settingsRes.leave_msg !== undefined ? settingsRes.leave_msg : "Adeus {user_mention}!"
          setLeaveMsg(lm === "Adeus {user_mention}!" ? t(lm, "Goodbye {user_mention}!") : lm)
          setLeaveDeleteTime(settingsRes.leave_delete_time || 0)

          // Welcome banner settings
          setWelcomeBannerEnabled(settingsRes.welcome_banner_enabled ?? false)
          setWelcomeBannerBackground(settingsRes.welcome_banner_background || "")
          setWelcomeBannerAvatarX(settingsRes.welcome_banner_avatar_x ?? 400)
          setWelcomeBannerAvatarY(settingsRes.welcome_banner_avatar_y ?? 150)
          setWelcomeBannerAvatarSize(settingsRes.welcome_banner_avatar_size ?? 120)
          setWelcomeBannerTitleX(settingsRes.welcome_banner_title_x ?? 400)
          setWelcomeBannerTitleY(settingsRes.welcome_banner_title_y ?? 280)
          setWelcomeBannerTitleText(settingsRes.welcome_banner_title_text || "Welcome")
          setWelcomeBannerTitleSize(settingsRes.welcome_banner_title_size ?? 30)
          setWelcomeBannerNameX(settingsRes.welcome_banner_name_x ?? 400)
          setWelcomeBannerNameY(settingsRes.welcome_banner_name_y ?? 320)
          setWelcomeBannerNameSize(settingsRes.welcome_banner_name_size ?? 38)
          setWelcomeBannerSubX(settingsRes.welcome_banner_sub_x ?? 400)
          setWelcomeBannerSubY(settingsRes.welcome_banner_sub_y ?? 360)
          setWelcomeBannerSubText(settingsRes.welcome_banner_sub_text || "Have a great moment here!")
          setWelcomeBannerSubSize(settingsRes.welcome_banner_sub_size ?? 20)
          setWelcomeBannerFont(settingsRes.welcome_banner_font || "Uni Sans")
        }

        if (channelsRes.success) setChannels(channelsRes.data)

      } catch (err: any) {
        console.error("Failed to load settings data:", err)
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
        welcome_channel: welcomeChannel || null,
        welcome_msg: welcomeMsg, // Can be empty to disable text and keep only image
        welcome_delete_time: Number(welcomeDeleteTime),
        leave_channel: leaveChannel || null,
        leave_msg: leaveMsg,
        leave_delete_time: Number(leaveDeleteTime),

        // Welcome banner
        welcome_banner_enabled: welcomeBannerEnabled,
        welcome_banner_background: welcomeBannerBackground,
        welcome_banner_avatar_x: Number(welcomeBannerAvatarX),
        welcome_banner_avatar_y: Number(welcomeBannerAvatarY),
        welcome_banner_avatar_size: Number(welcomeBannerAvatarSize),
        welcome_banner_title_x: Number(welcomeBannerTitleX),
        welcome_banner_title_y: Number(welcomeBannerTitleY),
        welcome_banner_title_text: welcomeBannerTitleText,
        welcome_banner_title_size: Number(welcomeBannerTitleSize),
        welcome_banner_name_x: Number(welcomeBannerNameX),
        welcome_banner_name_y: Number(welcomeBannerNameY),
        welcome_banner_name_size: Number(welcomeBannerNameSize),
        welcome_banner_sub_x: Number(welcomeBannerSubX),
        welcome_banner_sub_y: Number(welcomeBannerSubY),
        welcome_banner_sub_text: welcomeBannerSubText,
        welcome_banner_sub_size: Number(welcomeBannerSubSize),
        welcome_banner_font: welcomeBannerFont
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: t("Sucesso!", "Saved!"),
        description: t("Configurações salvas e sincronizadas com sucesso.", "Settings saved."),
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

  // Smart insertion function for template variables
  const insertVariable = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    variable: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const textarea = ref.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)

    const newValue = before + variable + after
    setter(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  // Load background image preview
  useEffect(() => {
    if (!welcomeBannerBackground) {
      setBgImageObj(null)
      return
    }
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setBgImageObj(img)
    }
    img.onerror = () => {
      setBgImageObj(null)
    }
    img.src = welcomeBannerBackground
  }, [welcomeBannerBackground])

  // Load avatar image preview
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setAvatarImageObj(img)
    }
    img.src = "https://cdn.discordapp.com/embed/avatars/0.png"
  }, [])

  // Canvas drawing effect (with rounded corners and custom fonts/sizes)
  useEffect(() => {
    if (!welcomeBannerEnabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, 800, 400)

    const radius = 24
    const fontName = welcomeBannerFont

    // Clip to rounded rectangle
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(800 - radius, 0)
    ctx.quadraticCurveTo(800, 0, 800, radius)
    ctx.lineTo(800, 400 - radius)
    ctx.quadraticCurveTo(800, 400, 800 - radius, 400)
    ctx.lineTo(radius, 400)
    ctx.quadraticCurveTo(0, 400, 0, 400 - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.clip()

    // 1. Draw Background
    if (bgImageObj) {
      try {
        ctx.drawImage(bgImageObj, 0, 0, 800, 400)
      } catch (err) {
        console.error("Failed to draw bg image on preview canvas", err)
      }
      ctx.fillStyle = "rgba(15, 23, 42, 0.45)"
      ctx.fillRect(0, 0, 800, 400)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 800, 400)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e1b4b')
      gradient.addColorStop(1, '#311042')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 800, 400)

      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'
      ctx.beginPath()
      ctx.arc(100, 100, 200, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(236, 72, 153, 0.1)'
      ctx.beginPath()
      ctx.arc(700, 300, 150, 0, Math.PI * 2)
      ctx.fill()
    }

    // Outlined rounded border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(800 - radius, 0)
    ctx.quadraticCurveTo(800, 0, 800, radius)
    ctx.lineTo(800, 400 - radius)
    ctx.quadraticCurveTo(800, 400, 800 - radius, 400)
    ctx.lineTo(radius, 400)
    ctx.quadraticCurveTo(0, 400, 0, 400 - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.stroke()

    ctx.restore() // Restore from clip so avatar effects aren't cut off

    // 2. Draw Avatar
    const avatarSize = welcomeBannerAvatarSize
    const avatarX = welcomeBannerAvatarX
    const avatarY = welcomeBannerAvatarY

    ctx.save()
    ctx.shadowColor = 'rgba(99, 102, 241, 0.5)'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX, avatarY, (avatarSize / 2) - 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    if (avatarImageObj) {
      try {
        ctx.drawImage(avatarImageObj, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
      } catch (err) {
        ctx.fillStyle = '#6366f1'
        ctx.fill()
      }
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fill()
    }
    ctx.restore()

    // Helper text renderer
    const drawText = (text: string, x: number, y: number, font: string, color: string, maxW: number) => {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = font
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      ctx.fillStyle = color
      ctx.fillText(text, x, y, maxW)
      ctx.restore()
    }

    const replaceMockPlaceholders = (str: string) => {
      return str
        .replace(/{user_mention}/g, t("@Novo membro", "@New member"))
        .replace(/{username}/g, t("Novo membro", "New member"))
        .replace(/{user_name}/g, t("Novo membro", "New member"))
        .replace(/{user_tag}/g, t("novo.membro", "new.member"))
        .replace(/{user_id}/g, "123456789012345678")
        .replace(/{server_name}/g, t("Servidor Demo", "Demo Server"))
        .replace(/{guild_name}/g, t("Servidor Demo", "Demo Server"))
        .replace(/{total_members}/g, "123")
        .replace(/{member_count}/g, "123")
        .replace(/{inviter_mention}/g, t("@Divulgador", "@Inviter"))
        .replace(/{inviter_name}/g, t("Divulgador", "Inviter"))
        .replace(/{inviter_tag}/g, t("Divulgador#1111", "Inviter#1111"))
        .replace(/{inviter_id}/g, "987654321098765432")
    }

    // 3. Draw Title
    const titleText = replaceMockPlaceholders(welcomeBannerTitleText)
    drawText(titleText, welcomeBannerTitleX, welcomeBannerTitleY, `bold ${welcomeBannerTitleSize}px "${fontName}"`, '#e2e8f0', 700)

    // 4. Draw Username
    drawText("Novo membro", welcomeBannerNameX, welcomeBannerNameY, `bold ${welcomeBannerNameSize}px "${fontName}"`, '#ffffff', 700)

    // 5. Draw Subtitle
    const subText = replaceMockPlaceholders(welcomeBannerSubText)
    drawText(subText, welcomeBannerSubX, welcomeBannerSubY, `500 ${welcomeBannerSubSize}px "${fontName}"`, '#94a3b8', 700)

  }, [
    welcomeBannerEnabled,
    bgImageObj,
    avatarImageObj,
    welcomeBannerAvatarX,
    welcomeBannerAvatarY,
    welcomeBannerAvatarSize,
    welcomeBannerTitleX,
    welcomeBannerTitleY,
    welcomeBannerTitleText,
    welcomeBannerTitleSize,
    welcomeBannerNameX,
    welcomeBannerNameY,
    welcomeBannerNameSize,
    welcomeBannerSubX,
    welcomeBannerSubY,
    welcomeBannerSubText,
    welcomeBannerSubSize,
    welcomeBannerFont
  ])

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
      {/* Inject custom local font-faces */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Uni Sans';
              src: url('/fonts/UniSans-Heavy.ttf') format('truetype');
              font-weight: bold;
              font-style: normal;
            }
            @font-face {
              font-family: 'More Sugar Regular';
              src: url('/fonts/MoreSugar-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'Montserrat';
              src: url('/fonts/Montserrat-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'Montserrat';
              src: url('/fonts/Montserrat-Bold.ttf') format('truetype');
              font-weight: bold;
              font-style: normal;
            }
          `,
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-[26px] font-bold leading-tight tracking-[-0.5px] text-foreground">
            {t("Mensagens de Entrada/Saída", "Join and leave messages")}
          </h1>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.7] text-muted-foreground">
            {t("Gerencie e personalize como os membros são recebidos e quando saem do servidor.", "Customize how members are welcomed and what happens when they leave.")}
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
        {/* 1. Boas-vindas (Entrada) */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">1</span>
              {t("Mensagem de Boas-vindas (Entrada)", "Welcome message (join)")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("Configure como a Lunna cumprimentará os novos membros que entrarem no servidor. (Você pode deixar a mensagem vazia caso queira enviar apenas o banner por imagem!)", "Set how Lunna greets new members. (Leave the message empty to send only the image banner!)")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("Canal de Envio", "Channel")}</label>
              <select
                value={welcomeChannel}
                onChange={(e) => setWelcomeChannel(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value="" className="bg-card text-muted-foreground">{t("Desativado (Não enviar)", "Off (don't send)")}</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("Auto-deletar Mensagem", "Auto-delete message")}</label>
              <select
                value={welcomeDeleteTime}
                onChange={(e) => setWelcomeDeleteTime(Number(e.target.value))}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value={0} className="bg-card text-foreground">{t("Nunca apagar (Manter no histórico)", "Never delete (keep it)")}</option>
                <option value={5} className="bg-card text-foreground">{t("Apagar após 5 segundos", "Delete after 5 seconds")}</option>
                <option value={10} className="bg-card text-foreground">{t("Apagar após 10 segundos", "Delete after 10 seconds")}</option>
                <option value={30} className="bg-card text-foreground">{t("Apagar após 30 segundos", "Delete after 30 seconds")}</option>
                <option value={60} className="bg-card text-foreground">{t("Apagar após 1 minuto", "Delete after 1 minute")}</option>
                <option value={300} className="bg-card text-foreground">{t("Apagar após 5 minutos", "Delete after 5 minutes")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-foreground">{t("Mensagem de Boas-vindas", "Welcome message")}</label>
              <span className="text-xs text-muted-foreground font-medium">{t("Suporta Markdown do Discord", "Supports Discord Markdown")}</span>
            </div>
            <textarea
              ref={welcomeTextareaRef}
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              disabled={!welcomeChannel}
              rows={4}
              placeholder={t("Deixe em branco para desativar a mensagem textual e manter apenas o banner de imagem...", "Leave empty to turn off the text message and keep only the image banner...")}
              className="w-full rounded-[14px] border border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed resize-none"
            />
            
            {welcomeChannel && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <span className="text-xs font-semibold text-muted-foreground">{t("Variáveis Disponíveis (Clique para inserir):", "Variables (click to insert):")}</span>
                <div className="flex flex-wrap gap-2">
                  {["{user_mention}", "{username}", "{user_name}", "{user_tag}", "{user_id}", "{server_name}", "{guild_name}", "{total_members}", "{member_count}", "{member_count_ordinal}", "{inviter_mention}", "{inviter_name}", "{inviter_tag}", "{inviter_id}"].map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(welcomeTextareaRef, variable, welcomeMsg, setWelcomeMsg)}
                      className="rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[#7c3aed]/20 transition-all cursor-pointer animate-in fade-in duration-200"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Banner de Boas-vindas por Imagem */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-indigo-500/10 text-indigo-400 text-sm font-semibold">2</span>
                {t("Banner de Boas-vindas por Imagem", "Welcome image banner")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("Ative e personalize um banner de imagem dinâmico gerado em tempo real quando novos membros entrarem.", "Turn on and customize an image banner generated live when new members join.")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-foreground cursor-pointer select-none" htmlFor="banner-toggle">
                {t("Habilitar Banner", "Enable banner")}
              </label>
              <input
                id="banner-toggle"
                type="checkbox"
                checked={welcomeBannerEnabled}
                onChange={(e) => setWelcomeBannerEnabled(e.target.checked)}
                className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-[#7c3aed] transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
              />
            </div>
          </div>

          {welcomeBannerEnabled && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-300">
              {/* Canvas Preview Column */}
              <div className="xl:col-span-7 space-y-4">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>{t("Pré-visualização do Banner (800x400)", "Banner preview (800x400)")}</span>
                  <span className="text-xs text-muted-foreground">{t("Arraste os controles ao lado para ajustar posições", "Use the controls beside it to adjust positions")}</span>
                </label>
                <div className="relative overflow-hidden rounded-[14px] border border-border/80 bg-secondary/5 p-2">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full max-w-full aspect-[2/1] rounded-[10px] bg-slate-950 border border-slate-900 object-contain"
                  />
                </div>
                

                <p className="text-xs text-muted-foreground text-center">
                  * A imagem real gerada pelo bot usará a foto de perfil do novo membro.
                </p>
              </div>

              {/* Controls Column */}
              <div className="xl:col-span-5 space-y-6">
                {/* Background settings */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                    <span>{t("URL da Imagem de Fundo (Opcional)", "Background image URL (optional)")}</span>
                  </label>
                  <input
                    type="url"
                    value={welcomeBannerBackground}
                    onChange={(e) => setWelcomeBannerBackground(e.target.value)}
                    placeholder={t("https://exemplo.com/fundo.png (deixe vazio para gradiente premium)", "https://example.com/background.png (leave empty for the premium gradient)")}
                    className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  />
                </div>

                {/* Font selector settings */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Type className="h-4 w-4 text-indigo-400" />
                    <span>{t("Fonte do Texto (Text Font)", "Text font")}</span>
                  </label>
                  <select
                    value={welcomeBannerFont}
                    onChange={(e) => setWelcomeBannerFont(e.target.value)}
                    className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  >
                    <option value="Uni Sans">{t("Uni Sans (Padrão Lunna)", "Uni Sans (Lunna default)")}</option>
                    <option value="Montserrat">{t("Moderno Bold (Montserrat)", "Modern bold (Montserrat)")}</option>
                    <option value="More Sugar Regular">{t("Fofo Gamer (More Sugar)", "Cute gamer (More Sugar)")}</option>
                    <option value="sans-serif">{t("Clean Simples (Sans-serif)", "Simple clean (Sans-serif)")}</option>
                  </select>
                </div>

                {/* Tab layout for customization categories */}
                <div className="space-y-4 rounded-[14px] border border-border/60 bg-secondary/10 p-4">
                  {/* Category selector */}
                  <div className="grid grid-cols-4 gap-1 bg-secondary/30 p-1 rounded-[10px]">
                    {["avatar", "titulo", "nome", "sub"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveTab(cat)}
                        className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${ activeTab === cat ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground" }`}
                      >
                        {cat === "sub" ? t("Subtítulo", "Subtitle") : cat === "titulo" ? t("Título", "Title") : cat === "nome" ? t("nome", "name") : cat}
                      </button>
                    ))}
                  </div>

                  {/* Tab contents */}
                  {activeTab === "avatar" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição X", "X position")}</span>
                          <span className="text-primary">{welcomeBannerAvatarX}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={800}
                          value={welcomeBannerAvatarX}
                          onChange={(e) => setWelcomeBannerAvatarX(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição Y", "Y position")}</span>
                          <span className="text-primary">{welcomeBannerAvatarY}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={400}
                          value={welcomeBannerAvatarY}
                          onChange={(e) => setWelcomeBannerAvatarY(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Tamanho do Avatar", "Avatar size")}</span>
                          <span className="text-primary">{welcomeBannerAvatarSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={240}
                          value={welcomeBannerAvatarSize}
                          onChange={(e) => setWelcomeBannerAvatarSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                    </div>
                  )}

                  {activeTab === "titulo" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">{t("Texto do Título", "Title text")}</label>
                        <input
                          type="text"
                          value={welcomeBannerTitleText}
                          onChange={(e) => setWelcomeBannerTitleText(e.target.value)}
                          placeholder="Welcome"
                          className="w-full h-10 rounded-lg border border-border bg-secondary/20 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição X", "X position")}</span>
                          <span className="text-primary">{welcomeBannerTitleX}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={800}
                          value={welcomeBannerTitleX}
                          onChange={(e) => setWelcomeBannerTitleX(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição Y", "Y position")}</span>
                          <span className="text-primary">{welcomeBannerTitleY}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={400}
                          value={welcomeBannerTitleY}
                          onChange={(e) => setWelcomeBannerTitleY(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      {/* Font Size Selector */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Tamanho da Fonte (Título)", "Font size (title)")}</span>
                          <span className="text-primary">{welcomeBannerTitleSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={60}
                          value={welcomeBannerTitleSize}
                          onChange={(e) => setWelcomeBannerTitleSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "nome" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("O nome será preenchido dinamicamente com o nome do usuário no Discord.", "The name is filled in with the member's Discord name.")}
                      </p>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição X", "X position")}</span>
                          <span className="text-primary">{welcomeBannerNameX}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={800}
                          value={welcomeBannerNameX}
                          onChange={(e) => setWelcomeBannerNameX(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição Y", "Y position")}</span>
                          <span className="text-primary">{welcomeBannerNameY}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={400}
                          value={welcomeBannerNameY}
                          onChange={(e) => setWelcomeBannerNameY(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      {/* Font Size Selector */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Tamanho da Fonte (Nome)", "Font size (name)")}</span>
                          <span className="text-primary">{welcomeBannerNameSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={60}
                          value={welcomeBannerNameSize}
                          onChange={(e) => setWelcomeBannerNameSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "sub" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">{t("Texto do Subtítulo", "Subtitle text")}</label>
                        <input
                          type="text"
                          value={welcomeBannerSubText}
                          onChange={(e) => setWelcomeBannerSubText(e.target.value)}
                          placeholder="Have a great moment here!"
                          className="w-full h-10 rounded-lg border border-border bg-secondary/20 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição X", "X position")}</span>
                          <span className="text-primary">{welcomeBannerSubX}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={800}
                          value={welcomeBannerSubX}
                          onChange={(e) => setWelcomeBannerSubX(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Posição Y", "Y position")}</span>
                          <span className="text-primary">{welcomeBannerSubY}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={400}
                          value={welcomeBannerSubY}
                          onChange={(e) => setWelcomeBannerSubY(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>

                      {/* Font Size Selector */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-foreground">
                          <span>{t("Tamanho da Fonte (Subtítulo)", "Font size (subtitle)")}</span>
                          <span className="text-primary">{welcomeBannerSubSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={60}
                          value={welcomeBannerSubSize}
                          onChange={(e) => setWelcomeBannerSubSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Despedida (Saída) */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-red-500/10 text-red-400 text-sm font-semibold">3</span>
              {t("Mensagem de Despedida (Saída)", "Goodbye message (leave)")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("Configure a notificação de quando um membro sai do servidor.", "Set the message posted when a member leaves the server.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("Canal de Envio", "Channel")}</label>
              <select
                value={leaveChannel}
                onChange={(e) => setLeaveChannel(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value="" className="bg-card text-muted-foreground">{t("Desativado (Não enviar)", "Off (don't send)")}</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-card text-foreground">
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("Auto-deletar Mensagem", "Auto-delete message")}</label>
              <select
                value={leaveDeleteTime}
                onChange={(e) => setLeaveDeleteTime(Number(e.target.value))}
                className="w-full h-12 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
              >
                <option value={0} className="bg-card text-foreground">{t("Nunca apagar (Manter no histórico)", "Never delete (keep it)")}</option>
                <option value={5} className="bg-card text-foreground">{t("Apagar após 5 segundos", "Delete after 5 seconds")}</option>
                <option value={10} className="bg-card text-foreground">{t("Apagar após 10 segundos", "Delete after 10 seconds")}</option>
                <option value={30} className="bg-card text-foreground">{t("Apagar após 30 segundos", "Delete after 30 seconds")}</option>
                <option value={60} className="bg-card text-foreground">{t("Apagar após 1 minuto", "Delete after 1 minute")}</option>
                <option value={300} className="bg-card text-foreground">{t("Apagar após 5 minutos", "Delete after 5 minutes")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-foreground">{t("Mensagem de Despedida", "Goodbye message")}</label>
              <span className="text-xs text-muted-foreground font-medium">{t("Suporta Markdown do Discord", "Supports Discord Markdown")}</span>
            </div>
            <textarea
              ref={leaveTextareaRef}
              value={leaveMsg}
              onChange={(e) => setLeaveMsg(e.target.value)}
              disabled={!leaveChannel}
              rows={4}
              placeholder={t("Digite a mensagem de despedida...", "Type the goodbye message...")}
              className="w-full rounded-[14px] border border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed resize-none"
            />
            
            {leaveChannel && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <span className="text-xs font-semibold text-muted-foreground">{t("Variáveis Disponíveis (Clique para inserir):", "Variables (click to insert):")}</span>
                <div className="flex flex-wrap gap-2">
                  {["{user_mention}", "{username}", "{user_name}", "{user_tag}", "{user_id}", "{server_name}", "{guild_name}", "{total_members}", "{member_count}", "{member_count_ordinal}", "{inviter_mention}", "{inviter_name}", "{inviter_tag}", "{inviter_id}"].map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(leaveTextareaRef, variable, leaveMsg, setLeaveMsg)}
                      className="rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[#7c3aed]/20 transition-all cursor-pointer animate-in fade-in duration-200"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
