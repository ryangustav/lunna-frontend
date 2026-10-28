"use client"

import React, { use, useEffect, useState, useRef } from "react"
import { Save, AlertTriangle, MessageSquare, Image as ImageIcon, Type, Lock, Crown, Upload, Loader2, X, Send, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"
import { serverText, pageLang } from "@/lib/server-text"

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
  // vanity URL / invite not found ("" = Lunna's default text)
  const [welcomeMsgVanity, setWelcomeMsgVanity] = useState<string>("")
  const [welcomeMsgUnknown, setWelcomeMsgUnknown] = useState<string>("")

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
  const [welcomeBannerOverlay, setWelcomeBannerOverlay] = useState<number>(55)
  const [welcomeBannerTextAlign, setWelcomeBannerTextAlign] = useState<"left" | "center" | "right">("center")
  // text colours: defaults are the bot's theme (cardTheme COLORS.muted / COLORS.text)
  const [welcomeBannerTitleColor, setWelcomeBannerTitleColor] = useState<string>("#94a1b2")
  const [welcomeBannerNameColor, setWelcomeBannerNameColor] = useState<string>("#fffffe")
  const [welcomeBannerSubColor, setWelcomeBannerSubColor] = useState<string>("#94a1b2")
  const [activeTab, setActiveTab] = useState<string>("avatar")
  const [uploadingBg, setUploadingBg] = useState(false)
  const [testing, setTesting] = useState<"join" | "leave" | null>(null)
  const [testScenario, setTestScenario] = useState<"invite" | "vanity" | "unknown">("invite")
  const bgFileInputRef = useRef<HTMLInputElement>(null)

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
          setWelcomeMsgVanity(settingsRes.welcome_msg_vanity || "")
          setWelcomeMsgUnknown(settingsRes.welcome_msg_unknown || "")

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
          setWelcomeBannerOverlay(settingsRes.welcome_banner_overlay ?? 55)
          setWelcomeBannerTextAlign(["left", "right"].includes(settingsRes.welcome_banner_text_align) ? settingsRes.welcome_banner_text_align : "center")
          setWelcomeBannerTitleColor(settingsRes.welcome_banner_title_color || "#94a1b2")
          setWelcomeBannerNameColor(settingsRes.welcome_banner_name_color || "#fffffe")
          setWelcomeBannerSubColor(settingsRes.welcome_banner_sub_color || "#94a1b2")
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

  // Everything this page edits: saved by handleSave, and sent unsaved with a test message
  const settingsPayload = () => ({
        welcome_channel: welcomeChannel || null,
        welcome_msg: welcomeMsg, // Can be empty to disable text and keep only image
        welcome_delete_time: Number(welcomeDeleteTime),
        welcome_msg_vanity: welcomeMsgVanity,
        welcome_msg_unknown: welcomeMsgUnknown,
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
        welcome_banner_font: welcomeBannerFont,
        welcome_banner_overlay: Number(welcomeBannerOverlay),
        welcome_banner_text_align: welcomeBannerTextAlign,
        welcome_banner_title_color: welcomeBannerTitleColor,
        welcome_banner_name_color: welcomeBannerNameColor,
        welcome_banner_sub_color: welcomeBannerSubColor
  })

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.updateGuildSettings(guildId, settingsPayload())

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

  // Test message: the bot posts it in the channel as you joining/leaving, using the values on screen (even unsaved)
  const handleTest = async (kind: "join" | "leave") => {
    setTesting(kind)
    try {
      const { id } = await api.sendWelcomeTest(guildId, { kind, scenario: testScenario, overrides: settingsPayload() })

      // the bot checks for tests every few seconds
      const deadline = Date.now() + 25000
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1500))
        const res = await api.getWelcomeTest(guildId, id)
        if (res.status === "done") {
          toast({
            title: t("Mensagem de teste enviada!", "Test message sent!"),
            description: t("Confira o canal configurado no Discord.", "Check the configured channel on Discord."),
          })
          return
        }
        if (res.status === "error") {
          toast({
            title: t("Não foi possível enviar o teste", "Couldn't send the test"),
            description: serverText(res.error || "Ocorreu um erro ao enviar a mensagem de teste.", pageLang()),
            variant: "destructive"
          })
          return
        }
      }
      toast({
        title: t("A Lunna não respondeu", "Lunna didn't answer"),
        description: t("Ela pode estar reiniciando. Tente de novo em alguns instantes.", "She may be restarting. Try again in a moment."),
        variant: "destructive"
      })
    } catch (err: any) {
      toast({
        title: t("Não foi possível enviar o teste", "Couldn't send the test"),
        description: err.message || t("Tente novamente.", "Try again."),
        variant: "destructive"
      })
    } finally {
      setTesting(null)
    }
  }

  // Uploads the background to the CDN; the backend saves it right away and returns the URL
  const handleBackgroundFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // lets the same file be picked again
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("Imagem muito grande", "Image too large"),
        description: t("A imagem passa de 5 MB. Envie um arquivo menor.", "The image is over 5 MB. Upload a smaller file."),
        variant: "destructive"
      })
      return
    }

    setUploadingBg(true)
    try {
      const res = await api.uploadWelcomeBackground(guildId, file)
      setWelcomeBannerBackground(res.url)
      toast({
        title: t("Imagem enviada!", "Image uploaded!"),
        description: t("O fundo do banner foi atualizado.", "The banner background was updated."),
      })
    } catch (err: any) {
      toast({
        title: t("Erro ao enviar imagem", "Couldn't upload the image"),
        description: err.message || t("Tente novamente com outro arquivo.", "Try again with another file."),
        variant: "destructive"
      })
    } finally {
      setUploadingBg(false)
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
      // same dark layer the bot draws (WelcomeBannerGenerator)
      if (welcomeBannerOverlay > 0) {
        ctx.fillStyle = `rgba(22, 22, 26, ${welcomeBannerOverlay / 100})`
        ctx.fillRect(0, 0, 800, 400)
      }
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
    // X is the texts' left edge, centre or right edge — same rule as the bot (WelcomeBannerGenerator)
    const drawText = (text: string, x: number, y: number, font: string, color: string, maxW: number) => {
      if (welcomeBannerTextAlign === 'left') maxW = Math.max(40, 800 - x - 16)
      if (welcomeBannerTextAlign === 'right') maxW = Math.max(40, x - 16)
      ctx.save()
      ctx.textAlign = welcomeBannerTextAlign
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
        .replace(/{member_count_ordinal}/g, "123rd")
        .replace(/{member_count}/g, "123")
        .replace(/{inviter_mention}/g, t("@Divulgador", "@Inviter"))
        .replace(/{inviter_name}/g, t("Divulgador", "Inviter"))
        .replace(/{inviter_tag}/g, t("Divulgador#1111", "Inviter#1111"))
        .replace(/{inviter_id}/g, "987654321098765432")
        .replace(/{valid_invites}|{inviter_invites}/g, "12")
        .replace(/{total_invites}/g, "15")
        .replace(/{fake_invites}/g, "1")
        .replace(/{leave_invites}/g, "2")
        .replace(/{bonus_invites}/g, "0")
        .replace(/{invite_code}/g, "lunna")
    }

    // 3. Draw Title
    const titleText = replaceMockPlaceholders(welcomeBannerTitleText)
    drawText(titleText, welcomeBannerTitleX, welcomeBannerTitleY, `bold ${welcomeBannerTitleSize}px "${fontName}"`, welcomeBannerTitleColor, 700)

    // 4. Draw Username
    drawText("Novo membro", welcomeBannerNameX, welcomeBannerNameY, `bold ${welcomeBannerNameSize}px "${fontName}"`, welcomeBannerNameColor, 700)

    // 5. Draw Subtitle (one line per line break, the block centred on Y — same as the bot)
    const subLines = replaceMockPlaceholders(welcomeBannerSubText).split(/\r?\n/)
    const subLineHeight = welcomeBannerSubSize * 1.25
    subLines.forEach((line, i) => {
      const y = welcomeBannerSubY + (i - (subLines.length - 1) / 2) * subLineHeight
      drawText(line, welcomeBannerSubX, y, `500 ${welcomeBannerSubSize}px "${fontName}"`, welcomeBannerSubColor, 700)
    })

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
    welcomeBannerFont,
    welcomeBannerOverlay,
    welcomeBannerTextAlign,
    welcomeBannerTitleColor,
    welcomeBannerNameColor,
    welcomeBannerSubColor
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
                  {["{user_mention}", "{username}", "{user_name}", "{user_tag}", "{user_id}", "{server_name}", "{guild_name}", "{total_members}", "{member_count}", "{member_count_ordinal}", "{inviter_mention}", "{inviter_name}", "{inviter_tag}", "{inviter_id}", "{valid_invites}", "{total_invites}", "{fake_invites}", "{leave_invites}", "{bonus_invites}", "{invite_code}"].map((variable) => (
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

          {/* Joins without a known inviter */}
          <div className="space-y-4 rounded-[14px] border border-border/60 bg-secondary/10 p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{t("Quando não há convite conhecido", "When there's no known invite")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "Enviadas no lugar da mensagem acima quando o membro entra pela URL personalizada ou quando não foi possível descobrir quem convidou. Deixe vazio para usar o texto padrão da Lunna (só quando a mensagem acima fala do convite; senão ela é mantida). Usam as mesmas variáveis.",
                  "Sent instead of the message above when the member joins through the vanity URL or when we couldn't find who invited them. Leave empty for Lunna's default text (only when the message above mentions the invite; otherwise it's kept). Same variables."
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">{t("Entrou pela URL personalizada", "Joined through the vanity URL")}</label>
              <textarea
                value={welcomeMsgVanity}
                onChange={(e) => setWelcomeMsgVanity(e.target.value)}
                disabled={!welcomeChannel}
                rows={2}
                maxLength={2000}
                placeholder={t("Bem-vindo {user_mention} ao servidor! Você entrou pela URL personalizada.", "Welcome {user_mention} to the server! You joined through the vanity URL.")}
                className="w-full rounded-[10px] border border-border bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">{t("Convite desconhecido", "Unknown invite")}</label>
              <textarea
                value={welcomeMsgUnknown}
                onChange={(e) => setWelcomeMsgUnknown(e.target.value)}
                disabled={!welcomeChannel}
                rows={2}
                maxLength={2000}
                placeholder={t("Bem-vindo {user_mention} ao servidor! Não foi possível descobrir quem te convidou.", "Welcome {user_mention} to the server! We couldn't find out who invited you.")}
                className="w-full rounded-[10px] border border-border bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* Test message */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={testScenario}
              onChange={(e) => setTestScenario(e.target.value as "invite" | "vanity" | "unknown")}
              disabled={!welcomeChannel || testing !== null}
              className="h-10 rounded-[10px] border border-border bg-secondary/30 px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50 disabled:opacity-40"
            >
              <option value="invite" className="bg-card text-foreground">{t("Convite normal (você como convidador)", "Normal invite (you as the inviter)")}</option>
              <option value="vanity" className="bg-card text-foreground">{t("Entrou pela URL personalizada", "Joined through the vanity URL")}</option>
              <option value="unknown" className="bg-card text-foreground">{t("Convite desconhecido", "Unknown invite")}</option>
            </select>
            <Button
              type="button"
              variant="outline"
              disabled={!welcomeChannel || testing !== null}
              onClick={() => handleTest("join")}
              className="h-10 rounded-full text-sm font-semibold"
            >
              {testing === "join" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {testing === "join" ? t("Enviando teste...", "Sending test...") : t("Enviar mensagem de teste", "Send test message")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground -mt-3">
            {t("A Lunna envia no canal escolhido como se você tivesse acabado de entrar, com o que está na tela (mesmo sem salvar), incluindo o banner.", "Lunna posts it in the chosen channel as if you had just joined, using what's on screen (even unsaved), banner included.")}
          </p>
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

                {/* Text colours, one per text */}
                <div className="space-y-3 rounded-[14px] border border-border/60 bg-secondary/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{t("Cores do Texto", "Text colors")}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setWelcomeBannerTitleColor("#94a1b2")
                        setWelcomeBannerNameColor("#fffffe")
                        setWelcomeBannerSubColor("#94a1b2")
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("Restaurar padrão", "Reset to default")}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      [t("Título", "Title"), welcomeBannerTitleColor, setWelcomeBannerTitleColor],
                      [t("Nome", "Name"), welcomeBannerNameColor, setWelcomeBannerNameColor],
                      [t("Subtítulo", "Subtitle"), welcomeBannerSubColor, setWelcomeBannerSubColor],
                    ] as const).map(([label, value, setter]) => (
                      <label key={label} className="flex items-center gap-3 rounded-[10px] border border-border bg-secondary/30 px-3 py-2 cursor-pointer">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-foreground">{label}</span>
                          <span className="block text-[11px] font-mono uppercase text-muted-foreground">{value}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls Column */}
              <div className="xl:col-span-5 space-y-6">
                {/* Background settings */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                    <span>{t("Imagem de Fundo (Opcional)", "Background image (optional)")}</span>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingBg}
                      onClick={() => bgFileInputRef.current?.click()}
                      className="h-11 shrink-0 rounded-[10px] text-sm font-semibold"
                    >
                      {uploadingBg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {uploadingBg ? t("Enviando...", "Uploading...") : t("Enviar imagem", "Upload image")}
                    </Button>
                    {welcomeBannerBackground && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingBg}
                        onClick={() => setWelcomeBannerBackground("")}
                        title={t("Remover fundo", "Remove background")}
                        className="h-11 w-11 shrink-0 rounded-[10px] p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      ref={bgFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleBackgroundFile}
                      className="hidden"
                    />
                  </div>
                  <input
                    type="url"
                    value={welcomeBannerBackground}
                    onChange={(e) => setWelcomeBannerBackground(e.target.value)}
                    placeholder={t("ou cole um link direto: https://exemplo.com/fundo.png", "or paste a direct link: https://example.com/background.png")}
                    className="w-full h-11 rounded-[10px] border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
                  />
                  {welcomeBannerBackground && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>{t("Escurecer fundo", "Darken background")}</span>
                        <span className="text-primary">{welcomeBannerOverlay}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={welcomeBannerOverlay}
                        onChange={(e) => setWelcomeBannerOverlay(Number(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {t("Uma camada escura por cima da imagem para o texto ficar legível. Use 0% se a sua arte já tem espaço para o texto.", "A dark layer over the image so the text stays readable. Use 0% if your art already has room for the text.")}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("PNG, JPG, WebP ou GIF até 5 MB. Recortada para 800x400. Links de alguns sites podem ser bloqueados pelo próprio site; prefira enviar a imagem.", "PNG, JPG, WebP or GIF up to 5 MB, cropped to 800x400. Some sites block their images from being used elsewhere, so uploading is more reliable.")}
                  </p>
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

                {/* Text alignment: X of each text is its left edge, centre or right edge */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlignCenter className="h-4 w-4 text-indigo-400" />
                    <span>{t("Alinhamento do Texto", "Text alignment")}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-secondary/30 p-1 rounded-[10px]">
                    {([
                      ["left", AlignLeft, t("Esquerda", "Left")],
                      ["center", AlignCenter, t("Meio", "Center")],
                      ["right", AlignRight, t("Direita", "Right")],
                    ] as const).map(([value, Icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setWelcomeBannerTextAlign(value)}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${welcomeBannerTextAlign === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("Vale para o título, o nome e o subtítulo. A posição X de cada um passa a ser a borda escolhida do texto.", "Applies to the title, name and subtitle. Each one's X position becomes that edge of the text.")}
                  </p>
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
                        <textarea
                          value={welcomeBannerSubText}
                          onChange={(e) => setWelcomeBannerSubText(e.target.value)}
                          placeholder="Have a great moment here!"
                          rows={3}
                          className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50 resize-none"
                        />
                        <p className="text-[11px] text-muted-foreground">{t("Aperte Enter para quebrar a linha.", "Press Enter for a new line.")}</p>
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
                  {["{user_mention}", "{username}", "{user_name}", "{user_tag}", "{user_id}", "{server_name}", "{guild_name}", "{total_members}", "{member_count}", "{member_count_ordinal}", "{inviter_mention}", "{inviter_name}", "{inviter_tag}", "{inviter_id}", "{valid_invites}", "{total_invites}", "{fake_invites}", "{leave_invites}", "{bonus_invites}", "{invite_code}"].map((variable) => (
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

          {/* Test message */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              disabled={!leaveChannel || testing !== null}
              onClick={() => handleTest("leave")}
              className="h-10 rounded-full text-sm font-semibold"
            >
              {testing === "leave" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {testing === "leave" ? t("Enviando teste...", "Sending test...") : t("Enviar mensagem de teste", "Send test message")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("A Lunna envia no canal escolhido como se você tivesse saído, com o que está na tela (mesmo sem salvar). Nenhum convite é contado.", "Lunna posts it in the chosen channel as if you had left, using what's on screen (even unsaved). No invite is counted.")}
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
