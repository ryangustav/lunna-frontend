"use client"

import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Campaign = {
  id: string; code: string; name: string; status: "draft" | "sending" | "paused" | "done"; pause_reason: string | null
  user_vip: { tier: string; days: number }; guild_premium: { tier: string | null; days: number }
  redeem_until: string; audience: { inactive_days: number; owners: boolean }; daily_cap: number
  preview_requested_at: string | null; preview: { counts: Record<string, number>; at: string } | null
  sample_requested_by: string | null; sample_result: { ok: boolean; error?: string; at: string } | null
  deliveries: Record<string, number>; redeemed: { users: number; guilds: number }
}

const VIP_NAME: Record<string, string> = { Lunar: "VIP Lunar", Cosmico: "VIP Cósmico", Galactico: "VIP Galáctico" }
const GUILD_NAME: Record<string, string> = { basico: "Premium Básico", completo: "Premium Completo" }
const STATUS: Record<string, { label: string; tone: "neutral" | "accent" | "success" }> = {
  draft: { label: "Rascunho", tone: "neutral" }, sending: { label: "Enviando", tone: "success" },
  paused: { label: "Pausada", tone: "accent" }, done: { label: "Concluída", tone: "neutral" },
}
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const n = (v?: number) => (v || 0).toLocaleString("pt-BR")
const previewFresh = (c: Campaign) => !!c.preview?.at && (!c.preview_requested_at || new Date(c.preview.at) >= new Date(c.preview_requested_at))

const EMPTY = { code: "", name: "", vip_tier: "Lunar", vip_days: 30, guild_tier: "basico", guild_days: 30, redeem_days: 14, inactive_days: 14, daily_cap: 400 }

