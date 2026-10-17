"use client"

import { useEffect, useState } from "react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { SimpleMarkdown } from "@/components/lunna/simple-markdown"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Incident = { is_incident: boolean; occurred_at: string | null; data_affected: string; risks: string; measures: string; contact: string }
type Notice = {
  id?: string; slug?: string; title: string; summary: string; body: string; severity: "info" | "warning" | "critical"
  show_site: boolean; show_bot: boolean; published: boolean; starts_at: string; ends_at: string | null
  incident: Incident; bot_views?: number; created_at?: string
}

const EMPTY: Notice = {
  title: "", summary: "", body: "", severity: "warning", show_site: true, show_bot: false, published: false,
  starts_at: "", ends_at: null,
  incident: { is_incident: false, occurred_at: null, data_affected: "", risks: "", measures: "", contact: "" },
}
const SEVERITY = {
  info: { label: "Informativo", tone: "neutral" as const },
  warning: { label: "Importante", tone: "accent" as const },
  critical: { label: "Urgente", tone: "accent" as const },
}
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const areaCls = `${inputCls} h-auto py-2`
// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
const toLocal = (iso?: string | null) => { if (!iso) return ""; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null)

const INCIDENT_TEMPLATE = `## O que aconteceu
Descreva o incidente em linguagem simples: o que houve, como foi descoberto e por quanto tempo durou.

## O que você deve fazer
- Exemplo: saia e entre de novo no site para renovar sua sessão.
- Exemplo: desconfie de mensagens pedindo sua senha em nome da Lunna.

## Próximos passos
O que ainda vamos fazer e quando este aviso será atualizado.`

function status(n: Notice) {
  if (!n.published) return { label: "Rascunho", tone: "neutral" as const }
  if (n.ends_at && new Date(n.ends_at) < new Date()) return { label: "Encerrado", tone: "neutral" as const }
  if (n.starts_at && new Date(n.starts_at) > new Date()) return { label: "Agendado", tone: "accent" as const }
  return { label: "No ar", tone: "success" as const }
}

