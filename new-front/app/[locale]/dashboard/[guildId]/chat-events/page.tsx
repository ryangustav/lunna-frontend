"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Check, Info, ShieldCheck, Swords, Gift, Shuffle, HelpCircle, Star, Ticket, Store, KeyRound } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/use-t"

interface Channel {
  id: string
  name: string
  type: number
}

interface Role {
  id: string
  name: string
  color?: number
}

type Frequency = "off" | "low" | "normal" | "high"

// Mirrors Lunna_Bot/src/configs/chat_events.json (frequency + anti_abuse)
const ANTI_ABUSE = { minMembers: 20, minAuthors: 3, dailyRewards: 12, dailyCoins: 3000, merchantBuys: 3 }

export default function ChatEventsPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [channels, setChannels] = useState<Channel[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [channelId, setChannelId] = useState<string>("")
  const [frequency, setFrequency] = useState<Frequency>("normal")
  const [pingRole, setPingRole] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [settingsRes, channelsRes, rolesRes] = await Promise.all([
          api.getGuildSettings(guildId),
          api.getGuildChannels(guildId),
          api.getGuildRoles(guildId),
        ])

        if (settingsRes) {
          setChannelId(settingsRes.chat_event_channel || "")
          const ce = settingsRes.chat_events || {}
          setFrequency((["off", "low", "normal", "high"].includes(ce.frequency) ? ce.frequency : "normal") as Frequency)
          setPingRole(ce.ping_role || "")
        }
        if (channelsRes?.success) {
          setChannels(channelsRes.data.filter((c: Channel) => c.type === 0 || c.type === 5))
        }
        setRoles((rolesRes?.data || []).filter((r: Role) => r.name !== "@everyone"))
      } catch (err: any) {
        console.error("Failed to load chat events settings:", err)
        setError(err.message || t("Não foi possível carregar as configurações dos eventos.", "Couldn't load the chat event settings."))
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
      await api.updateGuildSettings(guildId, {
        chat_event_channel: channelId || null,
        chat_events: { frequency, ping_role: pingRole || null },
      })
      toast({
        title: t("Salvo com sucesso!", "Saved!"),
        description: channelId && frequency !== "off"
          ? t("Os eventos vão aparecer sozinhos quando o chat estiver ativo.", "Events will appear by themselves while the chat is active.")
          : t("Os eventos de chat estão desligados neste servidor.", "Chat events are off in this server."),
      })
    } catch (err: any) {
      console.error("Failed to save chat events settings:", err)
      toast({
        title: t("Erro ao salvar", "Couldn't save"),
        description: err.message || t("Ocorreu um erro ao salvar as configurações.", "Something went wrong while saving the settings."),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const frequencies: { id: Frequency; title: string; desc: string }[] = [
    { id: "off", title: t("Desligado", "Off"), desc: t("Nenhum evento aparece", "No events appear") },
    { id: "low", title: t("Baixa", "Low"), desc: t("No máximo 1 a cada 45 min", "At most 1 every 45 min") },
    { id: "normal", title: t("Normal", "Normal"), desc: t("No máximo 1 a cada 25 min", "At most 1 every 25 min") },
    { id: "high", title: t("Alta", "High"), desc: t("No máximo 1 a cada 12 min", "At most 1 every 12 min") },
  ]

  const types = [
    { icon: <Swords className="h-4 w-4" />, name: t("Chefe de chat", "Chat boss"), desc: t("Todos atacam com a força do RPG; prêmio pelo dano.", "Everyone attacks with their RPG strength; prizes by damage.") },
    { icon: <Gift className="h-4 w-4" />, name: t("Baú", "Chest"), desc: t("Quem clicar primeiro leva.", "First to click takes it.") },
    { icon: <Shuffle className="h-4 w-4" />, name: t("Palavra embaralhada", "Scrambled word"), desc: t("Quem desembaralhar primeiro ganha.", "First to unscramble wins.") },
    { icon: <HelpCircle className="h-4 w-4" />, name: t("Quiz relâmpago", "Lightning quiz"), desc: t("Todos que acertarem ganham.", "Everyone who gets it right wins.") },
    { icon: <Star className="h-4 w-4" />, name: t("Chuva de estrelas", "Star shower"), desc: t("Os 5 primeiros ganham.", "The first 5 win.") },
    { icon: <Ticket className="h-4 w-4" />, name: t("Sorteio relâmpago", "Lightning raffle"), desc: t("Sorte, não velocidade.", "Luck, not speed.") },
    { icon: <Store className="h-4 w-4" />, name: t("Mercador ambulante", "Wandering merchant"), desc: t("Materiais e ovos com desconto.", "Discounted materials and eggs.") },
    { icon: <KeyRound className="h-4 w-4" />, name: t("Baú com cadeado", "Locked chest"), desc: t("Responda o enigma para abrir.", "Solve the riddle to open it.") },
  ]

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
        <h3 className="text-[15px] font-bold text-foreground">{t("Falha de Conexão", "Connection failed")}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          {t("Tentar Novamente", "Try again")}
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
            {t("Eventos no chat", "Chat events")}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl font-medium">
            {t("Chefes, baús, quizzes e outros minijogos que aparecem sozinhos quando o chat está movimentado, com prêmios do RPG da Lunna.", "Bosses, chests, quizzes and other mini games that appear by themselves while the chat is busy, with prizes from Lunna's RPG.")}
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
        {/* Card 1: channel */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm hover:border-violet-500/30 transition-colors duration-300">
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">1</span>
              {t("Canal dos eventos", "Event channel")}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {t("Onde os eventos aparecem. A Lunna precisa poder enviar mensagens e imagens nele.", "Where events appear. Lunna needs to be able to send messages and images there.")}
            </p>
          </div>
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full h-12 rounded-[10px] border border-border bg-secondary/20 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50"
          >
            <option value="" className="bg-card text-muted-foreground">{t("Nenhum (eventos desligados)", "None (events off)")}</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id} className="bg-card text-foreground">#{ch.name}</option>
            ))}
          </select>
        </div>

        {/* Card 2: frequency */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm hover:border-violet-500/30 transition-colors duration-300">
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">2</span>
              {t("Frequência", "Frequency")}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {t("Os eventos só aparecem com o chat ativo, então em horários parados nada acontece. Nos fins de semana com evento da Lunna, eles aparecem mais e pagam mais.", "Events only appear while the chat is active, so nothing happens in quiet hours. On weekends with a Lunna event they show up more often and pay more.")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {frequencies.map((f) => (
              <div
                key={f.id}
                onClick={() => setFrequency(f.id)}
                className={`cursor-pointer rounded-[14px] border p-4 transition-all duration-200 ${frequency === f.id ? "border-violet-500 bg-violet-500/10" : "border-border bg-secondary/10 hover:border-border/80"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{f.title}</span>
                  {frequency === f.id && <Check className="h-4 w-4 text-violet-400" />}
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: ping role */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm hover:border-violet-500/30 transition-colors duration-300">
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">3</span>
              {t("Cargo para avisar", "Role to notify")}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {t("Opcional: a Lunna marca este cargo quando um evento aparece. Dica: use um cargo que as pessoas escolhem receber (por exemplo, em Cargos por botão).", "Optional: Lunna pings this role when an event appears. Tip: use a role people opt into (for example with Button roles).")}
            </p>
          </div>
          <select
            value={pingRole}
            onChange={(e) => setPingRole(e.target.value)}
            className="w-full h-12 rounded-[10px] border border-border bg-secondary/20 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-violet-500/50"
          >
            <option value="" className="bg-card text-muted-foreground">{t("Nenhum cargo", "No role")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id} className="bg-card text-foreground">@{r.name}</option>
            ))}
          </select>
        </div>

        {/* Card 4: what can appear */}
        <div className="rounded-[14px] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400 text-sm font-semibold">4</span>
              {t("Eventos que podem aparecer", "Events that can appear")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {types.map((ty) => (
              <div key={ty.name} className="flex items-start gap-3 rounded-[10px] border border-border/50 bg-secondary/10 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-violet-500/10 text-violet-400">{ty.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ty.name}</p>
                  <p className="text-xs text-muted-foreground">{ty.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[14px] bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">{t("Regras justas para todos os servidores", "Fair rules for every server")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  `As moedas da Lunna valem em todos os servidores, então: os eventos só aparecem em servidores com ${ANTI_ABUSE.minMembers}+ membros e pelo menos ${ANTI_ABUSE.minAuthors} pessoas conversando; cada pessoa ganha prêmios de até ${ANTI_ABUSE.dailyRewards} eventos (e ${ANTI_ABUSE.dailyCoins.toLocaleString("pt-BR")} moedas) por dia, somando todos os servidores; e faz no máximo ${ANTI_ABUSE.merchantBuys} compras por dia nos mercadores.`,
                  `Lunna's coins are shared by every server, so: events only appear in servers with ${ANTI_ABUSE.minMembers}+ members and at least ${ANTI_ABUSE.minAuthors} people chatting; each person gets prizes from up to ${ANTI_ABUSE.dailyRewards} events (and ${ANTI_ABUSE.dailyCoins.toLocaleString("en-US")} coins) a day across all servers; and makes at most ${ANTI_ABUSE.merchantBuys} merchant purchases a day.`
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[14px] bg-secondary/30 border border-border/40 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">{t("Quer ver como fica?", "Want to see how it looks?")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("No Discord, use /eventos testar para mostrar um evento de teste (sem prêmios) e /eventos ranking para ver quem mais participou na semana.", "On Discord, use /eventos test to show a test event (no prizes) and /eventos ranking to see who took part the most this week.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
