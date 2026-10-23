"use client"

import React, { use, useEffect, useMemo, useRef, useState } from "react"
import {
  Plus, Trash2, Search, Trophy, UserPlus, AlertTriangle, LogOut, Gift, CheckCircle2, Link2, RotateCcw, Loader2, Minus,
} from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, useNumberLocale, type T } from "@/lib/use-t"

type Config = {
  enabled: boolean
  fake_account_days: number
  self_invite_fake: boolean
  subtract_fakes: boolean
  subtract_leaves: boolean
  log_channel_id: string | null
  join_message: string
  leave_message: string
  announce_unknown: boolean
  role_rewards: { invites: number; role_id: string }[]
  stack_roles: boolean
  members_can_view: boolean
}
type Stats = { total: number; fake: number; leaves: number; bonus: number; valid: number }
type Row = Stats & { user_id: string; name: string; avatar: string | null }
type Join = {
  user_id: string; user_name: string; user_avatar: string | null; inviter_id: string | null; inviter_name: string
  code: string | null; source: "invite" | "vanity" | "unknown"; left: boolean; fake: boolean; joined_at: string; account_age_days: number
}
type Overview = {
  config: Config
  summary: { joins: number; invite: number; vanity: number; unknown: number; fake: number; left: number; inviters: number; last_30_days: number }
  daily: { day: string; joins: number; fake: number }[]
  leaderboard: Row[]
  recent: Join[]
}
type MemberDetail = {
  user_id: string; name: string; avatar: string | null; stats: Stats
  invited_by: { inviter_id: string | null; inviter_name: string; code: string | null; source: string; joined_at: string } | null
  invited: Join[]
  bonuses: { id: string; amount: number; by: string | null; reason: string; at: string }[]
}

const DEFAULTS: Config = {
  enabled: false, fake_account_days: 7, self_invite_fake: true, subtract_fakes: true, subtract_leaves: true,
  log_channel_id: null, join_message: "", leave_message: "", announce_unknown: true, role_rewards: [], stack_roles: true, members_can_view: true,
}

// the bot's defaults (InviteTrackerService) — an empty message posts these, in the server's language
const DEFAULT_JOIN = (t: T) => t(
  "📥 {user_mention} entrou, convidado(a) por **{inviter_name}**, que agora tem **{inviter_invites}** convite(s).",
  "📥 {user_mention} joined, invited by **{inviter_name}**, who now has **{inviter_invites}** invite(s).")
const DEFAULT_LEAVE = (t: T) => t(
  "📤 **{username}** saiu. Tinha sido convidado(a) por **{inviter_name}**, que agora tem **{inviter_invites}** convite(s).",
  "📤 **{username}** left. They were invited by **{inviter_name}**, who now has **{inviter_invites}** invite(s).")
const VARIABLES = ["{user_mention}", "{username}", "{user_id}", "{inviter_mention}", "{inviter_name}", "{inviter_id}", "{valid_invites}", "{total_invites}", "{fake_invites}", "{leave_invites}", "{bonus_invites}", "{invite_code}", "{server_name}", "{member_count}"]

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"

function useRelative() {
  const locale = useNumberLocale()
  return (iso: string | null) => {
    if (!iso) return ""
    const diff = (new Date(iso).getTime() - Date.now()) / 1000
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const steps: [number, Intl.RelativeTimeFormatUnit][] = [[60, "second"], [3600, "minute"], [86400, "hour"], [2592000, "day"], [31536000, "month"]]
    for (let i = 0; i < steps.length; i++) {
      if (Math.abs(diff) < steps[i][0]) return rtf.format(Math.round(diff / (i ? steps[i - 1][0] : 1)), steps[i][1])
    }
    return rtf.format(Math.round(diff / 31536000), "year")
  }
}

function Avatar({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full bg-secondary object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/15 text-[12px] font-bold text-[#a78bfa]" style={{ width: size, height: size }}>
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  )
}

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}{label}</div>
      <div className="mt-2 text-[24px] font-bold leading-none tracking-[-0.5px] text-foreground tabular-nums">{value}</div>
      {hint && <div className="mt-1.5 text-[12px] text-muted-foreground">{hint}</div>}
    </div>
  )
}

