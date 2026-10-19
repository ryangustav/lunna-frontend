"use client"

import React, { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Field } from "@/components/dashboard/primitives"
import { cn } from "@/lib/utils"
import {
  GripVertical, Type, PanelLeft, Image as ImageIcon, Minus, List, Link2, MousePointerClick,
  ChevronUp, ChevronDown, Trash2, Copy, Plus,
} from "lucide-react"
import { useT, type T } from "@/lib/use-t"

// ─── Types (mirror lunna-backend tickets.controller.ts / Lunna_Bot TicketService.js) ─────────

export type ButtonColor = "primary" | "secondary" | "success" | "danger"

export type Block =
  | { type: "text"; content: string }
  | { type: "section"; content: string; thumbnail_url: string }
  | { type: "image"; urls: string[] }
  | { type: "separator"; divider: boolean; spacing: "small" | "large" }
  | { type: "category_list" }
  | { type: "links"; links: { label: string; url: string; emoji: string }[] }
  | { type: "open" }

export type PanelCategory = { id: string; name: string; emoji: string; description: string; button_style: ButtonColor }

export type PanelConfig = {
  color: number
  accent: boolean
  style: "buttons" | "menu" | "auto"
  menu_placeholder: string
  layout: Block[]
}

type Keyed = Block & { _k: string }

const BLOCKS = (t: T): { type: Block["type"]; label: string; hint: string; icon: React.ReactNode }[] => [
  { type: "text", label: t("Texto", "Text"), hint: t("Markdown: # título, **negrito**, listas", "Markdown: # heading, **bold**, lists"), icon: <Type /> },
  { type: "section", label: t("Texto com miniatura", "Text with thumbnail"), hint: t("Texto com uma imagem pequena ao lado", "Text with a small image beside it"), icon: <PanelLeft /> },
  { type: "image", label: t("Imagem", "Image"), hint: t("Banner ou galeria (até 10)", "Banner or gallery (up to 10)"), icon: <ImageIcon /> },
  { type: "separator", label: t("Separador", "Separator"), hint: t("Linha ou espaço entre blocos", "Line or space between blocks"), icon: <Minus /> },
  { type: "category_list", label: t("Lista de categorias", "Category list"), hint: t("Emoji, nome e descrição de cada categoria", "Emoji, name and description of each category"), icon: <List /> },
  { type: "links", label: t("Botões de link", "Link buttons"), hint: t("Até 5 links (regras, site…)", "Up to 5 links (rules, website…)"), icon: <Link2 /> },
  { type: "open", label: t("Abrir ticket", "Open ticket"), hint: t("Botões ou menu das categorias", "Category buttons or menu"), icon: <MousePointerClick /> },
]
const meta = (type: Block["type"], t: T) => BLOCKS(t).find((b) => b.type === type)!

export function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "text": return { type, content: "" }
    case "section": return { type, content: "", thumbnail_url: "" }
    case "image": return { type, urls: [""] }
    case "separator": return { type, divider: true, spacing: "small" }
    case "links": return { type, links: [{ label: "", url: "", emoji: "" }] }
    default: return { type } as Block
  }
}

export function defaultLayout(title: string, description: string): Block[] {
  return [
    { type: "text", content: `## 🎫 ${title || "Suporte"}\n${description || ""}` },
    { type: "separator", divider: true, spacing: "small" },
    { type: "category_list" },
    { type: "open" },
  ]
}

const listText = (cats: PanelCategory[]) =>
  cats.filter((c) => c.description).map((c) => `${c.emoji || "🎫"} **${c.name}** — ${c.description}`).join("\n")

