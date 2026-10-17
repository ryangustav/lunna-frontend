"use client"

import React, { use, useEffect, useRef, useState } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type PanelRole = { role_id: string; label: string; emoji: string; description: string }
type Panel = {
  id?: string
  title: string
  description: string
  channel_id: string
  color: number
  mode: "toggle" | "unique" | "add_only"
  style: "buttons" | "menu"
  roles: PanelRole[]
  status?: "published" | "pending" | "error"
  publish_error?: string | null
  skipped_roles?: string[]
}

const EMPTY: Panel = { title: "", description: "", channel_id: "", color: 0x7c3aed, mode: "toggle", style: "buttons", roles: [] }
const MODES = {
  toggle: { label: "Alternar", hint: "Clicar pega o cargo; clicar de novo tira. Ideal para notificações e interesses." },
  unique: { label: "Escolher só um", hint: "O membro fica com apenas um cargo do painel. Ideal para cores ou região." },
  add_only: { label: "Só adicionar", hint: "O cargo não pode ser removido pelo painel. Ideal para regras aceitas ou verificação." },
}
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const hex = (n: number) => `#${(n ?? 0x7c3aed).toString(16).padStart(6, "0")}`

export default function RolePanelsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [panels, setPanels] = useState<Panel[]>([])
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string; color?: number }[]>([])
  const [editing, setEditing] = useState<Panel | null>(null)
  const [saving, setSaving] = useState(false)
  const [newRole, setNewRole] = useState("")
  const poll = useRef<any>(null)

  const loadPanels = async () => {
    const res = await api.getRolePanels(guildId)
    setPanels(res?.data || [])
    return (res?.data || []) as Panel[]
  }

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [, c, r] = await Promise.all([loadPanels(), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      setChannels((c?.data || []).filter((ch: any) => ch.type === 0 || ch.type === 5))
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || "Não foi possível carregar os painéis.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
    return () => clearInterval(poll.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId])

  // While something is waiting for the bot to publish, refresh the status every few seconds
  const watchPublishing = () => {
    clearInterval(poll.current)
    let tries = 0
    poll.current = setInterval(async () => {
      tries++
      const list = await loadPanels().catch(() => [] as Panel[])
      if (!list.some((p) => p.status === "pending") || tries > 12) clearInterval(poll.current)
    }, 5000)
  }

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || "cargo removido"
  const channelName = (id: string) => channels.find((c) => c.id === id)?.name || "canal removido"

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id) await api.updateRolePanel(guildId, editing.id, editing)
      else await api.createRolePanel(guildId, editing)
      toast({ title: "Painel salvo", description: "A Lunna publica a mensagem no canal em alguns segundos." })
      setEditing(null)
      await loadPanels()
      watchPublishing()
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (panel: Panel) => {
    if (!panel.id || !confirm(`Excluir o painel "${panel.title}"? A mensagem também será apagada do canal.`)) return
    try {
      await api.deleteRolePanel(guildId, panel.id)
      setPanels((list) => list.filter((p) => p.id !== panel.id))
      toast({ title: "Painel excluído" })
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" })
    }
  }

  const setField = <K extends keyof Panel>(key: K, value: Panel[K]) => setEditing((p) => (p ? { ...p, [key]: value } : p))
  const setRole = (i: number, patch: Partial<PanelRole>) => setEditing((p) => p ? { ...p, roles: p.roles.map((r, j) => (j === i ? { ...r, ...patch } : r)) } : p)
  const moveRole = (i: number, d: number) => setEditing((p) => {
    if (!p) return p
    const list = [...p.roles]
    const j = i + d
    if (j < 0 || j >= list.length) return p
    ;[list[i], list[j]] = [list[j], list[i]]
    return { ...p, roles: list }
  })
  const addRole = () => {
    if (!editing || !newRole || editing.roles.length >= 25 || editing.roles.some((r) => r.role_id === newRole)) return
    setField("roles", [...editing.roles, { role_id: newRole, label: roleName(newRole), emoji: "", description: "" }])
    setNewRole("")
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  // ── Editor
  if (editing) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          eyebrow="Cargos por botão"
          title={editing.id ? "Editar painel" : "Novo painel"}
          description="Os membros pegam os cargos sozinhos clicando nos botões ou escolhendo no menu."
          action={
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setEditing(null)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={save} loading={saving} disabled={!editing.title || !editing.channel_id}>Salvar e publicar</PrimaryButton>
            </div>
          }
        />

        <Section title="Mensagem">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título">
              <input maxLength={100} className={inputCls} value={editing.title} placeholder="Escolha seus cargos" onChange={(e) => setField("title", e.target.value)} />
            </Field>
            <Field label="Canal">
              <select className={inputCls} value={editing.channel_id} onChange={(e) => setField("channel_id", e.target.value)}>
                <option value="">Selecione um canal</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field className="mt-4" label="Descrição" hint="Aceita Markdown do Discord.">
            <textarea rows={3} maxLength={1000} className={`${inputCls} h-auto py-2`} value={editing.description} onChange={(e) => setField("description", e.target.value)} />
          </Field>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Modo" hint={MODES[editing.mode].hint}>
              <select className={inputCls} value={editing.mode} onChange={(e) => setField("mode", e.target.value as Panel["mode"])}>
                {Object.entries(MODES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Formato">
              <select className={inputCls} value={editing.style} onChange={(e) => setField("style", e.target.value as Panel["style"])}>
                <option value="buttons">Botões</option>
                <option value="menu">Menu de seleção</option>
              </select>
            </Field>
            <Field label="Cor da barra lateral">
              <input type="color" className={`${inputCls} p-1`} value={hex(editing.color)} onChange={(e) => setField("color", parseInt(e.target.value.slice(1), 16))} />
            </Field>
          </div>
        </Section>

        <Section
          title={`Cargos (${editing.roles.length}/25)`}
          description="Cargos com permissões de staff, acima do cargo da Lunna ou gerenciados por integrações não são publicados."
        >
          {editing.roles.length > 0 && (
            <ul className="mb-4 flex flex-col gap-3">
              {editing.roles.map((r, i) => (
                <li key={r.role_id} className="rounded-[10px] border border-border p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-foreground">@{roleName(r.role_id)}</span>
                    <span className="flex items-center gap-1">
                      <button aria-label="Subir" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" onClick={() => moveRole(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                      <button aria-label="Descer" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" onClick={() => moveRole(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                      <button aria-label="Remover" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={() => setField("roles", editing.roles.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_110px_1.4fr]">
                    <Field label="Texto do botão">
                      <input maxLength={80} className={inputCls} value={r.label} onChange={(e) => setRole(i, { label: e.target.value })} />
                    </Field>
                    <Field label="Emoji" hint="😀 ou <:nome:id>">
                      <input maxLength={64} className={inputCls} value={r.emoji} onChange={(e) => setRole(i, { emoji: e.target.value })} />
                    </Field>
                    <Field label="Descrição (opcional)">
                      <input maxLength={100} className={inputCls} value={r.description} onChange={(e) => setRole(i, { description: e.target.value })} />
                    </Field>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Adicionar cargo" className="flex-1">
              <select className={inputCls} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="">Selecione um cargo</option>
                {roles.filter((r) => !editing.roles.some((x) => x.role_id === r.id)).map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
              </select>
            </Field>
            <SecondaryButton onClick={addRole} disabled={!newRole || editing.roles.length >= 25}>
              <Plus className="h-4 w-4" /> Adicionar
            </SecondaryButton>
          </div>
        </Section>

        <Section title="Prévia">
          <div className="rounded-[10px] border-l-4 bg-background p-4" style={{ borderLeftColor: hex(editing.color) }}>
            <p className="text-[16px] font-semibold text-foreground">{editing.title || "Título do painel"}</p>
            {editing.description && <p className="mt-1 whitespace-pre-line text-[13px] text-muted-foreground">{editing.description}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">{MODES[editing.mode].hint.split(".")[0]}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {editing.style === "buttons"
                ? editing.roles.map((r) => (
                    <span key={r.role_id} className="rounded-[6px] bg-secondary px-3 py-1.5 text-[13px] text-foreground">{r.emoji ? `${r.emoji} ` : ""}{r.label}</span>
                  ))
                : <span className="w-full rounded-[6px] border border-border px-3 py-2 text-[13px] text-muted-foreground">{editing.mode === "unique" ? "Escolha um cargo" : "Escolha seus cargos"} ▾</span>}
              {editing.roles.length === 0 && <span className="text-[13px] text-muted-foreground">Adicione cargos para ver os botões.</span>}
            </div>
          </div>
        </Section>
      </div>
    )
  }

  // ── List
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Comunidade"
        title="Cargos por botão"
        description="Painéis em que os membros pegam cargos sozinhos: cores, notificações, interesses ou verificação."
        action={<PrimaryButton onClick={() => setEditing({ ...EMPTY, channel_id: channels[0]?.id || "" })}><Plus className="h-4 w-4" /> Novo painel</PrimaryButton>}
      />

      {panels.length === 0 ? (
        <Section title="Nenhum painel ainda" description="Crie o primeiro painel e a Lunna envia a mensagem no canal escolhido." />
      ) : panels.map((p) => (
        <Section
          key={p.id}
          title={p.title}
          description={`#${channelName(p.channel_id)} · ${MODES[p.mode].label} · ${p.style === "menu" ? "Menu" : "Botões"} · ${p.roles.length} cargo(s)`}
          action={
            <div className="flex items-center gap-2">
              {p.status === "published" && <Pill tone="success">Publicado</Pill>}
              {p.status === "pending" && <Pill tone="neutral">Publicando…</Pill>}
              {p.status === "error" && <Pill tone="accent">Atenção</Pill>}
              <button aria-label="Editar" className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setEditing({ ...EMPTY, ...p })}>
                <Pencil className="h-4 w-4" />
              </button>
              <button aria-label="Excluir" className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => remove(p)}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          }
        >
          {(p.publish_error || p.roles.length > 0) && (
            <div className="flex flex-col gap-3">
              {p.roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.roles.map((r) => (
                    <span key={r.role_id} className={`rounded-full border px-3 py-1 text-[12px] ${p.skipped_roles?.includes(r.role_id) ? "border-destructive/40 text-destructive line-through" : "border-border text-foreground"}`}>
                      {r.emoji ? `${r.emoji} ` : ""}@{roleName(r.role_id)}
                    </span>
                  ))}
                </div>
              )}
              {p.publish_error && <p className="text-[12px] leading-[1.5] text-destructive">{p.publish_error}</p>}
            </div>
          )}
        </Section>
      ))}
    </div>
  )
}
