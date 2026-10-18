"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type CodeRow = { id: string; hint: string; type: string; value: number | null; vip: string | null; used: boolean }
type Created = { codes: string[]; type: "coins" | "vip"; value: number; vip: string | null }

const PERIODS = [
  { value: "7d", label: "7 dias" }, { value: "15d", label: "15 dias" }, { value: "1m", label: "1 mês" },
  { value: "3m", label: "3 meses" }, { value: "6m", label: "6 meses" }, { value: "12m", label: "12 meses" },
]
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const label = (c: { type: string; value: number | null; vip: string | null }) =>
  c.type === "vip" ? `VIP ${PERIODS.find((p) => p.value === c.vip)?.label || c.vip}` : `${(c.value || 0).toLocaleString("pt-BR")} moedas`

/**
 * Redeem codes (used with /code redeem in the bot). Full codes are only shown right after
 * creation — the list afterwards shows a hint, so a screen share or the history can't leak them.
 */
export default function AdminCodesPage() {
  const { toast } = useToast()
  const [data, setData] = useState<{ unused: { coins: number; vip: number }; recent: CodeRow[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ type: "coins" as "coins" | "vip", value: 1000, period: "1m", quantity: 1 })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<Created | null>(null)

  const load = async () => { try { setError(null); const r = await api.getAdminCodes(); setData(r.data) } catch (e: any) { setError(e.message) } }
  useEffect(() => { load() }, [])

  const create = async () => {
    const what = form.type === "vip" ? `VIP de ${PERIODS.find((p) => p.value === form.period)?.label}` : `${form.value.toLocaleString("pt-BR")} moedas`
    if (!window.confirm(`Gerar ${form.quantity} código(s) de ${what}? Cada código só pode ser usado uma vez.`)) return
    setCreating(true)
    try {
      const r = await api.createAdminCodes(form.type === "vip" ? { type: "vip", period: form.period, quantity: form.quantity } : { type: "coins", value: form.value, quantity: form.quantity })
      setCreated(r.data)
      await load()
    } catch (e: any) { toast({ title: "Não foi possível gerar", description: e.message, variant: "destructive" }) } finally { setCreating(false) }
  }

  const copyAll = async () => {
    if (!created) return
    try { await navigator.clipboard.writeText(created.codes.join("\n")); toast({ title: "Códigos copiados" }) }
    catch { toast({ title: "Não foi possível copiar", description: "Selecione e copie manualmente.", variant: "destructive" }) }
  }
  const download = () => {
    if (!created) return
    const text = `Códigos Lunna — ${label(created)}\nGerados em ${new Date().toLocaleString("pt-BR")}\n\n${created.codes.join("\n")}\n`
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }))
    const a = Object.assign(document.createElement("a"), { href: url, download: `codigos-lunna-${Date.now()}.txt` })
    a.click(); URL.revokeObjectURL(url)
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <LoadingState />

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Códigos de resgate"
        description={`Códigos para /code redeem. Ainda não usados: ${data.unused.coins} de moedas e ${data.unused.vip} de VIP.`} />

      {created && (
        <Section title="Códigos gerados" description="Copie agora: por segurança, os códigos completos não aparecem de novo depois que você sair desta tela."
          action={<SecondaryButton onClick={() => setCreated(null)}>Já copiei</SecondaryButton>}>
          <p className="mb-3 text-[13px] text-foreground">{created.codes.length} × {label(created)}</p>
          <textarea readOnly rows={Math.min(10, created.codes.length + 1)} className={`${inputCls} h-auto py-2 font-mono text-[13px]`} value={created.codes.join("\n")} onFocus={(e) => e.target.select()} />
          <div className="mt-3 flex flex-wrap gap-2">
            <PrimaryButton onClick={copyAll}>Copiar todos</PrimaryButton>
            <SecondaryButton onClick={download}>Baixar .txt</SecondaryButton>
          </div>
        </Section>
      )}

      <Section title="Gerar códigos">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo">
            <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "coins" | "vip" })}>
              <option value="coins">Lunar Coins</option>
              <option value="vip">VIP</option>
            </select>
          </Field>
          {form.type === "coins" ? (
            <Field label="Moedas por código" hint="De 1 a 1.000.000.">
              <input type="number" min={1} max={1000000} className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: Math.floor(Number(e.target.value)) })} />
            </Field>
          ) : (
            <Field label="Período do VIP">
              <select className={inputCls} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Quantidade" hint="Até 50 por vez.">
            <input type="number" min={1} max={50} className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, Math.min(50, Math.floor(Number(e.target.value)))) })} />
          </Field>
        </div>
        <div className="mt-4"><PrimaryButton onClick={create} loading={creating}>Gerar</PrimaryButton></div>
      </Section>

      <Section title="Últimos códigos" description="Só o começo e o fim de cada código aparecem aqui.">
        {data.recent.length === 0 ? <p className="text-[13px] text-muted-foreground">Nenhum código ainda.</p> : (
          <div className="overflow-hidden rounded-[10px] border border-border text-[13px]">
            {data.recent.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 px-3 py-2 ${i % 2 ? "bg-card" : ""}`}>
                <span className="w-32 shrink-0 font-mono text-foreground">{c.hint}</span>
                <span className="flex-1 text-muted-foreground">{label(c)}</span>
                <Pill tone={c.used ? "neutral" : "success"}>{c.used ? "Usado" : "Disponível"}</Pill>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
