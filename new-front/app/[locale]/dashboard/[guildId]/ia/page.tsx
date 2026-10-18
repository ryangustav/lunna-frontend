"use client"

import { use, useEffect, useState } from "react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

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
const STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" }> = {
  planned: { label: "Aguardando aprovação", tone: "accent" }, blocked: { label: "Bloqueado", tone: "neutral" }, running: { label: "Executando", tone: "accent" },
  done: { label: "Concluído", tone: "success" }, failed: { label: "Parou no meio", tone: "neutral" }, cancelled: { label: "Cancelado", tone: "neutral" },
  undone: { label: "Desfeito", tone: "neutral" }, expired: { label: "Expirado", tone: "neutral" },
}
const EXAMPLES = [
  "@Lunna crie um canal #regras só leitura, envie regras de convivência, reaja com ✅ e dê o cargo “Leu as regras” para quem reagir",
  "@Lunna monte um sistema de tickets com Suporte e Denúncias no canal #abrir-ticket, atendido pelo cargo Moderador",
  "@Lunna ative os níveis, anuncie em #geral e dê o cargo VIP do chat no nível 20",
  "@Lunna toda segunda às 9h envie um bom dia em #geral",
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

  const ch = (id: string | null) => (id ? `#${channels[id] || "canal removido"}` : "—")
  const rl = (id: string | null) => (id ? `@${roles[id] || "cargo removido"}` : "—")
  const describe = (a: Automation) => {
    if (a.type === "reaction_role") return { title: "Reação → cargo", text: `${a.emoji} em ${ch(a.channel_id)} dá ${rl(a.role_id)}${a.remove_on_unreact ? " (tira ao remover a reação)" : ""}` }
    if (a.type === "join_role") return { title: "Cargo de entrada", text: `Todo membro novo ganha ${rl(a.role_id)}` }
    const s = a.schedule
    const days = s?.days?.length === 7 ? "todo dia" : (s?.days || []).map((d) => DAYS[d]).join(", ")
    return { title: "Mensagem agendada", text: `${ch(a.channel_id)} · ${days} às ${String(s?.hour ?? 0).padStart(2, "0")}:${String(s?.minute ?? 0).padStart(2, "0")}${a.title ? ` · “${a.title}”` : ""}` }
  }

  const toggle = async (a: Automation, enabled: boolean) => {
    try { await api.updateAutomation(guildId, a.id, enabled); await load() }
    catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) }
  }
  const remove = async (a: Automation) => {
    if (!window.confirm(`Apagar a automação “${describe(a).title}”? Isso não apaga canais, cargos ou mensagens.`)) return
    try { await api.deleteAutomation(guildId, a.id); await load() }
    catch (e: any) { toast({ title: "Não foi possível", description: e.message, variant: "destructive" }) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />
  const { limits, usage } = data
  const nearLimit = usage.runs >= limits.runs - 1 && data.plan !== "completo"

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Geral" title="Lunna IA"
        description="Peça tarefas de administração mencionando a Lunna no seu servidor. Ela monta um plano, você aprova, e ela executa passo a passo — com botão para desfazer." />

      <div className="grid gap-3 sm:grid-cols-3">
        <Meter label="Pedidos este mês" used={usage.runs} max={limits.runs} />
        <Meter label="Automações ativas" used={usage.automations} max={limits.automations} />
        <div className="rounded-[14px] border border-border bg-card p-4">
          <p className="text-[12px] text-muted-foreground">Plano do servidor</p>
          <p className="mt-1 text-[18px] font-bold text-foreground">{limits.label}</p>
          <p className="text-[12px] text-muted-foreground">Até {limits.steps} passos por pedido{limits.scheduled ? " · mensagens agendadas" : ""}</p>
        </div>
      </div>
      {nearLimit && (
        <p className="rounded-[12px] border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-3 text-[13px] text-foreground">
          {data.plan === "free" ? "No Premium Básico são 60 pedidos por mês, 15 automações, mensagens agendadas e desfazer por 7 dias." : "No Premium Completo são 300 pedidos por mês e 50 automações."}{" "}
          <Link href={`/dashboard/${guildId}/premium`} className="font-semibold text-[#a78bfa] hover:underline">Ver planos</Link>
        </p>
      )}

      <Section title="Como pedir" description="Só quem tem Gerenciar Servidor pode pedir. A IA nunca faz algo que você não poderia fazer sozinho, e nunca dá permissões de administração.">
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((e) => <p key={e} className="rounded-[10px] bg-secondary px-3 py-2 font-mono text-[12px] text-foreground">{e}</p>)}
        </div>
      </Section>

      <Section title="Automações" description="Criadas pela Lunna IA. Pausar mantém a configuração; apagar remove só a automação.">
        {data.automations.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhuma automação ainda.</p> : (
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
                  <button className="text-[12px] text-red-500 hover:underline" onClick={() => remove(a)}>Apagar</button>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Pedidos recentes" description="Os 30 últimos pedidos feitos à Lunna IA neste servidor.">
        {data.runs.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhum pedido ainda.</p> : (
          <div className="flex flex-col gap-2">
            {data.runs.map((r) => {
              const st = STATUS[r.status] || { label: r.status, tone: "neutral" as const }
              const open = openRun === r.id
              return (
                <div key={r.id} className="rounded-[10px] border border-border">
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setOpenRun(open ? null : r.id)}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-foreground">{r.prompt || r.summary || "(sem texto)"}</p>
                      <p className="text-[12px] text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · {r.steps.length} passo(s) · <span className="font-mono">{r.user_id}</span></p>
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