/** Same count the backend enforces: Discord allows 40 components and 4000 characters per message. */
export function panelLimits(cfg: PanelConfig, cats: PanelCategory[]) {
  const useMenu = cfg.style === "menu" || (cfg.style === "auto" && cats.length > 5)
  const list = listText(cats)
  const len = (t: string) => t.length + (t.match(/{server}/g) || []).length * 100 + (t.match(/{members}/g) || []).length * 7
  let components = 1
  let chars = 0
  for (const b of cfg.layout) {
    if (b.type === "text" && b.content) { components += 1; chars += len(b.content) }
    if (b.type === "section" && b.content) { components += b.thumbnail_url ? 3 : 1; chars += len(b.content) }
    if (b.type === "image") { const n = b.urls.filter(Boolean).length; if (n) components += 1 + n }
    if (b.type === "separator") components += 1
    if (b.type === "category_list" && list) { components += 1; chars += list.length }
    if (b.type === "links") { const n = b.links.filter((l) => l.label && l.url).length; if (n) components += 1 + n }
    if (b.type === "open") components += !cats.length ? 1 : useMenu ? 2 : Math.ceil(cats.length / 5) + cats.length
  }
  return { components, chars }
}

// ─── Discord-flavoured markdown preview (no HTML injection: builds React nodes) ──────────────

