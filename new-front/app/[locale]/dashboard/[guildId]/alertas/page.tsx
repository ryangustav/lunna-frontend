"use client"

import React, { use, useEffect, useRef, useState } from "react"
import { Youtube, Twitch, Rss, Trash2, Send, RefreshCw, Radio } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, type T } from "@/lib/use-t"
import { publishErrorText } from "@/lib/publish-error"

type Platform = "youtube" | "twitch" | "rss"
type Types = { video: boolean; short: boolean; live: boolean }
type Alert = {
  id: string; platform: Platform; input: string
  source: { name: string; avatar: string | null; url: string } | null
  status: "pending" | "ok" | "error"; error: string | null; post_error: string | null
  channel_id: string; role_id: string | null; message: string; types: Types; enabled: boolean
  live: boolean; last_check_at: string | null; last_post_at: string | null; test_pending: boolean
}
type Data = { alerts: Alert[]; limits: { plan: "free" | "basico" | "completo"; max: number; used: number } }
type Channel = { id: string; name: string; type: number }
type Role = { id: string; name: string; color?: number }

const PLATFORM = (t: T): Record<Platform, { label: string; icon: React.ReactNode; color: string; placeholder: string; hint: string }> => ({
  youtube: { label: "YouTube", icon: <Youtube className="h-4 w-4" />, color: "#ff0033", placeholder: t("@canal ou link do canal", "@channel or channel link"), hint: t("Vídeos, Shorts e lives. A Lunna confere a cada 5 minutos.", "Videos, Shorts and lives. Lunna checks every 5 minutes.") },
  twitch: { label: "Twitch", icon: <Twitch className="h-4 w-4" />, color: "#9146ff", placeholder: t("nome do canal ou twitch.tv/canal", "channel name or twitch.tv/channel"), hint: t("Avisa quando a live começa. A Lunna confere a cada 2 minutos.", "Posts when the stream starts. Lunna checks every 2 minutes.") },
  rss: { label: "RSS", icon: <Rss className="h-4 w-4" />, color: "#f26522", placeholder: "https://site.com/feed", hint: t("Blogs, podcasts, Reddit, notícias — qualquer site com feed RSS/Atom. A cada 10 minutos.", "Blogs, podcasts, Reddit, news: any site with an RSS/Atom feed. Every 10 minutes.") },
})
const PLAN_LABEL = (t: T) => ({ free: t("grátis", "free"), basico: t("Premium Básico", "Premium Basic"), completo: t("Premium Completo", "Premium Complete") })
const TEXT_CHANNEL = (c: Channel) => c.type === 0 || c.type === 5
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const EMPTY = { platform: "youtube" as Platform, input: "", channel_id: "", role_id: "", message: "", types: { video: true, short: true, live: true } }
const ago = (d: string | null, t: T) => {
  if (!d) return null
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000))
  const v = s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s / 60)} min` : s < 86400 ? `${Math.round(s / 3600)} h` : t(`${Math.round(s / 86400)} dias`, `${Math.round(s / 86400)} days`)
  return t(`há ${v}`, `${v} ago`)
}

function PingSelect({ value, onChange, roles }: { value: string; onChange: (v: string) => void; roles: Role[] }) {
  const t = useT()
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{t("Ninguém", "Nobody")}</option>
      <option value="everyone">@everyone</option>
      <option value="here">@here</option>
      {roles.filter((r) => r.name !== "@everyone").map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
    </select>
  )
}

function TypeChecks({ value, onChange }: { value: Types; onChange: (t: Types) => void }) {
  const t = useT()
  const opt = (k: keyof Types, label: string) => (
    <label className="flex items-center gap-2 text-[13px] text-foreground">
      <input type="checkbox" className="h-4 w-4 accent-[#7c3aed]" checked={value[k]} onChange={(e) => onChange({ ...value, [k]: e.target.checked })} /> {label}
    </label>
  )
  return <div className="flex flex-wrap gap-4">{opt("video", t("Vídeos", "Videos"))}{opt("short", "Shorts")}{opt("live", "Lives")}</div>
}

export default function SocialAlertsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [form, setForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = async () => {
    try {
      setError(null)
      const r = await api.getSocialAlerts(guildId)
      setData(r.data)
    } catch (e: any) { setError(e.message) }
  }
  useEffect(() => {
    load()
    Promise.all([api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      .then(([c, r]) => { setChannels((c?.data || []).filter(TEXT_CHANNEL)); setRoles(r?.data || []) })
      .catch(() => {})
    return () => { if (poll.current) clearTimeout(poll.current) }
  }, [guildId])

  // while the bot is still finding a channel or sending a test, refresh
  useEffect(() => {
    if (poll.current) clearTimeout(poll.current)
    if (data?.alerts.some((a) => a.status === "pending" || a.test_pending)) poll.current = setTimeout(load, 5000)
  }, [data])

  const replace = (a: Alert) => setData((d) => (d ? { ...d, alerts: d.alerts.map((x) => (x.id === a.id ? a : x)) } : d))
  const update = async (a: Alert, patch: Partial<Alert>, okMsg?: string) => {
    setBusy(a.id)
    try { const r = await api.updateSocialAlert(guildId, a.id, patch); replace(r.data); if (okMsg) toast({ title: okMsg }) }
    catch (e: any) { toast({ title: t("Não foi possível salvar", "Couldn't save"), description: e.message, variant: "destructive" }) }
    finally { setBusy(null) }
  }

  const create = async () => {
    setCreating(true)
    try {
      const r = await api.createSocialAlert(guildId, { ...form, role_id: form.role_id || null })
      setData((d) => (d ? { ...d, alerts: [...d.alerts, r.data], limits: { ...d.limits, used: d.limits.used + 1 } } : d))
      setForm({ ...EMPTY, platform: form.platform, channel_id: form.channel_id })
      toast({ title: t("Alerta criado", "Alert created"), description: t("A Lunna está procurando o canal — leva alguns segundos.", "Lunna is looking for the channel. It takes a few seconds.") })
    } catch (e: any) { toast({ title: t("Não foi possível criar", "Couldn't create"), description: e.message, variant: "destructive" }) }
    finally { setCreating(false) }
  }

  const remove = async (a: Alert) => {
    if (!window.confirm(t(`Excluir o alerta de ${a.source?.name || a.input}?`, `Delete the alert for ${a.source?.name || a.input}?`))) return
    setBusy(a.id)
    try {
      await api.deleteSocialAlert(guildId, a.id)
      setData((d) => (d ? { ...d, alerts: d.alerts.filter((x) => x.id !== a.id), limits: { ...d.limits, used: d.limits.used - 1 } } : d))
    } catch (e: any) { toast({ title: t("Não foi possível excluir", "Couldn't delete"), description: e.message, variant: "destructive" }) }
    finally { setBusy(null) }
  }

  const act = async (a: Alert, kind: "test" | "retry") => {
    setBusy(a.id)
    try {
      const r = kind === "test" ? await api.testSocialAlert(guildId, a.id) : await api.retrySocialAlert(guildId, a.id)
      replace(r.data)
      toast({ title: kind === "test" ? t("Teste a caminho", "Test on the way") : t("Procurando de novo", "Looking again"), description: kind === "test" ? t("A Lunna posta um exemplo no canal em até 1 minuto (sem mencionar ninguém).", "Lunna posts an example in the channel within 1 minute (without pinging anyone).") : undefined })
    } catch (e: any) { toast({ title: t("Não deu certo", "That didn't work"), description: e.message, variant: "destructive" }) }
    finally { setBusy(null) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />

  const full = data.limits.used >= data.limits.max
  const PLATFORMS = PLATFORM(t)
  const p = PLATFORMS[form.platform]
  const channelName = (id: string) => channels.find((c) => c.id === id)?.name

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={t("Comunidade", "Community")} title={t("Alertas de redes", "Social alerts")}
        description={t("A Lunna avisa no seu servidor quando um canal do YouTube posta vídeo, Short ou abre live, quando alguém entra ao vivo na Twitch, ou quando um site publica algo novo.", "Lunna posts in your server when a YouTube channel uploads a video or Short or goes live, when someone goes live on Twitch, or when a site publishes something new.")}
        action={<Pill tone={full ? "accent" : "neutral"}>{data.limits.used}/{data.limits.max} {t("alertas", "alerts")} · {PLAN_LABEL(t)[data.limits.plan]}</Pill>} />

      <Section title={t("Novo alerta", "New alert")} description={p.hint}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLATFORMS) as Platform[]).map((k) => (
              <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, platform: k }))}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${form.platform === k ? "text-white" : "border-border text-foreground hover:bg-secondary"}`}
                style={form.platform === k ? { background: PLATFORMS[k].color, borderColor: PLATFORMS[k].color } : undefined}>
                {PLATFORMS[k].icon} {PLATFORMS[k].label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={form.platform === "rss" ? t("Link do feed", "Feed link") : t("Canal", "Channel")}>
              <input className={inputCls} maxLength={300} value={form.input} placeholder={p.placeholder} onChange={(e) => setForm((f) => ({ ...f, input: e.target.value }))} />
            </Field>
            <Field label={t("Postar em", "Post in")}>
              <select className={inputCls} value={form.channel_id} onChange={(e) => setForm((f) => ({ ...f, channel_id: e.target.value }))}>
                <option value="">{t("Escolha um canal…", "Pick a channel…")}</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}{c.type === 5 ? t(" (anúncios)", " (announcements)") : ""}</option>)}
              </select>
            </Field>
            <Field label={t("Mencionar", "Mention")}>
              <PingSelect value={form.role_id} onChange={(v) => setForm((f) => ({ ...f, role_id: v }))} roles={roles} />
            </Field>
            {form.platform === "youtube" && (
              <Field label={t("Avisar sobre", "Post about")}><div className="flex h-10 items-center"><TypeChecks value={form.types} onChange={(t) => setForm((f) => ({ ...f, types: t }))} /></div></Field>
            )}
          </div>
          <Field label={t("Mensagem (opcional)", "Message (optional)")} hint={t("Use {canal}, {titulo} e {link}. Vazio = mensagem padrão, ex.: “🔴 {canal} está ao vivo!”", "Use {canal} (channel name), {titulo} (title) and {link}. Empty = the default message, posted in the server's language.")}>
            <input className={inputCls} maxLength={500} value={form.message} placeholder={t("📢 {canal} acabou de postar: {titulo}", "📢 {canal} just posted: {titulo}")} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton loading={creating} disabled={full || !form.input.trim() || !form.channel_id} onClick={create}>{t("Criar alerta", "Create alert")}</PrimaryButton>
            {full && <span className="text-[13px] text-amber-500">{t("Limite do plano atingido", "Plan limit reached")}{data.limits.plan !== "completo" ? t(" — com o Premium do servidor dá para ter mais.", ". Server Premium allows more.") : "."}</span>}
          </div>
        </div>
      </Section>

      {data.alerts.length === 0 && <p className="text-[14px] text-muted-foreground">{t("Nenhum alerta ainda. Crie o primeiro acima.", "No alerts yet. Create the first one above.")}</p>}

      {data.alerts.map((a, index) => {
        const meta = PLATFORMS[a.platform]
        const overLimit = index >= data.limits.max
        const draft = drafts[a.id] ?? a.message
        return (
          <div key={a.id} className={`rounded-[16px] border p-4 ${a.enabled && !overLimit ? "border-border" : "border-border opacity-70"}`}>
            <div className="flex items-center gap-3">
              {a.source?.avatar
                ? <img src={a.source.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                : <div className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: meta.color }}>{meta.icon}</div>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {a.source ? <a href={a.source.url} target="_blank" rel="noreferrer" className="hover:underline">{a.source.name}</a> : a.input}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1" style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
                  {a.status === "pending" && <span>· {t("procurando o canal…", "looking for the channel…")}</span>}
                  {a.status === "ok" && <span>· {t("conferido", "checked")} {ago(a.last_check_at, t) || t("agora", "now")}{a.last_post_at ? t(` · último aviso ${ago(a.last_post_at, t)}`, ` · last post ${ago(a.last_post_at, t)}`) : ""}</span>}
                  {a.live && <span className="inline-flex items-center gap-1 font-semibold text-red-500"><Radio className="h-3 w-3" /> {t("ao vivo agora", "live now")}</span>}
                </p>
              </div>
              <Switch checked={a.enabled} disabled={busy === a.id} onCheckedChange={(on) => update(a, { enabled: on }, on ? t("Alerta ligado", "Alert on") : t("Alerta pausado", "Alert paused"))} />
            </div>

            {a.status === "error" && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-[13px] text-amber-500">
                <span className="flex-1">{publishErrorText(a.error, t)}</span>
                <SecondaryButton disabled={busy === a.id} onClick={() => act(a, "retry")}><RefreshCw className="h-4 w-4" /> {t("Tentar de novo", "Try again")}</SecondaryButton>
              </div>
            )}
            {a.post_error && <p className="mt-3 rounded-[10px] border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-[13px] text-amber-500">{publishErrorText(a.post_error, t)}</p>}
            {overLimit && <p className="mt-3 text-[13px] text-amber-500">{t(`Pausado: acima do limite do plano atual (${data.limits.max} alertas).`, `Paused: over the current plan's limit (${data.limits.max} alerts).`)}</p>}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label={t("Postar em", "Post in")}>
                <select className={inputCls} value={a.channel_id} disabled={busy === a.id} onChange={(e) => update(a, { channel_id: e.target.value }, t("Canal alterado", "Channel changed"))}>
                  {!channelName(a.channel_id) && <option value={a.channel_id}>{t("canal removido", "deleted channel")}</option>}
                  {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </Field>
              <Field label={t("Mencionar", "Mention")}>
                <PingSelect value={a.role_id || ""} onChange={(v) => update(a, { role_id: v || null }, t("Menção alterada", "Mention changed"))} roles={roles} />
              </Field>
              {a.platform === "youtube" && (
                <Field label={t("Avisar sobre", "Post about")}><div className="flex h-10 items-center"><TypeChecks value={a.types} onChange={(t) => update(a, { types: t })} /></div></Field>
              )}
              <Field label={t("Mensagem", "Message")} hint={t("{canal}, {titulo}, {link} · vazio = padrão", "{canal}, {titulo}, {link} · empty = default")}>
                <div className="flex gap-2">
                  <input className={inputCls} maxLength={500} value={draft} placeholder={t("mensagem padrão", "default message")} onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))} />
                  {draft !== a.message && <SecondaryButton disabled={busy === a.id} onClick={() => update(a, { message: draft }, t("Mensagem salva", "Message saved")).then(() => setDrafts((d) => { const n = { ...d }; delete n[a.id]; return n }))}>{t("Salvar", "Save")}</SecondaryButton>}
                </div>
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <SecondaryButton disabled={busy === a.id || a.status !== "ok" || a.test_pending} onClick={() => act(a, "test")}>
                <Send className="h-4 w-4" /> {a.test_pending ? t("Enviando teste…", "Sending test…") : t("Enviar teste", "Send test")}
              </SecondaryButton>
              <SecondaryButton disabled={busy === a.id} onClick={() => remove(a)}><Trash2 className="h-4 w-4" /> {t("Excluir", "Delete")}</SecondaryButton>
            </div>
          </div>
        )
      })}
    </div>
  )
}
