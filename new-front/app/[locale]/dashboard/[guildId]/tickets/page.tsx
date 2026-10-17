"use client"

import React, { use, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { PanelBuilder, defaultLayout, panelLimits, type Block, type ButtonColor, type PanelConfig } from "@/components/dashboard/ticket-panel-builder"

type Category = {
  id: string
  name: string
  emoji: string
  description: string
  staff_role_ids: string[]
  parent_id: string | null
  ask_reason: boolean
  welcome_message: string
  button_style: ButtonColor
}

type Tickets = {
  enabled: boolean
  panel_channel_id: string | null
  log_channel_id: string | null
  title: string
  description: string
  color: number
  accent: boolean
  style: "buttons" | "menu" | "auto"
  menu_placeholder: string
  layout: Block[]
  max_open_per_user: number
  categories: Category[]
}

type Status = "published" | "pending" | "error" | "disabled"

const DEFAULTS: Tickets = {
  enabled: false, panel_channel_id: null, log_channel_id: null, title: "Suporte",
  description: "Precisa de ajuda? Escolha um assunto abaixo e a equipe responde no seu ticket.",
  color: 0x7c3aed, accent: true, style: "buttons", menu_placeholder: "Escolha o assunto do ticket", layout: [],
  max_open_per_user: 1, categories: [],
}

const newCategory = (): Category => ({
  id: Math.random().toString(36).slice(2, 10), name: "", emoji: "🎫", description: "",
  staff_role_ids: [], parent_id: null, ask_reason: true, welcome_message: "", button_style: "primary",
})

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const chip = "rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-foreground hover:border-foreground/30"

export default function TicketsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cfg, setCfg] = useState<Tickets>(DEFAULTS)
  const [status, setStatus] = useState<Status>("disabled")
  const [publishError, setPublishError] = useState<string | null>(null)
  const [stats, setStats] = useState({ open: 0, closed: 0, total: 0 })
  const [open, setOpen] = useState<string | null>(null)
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null)

  const apply = (data: any) => {
    const next: Tickets = { ...DEFAULTS, ...(data?.config || {}) }
    if (!next.layout?.length) next.layout = defaultLayout(next.title, next.description)
    setCfg(next)
    setStatus(data?.status || "disabled")
    setPublishError(data?.publish_error || null)
    setStats(data?.stats || { open: 0, closed: 0, total: 0 })
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [t, c, r] = await Promise.all([api.getTickets(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      apply(t?.data)
      setChannels(c?.data || [])
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || "Não foi possível carregar os tickets.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    return () => { if (poll.current) clearTimeout(poll.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId])

  // After saving, follow the bot publishing the panel (it checks every ~10s)
  const followPublish = (tries = 0) => {
    if (poll.current) clearTimeout(poll.current)
    poll.current = setTimeout(async () => {
      try {
        const t = await api.getTickets(guildId)
        setStatus(t?.data?.status || "disabled")
        setPublishError(t?.data?.publish_error || null)
        if (t?.data?.status === "pending" && tries < 15) followPublish(tries + 1)
      } catch { /* keep the last known status */ }
    }, 4000)
  }

  const set = <K extends keyof Tickets>(key: K, value: Tickets[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const setCat = (id: string, patch: Partial<Category>) =>
    setCfg((c) => ({ ...c, categories: c.categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)) }))

  const save = async () => {
    if (cfg.enabled && !cfg.panel_channel_id) return toast({ title: "Escolha o canal do painel", variant: "destructive" })
    if (cfg.enabled && !cfg.categories.some((c) => c.name.trim())) return toast({ title: "Crie pelo menos uma categoria", variant: "destructive" })
    const limits = panelLimits(cfg, cfg.categories.filter((c) => c.name.trim()))
    if (limits.components > 40 || limits.chars > 4000) {
      return toast({ title: "O painel passou do limite do Discord", description: "Máximo de 40 componentes e 4000 caracteres. Remova alguns blocos.", variant: "destructive" })
    }
    setSaving(true)
    try {
      const res = await api.updateTickets(guildId, cfg)
      apply(res?.data)
      toast({ title: "Tickets salvos", description: "A Lunna atualiza o painel no Discord em alguns segundos." })
      followPublish()
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5)
  const discordCategories = channels.filter((c) => c.type === 4)
  const statusPill = {
    published: <Pill tone="success">Painel publicado</Pill>,
    pending: <Pill tone="accent">Publicando…</Pill>,
    error: <Pill>Atenção</Pill>,
    disabled: <Pill>Desativado</Pill>,
  }[status]
  const named = cfg.categories.filter((c) => c.name.trim())

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Comunidade"
        title="Tickets"
        description="Um painel com botões onde os membros abrem um canal privado com a equipe. A Lunna precisa das permissões Gerenciar Canais e Gerenciar Cargos."
        action={<PrimaryButton onClick={save} loading={saving}>Salvar</PrimaryButton>}
      />

      <Section
        title="Sistema de tickets"
        description={`${stats.open} aberto(s) · ${stats.closed} fechado(s) aguardando exclusão · ${stats.total} no total`}
        action={<div className="flex items-center gap-3">{statusPill}<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} /></div>}
      >
        {publishError && (
          <p className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">{publishError}</p>
        )}
      </Section>

      <Section title="Painel" description="Monte a mensagem do painel com blocos: arraste para reordenar, clique num bloco para editar. A prévia mostra como fica no Discord.">
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <Field label="Canal do painel">
            <select className={inputCls} value={cfg.panel_channel_id || ""} onChange={(e) => set("panel_channel_id", e.target.value || null)}>
              <option value="">Escolha um canal</option>
              {textChannels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
        </div>
        <PanelBuilder
          value={{ color: cfg.color, accent: cfg.accent, style: cfg.style, menu_placeholder: cfg.menu_placeholder, layout: cfg.layout }}
          cats={named}
          onChange={(v: PanelConfig) => setCfg((c) => ({ ...c, ...v }))}
        />
      </Section>

      <Section
        title="Categorias"
        description="Cada categoria vira um botão ou uma opção do menu. Defina quem atende e onde os canais são criados."
        action={cfg.categories.length < 25 && (
          <SecondaryButton onClick={() => { const c = newCategory(); set("categories", [...cfg.categories, c]); setOpen(c.id) }}>Adicionar</SecondaryButton>
        )}
      >
        <div className="flex flex-col gap-3">
          {cfg.categories.length === 0 && <p className="text-[13px] text-muted-foreground">Nenhuma categoria. Ex.: Suporte, Denúncias, Parcerias.</p>}
          {cfg.categories.map((cat) => (
            <div key={cat.id} className="rounded-[10px] border border-border">
              <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen(open === cat.id ? null : cat.id)}>
                <span className="text-[14px] text-foreground">{cat.emoji} {cat.name || <span className="text-muted-foreground">Sem nome</span>}</span>
                <span className="text-[12px] text-muted-foreground">
                  {cat.staff_role_ids.length ? `${cat.staff_role_ids.length} cargo(s) da equipe` : "só administradores"} {open === cat.id ? "▴" : "▾"}
                </span>
              </button>
              {open === cat.id && (
                <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
                  <Field label="Nome">
                    <input maxLength={80} className={inputCls} value={cat.name} placeholder="Suporte" onChange={(e) => setCat(cat.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Emoji" hint="Um emoji, ou <:nome:id> de um emoji do servidor.">
                    <input maxLength={64} className={inputCls} value={cat.emoji} onChange={(e) => setCat(cat.id, { emoji: e.target.value })} />
                  </Field>
                  <Field label="Cor do botão" hint="Usada quando o painel abre por botões.">
                    <select className={inputCls} value={cat.button_style || "primary"} onChange={(e) => setCat(cat.id, { button_style: e.target.value as ButtonColor })}>
                      <option value="primary">Azul</option>
                      <option value="secondary">Cinza</option>
                      <option value="success">Verde</option>
                      <option value="danger">Vermelho</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Descrição curta" hint="Aparece no painel. Máx. 100 caracteres.">
                      <input maxLength={100} className={inputCls} value={cat.description} placeholder="Dúvidas sobre o servidor"
                        onChange={(e) => setCat(cat.id, { description: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Equipe que atende" hint="Quem tem Gerenciar Canais sempre vê os tickets.">
                    <select className={inputCls} value="" onChange={(e) => e.target.value && cat.staff_role_ids.length < 10 &&
                      setCat(cat.id, { staff_role_ids: [...new Set([...cat.staff_role_ids, e.target.value])] })}>
                      <option value="">Adicionar cargo</option>
                      {roles.filter((r) => !cat.staff_role_ids.includes(r.id)).map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Criar os canais em" hint="Uma categoria do Discord (opcional).">
                    <select className={inputCls} value={cat.parent_id || ""} onChange={(e) => setCat(cat.id, { parent_id: e.target.value || null })}>
                      <option value="">Fora de categorias</option>
                      {discordCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  {cat.staff_role_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      {cat.staff_role_ids.map((id) => (
                        <button key={id} className={chip} onClick={() => setCat(cat.id, { staff_role_ids: cat.staff_role_ids.filter((x) => x !== id) })}>
                          @{roles.find((r) => r.id === id)?.name || "cargo removido"} ✕
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Field label="Mensagem de boas-vindas" hint="Enviada dentro do ticket. Use {user} para mencionar o membro.">
                      <textarea rows={3} maxLength={1000} className={`${inputCls} h-auto py-2`} value={cat.welcome_message}
                        placeholder="Olá {user}! Explique o que você precisa e a equipe responde por aqui."
                        onChange={(e) => setCat(cat.id, { welcome_message: e.target.value })} />
                    </Field>
                  </div>
                  <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3 sm:col-span-2">
                    <span>
                      <span className="block text-[14px] text-foreground">Perguntar o motivo</span>
                      <span className="block text-[12px] text-muted-foreground">O membro descreve o problema num formulário antes de o ticket abrir.</span>
                    </span>
                    <Switch checked={cat.ask_reason} onCheckedChange={(v) => setCat(cat.id, { ask_reason: v })} />
                  </label>
                  <div className="sm:col-span-2">
                    <button className="text-[13px] text-destructive hover:underline"
                      onClick={() => set("categories", cfg.categories.filter((c) => c.id !== cat.id))}>Remover categoria</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Regras e registros" description="Limites por membro e onde a Lunna registra aberturas, fechamentos e exclusões.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tickets abertos por membro" hint="Tickets fechados contam até serem excluídos.">
            <select className={inputCls} value={cfg.max_open_per_user} onChange={(e) => set("max_open_per_user", Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Canal de registros" hint="O Discord não deixa a Lunna ler as conversas, então não há transcrição — só o resumo.">
            <select className={inputCls} value={cfg.log_channel_id || ""} onChange={(e) => set("log_channel_id", e.target.value || null)}>
              <option value="">Sem registros</option>
              {textChannels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Dentro do ticket" description="Botões Fechar e Assumir na mensagem de boas-vindas. Fechado, o membro só lê; a equipe pode reabrir ou excluir. Comandos: /ticket adicionar, remover, renomear e fechar." />
    </div>
  )
}