function inline(text: string, key: string, t: T): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|`[^`]+`|<@&?\d+>|<#\d+>)/g)
  return parts.filter(Boolean).map((p, i) => {
    const k = `${key}-${i}`
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={k} className="font-semibold text-white">{p.slice(2, -2)}</strong>
    if (p.startsWith("__") && p.endsWith("__")) return <u key={k}>{p.slice(2, -2)}</u>
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>
    if (p.startsWith("`") && p.endsWith("`")) return <code key={k} className="rounded bg-[#1e1f22] px-1 text-[13px]">{p.slice(1, -1)}</code>
    if (/^<(@&?|#)\d+>$/.test(p)) return <span key={k} className="rounded bg-[#5865f2]/30 px-1 text-[#c9cdfb]">{p.includes("#") ? t("#canal", "#channel") : t("@menção", "@mention")}</span>
    return <React.Fragment key={k}>{p}</React.Fragment>
  })
}

function Markdown({ text }: { text: string }) {
  const t = useT()
  const filled = text.replace(/{server}/g, t("Seu servidor", "Your server")).replace(/{members}/g, t("1.234", "1,234"))
  return (
    <div className="space-y-0.5 text-[14px] leading-[1.4] text-[#dbdee1]">
      {filled.split("\n").map((line, i) => {
        const k = `l${i}`
        if (line.startsWith("### ")) return <p key={k} className="pt-1 text-[16px] font-bold text-white">{inline(line.slice(4), k, t)}</p>
        if (line.startsWith("## ")) return <p key={k} className="pt-1 text-[20px] font-bold text-white">{inline(line.slice(3), k, t)}</p>
        if (line.startsWith("# ")) return <p key={k} className="pt-1 text-[24px] font-bold text-white">{inline(line.slice(2), k, t)}</p>
        if (line.startsWith("-# ")) return <p key={k} className="text-[12px] text-[#949ba4]">{inline(line.slice(3), k, t)}</p>
        if (/^[-*] /.test(line)) return <p key={k} className="pl-4 before:-ml-3 before:mr-2 before:content-['•']">{inline(line.slice(2), k, t)}</p>
        if (line.startsWith("> ")) return <p key={k} className="border-l-4 border-[#4e5058] pl-3">{inline(line.slice(2), k, t)}</p>
        if (!line.trim()) return <div key={k} className="h-2" />
        return <p key={k}>{inline(line, k, t)}</p>
      })}
    </div>
  )
}

const BUTTON_BG: Record<ButtonColor, string> = {
  primary: "bg-[#5865f2]", secondary: "bg-[#4e5058]", success: "bg-[#248046]", danger: "bg-[#da373c]",
}

export function PanelPreview({ cfg, cats }: { cfg: PanelConfig; cats: PanelCategory[] }) {
  const t = useT()
  const useMenu = cfg.style === "menu" || (cfg.style === "auto" && cats.length > 5)
  const list = listText(cats)
  let opened = false
  return (
    <div className="rounded-[12px] bg-[#313338] p-4">
      <div className="flex gap-3">
        <img src="/icon.png" alt="" className="h-10 w-10 shrink-0 rounded-full bg-[#7c3aed]/40" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[15px] font-semibold text-white">Lunna <span className="ml-1 rounded bg-[#5865f2] px-1 py-px text-[10px] font-semibold uppercase">App</span></p>
          <div className={cn("flex flex-col gap-2 rounded-[8px] border border-white/5 bg-[#393a41] p-4", cfg.accent && "border-l-4")}
            style={cfg.accent ? { borderLeftColor: `#${cfg.color.toString(16).padStart(6, "0")}` } : undefined}>
            {cfg.layout.map((b, i) => {
              const k = `b${i}`
              switch (b.type) {
                case "text": return b.content ? <Markdown key={k} text={b.content} /> : null
                case "section":
                  if (!b.content) return null
                  return (
                    <div key={k} className="flex items-start gap-3">
                      <div className="min-w-0 flex-1"><Markdown text={b.content} /></div>
                      {b.thumbnail_url && <img src={b.thumbnail_url} alt="" className="h-[85px] w-[85px] shrink-0 rounded-[8px] object-cover" />}
                    </div>
                  )
                case "image": {
                  const urls = b.urls.filter(Boolean)
                  if (!urls.length) return null
                  return (
                    <div key={k} className={cn("grid gap-1 overflow-hidden rounded-[8px]", urls.length > 1 && "grid-cols-2")}>
                      {urls.map((u, j) => <img key={j} src={u} alt="" className="max-h-[300px] w-full object-cover" />)}
                    </div>
                  )
                }
                case "separator":
                  return <div key={k} className={cn(b.spacing === "large" ? "my-3" : "my-1", b.divider && "border-t border-white/10")} />
                case "category_list": return list ? <Markdown key={k} text={list} /> : null
                case "links": {
                  const links = b.links.filter((l) => l.label && l.url)
                  if (!links.length) return null
                  return (
                    <div key={k} className="flex flex-wrap gap-2">
                      {links.map((l, j) => (
                        <span key={j} className="rounded-[8px] bg-[#4e5058] px-4 py-1.5 text-[14px] font-medium text-white">{l.emoji} {l.label} ↗</span>
                      ))}
                    </div>
                  )
                }
                case "open": {
                  if (opened) return null
                  opened = true
                  if (!cats.length) return <p key={k} className="text-[14px] italic text-[#949ba4]">{t("Nenhuma categoria configurada ainda.", "No categories set up yet.")}</p>
                  if (useMenu) {
                    return (
                      <div key={k} className="flex items-center justify-between rounded-[8px] border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-[14px] text-[#949ba4]">
                        {cfg.menu_placeholder || t("Escolha o assunto do ticket", "Choose what the ticket is about")} <ChevronDown className="h-4 w-4" />
                      </div>
                    )
                  }
                  return (
                    <div key={k} className="flex flex-wrap gap-2">
                      {cats.map((c) => (
                        <span key={c.id} className={cn("rounded-[8px] px-4 py-1.5 text-[14px] font-medium text-white", BUTTON_BG[c.button_style] || BUTTON_BG.primary)}>
                          {c.emoji} {c.name}
                        </span>
                      ))}
                    </div>
                  )
                }
              }
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Builder ────────────────────────────────────────────────────────────────

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const iconBtn = "flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4"
let keySeq = 0
const withKey = (b: Block): Keyed => ({ ...b, _k: `k${++keySeq}` })
const strip = (blocks: Keyed[]): Block[] => blocks.map(({ _k, ...b }) => b as Block)

export function PanelBuilder({ value, cats, onChange }: { value: PanelConfig; cats: PanelCategory[]; onChange: (v: PanelConfig) => void }) {
  const t = useT()
  // Stable keys for React while blocks move around (not saved)
  const [keyed, setKeyed] = useState<Keyed[]>(() => value.layout.map(withKey))
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dropAt, setDropAt] = useState<number | null>(null)
  const [openBlock, setOpenBlock] = useState<string | null>(null)

  const commit = (next: Keyed[]) => {
    setKeyed(next)
    onChange({ ...value, layout: strip(next) })
  }
  const update = (i: number, patch: Partial<Block>) => commit(keyed.map((b, j) => (j === i ? ({ ...b, ...patch } as Keyed) : b)))
  const move = (from: number, to: number) => {
    if (from === to || from + 1 === to) return
    const next = [...keyed]
    const [item] = next.splice(from, 1)
    next.splice(from < to ? to - 1 : to, 0, item)
    commit(next)
  }
  const insert = (type: Block["type"], at: number) => {
    if (type === "open" && keyed.some((b) => b.type === "open")) return
    const block = withKey(emptyBlock(type))
    const next = [...keyed]
    next.splice(at, 0, block)
    commit(next)
    if (!["category_list", "open"].includes(type)) setOpenBlock(block._k)
  }

  // Native drag & drop: blocks reorder, palette items get inserted where they are dropped
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDropAt(e.clientY < r.top + r.height / 2 ? i : i + 1)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("text/plain")
    const at = dropAt ?? keyed.length
    if (data.startsWith("new:")) insert(data.slice(4) as Block["type"], at)
    else if (dragFrom !== null) move(dragFrom, at)
    setDragFrom(null)
    setDropAt(null)
  }
  const endDrag = () => { setDragFrom(null); setDropAt(null) }

  const limits = panelLimits(value, cats)
  const hasOpen = keyed.some((b) => b.type === "open")

  const indicator = (i: number) => dropAt === i && <div className="h-1 rounded-full bg-[#7c3aed]" />

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Palette */}
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{t("Blocos · arraste para o painel ou clique para adicionar", "Blocks · drag onto the panel or click to add")}</p>
          <div className="flex flex-wrap gap-2">
            {BLOCKS(t).map((b) => {
              const disabled = b.type === "open" && hasOpen
              return (
                <button key={b.type} type="button" draggable={!disabled} disabled={disabled} title={b.hint}
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", `new:${b.type}`); e.dataTransfer.effectAllowed = "copy" }}
                  onDragEnd={endDrag}
                  onClick={() => insert(b.type, keyed.length)}
                  className="flex cursor-grab items-center gap-2 rounded-[10px] border border-dashed border-border bg-secondary/50 px-3 py-2 text-[13px] text-foreground hover:border-[#7c3aed]/60 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[#a78bfa]">
                  {b.icon} {b.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex min-h-[120px] flex-col gap-2 rounded-[12px] border border-border bg-background/40 p-3"
          onDragOver={(e) => { e.preventDefault(); if (!keyed.length) setDropAt(0) }} onDrop={onDrop}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropAt(null) }}>
          {keyed.length === 0 && <p className="m-auto text-[13px] text-muted-foreground">{t("Arraste blocos para cá", "Drag blocks here")}</p>}
          {keyed.map((b, i) => {
            const m = meta(b.type, t)
            const expanded = openBlock === b._k
            const editable = !["category_list", "open"].includes(b.type)
            return (
              <React.Fragment key={b._k}>
                {indicator(i)}
                <div draggable onDragStart={(e) => { setDragFrom(i); e.dataTransfer.setData("text/plain", `move:${i}`); e.dataTransfer.effectAllowed = "move" }}
                  onDragEnd={endDrag} onDragOver={(e) => onDragOver(e, i)}
                  className={cn("rounded-[10px] border border-border bg-card", dragFrom === i && "opacity-40")}>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-[#a78bfa]"
                      onClick={() => editable && setOpenBlock(expanded ? null : b._k)}>
                      {m.icon}
                      <span className="shrink-0 whitespace-nowrap text-[14px] text-foreground">{m.label}</span>
                      <span className="min-w-0 truncate text-[12px] text-muted-foreground">{summary(b, t)}</span>
                    </button>
                    <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={t("Subir", "Move up")}><ChevronUp /></button>
                    <button type="button" className={iconBtn} disabled={i === keyed.length - 1} onClick={() => move(i, i + 2)} aria-label={t("Descer", "Move down")}><ChevronDown /></button>
                    {b.type !== "open" && (
                      <button type="button" className={iconBtn} aria-label={t("Duplicar", "Duplicate")}
                        onClick={() => { const next = [...keyed]; next.splice(i + 1, 0, withKey(strip([b])[0])); commit(next) }}><Copy /></button>
                    )}
                    <button type="button" className={cn(iconBtn, "hover:text-destructive")} aria-label={t("Remover", "Remove")}
                      onClick={() => commit(keyed.filter((_, j) => j !== i))}><Trash2 /></button>
                  </div>
                  {expanded && <div className="border-t border-border p-3"><BlockEditor block={b} onChange={(patch) => update(i, patch)} /></div>}
                </div>
              </React.Fragment>
            )
          })}
          {indicator(keyed.length)}
        </div>

        {!hasOpen && cats.length > 0 && (
          <p className="text-[12px] text-muted-foreground">{t("Sem o bloco “Abrir ticket”, os botões vão para o fim do painel.", "Without the “Open ticket” block, the buttons go to the end of the panel.")}</p>
        )}

        {/* Panel options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Como abrir o ticket", "How tickets are opened")}>
            <select className={inputCls} value={value.style} onChange={(e) => onChange({ ...value, style: e.target.value as PanelConfig["style"] })}>
              <option value="buttons">{t("Botões", "Buttons")}</option>
              <option value="menu">{t("Menu de seleção", "Select menu")}</option>
              <option value="auto">{t("Automático (menu com mais de 5 categorias)", "Automatic (menu with more than 5 categories)")}</option>
            </select>
          </Field>
          {value.style !== "buttons" && (
            <Field label={t("Texto do menu", "Menu text")}>
              <input maxLength={150} className={inputCls} value={value.menu_placeholder} onChange={(e) => onChange({ ...value, menu_placeholder: e.target.value })} />
            </Field>
          )}
          <Field label={t("Borda colorida", "Colored border")}>
            <div className="flex h-10 items-center gap-3">
              <Switch checked={value.accent} onCheckedChange={(v) => onChange({ ...value, accent: v })} />
              {value.accent && (
                <input type="color" className="h-9 w-16 cursor-pointer rounded-[8px] border border-border bg-background"
                  value={`#${value.color.toString(16).padStart(6, "0")}`} onChange={(e) => onChange({ ...value, color: parseInt(e.target.value.slice(1), 16) })} />
              )}
            </div>
          </Field>
        </div>
        <p className="text-[12px] text-muted-foreground">
          {t("Nos textos:", "In texts:")} <code>{"{server}"}</code> {t("nome do servidor", "server name")} · <code>{"{members}"}</code> {t("número de membros", "member count")} · <code>{"<@&id>"}</code> {t("menciona cargo (sem notificar)", "mentions a role (without pinging)")}.
        </p>
      </div>

      {/* Live preview */}
      <div className="flex min-w-0 flex-col gap-2 xl:sticky xl:top-24 xl:self-start">
        <PanelPreview cfg={value} cats={cats} />
        <div className="flex gap-4 text-[12px]">
          <span className={limits.components > 40 ? "text-destructive" : "text-muted-foreground"}>{limits.components} / 40 {t("componentes", "components")}</span>
          <span className={limits.chars > 4000 ? "text-destructive" : "text-muted-foreground"}>{limits.chars} / 4000 {t("caracteres", "characters")}</span>
        </div>
      </div>
    </div>
  )
}

function summary(b: Block, t: T) {
  switch (b.type) {
    case "text": case "section": return b.content.split("\n")[0].replace(/^#+\s|^-#\s/, "") || t("vazio", "empty")
    case "image": { const n = b.urls.filter(Boolean).length; return n ? t(`${n} imagem(ns)`, `${n} image(s)`) : t("sem imagem", "no image") }
    case "separator": return `${b.divider ? t("com linha", "with line") : t("só espaço", "space only")} · ${b.spacing === "large" ? t("grande", "large") : t("pequeno", "small")}`
    case "links": { const n = b.links.filter((l) => l.label && l.url).length; return `${n} link(s)` }
    case "category_list": return t("automático", "automatic")
    case "open": return t("botões ou menu das categorias", "category buttons or menu")
  }
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
  const t = useT()
  switch (block.type) {
    case "text":
      return (
        <textarea rows={4} maxLength={4000} className={`${inputCls} h-auto py-2 font-mono text-[13px]`} value={block.content}
          placeholder={t("## Central de ajuda\nEscolha um assunto abaixo.", "## Help center\nPick a topic below.")} onChange={(e) => onChange({ content: e.target.value })} />
      )
    case "section":
      return (
        <div className="flex flex-col gap-3">
          <textarea rows={3} maxLength={4000} className={`${inputCls} h-auto py-2 font-mono text-[13px]`} value={block.content}
            onChange={(e) => onChange({ content: e.target.value })} />
          <Field label={t("URL da miniatura", "Thumbnail URL")} hint={t("https://… (png, jpg, gif ou webp)", "https://… (png, jpg, gif or webp)")}>
            <input className={inputCls} value={block.thumbnail_url} placeholder="https://" onChange={(e) => onChange({ thumbnail_url: e.target.value })} />
          </Field>
        </div>
      )
    case "image":
      return (
        <div className="flex flex-col gap-2">
          {block.urls.map((u, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} value={u} placeholder="https://…/banner.png"
                onChange={(e) => onChange({ urls: block.urls.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button type="button" className={iconBtn} aria-label={t("Remover imagem", "Remove image")} onClick={() => onChange({ urls: block.urls.filter((_, j) => j !== i) })}><Trash2 /></button>
            </div>
          ))}
          {block.urls.length < 10 && (
            <button type="button" className="flex items-center gap-1 self-start text-[13px] text-[#a78bfa] hover:underline [&_svg]:h-4 [&_svg]:w-4"
              onClick={() => onChange({ urls: [...block.urls, ""] })}><Plus /> {t("Adicionar imagem", "Add image")}</button>
          )}
        </div>
      )
    case "separator":
      return (
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-[14px] text-foreground">
            <Switch checked={block.divider} onCheckedChange={(v) => onChange({ divider: v })} /> {t("Mostrar linha", "Show line")}
          </label>
          <select className={`${inputCls} w-auto`} value={block.spacing} onChange={(e) => onChange({ spacing: e.target.value as "small" | "large" })}>
            <option value="small">{t("Espaço pequeno", "Small space")}</option>
            <option value="large">{t("Espaço grande", "Large space")}</option>
          </select>
        </div>
      )
    case "links":
      return (
        <div className="flex flex-col gap-2">
          {block.links.map((l, i) => {
            const set = (patch: Partial<typeof l>) => onChange({ links: block.links.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            return (
              <div key={i} className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1.4fr)_32px] gap-2">
                <input maxLength={64} className={inputCls} value={l.emoji} placeholder="📜" onChange={(e) => set({ emoji: e.target.value })} />
                <input maxLength={80} className={inputCls} value={l.label} placeholder={t("Regras", "Rules")} onChange={(e) => set({ label: e.target.value })} />
                <input className={inputCls} value={l.url} placeholder="https://" onChange={(e) => set({ url: e.target.value })} />
                <button type="button" className={iconBtn} aria-label={t("Remover link", "Remove link")} onClick={() => onChange({ links: block.links.filter((_, j) => j !== i) })}><Trash2 /></button>
              </div>
            )
          })}
          {block.links.length < 5 && (
            <button type="button" className="flex items-center gap-1 self-start text-[13px] text-[#a78bfa] hover:underline [&_svg]:h-4 [&_svg]:w-4"
              onClick={() => onChange({ links: [...block.links, { label: "", url: "", emoji: "" }] })}><Plus /> {t("Adicionar link", "Add link")}</button>
          )}
        </div>
      )
    default:
      return null
  }
}
