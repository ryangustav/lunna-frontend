"use client"

import { use, useEffect, useState } from "react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, type T } from "@/lib/use-t"

type Automation = {
  id: string; type: "reaction_role" | "join_role" | "scheduled_message"; channel_id: string | null; message_id: string | null
  emoji: string | null; role_id: string | null; remove_on_unreact: boolean; enabled: boolean
  schedule: { days: number[]; hour: number; minute: number } | null; title: string | null; content: string | null; created_at: string
}
type Run = {
  id: string; user_id: string; prompt: string; summary: string; status: string; problems: string[]
  steps: { action: string; description: string; status: string; error: string | null }[]; created_at: string
}
type AgentData = {
  plan: string; limits: { label: string; runs: number; steps: number; automations: number; scheduled: boolean }
  usage: { runs: number; automations: number }; automations: Automation[]; runs: Run[]
}

const DAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const STATUS = (t: T): Record<string, { label: string; tone: "neutral" | "accent" | "success" }> => ({
  planned: { label: t("Aguardando aprovação", "Waiting for approval"), tone: "accent" }, blocked: { label: t("Bloqueado", "Blocked"), tone: "neutral" }, running: { label: t("Executando", "Running"), tone: "accent" },
  done: { label: t("Concluído", "Done"), tone: "success" }, failed: { label: t("Parou no meio", "Stopped halfway"), tone: "neutral" }, cancelled: { label: t("Cancelado", "Cancelled"), tone: "neutral" },
  undone: { label: t("Desfeito", "Undone"), tone: "neutral" }, expired: { label: t("Expirado", "Expired"), tone: "neutral" },
})
const EXAMPLES = [
  "@Lunna crie um canal #regras só leitura, envie regras de convivência, reaja com ✅ e dê o cargo “Leu as regras” para quem reagir",
  "@Lunna monte um sistema de tickets com Suporte e Denúncias no canal #abrir-ticket, atendido pelo cargo Moderador",
  "@Lunna ative os níveis, anuncie em #geral e dê o cargo VIP do chat no nível 20",
  "@Lunna toda segunda às 9h envie um bom dia em #geral",
]
const EXAMPLES_EN = [
  "@Lunna create a read-only #rules channel, post community rules, react with ✅ and give the “Read the rules” role to everyone who reacts",
  "@Lunna set up a ticket system with Support and Reports in #open-ticket, handled by the Moderator role",
  "@Lunna turn on levels, announce them in #general and give the chat VIP role at level 20",
  "@Lunna every Monday at 9am post a good morning in #general",
]

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, (used / Math.max(1, max)) * 100)
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[22px] font-bold text-foreground">{used} <span className="text-[14px] font-medium text-muted-foreground">/ {max}</span></p>
      <div className="mt-2 h-1.5 rounded-full bg-secondary"><div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-red-500" : "bg-[#7c3aed]"}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function AgentPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [data, setData] = useState<AgentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [channels, setChannels] = useState<Record<string, string>>({})
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [openRun, setOpenRun] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const [a, c, r] = await Promise.all([api.getAgent(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      setData(a.data)
      setChannels(Object.fromEntries((c?.data || []).map((x: any) => [x.id, x.name])))
      setRoles(Object.fromEntries((r?.data || []).map((x: any) => [x.id, x.name])))
    } catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  const ch = (id: string | null) => (id ? `#${channels[id] || t("canal removido", "deleted channel")}` : "—")
  const rl = (id: string | null) => (id ? `@${roles[id] || t("cargo removido", "deleted role")}` : "—")
  const describe = (a: Automation) => {
    if (a.type === "reaction_role") return { title: t("Reação → cargo", "Reaction → role"), text: t(`${a.emoji} em ${ch(a.channel_id)} dá ${rl(a.role_id)}${a.remove_on_unreact ? " (tira ao remover a reação)" : ""}`, `${a.emoji} in ${ch(a.channel_id)} gives ${rl(a.role_id)}${a.remove_on_unreact ? " (removed when the reaction is removed)" : ""}`) }
    if (a.type === "join_role") return { title: t("Cargo de entrada", "Join role"), text: t(`Todo membro novo ganha ${rl(a.role_id)}`, `Every new member gets ${rl(a.role_id)}`) }
    const s = a.schedule
    const days = s?.days?.length === 7 ? t("todo dia", "every day") : (s?.days || []).map((d) => t(DAYS[d], DAYS_EN[d])).join(", ")
    const time = `${String(s?.hour ?? 0).padStart(2, "0")}:${String(s?.minute ?? 0).padStart(2, "0")}`
    return { title: t("Mensagem agendada", "Scheduled message"), text: `${ch(a.channel_id)} · ${days} ${t("às", "at")} ${time}${a.title ? ` · “${a.title}”` : ""}` }
  }

  const toggle = async (a: Automation, enabled: boolean) => {
    try { await api.updateAutomation(guildId, a.id, enabled); await load() }
    catch (e: any) { toast({ title: t("Não foi possível", "Couldn't do it"), description: e.message, variant: "destructive" }) }
  }
  const remove = async (a: Automation) => {
    if (!window.confirm(t(`Apagar a automação “${describe(a).title}”? Isso não apaga canais, cargos ou mensagens.`, `Delete the automation “${describe(a).title}”? Channels, roles and messages are not deleted.`))) return
    try { await api.deleteAutomation(guildId, a.id); await load() }
    catch (e: any) { toast({ title: t("Não foi possível", "Couldn't do it"), description: e.message, variant: "destructive" }) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />
  const { limits, usage } = data
  const nearLimit = usage.runs >= limits.runs - 1 && data.plan !== "completo"

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow={t("Geral", "General")} title={t("Lunna IA", "Lunna AI")}
        description={t("Peça tarefas de administração mencionando a Lunna no seu servidor. Ela monta um plano, você aprova, e ela executa passo a passo — com botão para desfazer.", "Ask for admin tasks by mentioning Lunna in your server. She makes a plan, you approve it, and she carries it out step by step, with a button to undo.")} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Meter label={t("Pedidos este mês", "Requests this month")} used={usage.runs} max={limits.runs} />
        <Meter label={t("Automações ativas", "Active automations")} used={usage.automations} max={limits.automations} />
        <div className="rounded-[14px] border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground">{t("Plano do servidor", "Server plan")}</p>
          <p className="mt-1 text-[18px] font-bold text-foreground">{limits.label}</p>
          <p className="text-[12px] text-muted-foreground">{t(`Até ${limits.steps} passos por pedido`, `Up to ${limits.steps} steps per request`)}{limits.scheduled ? t(" · mensagens agendadas", " · scheduled messages") : ""}</p>
        </div>
      </div>
      {nearLimit && (
        <p className="rounded-[12px] border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-3 text-[13px] text-foreground">
          {data.plan === "free" ? t("No Premium Básico são 60 pedidos por mês, 15 automações, mensagens agendadas e desfazer por 7 dias.", "Premium Basic gives 60 requests a month, 15 automations, scheduled messages and 7 days to undo.") : t("No Premium Completo são 300 pedidos por mês e 50 automações.", "Premium Complete gives 300 requests a month and 50 automations.")}{" "}
          <Link href={`/dashboard/${guildId}/premium`} className="font-semibold text-[#a78bfa] hover:underline">{t("Ver planos", "See plans")}</Link>
        </p>
      )}

      <Section title={t("Como pedir", "How to ask")} description={t("Só quem tem Gerenciar Servidor pode pedir. A IA nunca faz algo que você não poderia fazer sozinho, e nunca dá permissões de administração.", "Only people with Manage Server can ask. The AI never does anything you couldn't do yourself, and never gives admin permissions.")}>
        <div className="flex flex-col gap-2">
          {(t("pt", "en") === "en" ? EXAMPLES_EN : EXAMPLES).map((e) => <p key={e} className="rounded-[10px] bg-secondary px-3 py-2 font-mono text-[12px] text-foreground">{e}</p>)}
        </div>
      </Section>

      <Section title={t("Automações", "Automations")} description={t("Criadas pela Lunna IA. Pausar mantém a configuração; apagar remove só a automação.", "Created by Lunna AI. Pausing keeps the setup; deleting removes only the automation.")}>
        {data.automations.length === 0 ? <p className="text-[13px] text-muted-foreground">{t("Nenhuma automação ainda.", "No automations yet.")}</p> : (
          <div className="flex flex-col gap-2">
            {data.automations.map((a) => {
              const d = describe(a)
              const lockedScheduled = a.type === "scheduled_message" && !limits.scheduled
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-[10px] border border-border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-foreground">{d.title} {lockedScheduled && <Pill>Premium</Pill>}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{d.text}</p>
                  </div>
                  <Switch checked={a.enabled && !lockedScheduled} disabled={lockedScheduled} onCheckedChange={(v) => toggle(a, v)} />
                  <button className="text-[12px] text-red-500 hover:underline" onClick={() => remove(a)}>{t("Apagar", "Delete")}</button>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title={t("Pedidos recentes", "Recent requests")} description={t("Os 30 últimos pedidos feitos à Lunna IA neste servidor.", "The last 30 requests made to Lunna AI in this server.")}>
        {data.runs.length === 0 ? <p className="text-[13px] text-muted-foreground">{t("Nenhum pedido ainda.", "No requests yet.")}</p> : (
          <div className="flex flex-col gap-2">
            {data.runs.map((r) => {
              const st = STATUS(t)[r.status] || { label: r.status, tone: "neutral" as const }
              const open = openRun === r.id
              return (
                <div key={r.id} className="rounded-[10px] border border-border">
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setOpenRun(open ? null : r.id)}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-foreground">{r.prompt || r.summary || t("(sem texto)", "(no text)")}</p>
                      <p className="text-[12px] text-muted-foreground">{new Date(r.created_at).toLocaleString(t("pt-BR", "en-US"), { dateStyle: "short", timeStyle: "short" })} · {t(`${r.steps.length} passo(s)`, `${r.steps.length} step(s)`)} · <span className="font-mono">{r.user_id}</span></p>
                    </div>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </button>
                  {open && (
                    <div className="border-t border-border px-4 py-3 text-[13px]">
                      {r.summary && <p className="mb-2 text-muted-foreground">{r.summary}</p>}
                      {r.steps.map((s, i) => (
                        <p key={i} className="text-foreground">{({ done: "✅", failed: "❌", skipped: "⏭️", running: "⏳" } as Record<string, string>)[s.status] || "▫️"} {i + 1}. {s.description}{s.error && <span className="text-red-500"> — {s.error}</span>}</p>
                      ))}
                      {r.problems.length > 0 && <ul className="mt-2 list-disc pl-5 text-amber-500">{r.problems.map((p, i) => <li key={i}>{p}</li>)}</ul>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
