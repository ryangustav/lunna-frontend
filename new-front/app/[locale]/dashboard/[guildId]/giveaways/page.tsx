"use client"

import React, { use, useEffect, useState } from "react"
import { Plus, Gift, Users, Trophy, Square, RotateCcw, Ban, ExternalLink, Loader2, Settings2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, useNumberLocale } from "@/lib/use-t"

type Giveaway = {
  id: string
  status: "running" | "ended" | "cancelled"
  prize: string
  description: string
  channel_id: string
  message_id: string | null
  host_id: string
  winners_count: number
  winners: { id: string; name: string; avatar: string | null }[]
  entry_count: number
  ends_at: string
  ended_at: string | null
  created_at: string
  ping_role_id: string | null
  requirements: { min_level?: number; min_account_days?: number; min_member_days?: number; min_invites?: number; invites_since_start?: boolean; required_role_id?: string | null; blocked_role_id?: string | null }
  bonus_roles: { role_id: string; extra: number }[]
  invite_bonus: { invites: number; extra: number }[]
  pending_action: "end" | "cancel" | "reroll" | null
}

type Form = {
  prize: string
  description: string
  channel_id: string
  duration: number
  unit: "minutes" | "hours" | "days"
  winners_count: number
  ping_role_id: string
  image_url: string
  color: string
  dm_winners: boolean
  required_role_id: string
  blocked_role_id: string
  min_level: number
  min_account_days: number
  min_member_days: number
  min_invites: number
  invites_since_start: boolean
  bonus_role_id: string
  bonus_role_extra: number
  invite_bonus_invites: number
  invite_bonus_extra: number
}

const EMPTY: Form = {
  prize: "", description: "", channel_id: "", duration: 1, unit: "days", winners_count: 1, ping_role_id: "", image_url: "",
  color: "#7c3aed", dm_winners: true, required_role_id: "", blocked_role_id: "", min_level: 0, min_account_days: 0,
  min_member_days: 0, min_invites: 0, invites_since_start: false, bonus_role_id: "", bonus_role_extra: 1,
  invite_bonus_invites: 0, invite_bonus_extra: 1,
}

const UNIT_MIN = { minutes: 1, hours: 60, days: 1440 }
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"

function useRelative() {
  const locale = useNumberLocale()
  return (iso: string | null) => {
    if (!iso) return ""
    const diff = (new Date(iso).getTime() - Date.now()) / 1000
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const steps: [number, Intl.RelativeTimeFormatUnit, number][] = [[60, "second", 1], [3600, "minute", 60], [86400, "hour", 3600], [2592000, "day", 86400]]
    for (const [limit, unit, div] of steps) if (Math.abs(diff) < limit) return rtf.format(Math.round(diff / div), unit)
    return rtf.format(Math.round(diff / 2592000), "month")
  }
}

