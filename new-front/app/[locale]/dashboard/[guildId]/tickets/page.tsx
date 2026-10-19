"use client"

import React, { use, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { PanelBuilder, defaultLayout, panelLimits, type Block, type ButtonColor, type PanelConfig } from "@/components/dashboard/ticket-panel-builder"
import { useT } from "@/lib/use-t"
import { publishErrorText } from "@/lib/publish-error"

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

const EN_DEFAULTS = {
  title: "Support",
  description: "Need help? Pick a topic below and the team will answer you in your ticket.",
  menu_placeholder: "Choose what the ticket is about",
}
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
  const t = useT()
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
    if (!next.layout?.length) {
      // never edited with the block editor: on the English site, start from English texts
      if (t("pt", "en") === "en") {
        if (next.title === DEFAULTS.title) next.title = EN_DEFAULTS.title
        if (!next.description || next.description === DEFAULTS.description) next.description = EN_DEFAULTS.description
        if (next.menu_placeholder === DEFAULTS.menu_placeholder) next.menu_placeholder = EN_DEFAULTS.menu_placeholder
      }
      next.layout = defaultLayout(next.title, next.description)
    }
    setCfg(next)
    setStatus(data?.status || "disabled")
    setPublishError(data?.publish_error ? publishErrorText(data.publish_error, t) : null)
    setStats(data?.stats || { open: 0, closed: 0, total: 0 })
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [tk, c, r] = await Promise.all([api.getTickets(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      apply(tk?.data)
      setChannels(c?.data || [])
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || t("Não foi possível carregar os tickets.", "Couldn't load the tickets."))
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
        const res = await api.getTickets(guildId)
        setStatus(res?.data?.status || "disabled")
        setPublishError(res?.data?.publish_error ? publishErrorText(res.data.publish_error, t) : null)
        if (res?.data?.status === "pending" && tries < 15) followPublish(tries + 1)
      } catch { /* keep the last known status */ }
    }, 4000)
  }

  const set = <K extends keyof Tickets>(key: K, value: Tickets[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const setCat = (id: string, patch: Partial<Category>) =>
    setCfg((c) => ({ ...c, categories: c.categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)) }))

  const save = async () => {
    if (cfg.enabled && !cfg.panel_channel_id) return toast({ title: t("Escolha o canal do painel", "Pick the panel's channel"), variant: "destructive" })
    if (cfg.enabled && !cfg.categories.some((c) => c.name.trim())) return toast({ title: t("Crie pelo menos uma categoria", "Create at least one category"), variant: "destructive" })
    const limits = panelLimits(cfg, cfg.categories.filter((c) => c.name.trim()))
    if (limits.components > 40 || limits.chars > 4000) {
      return toast({ title: t("O painel passou do limite do Discord", "The panel is over Discord's limit"), description: t("Máximo de 40 componentes e 4000 caracteres. Remova alguns blocos.", "Max 40 components and 4000 characters. Remove some blocks."), variant: "destructive" })
    }
    setSaving(true)
    try {
      const res = await api.updateTickets(guildId, cfg)
      apply(res?.data)
      toast({ title: t("Tickets salvos", "Tickets saved"), description: t("A Lunna atualiza o painel no Discord em alguns segundos.", "Lunna updates the panel on Discord in a few seconds.") })
      followPublish()
    } catch (err: any) {
      toast({ title: t("Erro ao salvar", "Couldn't save"), description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const textChannels = channels.filter((c) => c.type === 0 || c.type === 5)
  const discordCategories = channels.filter((c) => c.type === 4)
  const statusPill = {
    published: <Pill tone="success">{t("Painel publicado", "Panel published")}</Pill>,
    pending: <Pill tone="accent">{t("Publicando…", "Publishing…")}</Pill>,
    error: <Pill>{t("Atenção", "Attention")}</Pill>,
    disabled: <Pill>{t("Desativado", "Off")}</Pill>,
  }[status]
  const named = cfg.categories.filter((c) => c.name.trim())

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Comunidade", "Community")}
        title="Tickets"
        description={t("Um painel com botões onde os membros abrem um canal privado com a equipe. A Lunna precisa das permissões Gerenciar Canais e Gerenciar Cargos.", "A panel with buttons where members open a private channel with the team. Lunna needs the Manage Channels and Manage Roles permissions.")}
        action={<PrimaryButton onClick={save} loading={saving}>{t("Salvar", "Save")}</PrimaryButton>}
      />

      <Section
        title={t("Sistema de tickets", "Ticket system")}
        description={t(`${stats.open} aberto(s) · ${stats.closed} fechado(s) aguardando exclusão · ${stats.total} no total`, `${stats.open} open · ${stats.closed} closed waiting for deletion · ${stats.total} in total`)}
        action={<div className="flex items-center gap-3">{statusPill}<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} /></div>}
      >
        {publishError && (
          <p className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">{publishError}</p>
        )}
      </Section>

      <Section title={t("Painel", "Panel")} description={t("Monte a mensagem do painel com blocos: arraste para reordenar, clique num bloco para editar. A prévia mostra como fica no Discord.", "Build the panel message from blocks: drag to reorder, click a block to edit it. The preview shows how it looks on Discord.")}>
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <Field label={t("Canal do painel", "Panel channel")}>
            <select className={inputCls} value={cfg.panel_channel_id || ""} onChange={(e) => set("panel_channel_id", e.target.value || null)}>
              <option value="">{t("Escolha um canal", "Pick a channel")}</option>
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
        title={t("Categorias", "Categories")}
        description={t("Cada categoria vira um botão ou uma opção do menu. Defina quem atende e onde os canais são criados.", "Each category becomes a button or a menu option. Set who handles it and where the channels are created.")}
        action={cfg.categories.length < 25 && (
          <SecondaryButton onClick={() => { const c = newCategory(); set("categories", [...cfg.categories, c]); setOpen(c.id) }}>{t("Adicionar", "Add")}</SecondaryButton>
        )}
      >
        <div className="flex flex-col gap-3">
          {cfg.categories.length === 0 && <p className="text-[13px] text-muted-foreground">{t("Nenhuma categoria. Ex.: Suporte, Denúncias, Parcerias.", "No categories. E.g.: Support, Reports, Partnerships.")}</p>}
          {cfg.categories.map((cat) => (
            <div key={cat.id} className="rounded-[10px] border border-border">
              <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen(open === cat.id ? null : cat.id)}>
                <span className="text-[14px] text-foreground">{cat.emoji} {cat.name || <span className="text-muted-foreground">{t("Sem nome", "No name")}</span>}</span>
                <span className="text-[12px] text-muted-foreground">
                  {cat.staff_role_ids.length ? t(`${cat.staff_role_ids.length} cargo(s) da equipe`, `${cat.staff_role_ids.length} staff role(s)`) : t("só administradores", "admins only")} {open === cat.id ? "▴" : "▾"}
                </span>
              </button>
              {open === cat.id && (
                <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
                  <Field label={t("Nome", "Name")}>
                    <input maxLength={80} className={inputCls} value={cat.name} placeholder={t("Suporte", "Support")} onChange={(e) => setCat(cat.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Emoji" hint={t("Um emoji, ou <:nome:id> de um emoji do servidor.", "An emoji, or <:name:id> of a server emoji.")}>
                    <input maxLength={64} className={inputCls} value={cat.emoji} onChange={(e) => setCat(cat.id, { emoji: e.target.value })} />
                  </Field>
                  <Field label={t("Cor do botão", "Button color")} hint={t("Usada quando o painel abre por botões.", "Used when the panel opens with buttons.")}>
                    <select className={inputCls} value={cat.button_style || "primary"} onChange={(e) => setCat(cat.id, { button_style: e.target.value as ButtonColor })}>
                      <option value="primary">{t("Azul", "Blue")}</option>
                      <option value="secondary">{t("Cinza", "Gray")}</option>
                      <option value="success">{t("Verde", "Green")}</option>
                      <option value="danger">{t("Vermelho", "Red")}</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t("Descrição curta", "Short description")} hint={t("Aparece no painel. Máx. 100 caracteres.", "Shown on the panel. Max 100 characters.")}>
                      <input maxLength={100} className={inputCls} value={cat.description} placeholder={t("Dúvidas sobre o servidor", "Questions about the server")}
                        onChange={(e) => setCat(cat.id, { description: e.target.value })} />
                    </Field>
                  </div>
                  <Field label={t("Equipe que atende", "Staff who handle it")} hint={t("Quem tem Gerenciar Canais sempre vê os tickets.", "People with Manage Channels always see the tickets.")}>
                    <select className={inputCls} value="" onChange={(e) => e.target.value && cat.staff_role_ids.length < 10 &&
                      setCat(cat.id, { staff_role_ids: [...new Set([...cat.staff_role_ids, e.target.value])] })}>
                      <option value="">{t("Adicionar cargo", "Add role")}</option>
                      {roles.filter((r) => !cat.staff_role_ids.includes(r.id)).map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
                    </select>
                  </Field>
                  <Field label={t("Criar os canais em", "Create channels in")} hint={t("Uma categoria do Discord (opcional).", "A Discord category (optional).")}>
                    <select className={inputCls} value={cat.parent_id || ""} onChange={(e) => setCat(cat.id, { parent_id: e.target.value || null })}>
                      <option value="">{t("Fora de categorias", "Outside categories")}</option>
                      {discordCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  {cat.staff_role_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      {cat.staff_role_ids.map((id) => (
                        <button key={id} className={chip} onClick={() => setCat(cat.id, { staff_role_ids: cat.staff_role_ids.filter((x) => x !== id) })}>
                          @{roles.find((r) => r.id === id)?.name || t("cargo removido", "deleted role")} ✕
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Field label={t("Mensagem de boas-vindas", "Welcome message")} hint={t("Enviada dentro do ticket. Use {user} para mencionar o membro.", "Sent inside the ticket. Use {user} to mention the member.")}>
                      <textarea rows={3} maxLength={1000} className={`${inputCls} h-auto py-2`} value={cat.welcome_message}
                        placeholder={t("Olá {user}! Explique o que você precisa e a equipe responde por aqui.", "Hi {user}! Tell us what you need and the team will answer here.")}
                        onChange={(e) => setCat(cat.id, { welcome_message: e.target.value })} />
                    </Field>
                  </div>
                  <label className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3 sm:col-span-2">
                    <span>
                      <span className="block text-[14px] text-foreground">{t("Perguntar o motivo", "Ask for a reason")}</span>
                      <span className="block text-[12px] text-muted-foreground">{t("O membro descreve o problema num formulário antes de o ticket abrir.", "The member describes the problem in a form before the ticket opens.")}</span>
                    </span>
                    <Switch checked={cat.ask_reason} onCheckedChange={(v) => setCat(cat.id, { ask_reason: v })} />
                  </label>
                  <div className="sm:col-span-2">
                    <button className="text-[13px] text-destructive hover:underline"
                      onClick={() => set("categories", cfg.categories.filter((c) => c.id !== cat.id))}>{t("Remover categoria", "Remove category")}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("Regras e registros", "Rules and logs")} description={t("Limites por membro e onde a Lunna registra aberturas, fechamentos e exclusões.", "Limits per member and where Lunna logs openings, closings and deletions.")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Tickets abertos por membro", "Open tickets per member")} hint={t("Tickets fechados contam até serem excluídos.", "Closed tickets count until they're deleted.")}>
            <select className={inputCls} value={cfg.max_open_per_user} onChange={(e) => set("max_open_per_user", Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label={t("Canal de registros", "Log channel")} hint={t("O Discord não deixa a Lunna ler as conversas, então não há transcrição — só o resumo.", "Discord doesn't let Lunna read the conversations, so there's no transcript, only the summary.")}>
            <select className={inputCls} value={cfg.log_channel_id || ""} onChange={(e) => set("log_channel_id", e.target.value || null)}>
              <option value="">{t("Sem registros", "No logs")}</option>
              {textChannels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t("Dentro do ticket", "Inside the ticket")} description={t("Botões Fechar e Assumir na mensagem de boas-vindas. Fechado, o membro só lê; a equipe pode reabrir ou excluir. Comandos: /ticket adicionar, remover, renomear e fechar.", "Close and Claim buttons on the welcome message. Once closed, the member can only read; the team can reopen or delete it. Commands: /ticket add, remove, rename and close.")} />
    </div>
  )
}
