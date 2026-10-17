"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill } from "@/components/dashboard/primitives"

type LookupUser = {
  user_id: string
  discord: { username: string; global_name: string | null; avatar: string | null; bot: boolean } | null
  has_profile: boolean; coins: number; gacha_keys: number
  vip: { tier: string; until: string | null; active: boolean } | null
  flagged: boolean; flag_reason: string | null; banned: boolean; is_admin: boolean
  rpg: { rank: string; level: number } | null
  streak: { count: number; last_day: string | null } | null
  season_level: number; last_daily: string | null
  ledger: { amount: number; category: string; at: string | null }[]
}
type Action = "ban" | "unban" | "flag" | "unflag"

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const n = (v: number) => (v || 0).toLocaleString("pt-BR")
const dt = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—")
const ACTION_LABEL: Record<Action, string> = { ban: "Banir do bot", unban: "Desbanir", flag: "Sinalizar", unflag: "Tirar sinalização" }

/**
 * Lookup by exact Discord id. Nothing is kept: the id is not put in the URL or in storage, and the
 * backend only returns an allow-list of fields (never IPs, e-mail or tokens). Every lookup is audited.
 */
export default function AdminUsersPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [user, setUser] = useState<LookupUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [acting, setActing] = useState<Action | null>(null)

  const search = async () => {
    const id = query.trim()
    if (!/^\d{17,20}$/.test(id)) return toast({ title: "ID inválido", description: "Use o ID do Discord (17 a 20 dígitos).", variant: "destructive" })
    setLoading(true); setUser(null); setNotFound(null); setReason("")
    try { const r = await api.getAdminUser(id); setUser(r.data) }
    catch (e: any) { if (/Nenhum usuário/.test(e.message)) setNotFound(id); else toast({ title: "Erro na consulta", description: e.message, variant: "destructive" }) }
    finally { setLoading(false) }
  }

  const act = async (action: Action) => {
    if (!user) return
    if (reason.trim().length < 5) return toast({ title: "Escreva o motivo", description: "Pelo menos 5 caracteres. Ele fica no registro de ações.", variant: "destructive" })
    if (!window.confirm(`${ACTION_LABEL[action]} ${user.discord?.username || user.user_id}?\n\nMotivo: ${reason.trim()}`)) return
    setActing(action)
    try {
      const r = await api.adminUserAction(user.user_id, action, reason.trim())
      setUser(r.data); setReason("")
      toast({ title: "Feito", description: "A ação foi registrada. No bot vale a partir do próximo comando." })
    } catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) } finally { setActing(null) }
  }

  const name = user?.discord?.global_name || user?.discord?.username || user?.user_id
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Usuários"
        description="Consulta pelo ID exato do Discord. Cada consulta e cada ação ficam no registro, com quem fez e quando. IPs, e-mail e tokens nunca aparecem aqui." />

      <Section title="Buscar">
        <div className="flex gap-2">
          <input className={`${inputCls} font-mono`} inputMode="numeric" autoComplete="off" maxLength={20} value={query} placeholder="ID do Discord, ex.: 852880352313868298"
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") search() }} />
          <PrimaryButton onClick={search} loading={loading}>Consultar</PrimaryButton>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">No Discord: Configurações → Avançado → Modo desenvolvedor, depois clique com o botão direito no usuário → Copiar ID.</p>
      </Section>

      {notFound && <p className="text-[14px] text-muted-foreground">Nenhum usuário com o ID <span className="font-mono">{notFound}</span>.</p>}

      {user && (
        <>
          <Section title={name || user.user_id} description={`${user.discord?.username ? `@${user.discord.username} · ` : ""}${user.user_id}`}
            action={<div className="flex flex-wrap justify-end gap-1.5">
              {user.banned && <Pill>Banido</Pill>}
              {user.flagged && <Pill tone="accent">Sinalizado</Pill>}
              {user.vip && <Pill tone={user.vip.active ? "success" : "neutral"}>VIP {user.vip.tier}</Pill>}
              {user.is_admin && <Pill tone="accent">Admin</Pill>}
              {user.discord?.bot && <Pill>Bot</Pill>}
            </div>}>
            <div className="flex items-start gap-4">
              {user.discord?.avatar
                ? <img src={user.discord.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full" referrerPolicy="no-referrer" />
                : <div className="h-16 w-16 shrink-0 rounded-full bg-secondary" />}
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                <div><p className="text-[12px] text-muted-foreground">Lunar Coins</p><p className="text-[18px] font-bold text-foreground">{n(user.coins)}</p></div>
                <div><p className="text-[12px] text-muted-foreground">Chaves de gacha</p><p className="text-[18px] font-bold text-foreground">{n(user.gacha_keys)}</p></div>
                <div><p className="text-[12px] text-muted-foreground">RPG</p><p className="text-[18px] font-bold text-foreground">{user.rpg ? `Rank ${user.rpg.rank} · Nv ${user.rpg.level}` : "—"}</p></div>
                <div><p className="text-[12px] text-muted-foreground">Sequência</p><p className="text-[18px] font-bold text-foreground">{user.streak ? `${user.streak.count} dias` : "—"}</p></div>
                <div><p className="text-[12px] text-muted-foreground">VIP até</p><p className="text-[14px] font-semibold text-foreground">{user.vip ? (user.vip.until ? dt(user.vip.until) : "permanente") : "—"}</p></div>
                <div><p className="text-[12px] text-muted-foreground">Último daily</p><p className="text-[14px] font-semibold text-foreground">{dt(user.last_daily)}</p></div>
                <div><p className="text-[12px] text-muted-foreground">Temporada</p><p className="text-[14px] font-semibold text-foreground">{user.season_level ? `Nível ${user.season_level}` : "—"}</p></div>
                <div><p className="text-[12px] text-muted-foreground">Perfil na Lunna</p><p className="text-[14px] font-semibold text-foreground">{user.has_profile ? "sim" : "não"}</p></div>
              </div>
            </div>
            {user.flagged && <p className="mt-4 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[13px] text-amber-500">Sinalizado: {user.flag_reason || "sem motivo registrado (sinalização automática antiga)"}</p>}
          </Section>

          <Section title="Últimas movimentações de moedas" description="As 20 mais recentes, para investigar exploits e farm.">
            {user.ledger.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhuma movimentação registrada.</p> : (
              <div className="overflow-hidden rounded-[10px] border border-border text-[13px]">
                {user.ledger.map((l, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2 ${i % 2 ? "bg-card" : ""}`}>
                    <span className="w-36 shrink-0 text-muted-foreground">{dt(l.at)}</span>
                    <span className="flex-1 font-mono text-[12px] text-foreground">{l.category}</span>
                    <span className={`font-semibold ${l.amount >= 0 ? "text-emerald-500" : "text-red-500"}`}>{l.amount >= 0 ? "+" : ""}{n(l.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {!user.is_admin && (
            <Section title="Ações" description="Banir impede o uso de todos os comandos do bot. Sinalizar marca a conta como suspeita. Motivo obrigatório: fica no registro.">
              <Field label="Motivo">
                <input className={inputCls} maxLength={300} value={reason} placeholder="Ex.: farm de moedas com contas alternativas" onChange={(e) => setReason(e.target.value)} />
              </Field>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.banned
                  ? <SecondaryButton disabled={!!acting} onClick={() => act("unban")}>{acting === "unban" ? "…" : ACTION_LABEL.unban}</SecondaryButton>
                  : <PrimaryButton loading={acting === "ban"} className="bg-red-600 hover:bg-red-700" onClick={() => act("ban")}>{ACTION_LABEL.ban}</PrimaryButton>}
                {user.has_profile && (user.flagged
                  ? <SecondaryButton disabled={!!acting} onClick={() => act("unflag")}>{ACTION_LABEL.unflag}</SecondaryButton>
                  : <SecondaryButton disabled={!!acting} onClick={() => act("flag")}>{ACTION_LABEL.flag}</SecondaryButton>)}
              </div>
            </Section>
          )}
          <p className="text-[12px] text-muted-foreground">Esta consulta foi registrada no registro de ações.</p>
        </>
      )}
    </div>
  )
}