function Avatar({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full bg-secondary object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/15 text-[11px] font-bold text-[#a78bfa]" style={{ width: size, height: size }}>
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  )
}

function requirementSummary(g: Giveaway, t: (pt: string, en: string) => string) {
  const r = g.requirements || {}
  const parts: string[] = []
  if (r.required_role_id) parts.push(t("cargo obrigatório", "required role"))
  if (r.blocked_role_id) parts.push(t("cargo bloqueado", "blocked role"))
  if (r.min_level) parts.push(`${t("nível", "level")} ${r.min_level}+`)
  if (r.min_account_days) parts.push(`${t("conta", "account")} ${r.min_account_days}d+`)
  if (r.min_member_days) parts.push(`${t("no servidor", "in server")} ${r.min_member_days}d+`)
  if (r.min_invites) parts.push(`${r.min_invites} ${t("convites", "invites")}${r.invites_since_start ? ` (${t("do sorteio", "during")})` : ""}`)
  if (g.bonus_roles?.length) parts.push(t("bônus de cargo", "role bonus"))
  if (g.invite_bonus?.length) parts.push(t("bônus de convites", "invite bonus"))
  return parts
}

export default function GiveawaysPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const nl = useNumberLocale()
  const rel = useRelative()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [list, setList] = useState<Giveaway[]>([])
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [tab, setTab] = useState("running")
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ g: Giveaway; action: "end" | "cancel" | "reroll" } | null>(null)
  const [rerollCount, setRerollCount] = useState(1)

  const refresh = async () => {
    const r = await api.getGiveaways(guildId)
    setList(r.data || [])
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [, c, r] = await Promise.all([refresh(), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      setChannels((c?.data || []).filter((ch: any) => ch.type === 0 || ch.type === 5))
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || t("Não foi possível carregar os sorteios.", "Couldn't load the giveaways."))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  // While something is waiting for the bot (posting or a requested action), keep the list fresh
  const waiting = list.some((g) => g.pending_action || (g.status === "running" && !g.message_id))
  useEffect(() => {
    if (!waiting) return
    const h = setInterval(() => refresh().catch(() => {}), 5000)
    return () => clearInterval(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, guildId])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const channelName = (id: string) => channels.find((c) => c.id === id)?.name || t("canal removido", "deleted channel")
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || t("cargo removido", "deleted role")

  const create = async () => {
    setSaving(true)
    try {
      const payload = {
        prize: form.prize,
        description: form.description,
        channel_id: form.channel_id,
        duration_minutes: form.duration * UNIT_MIN[form.unit],
        winners_count: form.winners_count,
        ping_role_id: form.ping_role_id || null,
        image_url: form.image_url,
        color: form.color,
        dm_winners: form.dm_winners,
        requirements: {
          required_role_id: form.required_role_id || null,
          blocked_role_id: form.blocked_role_id || null,
          min_level: form.min_level,
          min_account_days: form.min_account_days,
          min_member_days: form.min_member_days,
          min_invites: form.min_invites,
          invites_since_start: form.invites_since_start,
        },
        bonus_role_id: form.bonus_role_id || null,
        bonus_role_extra: form.bonus_role_extra,
        invite_bonus: { invites: form.invite_bonus_invites, extra: form.invite_bonus_extra },
      }
      await api.createGiveaway(guildId, payload)
      toast({ title: t("Sorteio criado", "Giveaway created"), description: t("A Lunna publica a mensagem no canal em alguns segundos.", "Lunna posts the message in the channel in a few seconds.") })
      setCreating(false)
      setForm(EMPTY)
      setTab("running")
      await refresh()
    } catch (err: any) {
      toast({ title: t("Não foi possível criar", "Couldn't create"), description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const act = async (g: Giveaway, action: "end" | "cancel" | "reroll", count = 1) => {
    setBusyId(g.id)
    try {
      await api.giveawayAction(guildId, g.id, action, count)
      toast({
        title: action === "end" ? t("Encerramento pedido", "Ending requested")
          : action === "cancel" ? t("Cancelamento pedido", "Cancel requested")
          : t("Novo sorteio pedido", "Reroll requested"),
        description: t("A Lunna aplica em alguns segundos.", "Lunna applies it in a few seconds."),
      })
      await refresh()
    } catch (err: any) {
      toast({ title: t("Erro", "Error"), description: err.message, variant: "destructive" })
    } finally {
      setBusyId(null)
      setConfirm(null)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const running = list.filter((g) => g.status === "running")
  const ended = list.filter((g) => g.status !== "running")
  const shown = tab === "running" ? running : ended

  const status = (g: Giveaway) => {
    if (g.pending_action) return <Pill tone="accent"><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t("processando", "processing")}</Pill>
    if (g.status === "running" && !g.message_id) return <Pill tone="accent"><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t("publicando", "posting")}</Pill>
    if (g.status === "running") return <Pill tone="success">{t("em andamento", "running")}</Pill>
    if (g.status === "cancelled") return <Pill>{t("cancelado", "cancelled")}</Pill>
    return <Pill>{t("encerrado", "ended")}</Pill>
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Comunidade", "Community")}
        title={t("Sorteios", "Giveaways")}
        description={t(
          "Crie sorteios com requisitos e bônus de convites, acompanhe a participação e encerre, cancele ou re-sorteie quando precisar.",
          "Create giveaways with requirements and invite bonuses, follow the entries and end, cancel or reroll when needed.")}
        action={<PrimaryButton onClick={() => setCreating(true)}><Plus className="h-4 w-4" />{t("Novo sorteio", "New giveaway")}</PrimaryButton>}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] border border-border bg-card p-4">
          <div className="text-[12px] font-medium text-muted-foreground">{t("Em andamento", "Running")}</div>
          <div className="mt-1.5 text-[24px] font-bold tabular-nums text-foreground">{running.length}</div>
        </div>
        <div className="rounded-[14px] border border-border bg-card p-4">
          <div className="text-[12px] font-medium text-muted-foreground">{t("Participantes", "Entries")}</div>
          <div className="mt-1.5 text-[24px] font-bold tabular-nums text-foreground">{running.reduce((a, g) => a + g.entry_count, 0).toLocaleString(nl)}</div>
        </div>
        <div className="rounded-[14px] border border-border bg-card p-4">
          <div className="text-[12px] font-medium text-muted-foreground">{t("Encerrados", "Ended")}</div>
          <div className="mt-1.5 text-[24px] font-bold tabular-nums text-foreground">{ended.length}</div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="running">{t("Em andamento", "Running")} ({running.length})</TabsTrigger>
          <TabsTrigger value="ended">{t("Encerrados", "Ended")} ({ended.length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-5">
          {shown.length === 0 ? (
            <Section>
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Gift className="h-8 w-8 text-[#7c3aed]" />
                <p className="text-[15px] font-semibold text-foreground">{tab === "running" ? t("Nenhum sorteio em andamento", "No giveaway running") : t("Nenhum sorteio encerrado ainda", "No ended giveaways yet")}</p>
                {tab === "running" && <PrimaryButton onClick={() => setCreating(true)}><Plus className="h-4 w-4" />{t("Criar o primeiro", "Create the first one")}</PrimaryButton>}
              </div>
            </Section>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((g) => {
                const busy = busyId === g.id || !!g.pending_action
                const link = g.message_id ? `https://discord.com/channels/${guildId}/${g.channel_id}/${g.message_id}` : null
                const reqs = requirementSummary(g, t)
                return (
                  <li key={g.id} className="rounded-[14px] border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[16px] font-semibold text-foreground">{g.prize}</h3>
                          {status(g)}
                        </div>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          #{channelName(g.channel_id)} · {g.status === "running"
                            ? <>{t("termina", "ends")} {rel(g.ends_at)}</>
                            : <>{t("encerrado", "ended")} {rel(g.ended_at || g.ends_at)}</>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-right">
                        <div>
                          <div className="flex items-center justify-end gap-1 text-[18px] font-bold tabular-nums text-foreground"><Users className="h-4 w-4 text-muted-foreground" />{g.entry_count.toLocaleString(nl)}</div>
                          <div className="text-[11px] text-muted-foreground">{t("participantes", "entries")}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-end gap-1 text-[18px] font-bold tabular-nums text-foreground"><Trophy className="h-4 w-4 text-muted-foreground" />{g.winners.length}/{g.winners_count}</div>
                          <div className="text-[11px] text-muted-foreground">{t("vencedores", "winners")}</div>
                        </div>
                      </div>
                    </div>

                    {g.status !== "running" && g.winners.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#a78bfa]" />
                        {g.winners.map((w) => (
                          <span key={w.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-0.5 pr-3 pl-0.5 text-[13px] font-medium text-foreground">
                            <Avatar src={w.avatar} name={w.name} size={22} />
                            {w.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {reqs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {reqs.map((r) => <span key={r} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">{r}</span>)}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      {g.status === "running" && (
                        <>
                          <SecondaryButton disabled={busy} onClick={() => setConfirm({ g, action: "end" })}><Square className="h-4 w-4" />{t("Encerrar agora", "End now")}</SecondaryButton>
                          <SecondaryButton disabled={busy} className="text-red-500" onClick={() => setConfirm({ g, action: "cancel" })}><Ban className="h-4 w-4" />{t("Cancelar", "Cancel")}</SecondaryButton>
                        </>
                      )}
                      {g.status === "ended" && g.winners.length > 0 && (
                        <SecondaryButton disabled={busy} onClick={() => { setRerollCount(1); setConfirm({ g, action: "reroll" }) }}><RotateCcw className="h-4 w-4" />{t("Re-sortear", "Reroll")}</SecondaryButton>
                      )}
                      {link && (
                        <a href={link} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-[#a78bfa] hover:underline">
                          {t("Ver no Discord", "View on Discord")}<ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* Create */}
      <Sheet open={creating} onOpenChange={(o) => !saving && setCreating(o)}>
        <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle>{t("Novo sorteio", "New giveaway")}</SheetTitle>
            <SheetDescription>{t("A mensagem é publicada no canal escolhido pela Lunna.", "The message is posted in the chosen channel by Lunna.")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            <Field label={t("Prêmio", "Prize")}>
              <input className={inputCls} maxLength={200} placeholder={t("Ex.: Nitro de 1 mês", "E.g. 1 month of Nitro")} value={form.prize} onChange={(e) => set("prize", e.target.value)} />
            </Field>
            <Field label={t("Descrição (opcional)", "Description (optional)")} hint={t("Regras ou como o prêmio será entregue.", "Rules or how the prize will be delivered.")}>
              <textarea rows={2} maxLength={1000} className={`${inputCls} h-auto py-2`} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Canal", "Channel")}>
                <select className={inputCls} value={form.channel_id} onChange={(e) => set("channel_id", e.target.value)}>
                  <option value="">{t("Selecione um canal", "Select a channel")}</option>
                  {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </Field>
              <Field label={t("Vencedores", "Winners")}>
                <input type="number" min={1} max={20} className={inputCls} value={form.winners_count} onChange={(e) => set("winners_count", Math.min(20, Math.max(1, Number(e.target.value) || 1)))} />
              </Field>
            </div>

            <Field label={t("Duração", "Duration")}>
              <div className="flex gap-2">
                <input type="number" min={1} className={`${inputCls} w-28`} value={form.duration} onChange={(e) => set("duration", Math.max(1, Number(e.target.value) || 1))} />
                <select className={`${inputCls} flex-1`} value={form.unit} onChange={(e) => set("unit", e.target.value as Form["unit"])}>
                  <option value="minutes">{t("minutos", "minutes")}</option>
                  <option value="hours">{t("horas", "hours")}</option>
                  <option value="days">{t("dias", "days")}</option>
                </select>
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Mencionar cargo", "Ping role")} hint={t("Notificado ao abrir o sorteio.", "Notified when the giveaway opens.")}>
                <select className={inputCls} value={form.ping_role_id} onChange={(e) => set("ping_role_id", e.target.value)}>
                  <option value="">{t("Ninguém", "Nobody")}</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </Field>
              <Field label={t("Cor", "Color")}>
                <input type="color" className="h-10 w-full rounded-[10px] border border-border bg-background p-1" value={form.color} onChange={(e) => set("color", e.target.value)} />
              </Field>
            </div>

            <Field label={t("Imagem (opcional)", "Image (optional)")} hint={t("Link https://", "https:// link")}>
              <input className={inputCls} placeholder="https://" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
            </Field>

            <div className="flex flex-col gap-3 rounded-[14px] border border-border p-4">
              <span className="text-[13px] font-semibold text-foreground">{t("Requisitos", "Requirements")}</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("Cargo obrigatório", "Required role")}>
                  <select className={inputCls} value={form.required_role_id} onChange={(e) => set("required_role_id", e.target.value)}>
                    <option value="">{t("Nenhum", "None")}</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>
                </Field>
                <Field label={t("Cargo bloqueado", "Blocked role")}>
                  <select className={inputCls} value={form.blocked_role_id} onChange={(e) => set("blocked_role_id", e.target.value)}>
                    <option value="">{t("Nenhum", "None")}</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>
                </Field>
                <Field label={t("Nível mínimo", "Minimum level")}>
                  <input type="number" min={0} max={500} className={inputCls} value={form.min_level} onChange={(e) => set("min_level", Number(e.target.value) || 0)} />
                </Field>
                <Field label={t("Idade da conta (dias)", "Account age (days)")}>
                  <input type="number" min={0} max={3650} className={inputCls} value={form.min_account_days} onChange={(e) => set("min_account_days", Number(e.target.value) || 0)} />
                </Field>
                <Field label={t("Tempo no servidor (dias)", "Time in server (days)")}>
                  <input type="number" min={0} max={3650} className={inputCls} value={form.min_member_days} onChange={(e) => set("min_member_days", Number(e.target.value) || 0)} />
                </Field>
                <Field label={t("Convites válidos mínimos", "Minimum valid invites")}>
                  <input type="number" min={0} max={10000} className={inputCls} value={form.min_invites} onChange={(e) => set("min_invites", Number(e.target.value) || 0)} />
                </Field>
              </div>
              {form.min_invites > 0 && (
                <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-3 py-2.5">
                  <span className="text-[13px] text-foreground">{t("Contar só convites feitos durante o sorteio", "Count only invites made during the giveaway")}</span>
                  <Switch checked={form.invites_since_start} onCheckedChange={(v) => set("invites_since_start", v)} />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-[14px] border border-border p-4">
              <span className="text-[13px] font-semibold text-foreground">{t("Bônus de entradas", "Entry bonuses")}</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("Cargo com bônus", "Role with bonus")}>
                  <select className={inputCls} value={form.bonus_role_id} onChange={(e) => set("bonus_role_id", e.target.value)}>
                    <option value="">{t("Nenhum", "None")}</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>
                </Field>
                <Field label={t("Entradas extras (cargo)", "Extra entries (role)")}>
                  <input type="number" min={1} max={10} className={inputCls} value={form.bonus_role_extra} onChange={(e) => set("bonus_role_extra", Number(e.target.value) || 1)} />
                </Field>
                <Field label={t("A partir de convites válidos", "From valid invites")} hint={t("0 desliga.", "0 turns it off.")}>
                  <input type="number" min={0} max={10000} className={inputCls} value={form.invite_bonus_invites} onChange={(e) => set("invite_bonus_invites", Number(e.target.value) || 0)} />
                </Field>
                <Field label={t("Entradas extras (convites)", "Extra entries (invites)")}>
                  <input type="number" min={1} max={50} className={inputCls} value={form.invite_bonus_extra} onChange={(e) => set("invite_bonus_extra", Number(e.target.value) || 1)} />
                </Field>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">{t("Avisar vencedores na DM", "DM the winners")}</span>
              </span>
              <Switch checked={form.dm_winners} onCheckedChange={(v) => set("dm_winners", v)} />
            </label>
          </div>

          <SheetFooter className="border-t border-border px-6 py-4">
            <SecondaryButton onClick={() => setCreating(false)} disabled={saving}>{t("Cancelar", "Cancel")}</SecondaryButton>
            <PrimaryButton loading={saving} disabled={!form.prize.trim() || !form.channel_id} onClick={create}>
              <Settings2 className="h-4 w-4" />{t("Criar sorteio", "Create giveaway")}
            </PrimaryButton>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirm end / cancel / reroll */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "end" && t("Encerrar o sorteio agora?", "End the giveaway now?")}
              {confirm?.action === "cancel" && t("Cancelar o sorteio?", "Cancel the giveaway?")}
              {confirm?.action === "reroll" && t("Re-sortear vencedores?", "Reroll winners?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "end" && t("Os vencedores são sorteados agora, entre quem cumpre os requisitos.", "Winners are drawn now, among those who meet the requirements.")}
              {confirm?.action === "cancel" && t("Ninguém é sorteado e a mensagem é marcada como cancelada.", "Nobody is drawn and the message is marked as cancelled.")}
              {confirm?.action === "reroll" && t("Novos vencedores são sorteados. Os anteriores não entram de novo.", "New winners are drawn. Previous winners can't be drawn again.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirm?.action === "reroll" && (
            <Field label={t("Quantos novos vencedores", "How many new winners")}>
              <input type="number" min={1} max={20} className={inputCls} value={rerollCount} onChange={(e) => setRerollCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} />
            </Field>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Voltar", "Back")}</AlertDialogCancel>
            <AlertDialogAction
              className={confirm?.action === "cancel" ? "bg-red-600 hover:bg-red-600/90" : ""}
              onClick={(e) => { e.preventDefault(); if (confirm) act(confirm.g, confirm.action, confirm.action === "reroll" ? rerollCount : 1) }}
            >
              {confirm?.action === "end" && t("Encerrar", "End")}
              {confirm?.action === "cancel" && t("Cancelar sorteio", "Cancel giveaway")}
              {confirm?.action === "reroll" && t("Re-sortear", "Reroll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