export default function AdminNoticesPage() {
  const { toast } = useToast()
  const [list, setList] = useState<Notice[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [edit, setEdit] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  const load = async () => { try { setError(null); const r = await api.getAdminNotices(); setList(r.data) } catch (e: any) { setError(e.message) } }
  useEffect(() => { load() }, [])

  const save = async (publish?: boolean) => {
    if (!edit) return
    const payload = { ...edit, published: publish ?? edit.published }
    if (payload.published && payload.severity === "critical" && !window.confirm("Publicar um aviso URGENTE? Ele aparece para todos no site e não pode ser fechado.")) return
    setSaving(true)
    try {
      if (edit.id) await api.updateAdminNotice(edit.id, payload)
      else await api.createAdminNotice(payload)
      toast({ title: payload.published ? "Aviso publicado" : "Rascunho salvo", description: payload.show_bot && payload.published ? "No bot, aparece uma vez para cada pessoa no próximo comando." : undefined })
      setEdit(null); await load()
    } catch (e: any) { toast({ title: "Não foi possível salvar", description: e.message, variant: "destructive" }) } finally { setSaving(false) }
  }

  const end = async (n: Notice) => {
    if (!n.id || !window.confirm(`Encerrar "${n.title}"? Ele sai do site e do bot, mas a página continua disponível pelo link.`)) return
    try { await api.endAdminNotice(n.id); await load() } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!list) return <LoadingState />

  if (edit) {
    const set = <K extends keyof Notice>(k: K, v: Notice[K]) => setEdit((e) => (e ? { ...e, [k]: v } : e))
    const setInc = <K extends keyof Incident>(k: K, v: Incident[K]) => setEdit((e) => (e ? { ...e, incident: { ...e.incident, [k]: v } } : e))
    return (
      <div className="flex flex-col gap-5">
        <PageHeader eyebrow="Avisos" title={edit.id ? "Editar aviso" : "Novo aviso"}
          action={<div className="flex gap-2"><SecondaryButton onClick={() => setEdit(null)}>Cancelar</SecondaryButton>
            <SecondaryButton onClick={() => save(false)} disabled={saving}>Salvar rascunho</SecondaryButton>
            <PrimaryButton onClick={() => save(true)} loading={saving}>{edit.published ? "Salvar" : "Publicar"}</PrimaryButton></div>} />

        <Section title="Conteúdo">
          <div className="grid gap-4">
            <Field label="Título"><input className={inputCls} maxLength={120} value={edit.title} onChange={(e) => set("title", e.target.value)} placeholder="Instabilidade no resgate de daily" /></Field>
            <Field label="Resumo" hint="Uma ou duas frases. É o que aparece no banner do site e na mensagem do bot.">
              <textarea rows={2} maxLength={300} className={areaCls} value={edit.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="Texto completo" hint="Markdown: ## título, **negrito**, - listas, [link](https://…). Aparece na página do aviso.">
              <div className="mb-2 flex gap-2">
                <button type="button" className="text-[12px] text-[#a78bfa] hover:underline" onClick={() => setPreview((p) => !p)}>{preview ? "Editar" : "Ver prévia"}</button>
                {!edit.body && <button type="button" className="text-[12px] text-[#a78bfa] hover:underline" onClick={() => set("body", INCIDENT_TEMPLATE)}>Usar modelo de incidente</button>}
              </div>
              {preview
                ? <div className="rounded-[10px] border border-border p-4"><SimpleMarkdown text={edit.body} /></div>
                : <textarea rows={10} maxLength={20000} className={`${areaCls} font-mono text-[13px]`} value={edit.body} onChange={(e) => set("body", e.target.value)} />}
            </Field>
          </div>
        </Section>

        <Section title="Onde e quando aparece">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gravidade">
              <select className={inputCls} value={edit.severity} onChange={(e) => { const v = e.target.value as Notice["severity"]; set("severity", v); if (v === "info") set("show_bot", false) }}>
                <option value="info">Informativo (pode ser fechado)</option>
                <option value="warning">Importante (pode ser fechado)</option>
                <option value="critical">Urgente (não pode ser fechado)</option>
              </select>
            </Field>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between gap-3 rounded-[10px] border border-border px-4 py-2.5 text-[14px]">
                Banner no site <Switch checked={edit.show_site} onCheckedChange={(v) => set("show_site", v)} />
              </label>
              <label className={`flex items-center justify-between gap-3 rounded-[10px] border border-border px-4 py-2.5 text-[14px] ${edit.severity === "info" ? "opacity-50" : ""}`}>
                <span>Mensagem no bot <span className="block text-[12px] text-muted-foreground">Uma vez por pessoa, após um comando</span></span>
                <Switch checked={edit.show_bot} disabled={edit.severity === "info"} onCheckedChange={(v) => set("show_bot", v)} />
              </label>
            </div>
            <Field label="Começa em" hint="Vazio = agora."><input type="datetime-local" className={inputCls} value={toLocal(edit.starts_at)} onChange={(e) => set("starts_at", fromLocal(e.target.value) || "")} /></Field>
            <Field label="Termina em" hint="Vazio = até você encerrar."><input type="datetime-local" className={inputCls} value={toLocal(edit.ends_at)} onChange={(e) => set("ends_at", fromLocal(e.target.value))} /></Field>
          </div>
        </Section>

        <Section title="Incidente de segurança (LGPD)"
          description="Para incidentes com dados pessoais. A LGPD (art. 48) pede comunicar aos titulares e à ANPD, em prazo razoável, o que aconteceu, quais dados, os riscos, as medidas tomadas e um contato. Estes campos aparecem destacados na página do aviso."
          action={<Switch checked={edit.incident.is_incident} onCheckedChange={(v) => setInc("is_incident", v)} />}>
          {edit.incident.is_incident && (
            <div className="grid gap-4">
              <Field label="Quando aconteceu"><input type="datetime-local" className={inputCls} value={toLocal(edit.incident.occurred_at)} onChange={(e) => setInc("occurred_at", fromLocal(e.target.value))} /></Field>
              <Field label="Dados envolvidos" hint="Ex.: IDs do Discord, nomes de usuário, e-mails. Diga também o que NÃO foi afetado."><textarea rows={3} maxLength={2000} className={areaCls} value={edit.incident.data_affected} onChange={(e) => setInc("data_affected", e.target.value)} /></Field>
              <Field label="Riscos para as pessoas"><textarea rows={3} maxLength={2000} className={areaCls} value={edit.incident.risks} onChange={(e) => setInc("risks", e.target.value)} /></Field>
              <Field label="Medidas já tomadas"><textarea rows={3} maxLength={2000} className={areaCls} value={edit.incident.measures} onChange={(e) => setInc("measures", e.target.value)} /></Field>
              <Field label="Contato do encarregado / suporte"><input className={inputCls} maxLength={300} value={edit.incident.contact} onChange={(e) => setInc("contact", e.target.value)} placeholder="privacidade@lunnabot.fun" /></Field>
              <p className="text-[12px] text-muted-foreground">Lembrete: este aviso comunica os titulares. A comunicação à ANPD é feita à parte, pelo formulário dela.</p>
            </div>
          )}
        </Section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Avisos"
        description="Banner no site e mensagem única no bot para falhas, manutenções e incidentes de segurança."
        action={<PrimaryButton onClick={() => { setEdit({ ...EMPTY }); setPreview(false) }}>Novo aviso</PrimaryButton>} />
      {list.length === 0 && <p className="text-[14px] text-muted-foreground">Nenhum aviso ainda.</p>}
      {list.map((n) => {
        const st = status(n)
        return (
          <Section key={n.id} title={n.title}
            description={`${SEVERITY[n.severity].label}${n.incident?.is_incident ? " · incidente de segurança" : ""} · ${[n.show_site && "site", n.show_bot && "bot"].filter(Boolean).join(" + ") || "sem canal"}${n.show_bot ? ` · visto no bot por ${n.bot_views || 0}` : ""}`}
            action={<Pill tone={st.tone}>{st.label}</Pill>}>
            {n.summary && <p className="mb-3 text-[14px] text-muted-foreground">{n.summary}</p>}
            <div className="flex flex-wrap gap-2">
              <SecondaryButton onClick={() => { setEdit({ ...EMPTY, ...n, incident: { ...EMPTY.incident, ...(n.incident || {}) } }); setPreview(false) }}>Editar</SecondaryButton>
              {n.published && n.slug && <Link href={`/avisos/${n.slug}`} className="inline-flex h-9 items-center px-3 text-[13px] text-[#a78bfa] hover:underline">Ver página</Link>}
              {st.label === "No ar" && <SecondaryButton onClick={() => end(n)}>Encerrar</SecondaryButton>}
            </div>
          </Section>
        )
      })}
    </div>
  )
}