export default function AdminCampaignsPage() {
  const { toast } = useToast()
  const [list, setList] = useState<Campaign[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = async () => {
    try { setError(null); const r = await api.getAdminCampaigns(); setList(r.data) } catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load(); return () => { if (poll.current) clearTimeout(poll.current) } }, [])

  // While a preview is pending or a campaign is sending, refresh every few seconds
  useEffect(() => {
    if (poll.current) clearTimeout(poll.current)
    if (list?.some((c) => c.status === "sending" || c.sample_requested_by || (c.preview_requested_at && !previewFresh(c)))) poll.current = setTimeout(load, 5000)
  }, [list])

  const create = async () => {
    setCreating(true)
    try {
      await api.createAdminCampaign(form)
      toast({ title: "Campanha criada", description: "Calcule a prévia antes de enviar." })
      setForm(EMPTY); setShowForm(false); await load()
    } catch (e: any) { toast({ title: "Não foi possível criar", description: e.message, variant: "destructive" }) } finally { setCreating(false) }
  }

  const act = async (c: Campaign, action: "preview" | "sample" | "send" | "pause") => {
    if (action === "send") {
      const total = c.preview ? (c.preview.counts.players || 0) + (c.preview.counts.owners || 0) : null
      const msg = total !== null
        ? `Enviar a campanha ${c.code} para cerca de ${total} pessoas? As DMs saem aos poucos (até ${c.daily_cap} por dia).`
        : `Enviar a campanha ${c.code}? Você ainda não calculou a prévia.`
      if (!window.confirm(msg)) return
    }
    setBusy(`${c.id}:${action}`)
    try { await api.adminCampaignAction(c.id, action); await load() } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }) } finally { setBusy(null) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!list) return <LoadingState />
  const set = (k: keyof typeof EMPTY, v: any) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Campanhas de retorno"
        description="DM com código de VIP grátis para quem já jogou e está sumido, e para donos de servidor. Quem desativou alertas ou recebeu DM automática nos últimos 60 dias fica de fora."
        action={<PrimaryButton onClick={() => setShowForm((v) => !v)}>{showForm ? "Fechar" : "Nova campanha"}</PrimaryButton>} />

      {showForm && (
        <Section title="Nova campanha" description="Fica como rascunho até você enviar.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código" hint="O que as pessoas digitam no /code redeem."><input className={`${inputCls} uppercase`} maxLength={32} value={form.code} placeholder="VOLTA30" onChange={(e) => set("code", e.target.value)} /></Field>
            <Field label="Nome interno"><input className={inputCls} maxLength={80} value={form.name} placeholder="Retorno de outubro" onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="VIP pessoal">
              <div className="flex gap-2">
                <select className={inputCls} value={form.vip_tier} onChange={(e) => set("vip_tier", e.target.value)}>{Object.entries(VIP_NAME).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <input type="number" min={1} max={90} className={`${inputCls} w-24`} value={form.vip_days} onChange={(e) => set("vip_days", Number(e.target.value))} />
              </div>
            </Field>
            <Field label="Premium para os servidores dos donos">
              <div className="flex gap-2">
                <select className={inputCls} value={form.guild_tier} onChange={(e) => set("guild_tier", e.target.value)}>
                  <option value="basico">Premium Básico</option><option value="completo">Premium Completo</option><option value="nenhum">Nenhum (só jogadores)</option>
                </select>
                <input type="number" min={1} max={90} disabled={form.guild_tier === "nenhum"} className={`${inputCls} w-24`} value={form.guild_days} onChange={(e) => set("guild_days", Number(e.target.value))} />
              </div>
            </Field>
            <Field label="Prazo para resgatar (dias)"><input type="number" min={1} max={60} className={inputCls} value={form.redeem_days} onChange={(e) => set("redeem_days", Number(e.target.value))} /></Field>
            <Field label="Jogadores sem atividade há (dias)"><input type="number" min={0} max={365} className={inputCls} value={form.inactive_days} onChange={(e) => set("inactive_days", Number(e.target.value))} /></Field>
            <Field label="Máximo de DMs por dia" hint="Envio lento protege a Lunna do anti-spam do Discord."><input type="number" min={10} max={2000} className={inputCls} value={form.daily_cap} onChange={(e) => set("daily_cap", Number(e.target.value))} /></Field>
          </div>
          <div className="mt-4"><PrimaryButton onClick={create} loading={creating}>Criar rascunho</PrimaryButton></div>
        </Section>
      )}

      {list.length === 0 && <p className="text-[14px] text-muted-foreground">Nenhuma campanha ainda.</p>}
      {list.map((c) => {
        const d = c.deliveries || {}
        const st = STATUS[c.status] || STATUS.draft
        const pending = c.preview_requested_at && !previewFresh(c)
        const expired = new Date(c.redeem_until) < new Date()
        return (
          <Section key={c.id} title={`${c.code}${c.name && c.name !== c.code ? ` · ${c.name}` : ""}`}
            description={`${VIP_NAME[c.user_vip?.tier] || c.user_vip?.tier} por ${c.user_vip?.days} dias${c.guild_premium?.tier ? ` · ${GUILD_NAME[c.guild_premium.tier]} por ${c.guild_premium.days} dias para servidores` : ""} · resgate até ${new Date(c.redeem_until).toLocaleDateString("pt-BR")}${expired ? " (expirado)" : ""}`}
            action={<Pill tone={st.tone}>{st.label}</Pill>}>
            {c.pause_reason && c.status === "paused" && <p className="mb-3 text-[13px] text-amber-500">{c.pause_reason}</p>}
            {c.sample_result && !c.sample_requested_by && (
              <p className={`mb-3 text-[13px] ${c.sample_result.ok ? "text-emerald-500" : "text-amber-500"}`}>
                {c.sample_result.ok ? "DM de exemplo enviada para você." : "Não consegui mandar a DM de exemplo (suas DMs estão fechadas para a Lunna?)."}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-4">
              <div><p className="text-[12px] text-muted-foreground">Enviadas</p><p className="text-[18px] font-bold text-foreground">{n(d.sent)}</p></div>
              <div><p className="text-[12px] text-muted-foreground">Falharam (DM fechada)</p><p className="text-[18px] font-bold text-foreground">{n(d.failed)}</p></div>
              <div><p className="text-[12px] text-muted-foreground">Na fila</p><p className="text-[18px] font-bold text-foreground">{n(d.queued)}</p></div>
              <div><p className="text-[12px] text-muted-foreground">Resgates</p><p className="text-[18px] font-bold text-emerald-500">{n(c.redeemed?.users)} <span className="text-[13px] font-medium text-muted-foreground">pessoas · {n(c.redeemed?.guilds)} servidores</span></p></div>
            </div>
            <div className="mt-4 rounded-[10px] border border-border px-4 py-3 text-[13px]">
              {pending && <span className="text-muted-foreground">Calculando a prévia… (o bot responde em alguns segundos)</span>}
              {!pending && c.preview && (
                <span className="text-foreground">
                  Prévia: <strong>{n(c.preview.counts.players)}</strong> jogadores e <strong>{n(c.preview.counts.owners)}</strong> donos ·
                  <span className="text-muted-foreground"> fora: {n(c.preview.counts.active)} ativos, {n(c.preview.counts.opted_out)} desativaram alertas, {n(c.preview.counts.recent_dm)} receberam DM recente</span>
                </span>
              )}
              {!pending && !c.preview && <span className="text-muted-foreground">Sem prévia ainda.</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.status !== "done" && <SecondaryButton disabled={!!busy} onClick={() => act(c, "preview")}>Calcular prévia</SecondaryButton>}
              <SecondaryButton disabled={!!busy || !!c.sample_requested_by} onClick={() => act(c, "sample")}>{c.sample_requested_by ? "Enviando exemplo…" : "DM de exemplo para mim"}</SecondaryButton>
              {(c.status === "draft" || c.status === "paused") && !expired && (
                <PrimaryButton loading={busy === `${c.id}:send`} onClick={() => act(c, "send")}>{c.status === "paused" ? "Retomar envio" : "Enviar"}</PrimaryButton>
              )}
              {c.status === "sending" && <SecondaryButton disabled={!!busy} onClick={() => act(c, "pause")}>Pausar</SecondaryButton>}
            </div>
          </Section>
        )
      })}
    </div>
  )
}