/** Joins per day, last 30 days. Single series: the title names it; hover shows the day's numbers. */
function JoinsChart({ daily }: { daily: Overview["daily"] }) {
  const t = useT()
  const locale = useNumberLocale()
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...daily.map((d) => d.joins))
  const fmt = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(locale, { day: "2-digit", month: "short" })
  const h = hover !== null ? daily[hover] : null
  return (
    <div>
      <div className="mb-3 flex h-5 items-center justify-between text-[12px] text-muted-foreground">
        <span>{h ? fmt(h.day) : t("Últimos 30 dias", "Last 30 days")}</span>
        {h && (
          <span className="tabular-nums text-foreground">
            <b>{h.joins}</b> {t("entrada(s)", "join(s)")}{h.fake > 0 && <span className="text-muted-foreground"> · {h.fake} fake</span>}
          </span>
        )}
      </div>
      <div className="relative flex h-28 items-end gap-[2px] border-b border-border" role="img" aria-label={t("Entradas por dia nos últimos 30 dias", "Joins per day over the last 30 days")}
        onMouseLeave={() => setHover(null)}>
        {daily.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 cursor-default items-end" onMouseEnter={() => setHover(i)}>
            <div
              className={`w-full rounded-t-[4px] transition-opacity ${hover === null || hover === i ? "opacity-100" : "opacity-40"}`}
              style={{ height: d.joins ? `${Math.max(4, (d.joins / max) * 100)}%` : "2px", background: d.joins ? "#7c3aed" : "var(--border)" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{fmt(daily[0]?.day)}</span>
        <span>{t("pico", "peak")}: {max}</span>
        <span>{t("hoje", "today")}</span>
      </div>
    </div>
  )
}

function JoinStatus({ j }: { j: Join }) {
  const t = useT()
  if (j.fake) return <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-500"><AlertTriangle className="h-3.5 w-3.5" />fake</span>
  if (j.left) return <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground"><LogOut className="h-3.5 w-3.5" />{t("saiu", "left")}</span>
  return <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" />{t("no servidor", "in server")}</span>
}

function Breakdown({ s }: { s: Stats }) {
  const t = useT()
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground tabular-nums">
      <span title={t("Total", "Total")}>📥 {s.total}</span>
      <span title="Fakes">⚠️ {s.fake}</span>
      <span title={t("Saídas", "Leaves")}>🚪 {s.leaves}</span>
      <span title={t("Bônus", "Bonus")}>🎁 {s.bonus >= 0 ? "+" : ""}{s.bonus}</span>
    </span>
  )
}

export default function InvitesPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const nl = useNumberLocale()
  const rel = useRelative()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Overview | null>(null)
  const [cfg, setCfg] = useState<Config>(DEFAULTS)
  const [saved, setSaved] = useState<Config>(DEFAULTS)
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [tab, setTab] = useState("overview")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [resetAll, setResetAll] = useState(false)
  const [newReward, setNewReward] = useState({ invites: 5, role_id: "" })
  const joinRef = useRef<HTMLTextAreaElement>(null)
  const leaveRef = useRef<HTMLTextAreaElement>(null)

  const apply = (o: Overview) => {
    setData(o)
    const c = { ...DEFAULTS, ...(o.config || {}) }
    setCfg(c)
    setSaved(c)
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [o, c, r] = await Promise.all([api.getInvites(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      apply(o.data)
      setChannels((c?.data || []).filter((ch: any) => ch.type === 0 || ch.type === 5))
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || t("Não foi possível carregar os convites.", "Couldn't load the invites."))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  const set = <K extends keyof Config>(key: K, value: Config[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const dirty = JSON.stringify(cfg) !== JSON.stringify(saved)
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || t("cargo removido", "deleted role")

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.updateInvites(guildId, cfg)
      apply(res.data)
      toast({ title: t("Convites salvos", "Invites saved"), description: t("As contagens já usam as novas regras, inclusive para entradas antigas.", "Counts already use the new rules, old joins included.") })
    } catch (err: any) {
      toast({ title: t("Erro ao salvar", "Couldn't save"), description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const doResetAll = async () => {
    try {
      const res = await api.resetInvites(guildId)
      apply(res.data)
      toast({ title: t("Convites zerados", "Invites reset"), description: t("Quem convidou quem continua registrado.", "Who invited whom stays recorded.") })
    } catch (err: any) {
      toast({ title: t("Erro", "Error"), description: err.message, variant: "destructive" })
    }
  }

  const insertVar = (ref: React.RefObject<HTMLTextAreaElement | null>, key: "join_message" | "leave_message", v: string) => {
    const el = ref.current
    const cur = cfg[key] || (key === "join_message" ? DEFAULT_JOIN(t) : DEFAULT_LEAVE(t))
    const start = el?.selectionStart ?? cur.length
    const end = el?.selectionEnd ?? cur.length
    set(key, (cur.slice(0, start) + v + cur.slice(end)).slice(0, 1000))
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + v.length, start + v.length) })
  }

  const preview = (template: string) => template
    .replace(/{user_mention}/g, t("@Novo membro", "@New member")).replace(/{username}|{user_name}/g, t("novo.membro", "new.member"))
    .replace(/{user_id}/g, "123456789012345678").replace(/{inviter_mention}/g, "@Lunnarian").replace(/{inviter_name}/g, "Lunnarian")
    .replace(/{inviter_id}/g, "987654321098765432").replace(/{valid_invites}/g, "12").replace(/{total_invites}/g, "15")
    .replace(/{fake_invites}/g, "1").replace(/{leave_invites}/g, "2").replace(/{bonus_invites}/g, "0").replace(/{invite_code}/g, "lunna")
    .replace(/{server_name}|{guild_name}/g, t("Servidor Demo", "Demo Server")).replace(/{member_count}/g, "1234")
    .replace(/\*\*(.+?)\*\*/g, "$1")

  const board = useMemo(() => {
    const rows = (data?.leaderboard || []).map((r, i) => ({ ...r, rank: i + 1 }))
    const q = query.trim().toLowerCase()
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.user_id.includes(q)) : rows
  }, [data, query])

  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState message={error || ""} onRetry={load} />
  const s = data.summary
  const pct = (n: number) => (s.joins ? `${Math.round((n / s.joins) * 100)}%` : "—")

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Comunidade", "Community")}
        title={t("Convites", "Invites")}
        description={t(
          "Descubra quem convidou cada membro, premie quem traz gente para o servidor e use convites como requisito nos sorteios. Comandos: /convites ver, /convites ranking.",
          "See who invited each member, reward the people who bring others in and use invites as a giveaway requirement. Commands: /invites view, /invites leaderboard.")}
        action={<PrimaryButton onClick={save} loading={saving} disabled={!dirty}>{dirty ? t("Salvar alterações", "Save changes") : t("Salvo", "Saved")}</PrimaryButton>}
      />

      <Section
        icon={<UserPlus />}
        title={t("Rastreador de convites", "Invite tracker")}
        description={cfg.enabled
          ? t("Ativo: anúncios, cargos por convites e /convites para os membros.", "On: announcements, invite roles and /invites for members.")
          : t("Desativado. As entradas continuam sendo registradas, então nada se perde quando você ativar.", "Off. Joins keep being recorded, so nothing is lost when you turn it on.")}
        action={<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} />}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">{t("Visão geral", "Overview")}</TabsTrigger>
          <TabsTrigger value="leaderboard">{t("Ranking", "Leaderboard")}</TabsTrigger>
          <TabsTrigger value="settings">{t("Regras e anúncios", "Rules & announcements")}</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<UserPlus />} label={t("Entradas registradas", "Recorded joins")} value={s.joins.toLocaleString(nl)} hint={t(`${s.last_30_days} nos últimos 30 dias`, `${s.last_30_days} in the last 30 days`)} />
            <StatTile icon={<Link2 />} label={t("Por convite", "Through invites")} value={pct(s.invite)} hint={t(`${s.vanity} pela URL personalizada · ${s.unknown} desconhecidas`, `${s.vanity} via vanity URL · ${s.unknown} unknown`)} />
            <StatTile icon={<AlertTriangle />} label={t("Contas fake", "Fake accounts")} value={s.fake.toLocaleString(nl)} hint={cfg.fake_account_days > 0 ? t(`menos de ${cfg.fake_account_days} dia(s) de conta`, `under ${cfg.fake_account_days} day(s) old`) : t("detecção por idade desligada", "age check off")} />
            <StatTile icon={<LogOut />} label={t("Saíram depois", "Left later")} value={pct(s.left)} hint={t(`${s.left} de ${s.joins}`, `${s.left} of ${s.joins}`)} />
          </div>

          <Section title={t("Entradas por dia", "Joins per day")}>
            <JoinsChart daily={data.daily} />
          </Section>

          <div className="grid gap-5 lg:grid-cols-2">
            <Section title={t("Top convidadores", "Top inviters")} icon={<Trophy />}
              action={data.leaderboard.length > 5 ? <button className="text-[13px] font-medium text-[#a78bfa] hover:underline" onClick={() => setTab("leaderboard")}>{t("Ver ranking", "See leaderboard")}</button> : undefined}>
              {data.leaderboard.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">{t("Ninguém convidou membros ainda.", "Nobody has invited members yet.")}</p>
              ) : (
                <ul className="-mx-2 flex flex-col">
                  {data.leaderboard.slice(0, 5).map((r, i) => (
                    <li key={r.user_id}>
                      <button onClick={() => setSelected(r.user_id)} className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left hover:bg-secondary/60">
                        <span className="w-6 text-center text-[13px] font-bold text-muted-foreground">{["🥇", "🥈", "🥉"][i] || `#${i + 1}`}</span>
                        <Avatar src={r.avatar} name={r.name} />
                        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">{r.name || r.user_id}</span>
                        <span className="text-[14px] font-bold tabular-nums text-foreground">{r.valid}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title={t("Entradas recentes", "Recent joins")} icon={<UserPlus />}>
              {data.recent.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">{t("Nenhuma entrada registrada ainda. Assim que alguém entrar, aparece aqui.", "No joins recorded yet. As soon as someone joins, they show up here.")}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {data.recent.slice(0, 8).map((j, i) => (
                    <li key={`${j.user_id}-${i}`} className="flex items-center gap-3 py-2.5">
                      <Avatar src={j.user_avatar} name={j.user_name} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-foreground">{j.user_name || j.user_id}</div>
                        <div className="truncate text-[12px] text-muted-foreground">
                          {j.inviter_id
                            ? <>{t("por", "by")} <button className="font-medium text-foreground hover:underline" onClick={() => setSelected(j.inviter_id!)}>{j.inviter_name || j.inviter_id}</button>{j.code && <> · <code>{j.code}</code></>}</>
                            : j.source === "vanity" ? t("URL personalizada", "vanity URL") : t("convite desconhecido", "unknown invite")}
                          {" · "}{rel(j.joined_at)}
                        </div>
                      </div>
                      <JoinStatus j={j} />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
          <p className="text-[12px] leading-[1.6] text-muted-foreground">
            {t("A Lunna precisa da permissão Gerenciar Servidor para ver qual convite cada membro usou. Entradas enquanto ela estava offline aparecem como desconhecidas.",
              "Lunna needs the Manage Server permission to see which invite each member used. Joins while she was offline show up as unknown.")}
          </p>
        </TabsContent>

        {/* ── Leaderboard ──────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="mt-5 flex flex-col gap-5">
          <Section
            title={t("Ranking de convites", "Invite leaderboard")}
            description={t("Clique em um membro para ver quem ele convidou, dar bônus ou zerar os convites.", "Click a member to see who they invited, give bonuses or reset their invites.")}
            action={<SecondaryButton onClick={() => setSelected("new")}><Gift className="h-4 w-4" />{t("Dar bônus", "Give bonus")}</SecondaryButton>}
          >
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} placeholder={t("Buscar por nome ou ID", "Search by name or ID")} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {board.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">{query ? t("Ninguém encontrado.", "No one found.") : t("Ninguém convidou membros ainda.", "Nobody has invited members yet.")}</p>
            ) : (
              <ul className="-mx-2 flex flex-col">
                {board.map((r) => (
                  <li key={r.user_id}>
                    <button onClick={() => setSelected(r.user_id)} className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2.5 text-left hover:bg-secondary/60">
                      <span className="w-8 text-center text-[13px] font-bold tabular-nums text-muted-foreground">{["🥇", "🥈", "🥉"][r.rank - 1] || `#${r.rank}`}</span>
                      <Avatar src={r.avatar} name={r.name} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-foreground">{r.name || r.user_id}</span>
                        <Breakdown s={r} />
                      </span>
                      <span className="text-right">
                        <span className="block text-[18px] font-bold leading-none tabular-nums text-foreground">{r.valid}</span>
                        <span className="text-[11px] text-muted-foreground">{t("válidos", "valid")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[12px] text-muted-foreground">📥 total · ⚠️ fakes · 🚪 {t("saídas", "leaves")} · 🎁 {t("bônus", "bonus")} — {t("mostra os 100 primeiros", "shows the top 100")}</p>
          </Section>

          <Section
            title={t("Zerar todos os convites", "Reset every invite")}
            description={t("Zera contagens e bônus de todo o servidor (ex.: para começar uma nova temporada). Quem convidou quem continua registrado.", "Resets counts and bonuses for the whole server (e.g. to start a new season). Who invited whom stays recorded.")}
            action={<SecondaryButton onClick={() => setResetAll(true)} className="text-red-500"><RotateCcw className="h-4 w-4" />{t("Zerar tudo", "Reset all")}</SecondaryButton>}
          />
        </TabsContent>

        {/* ── Settings ─────────────────────────────────────────── */}
        <TabsContent value="settings" className="mt-5 flex flex-col gap-5">
          <Section title={t("O que conta como convite válido", "What counts as a valid invite")}
            description={t("Válidos = total − fakes − saídas + bônus. Mudanças valem também para entradas antigas.", "Valid = total − fakes − leaves + bonus. Changes apply to old joins too.")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Conta fake: menos de quantos dias?", "Fake account: younger than how many days?")}
                hint={cfg.fake_account_days > 0
                  ? t(`Contas criadas há menos de ${cfg.fake_account_days} dia(s) contam como fake. 0 desliga.`, `Accounts created less than ${cfg.fake_account_days} day(s) ago count as fake. 0 turns it off.`)
                  : t("Desligado: a idade da conta não importa.", "Off: account age doesn't matter.")}>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={90} value={Math.min(90, cfg.fake_account_days)} onChange={(e) => set("fake_account_days", Number(e.target.value))} className="flex-1 accent-[#7c3aed]" />
                  <input type="number" min={0} max={365} className={`${inputCls} w-20`} value={cfg.fake_account_days} onChange={(e) => set("fake_account_days", Math.max(0, Math.min(365, Number(e.target.value) || 0)))} />
                </div>
              </Field>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {([
                ["subtract_fakes", t("Descontar fakes", "Subtract fakes"), t("Contas fake não contam como convite válido.", "Fake accounts don't count as valid invites.")],
                ["subtract_leaves", t("Descontar saídas", "Subtract leaves"), t("Se o convidado sair do servidor, o convite deixa de valer.", "If the invited member leaves, the invite stops counting.")],
                ["self_invite_fake", t("Auto-convite é fake", "Self-invites are fake"), t("Entrar pelo próprio convite (ex.: depois de sair) não conta.", "Joining through your own invite (e.g. after leaving) doesn't count.")],
              ] as const).map(([key, label, hint]) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
                  <span>
                    <span className="block text-[14px] text-foreground">{label}</span>
                    <span className="block text-[12px] text-muted-foreground">{hint}</span>
                  </span>
                  <Switch checked={cfg[key]} onCheckedChange={(v) => set(key, v)} />
                </label>
              ))}
            </div>
          </Section>

          <Section title={t("Anúncios de entrada e saída", "Join and leave announcements")}
            description={t("Um canal com quem entrou, por qual convite e quantos convites a pessoa tem. Independe da mensagem de boas-vindas.", "A channel with who joined, through which invite and how many invites the inviter has. Separate from the welcome message.")}>
            <Field label={t("Canal", "Channel")}>
              <select className={inputCls} value={cfg.log_channel_id || ""} onChange={(e) => set("log_channel_id", e.target.value || null)}>
                <option value="">{t("Não anunciar", "Don't announce")}</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </Field>
            {cfg.log_channel_id && (
              <div className="mt-5 flex flex-col gap-5">
                {([["join_message", joinRef, t("Mensagem de entrada", "Join message"), DEFAULT_JOIN(t)], ["leave_message", leaveRef, t("Mensagem de saída", "Leave message"), DEFAULT_LEAVE(t)]] as const).map(([key, ref, label, def]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-foreground">{label}</span>
                      {cfg[key] && <button className="text-[12px] text-muted-foreground hover:text-foreground" onClick={() => set(key, "")}>{t("Usar padrão", "Use default")}</button>}
                    </div>
                    <textarea ref={ref} rows={2} maxLength={1000} className={`${inputCls} h-auto py-2`} placeholder={def} value={cfg[key]} onChange={(e) => set(key, e.target.value)} />
                    <div className="rounded-[10px] border border-border bg-secondary/40 px-3 py-2 text-[13px] text-foreground">
                      <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">{t("Prévia", "Preview")}</span>
                      {preview(cfg[key] || def)}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES.map((v) => (
                    <button key={v} type="button" onClick={() => insertVar(document.activeElement === leaveRef.current ? leaveRef : joinRef, document.activeElement === leaveRef.current ? "leave_message" : "join_message", v)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="rounded-lg border border-[#7c3aed]/20 bg-[#7c3aed]/10 px-2.5 py-1 text-[12px] font-semibold text-[#a78bfa] hover:bg-[#7c3aed]/20">
                      {v}
                    </button>
                  ))}
                </div>
                <p className="-mt-3 text-[12px] text-muted-foreground">{t("Clique numa mensagem e depois numa variável para inserir. Entradas fake ganham um aviso automático.", "Click a message, then a variable to insert it. Fake joins get an automatic note.")}</p>
                <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
                  <span>
                    <span className="block text-[14px] text-foreground">{t("Anunciar entradas sem convidador", "Announce joins without an inviter")}</span>
                    <span className="block text-[12px] text-muted-foreground">{t("URL personalizada ou convite que não deu para identificar.", "Vanity URL or an invite that couldn't be identified.")}</span>
                  </span>
                  <Switch checked={cfg.announce_unknown} onCheckedChange={(v) => set("announce_unknown", v)} />
                </label>
              </div>
            )}
          </Section>

          <Section title={t("Cargos por convites", "Invite roles")}
            description={t("O cargo é entregue ao atingir o número de convites válidos e removido se cair abaixo. O cargo da Lunna precisa estar acima deles.", "The role is given on reaching the number of valid invites and removed if it drops below. Lunna's role must be above them.")}>
            {cfg.role_rewards.length > 0 && (
              <ul className="-mx-2 mb-4 divide-y divide-border">
                {[...cfg.role_rewards].sort((a, b) => a.invites - b.invites).map((r) => (
                  <li key={r.role_id} className="flex items-center justify-between gap-3 px-2 py-2.5 text-[14px]">
                    <span>
                      <span className="text-muted-foreground">{r.invites} {t("convite(s)", "invite(s)")}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">@{roleName(r.role_id)}</span>
                    </span>
                    <button aria-label={t("Remover", "Remove")} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      onClick={() => set("role_rewards", cfg.role_rewards.filter((x) => x.role_id !== r.role_id))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label={t("Convites", "Invites")} className="sm:w-28">
                <input type="number" min={1} max={100000} className={inputCls} value={newReward.invites} onChange={(e) => setNewReward((n) => ({ ...n, invites: Number(e.target.value) }))} />
              </Field>
              <Field label={t("Cargo", "Role")} className="flex-1">
                <select className={inputCls} value={newReward.role_id} onChange={(e) => setNewReward((n) => ({ ...n, role_id: e.target.value }))}>
                  <option value="">{t("Selecione um cargo", "Select a role")}</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </Field>
              <SecondaryButton disabled={!newReward.role_id || cfg.role_rewards.length >= 25} onClick={() => {
                set("role_rewards", [...cfg.role_rewards.filter((r) => r.role_id !== newReward.role_id), { invites: Math.max(1, newReward.invites || 1), role_id: newReward.role_id }])
                setNewReward({ invites: newReward.invites + 5, role_id: "" })
              }}>
                <Plus className="h-4 w-4" /> {t("Adicionar", "Add")}
              </SecondaryButton>
            </div>
            <label className="mt-5 flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">{t("Acumular cargos", "Stack roles")}</span>
                <span className="block text-[12px] text-muted-foreground">{t("Desligado: o membro fica só com o cargo da maior faixa alcançada.", "Off: the member keeps only the role of the highest tier reached.")}</span>
              </span>
              <Switch checked={cfg.stack_roles} onCheckedChange={(v) => set("stack_roles", v)} />
            </label>
          </Section>

          <Section title={t("Privacidade", "Privacy")}>
            <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">{t("Membros veem os convites dos outros", "Members can see others' invites")}</span>
                <span className="block text-[12px] text-muted-foreground">{t("Desligado: /convites ver e /convites convidados só mostram os próprios (a equipe vê tudo). O ranking continua público.", "Off: /invites view and /invites invited only show their own (staff sees everything). The leaderboard stays public.")}</span>
              </span>
              <Switch checked={cfg.members_can_view} onCheckedChange={(v) => set("members_can_view", v)} />
            </label>
          </Section>

          <Section title={t("Sorteios com convites", "Giveaways with invites")} icon={<Gift />}
            description={t("No /sorteio criar: convites_minimos exige convites válidos para participar; bonus_a_partir_de + entradas_por_convites dá entradas extras; convites_do_sorteio conta só convites feitos durante o sorteio. Os requisitos são conferidos de novo na hora de sortear.",
              "In /giveaway create: min_invites requires valid invites to enter; bonus_from_invites + invite_bonus_entries gives extra entries; giveaway_invites_only counts only invites made during the giveaway. Requirements are checked again at draw time.")} />
        </TabsContent>
      </Tabs>

      {dirty && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-[14px] border border-[#7c3aed]/40 bg-card px-4 py-3 shadow-lg">
          <span className="text-[13px] text-foreground">{t("Você tem alterações não salvas.", "You have unsaved changes.")}</span>
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setCfg(saved)}>{t("Descartar", "Discard")}</SecondaryButton>
            <PrimaryButton onClick={save} loading={saving}>{t("Salvar", "Save")}</PrimaryButton>
          </div>
        </div>
      )}

      <MemberSheet guildId={guildId} userId={selected} onClose={() => setSelected(null)} onSelect={setSelected} onChanged={() => api.getInvites(guildId).then((o) => setData(o.data)).catch(() => {})} />

      <AlertDialog open={resetAll} onOpenChange={setResetAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Zerar os convites de todo o servidor?", "Reset every invite in the server?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Todas as contagens e bônus voltam a zero. Quem convidou quem continua registrado. Isso não pode ser desfeito.", "All counts and bonuses go back to zero. Who invited whom stays recorded. This can't be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancelar", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={doResetAll} className="bg-red-600 hover:bg-red-600/90">{t("Zerar tudo", "Reset all")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Side panel: one member's invites, bonus and reset. userId "new" = pick a member first. */
function MemberSheet({ guildId, userId, onClose, onSelect, onChanged }: {
  guildId: string; userId: string | null; onClose: () => void; onSelect: (id: string) => void; onChanged: () => void
}) {
  const t = useT()
  const rel = useRelative()
  const { toast } = useToast()
  const [detail, setDetail] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(1)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [q, setQ] = useState("")
  const [results, setResults] = useState<{ id: string; name: string; username?: string; avatar: string | null }[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setDetail(null)
    setAmount(1)
    setReason("")
    setQ("")
    setResults([])
    if (!userId || userId === "new") return
    setLoading(true)
    api.getInviteMember(guildId, userId)
      .then((r) => setDetail(r.data))
      .catch((err) => toast({ title: t("Erro", "Error"), description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId, userId])

  useEffect(() => {
    if (userId !== "new" || q.trim().length < 2) { setResults([]); return }
    const h = setTimeout(() => {
      setSearching(true)
      api.searchMembers(guildId, q.trim()).then((r) => setResults(r.data || [])).catch(() => setResults([])).finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(h)
  }, [q, userId, guildId])

  const giveBonus = async (sign: 1 | -1) => {
    if (!detail || !amount) return
    setBusy(true)
    try {
      const r = await api.addInviteBonus(guildId, { user_id: detail.user_id, amount: sign * Math.abs(amount), reason })
      setDetail(r.data)
      setReason("")
      onChanged()
      toast({ title: sign > 0 ? t(`+${Math.abs(amount)} convite(s) bônus`, `+${Math.abs(amount)} bonus invite(s)`) : t(`−${Math.abs(amount)} convite(s)`, `−${Math.abs(amount)} invite(s)`), description: t(`${detail.name} agora tem ${r.data.stats.valid} válidos. Os cargos atualizam na próxima entrada/saída ou quando ele usar /convites ver.`, `${detail.name} now has ${r.data.stats.valid} valid. Roles update on the next join/leave or when they use /invites view.`) })
    } catch (err: any) {
      toast({ title: t("Erro", "Error"), description: err.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    if (!detail) return
    try {
      await api.resetInvites(guildId, detail.user_id)
      const r = await api.getInviteMember(guildId, detail.user_id)
      setDetail(r.data)
      onChanged()
      toast({ title: t("Convites zerados", "Invites reset") })
    } catch (err: any) {
      toast({ title: t("Erro", "Error"), description: err.message, variant: "destructive" })
    }
  }

  const s = detail?.stats
  return (
    <Sheet open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {userId === "new" ? (
          <>
            <SheetHeader>
              <SheetTitle>{t("Dar bônus", "Give bonus")}</SheetTitle>
              <SheetDescription>{t("Busque o membro pelo nome ou cole o ID.", "Search the member by name or paste their ID.")}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input autoFocus className={`${inputCls} pl-9`} placeholder={t("Nome ou ID", "Name or ID")} value={q} onChange={(e) => setQ(e.target.value)} />
                {searching && <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
              </div>
              <ul className="flex flex-col">
                {results.map((m) => (
                  <li key={m.id}>
                    <button onClick={() => onSelect(m.id)} className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left hover:bg-secondary/60">
                      <Avatar src={m.avatar} name={m.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-foreground">{m.name}</span>
                        {m.username && <span className="block truncate text-[12px] text-muted-foreground">@{m.username}</span>}
                      </span>
                    </button>
                  </li>
                ))}
                {q.trim().length >= 2 && !searching && results.length === 0 && <li className="py-4 text-center text-[13px] text-muted-foreground">{t("Ninguém encontrado.", "No one found.")}</li>}
              </ul>
            </div>
          </>
        ) : loading || !detail || !s ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar src={detail.avatar} name={detail.name} size={48} />
                <div className="min-w-0">
                  <SheetTitle className="truncate">{detail.name || detail.user_id}</SheetTitle>
                  <SheetDescription className="truncate">
                    {detail.invited_by?.inviter_id
                      ? t(`Convidado por ${detail.invited_by.inviter_name || detail.invited_by.inviter_id}`, `Invited by ${detail.invited_by.inviter_name || detail.invited_by.inviter_id}`)
                      : detail.invited_by?.source === "vanity" ? t("Entrou pela URL personalizada", "Joined through the vanity URL") : t("Convite de entrada desconhecido", "Unknown join invite")}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 pb-6">
              <div className="rounded-[14px] border border-border bg-secondary/30 p-4">
                <div className="text-[12px] font-medium text-muted-foreground">{t("Convites válidos", "Valid invites")}</div>
                <div className="mt-1 text-[32px] font-bold leading-none tabular-nums text-foreground">{s.valid}</div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {([["📥", t("Total", "Total"), s.total], ["⚠️", "Fakes", s.fake], ["🚪", t("Saídas", "Leaves"), s.leaves], ["🎁", t("Bônus", "Bonus"), s.bonus]] as const).map(([e, l, v]) => (
                    <div key={l} className="rounded-[10px] bg-card px-1 py-2">
                      <div className="text-[15px] font-semibold tabular-nums text-foreground">{e} {l === t("Bônus", "Bonus") && Number(v) > 0 ? "+" : ""}{v}</div>
                      <div className="text-[11px] text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-foreground">{t("Ajustar bônus", "Adjust bonus")}</span>
                <div className="flex gap-2">
                  <input type="number" min={1} max={10000} className={`${inputCls} w-24`} value={amount} onChange={(e) => setAmount(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))} />
                  <input className={inputCls} maxLength={200} placeholder={t("Motivo (opcional)", "Reason (optional)")} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <PrimaryButton className="flex-1" loading={busy} onClick={() => giveBonus(1)}><Plus className="h-4 w-4" />{t("Dar", "Give")}</PrimaryButton>
                  <SecondaryButton className="flex-1" disabled={busy} onClick={() => giveBonus(-1)}><Minus className="h-4 w-4" />{t("Tirar", "Take")}</SecondaryButton>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{t("Convidou", "Invited")}</span>
                  <Pill>{detail.invited.length}{detail.invited.length >= 50 ? "+" : ""}</Pill>
                </div>
                {detail.invited.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">{t("Ninguém entrou pelos convites dessa pessoa.", "No one joined through their invites.")}</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {detail.invited.map((j, i) => (
                      <li key={`${j.user_id}-${i}`} className="flex items-center gap-3 py-2">
                        <Avatar src={j.user_avatar} name={j.user_name} size={26} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground">{j.user_name || j.user_id}</span>
                          <span className="block text-[11px] text-muted-foreground">{rel(j.joined_at)}{j.fake && ` · ${t(`conta de ${j.account_age_days} dia(s)`, `${j.account_age_days}-day-old account`)}`}</span>
                        </span>
                        <JoinStatus j={j} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {detail.bonuses.length > 0 && (
                <div>
                  <span className="mb-2 block text-[13px] font-medium text-foreground">{t("Histórico de bônus", "Bonus history")}</span>
                  <ul className="flex flex-col divide-y divide-border">
                    {detail.bonuses.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                        <span className="min-w-0 truncate text-muted-foreground">{b.reason || t("Sem motivo", "No reason")} · {rel(b.at)}</span>
                        <span className={`font-semibold tabular-nums ${b.amount > 0 ? "text-emerald-500" : "text-red-500"}`}>{b.amount > 0 ? "+" : ""}{b.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SecondaryButton className="text-red-500" onClick={() => setConfirmReset(true)}><RotateCcw className="h-4 w-4" />{t("Zerar convites deste membro", "Reset this member's invites")}</SecondaryButton>
            </div>

            <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t(`Zerar os convites de ${detail.name}?`, `Reset ${detail.name}'s invites?`)}</AlertDialogTitle>
                  <AlertDialogDescription>{t("Contagens e bônus voltam a zero. Isso não pode ser desfeito.", "Counts and bonuses go back to zero. This can't be undone.")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancelar", "Cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={reset} className="bg-red-600 hover:bg-red-600/90">{t("Zerar", "Reset")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
