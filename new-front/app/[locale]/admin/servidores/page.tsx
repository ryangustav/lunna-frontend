"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, RefreshCw, Search, Crown, Users, LogOut, Ban, Link2, Copy } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Row = { id: string; name: string; icon: string | null; members: number; online: number; rank: number; plan: string }
type List = { total: number; total_members: number; matched: number; page: number; pages: number; updated_at: string; guilds: Row[] }
type Detail = {
  id: string; in_guild: boolean; name?: string; icon?: string | null; banner?: string | null; description?: string | null
  created_at?: string; joined_at?: string | null; members?: number; online?: number
  owner?: { id: string; username?: string; global_name?: string | null; avatar?: string | null }
  locale?: string | null; boosts?: number; boost_tier?: number; vanity?: string | null; features?: string[]
  roles?: number; emojis?: number; channels?: { total: number; text: number; voice: number; categories: number }
  lunna?: {
    plan: string; plan_expires_at: string | null; language: string | null; configured: boolean
    modules: Record<string, boolean>
    counts: Record<string, number>
  }
  blocked: { reason: string; at: string; by: string | null; name?: string } | null
}
type Blocked = { guild_id: string; name: string; reason: string; blocked_by: string | null; created_at: string }

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const n = (v?: number) => (v || 0).toLocaleString("pt-BR")
const dt = (v?: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—")
const PLAN: Record<string, string> = { free: "Grátis", basico: "Premium Básico", completo: "Premium Completo" }
const MODULES: Record<string, string> = {
  welcome: "Boas-vindas", leave: "Despedida", autorole: "Autorole", leveling: "Níveis", tickets: "Tickets",
  anti_spam: "Anti-spam", anti_invite: "Bloqueio de convites", anti_link: "Bloqueio de links", word_filter: "Filtro de palavras",
  trap_channel: "Canal armadilha", logs: "Logs", member_counters: "Contador de membros", brain: "Cérebro (IA)", chat_events: "Eventos no chat",
}
const COUNTS: Record<string, string> = {
  tickets_open: "Tickets abertos", tickets_total: "Tickets (total)", role_panels: "Painéis de cargos", social_alerts: "Alertas de redes",
  automations: "Automações ativas", ai_requests: "Pedidos à Lunna IA", members_with_xp: "Membros com XP",
}

/** Servers Lunna is in, biggest first. Details and leaving/blocking are audited by the backend. */
export default function AdminGuildsPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [applied, setApplied] = useState("")
  const [page, setPage] = useState(1)
  const [list, setList] = useState<List | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState<Blocked[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  const load = async (refresh = false) => {
    setLoading(true); setError(null)
    try { const r = await api.getAdminGuilds(applied, page, refresh); setList(r.data) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }
  const loadBlocked = () => api.getAdminBlockedGuilds().then((r) => setBlocked(r.data || [])).catch(() => {})
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [applied, page])
  useEffect(() => { loadBlocked() }, [])

  const unblock = async (b: Blocked) => {
    if (!window.confirm(`Desbloquear ${b.name || b.guild_id}? A Lunna volta a poder ser adicionada lá.`)) return
    try { await api.adminUnblockGuild(b.guild_id); toast({ title: "Servidor desbloqueado" }); loadBlocked() }
    catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) }
  }

  if (selected) {
    return <GuildDetail id={selected} onBack={() => setSelected(null)} onLeft={() => { setSelected(null); load(); loadBlocked() }} />
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Administração"
        title="Servidores"
        description={list ? `A Lunna está em ${n(list.total)} servidores, somando ${n(list.total_members)} membros (contagem aproximada do Discord). Atualizado ${dt(list.updated_at)}.` : "Todos os servidores da Lunna, do maior para o menor."}
        action={<SecondaryButton disabled={loading} onClick={() => load(true)}><RefreshCw className="h-4 w-4" /> Atualizar</SecondaryButton>}
      />

      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(query.trim()) }}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className={`${inputCls} pl-9`} value={query} maxLength={100} placeholder="Nome ou ID do servidor" onChange={(e) => setQuery(e.target.value)} />
        </div>
        <PrimaryButton type="submit">Buscar</PrimaryButton>
      </form>

      {error && <ErrorState message={error} onRetry={() => load()} />}
      {!list && !error && <LoadingState />}
      {list && (
        <Section>
          {list.guilds.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhum servidor encontrado.</p> : (
            <ul className="-mx-2 divide-y divide-border">
              {list.guilds.map((g) => (
                <li key={g.id}>
                  <button className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-secondary/60" onClick={() => setSelected(g.id)}>
                    <span className="w-10 shrink-0 text-right text-[12px] font-semibold text-muted-foreground">#{g.rank}</span>
                    {g.icon ? <img src={g.icon} alt="" className="h-9 w-9 shrink-0 rounded-full" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-bold text-muted-foreground">{g.name.slice(0, 1)}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-foreground">{g.name}</span>
                      <span className="block font-mono text-[11px] text-muted-foreground">{g.id}</span>
                    </span>
                    {g.plan !== "free" && <Pill tone="accent"><Crown className="mr-1 inline h-3 w-3" />{PLAN[g.plan] || g.plan}</Pill>}
                    <span className="shrink-0 text-right text-[13px]">
                      <span className="block font-semibold text-foreground">{n(g.members)}</span>
                      <span className="block text-[11px] text-muted-foreground">{n(g.online)} online</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {list.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-[13px] text-muted-foreground">
              <SecondaryButton disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Anterior</SecondaryButton>
              <span>Página {list.page} de {list.pages}{applied ? ` · ${n(list.matched)} resultado(s)` : ""}</span>
              <SecondaryButton disabled={page >= list.pages || loading} onClick={() => setPage((p) => p + 1)}>Próxima</SecondaryButton>
            </div>
          )}
        </Section>
      )}

      {blocked.length > 0 && (
        <Section title="Servidores bloqueados" description="A Lunna sai desses servidores sozinha se alguém adicioná-la de novo.">
          <ul className="-mx-2 divide-y divide-border">
            {blocked.map((b) => (
              <li key={b.guild_id} className="flex items-center gap-3 px-2 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-foreground">{b.name || b.guild_id}</span>
                  <span className="block text-[12px] text-muted-foreground">{dt(b.created_at)} · {b.reason}</span>
                </span>
                <SecondaryButton onClick={() => unblock(b)}>Desbloquear</SecondaryButton>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function GuildDetail({ id, onBack, onLeft }: { id: string; onBack: () => void; onLeft: () => void }) {
  const { toast } = useToast()
  const [data, setData] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [acting, setActing] = useState<"leave" | "block" | null>(null)
  const [inviteReason, setInviteReason] = useState("")
  const [inviting, setInviting] = useState(false)
  const [invite, setInvite] = useState<{ url: string; expires_at: string; channel: string } | null>(null)

  const load = () => { setError(null); api.getAdminGuild(id).then((r) => setData(r.data)).catch((e) => setError(e.message)) }
  useEffect(load, [id])

  const leave = async (block: boolean) => {
    if (!data) return
    if (reason.trim().length < 5) return toast({ title: "Escreva o motivo", description: "Pelo menos 5 caracteres. Ele fica no registro de ações.", variant: "destructive" })
    const what = block ? "Tirar a Lunna e BLOQUEAR" : "Tirar a Lunna de"
    if (!window.confirm(`${what} ${data.name || id}?${block ? "\n\nSe alguém adicionar a Lunna de novo, ela sai sozinha." : ""}\n\nMotivo: ${reason.trim()}`)) return
    setActing(block ? "block" : "leave")
    try {
      await api.adminLeaveGuild(id, reason.trim(), block, data.name)
      toast({ title: block ? "Servidor bloqueado" : "A Lunna saiu do servidor", description: "A ação foi registrada." })
      onLeft()
    } catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) } finally { setActing(null) }
  }

  const createInvite = async () => {
    if (inviteReason.trim().length < 5) return toast({ title: "Escreva o motivo", description: "Ex.: o número da denúncia. Ele fica no registro de ações.", variant: "destructive" })
    if (!window.confirm(`Gerar um convite para ${data?.name || id}?\n\nUso único, vale 1 hora. Fica no registro de ações.\n\nMotivo: ${inviteReason.trim()}`)) return
    setInviting(true)
    try { const r = await api.adminGuildInvite(id, inviteReason.trim()); setInvite(r.data) }
    catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) } finally { setInviting(false) }
  }

  const back = <button onClick={onBack} className="flex w-max items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Voltar para a lista</button>
  if (error) return <div className="flex flex-col gap-4">{back}<ErrorState message={error} onRetry={load} /></div>
  if (!data) return <div className="flex flex-col gap-4">{back}<LoadingState /></div>

  if (!data.in_guild) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <Section title={data.blocked?.name || id} description={`A Lunna não está mais nesse servidor. Bloqueado em ${dt(data.blocked?.at)} · ${data.blocked?.reason || ""}`} />
      </div>
    )
  }

  const l = data.lunna!
  const on = Object.entries(l.modules || {}).filter(([, v]) => v).map(([k]) => MODULES[k] || k)
  const facts: [string, React.ReactNode][] = [
    ["ID", <span key="id" className="font-mono">{data.id}</span>],
    ["Dono", data.owner?.username ? `${data.owner.global_name || data.owner.username} (@${data.owner.username}) · ${data.owner.id}` : data.owner?.id || "—"],
    ["Membros", `${n(data.members)} (${n(data.online)} online)`],
    ["Criado em", dt(data.created_at)],
    ["Lunna entrou em", dt(data.joined_at)],
    ["Canais", data.channels ? `${data.channels.total} (${data.channels.text} de texto, ${data.channels.voice} de voz, ${data.channels.categories} categorias)` : "—"],
    ["Cargos / emojis", `${data.roles ?? 0} / ${data.emojis ?? 0}`],
    ["Boosts", `${data.boosts ?? 0} (nível ${data.boost_tier ?? 0})`],
    ["Idioma do Discord", data.locale || "—"],
    ["Convite personalizado", data.vanity ? `discord.gg/${data.vanity}` : "—"],
  ]

  return (
    <div className="flex flex-col gap-5">
      {back}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        {data.banner && <img src={data.banner} alt="" className="h-32 w-full object-cover" />}
        <div className="flex items-center gap-4 p-5">
          {data.icon ? <img src={data.icon} alt="" className="h-16 w-16 rounded-full" /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-[22px] font-bold text-muted-foreground">{(data.name || "?").slice(0, 1)}</span>}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-bold text-foreground">{data.name}</h1>
            {data.description && <p className="text-[13px] text-muted-foreground">{data.description}</p>}
            <div className="mt-1 flex flex-wrap gap-2">
              <Pill tone={l.plan !== "free" ? "accent" : "neutral"}>{PLAN[l.plan] || l.plan}{l.plan_expires_at ? ` até ${dt(l.plan_expires_at)}` : ""}</Pill>
              <Pill><Users className="mr-1 inline h-3 w-3" />{n(data.members)}</Pill>
              {data.blocked && <Pill tone="accent">Bloqueado</Pill>}
            </div>
          </div>
        </div>
      </div>

      <Section title="Servidor">
        <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-2">
          {facts.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="text-foreground">{v}</dd></div>)}
        </dl>
        {!!data.features?.length && <p className="mt-4 text-[12px] text-muted-foreground">Recursos do Discord: {data.features.join(", ")}</p>}
      </Section>

      <Section title="Na Lunna" description={l.configured ? `Idioma: ${l.language === "pt" ? "Português" : l.language === "en" ? "English" : "automático (idioma do Discord)"}` : "Esse servidor nunca abriu o painel nem mudou configurações."}>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Módulos ligados</p>
        {on.length ? <div className="mb-5 flex flex-wrap gap-2">{on.map((m) => <Pill key={m} tone="success">{m}</Pill>)}</div> : <p className="mb-5 text-[13px] text-muted-foreground">Nenhum.</p>}
        <dl className="grid gap-3 text-[13px] sm:grid-cols-3">
          {Object.entries(l.counts || {}).map(([k, v]) => <div key={k} className="rounded-[10px] border border-border p-3"><dt className="text-muted-foreground">{COUNTS[k] || k}</dt><dd className="text-[18px] font-bold text-foreground">{n(v)}</dd></div>)}
        </dl>
      </Section>

      <Section title="Convite para averiguação" description="Só para denúncias: gera um convite de uso único, válido por 1 hora, para alguém da equipe entrar e verificar o servidor.">
        {invite ? (
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-secondary/40 p-3">
            <code className="min-w-0 flex-1 truncate text-[14px] text-foreground">{invite.url}</code>
            <SecondaryButton onClick={() => navigator.clipboard.writeText(invite.url).then(() => toast({ title: "Convite copiado" })).catch(() => {})}><Copy className="h-4 w-4" /> Copiar</SecondaryButton>
            <p className="w-full text-[12px] text-muted-foreground">Canal #{invite.channel || "?"} · expira {dt(invite.expires_at)} · não compartilhe fora da equipe.</p>
          </div>
        ) : (
          <>
            <Field label="Motivo (fica no registro de ações)">
              <input className={inputCls} maxLength={300} value={inviteReason} placeholder="Ex.: denúncia #123, conteúdo proibido" onChange={(e) => setInviteReason(e.target.value)} />
            </Field>
            <div className="mt-4">
              <SecondaryButton disabled={inviting} onClick={createInvite}><Link2 className="h-4 w-4" /> {inviting ? "Gerando…" : "Gerar convite"}</SecondaryButton>
            </div>
          </>
        )}
      </Section>

      <Section title="Tirar a Lunna do servidor" description="A Lunna sai na hora. Bloquear também faz ela sair sozinha se alguém adicioná-la de novo. As configurações salvas do servidor não são apagadas.">
        <Field label="Motivo (fica no registro de ações)">
          <input className={inputCls} maxLength={300} value={reason} placeholder="Ex.: servidor de golpes, pedido do dono" onChange={(e) => setReason(e.target.value)} />
        </Field>
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton disabled={!!acting} onClick={() => leave(false)}><LogOut className="h-4 w-4" /> {acting === "leave" ? "Saindo…" : "Sair do servidor"}</SecondaryButton>
          <PrimaryButton disabled={!!acting} loading={acting === "block"} onClick={() => leave(true)}><Ban className="h-4 w-4" /> Sair e bloquear</PrimaryButton>
        </div>
      </Section>
    </div>
  )
}
