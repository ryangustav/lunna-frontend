"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Trash2, ImageUp, X } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Kind = "avatar" | "banner"
type ActivityType = "custom" | "playing" | "listening" | "watching" | "competing" | "streaming"
type Item = { type: ActivityType; text: string; url?: string }
type Presence = { status: "online" | "idle" | "dnd" | "invisible"; interval_sec: number; items: Item[] }
type Profile = {
  revision: number; bio: string | null; presence: Presence | null
  avatar_asset: string | null; banner_asset: string | null
  applied: { revision: number; at: string | null; errors?: Record<string, string> } | null
  current: { username: string; avatar_url: string; banner_url: string | null; bio: string; at: string | null } | null
  updated_at: string | null
}

// Mirrors lunna-backend admin.controller.ts (PROFILE_*) and Lunna_Bot BotProfileService
const BIO_MAX = 400
const MAX_ITEMS = 10
const IMAGE_MAX = 8 * 1024 * 1024
const STATUS: Record<Presence["status"], { label: string; color: string }> = {
  online: { label: "Online", color: "#23a55a" },
  idle: { label: "Ausente", color: "#f0b232" },
  dnd: { label: "Não perturbe", color: "#f23f43" },
  invisible: { label: "Invisível", color: "#80848e" },
}
const TYPES: Record<ActivityType, { label: string; prefix: string }> = {
  custom: { label: "Status personalizado", prefix: "" },
  playing: { label: "Jogando", prefix: "Jogando" },
  listening: { label: "Ouvindo", prefix: "Ouvindo" },
  watching: { label: "Assistindo", prefix: "Assistindo" },
  competing: { label: "Competindo em", prefix: "Competindo em" },
  streaming: { label: "Transmitindo", prefix: "Transmitindo" },
}
const STREAM_URL = /^https:\/\/(www\.)?(twitch\.tv|youtube\.com)\/\S+$/i
const DEFAULT_PRESENCE: Presence = { status: "dnd", interval_sec: 60, items: [{ type: "custom", text: "💸 Play mines!" }] }

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
// Preview only: real numbers are filled in by the bot
const sample = (t: string) => t.replace(/\{(servidores|servers)\}/gi, "1.234").replace(/\{(membros|members)\}/gi, "98.765").replace(/\{(versao|versão|version)\}/gi, "3.0")
const line = (i: Item) => (i.type === "custom" ? sample(i.text) : `${TYPES[i.type].prefix} ${sample(i.text)}`)
const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result))
  r.onerror = () => reject(new Error("Não consegui ler o arquivo."))
  r.readAsDataURL(file)
})

export default function AdminBotProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bio, setBio] = useState("")
  const [presence, setPresence] = useState<Presence>(DEFAULT_PRESENCE)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [picked, setPicked] = useState<Record<Kind, string | null>>({ avatar: null, banner: null })
  const [uploading, setUploading] = useState<Kind | null>(null)
  const [tick, setTick] = useState(0)
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedOnce = useRef(false)

  const load = async () => {
    try {
      setError(null)
      const r = await api.getBotProfile()
      const p: Profile = r.data
      setProfile(p)
      // the form starts from what was saved (or what Discord shows) and isn't overwritten while editing
      if (!loadedOnce.current) {
        loadedOnce.current = true
        setBio(p.bio ?? p.current?.bio ?? "")
        setPresence(p.presence ? { ...DEFAULT_PRESENCE, ...p.presence } : DEFAULT_PRESENCE)
      }
    } catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load(); return () => { if (poll.current) clearTimeout(poll.current) } }, [])

  const pending = !!profile && profile.revision > 0 && profile.applied?.revision !== profile.revision
  // the bot checks every ~20s: refresh until it has applied the latest change
  useEffect(() => {
    if (poll.current) clearTimeout(poll.current)
    if (pending) poll.current = setTimeout(load, 5000)
  }, [profile])

  // preview rotates through the statuses
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const edit = (fn: (p: Presence) => Presence) => { setPresence(fn); setDirty(true) }
  const setItem = (i: number, patch: Partial<Item>) => edit((p) => ({ ...p, items: p.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }))

  const problems = useMemo(() => presence.items.map((it) => {
    if (!it.text.trim()) return "Escreva o texto do status."
    if (it.type === "streaming" && !STREAM_URL.test(it.url || "")) return "Transmitindo precisa de um link da Twitch ou do YouTube."
    return null
  }), [presence])

  const save = async () => {
    if (problems.some(Boolean)) { toast({ title: "Confira os status", description: problems.find(Boolean)!, variant: "destructive" }); return }
    setSaving(true)
    try {
      const r = await api.updateBotProfile({ bio, presence })
      setProfile(r.data); setDirty(false)
      toast({ title: "Salvo", description: "A Lunna aplica em até 20 segundos." })
    } catch (e: any) { toast({ title: "Não foi possível salvar", description: e.message, variant: "destructive" }) } finally { setSaving(false) }
  }

  const pick = async (kind: Kind, file?: File | null) => {
    if (!file) return
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) { toast({ title: "Formato não aceito", description: "Use PNG, JPG, GIF ou WEBP.", variant: "destructive" }); return }
    if (file.size > IMAGE_MAX) { toast({ title: "Imagem grande demais", description: "O máximo é 8 MB.", variant: "destructive" }); return }
    try { const url = await readAsDataUrl(file); setPicked((p) => ({ ...p, [kind]: url })) } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }) }
  }

  const upload = async (kind: Kind, remove = false) => {
    if (remove && !window.confirm(kind === "avatar" ? "Voltar para o avatar padrão do Discord?" : "Remover o banner da Lunna?")) return
    setUploading(kind)
    try {
      const r = remove ? await api.removeBotProfileImage(kind) : await api.uploadBotProfileImage(kind, picked[kind]!)
      setProfile(r.data)
      if (!remove) setPicked((p) => ({ ...p, [kind]: null }))
      toast({ title: remove ? "Removendo…" : "Enviado", description: "A Lunna aplica em até 20 segundos." })
    } catch (e: any) { toast({ title: "Não foi possível enviar", description: e.message, variant: "destructive" }) } finally { setUploading(null) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!profile) return <LoadingState />

  const cur = profile.current
  const errors = profile.applied?.errors || {}
  const removing = (k: Kind) => pending && profile[`${k}_asset`] === "remove"
  const avatarSrc = picked.avatar || (removing("avatar") ? null : cur?.avatar_url) || null
  const bannerSrc = picked.banner || (removing("banner") ? null : cur?.banner_url) || null
  const shown = presence.items.length ? presence.items[tick % presence.items.length] : null
  const st = STATUS[presence.status]

  const imageBlock = (kind: Kind) => {
    const label = kind === "avatar" ? "Avatar" : "Banner"
    const has = kind === "avatar" ? !!cur?.avatar_url : !!cur?.banner_url
    return (
      <div className="flex flex-col gap-2 rounded-[10px] border border-border p-4">
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[14px] font-medium text-foreground">{label}</p>
          {errors[kind] && !pending && <Pill tone="accent">Falhou</Pill>}
        </div>
        <p className="text-[12px] text-muted-foreground">
          {kind === "avatar" ? "Quadrado, pelo menos 512 × 512. GIF animado funciona." : "Proporção 17:6 — ideal 1360 × 480. Deixe o canto inferior esquerdo livre (o avatar fica em cima)."}
          {" "}PNG, JPG, GIF ou WEBP até 8 MB. O Discord limita trocas seguidas: evite enviar várias vezes em poucos minutos.
        </p>
        {errors[kind] && !pending && <p className="text-[12px] text-amber-500">{errors[kind]}</p>}
        <div className="flex flex-wrap gap-2">
          {picked[kind] ? (
            <>
              <PrimaryButton loading={uploading === kind} onClick={() => upload(kind)}>Aplicar {label.toLowerCase()}</PrimaryButton>
              <SecondaryButton disabled={!!uploading} onClick={() => setPicked((p) => ({ ...p, [kind]: null }))}><X className="h-4 w-4" /> Cancelar</SecondaryButton>
            </>
          ) : (
            <>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary">
                <ImageUp className="h-4 w-4" /> Escolher imagem
                <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => { pick(kind, e.target.files?.[0]); e.target.value = "" }} />
              </label>
              {has && <SecondaryButton disabled={!!uploading || pending} onClick={() => upload(kind, true)}><Trash2 className="h-4 w-4" /> Remover</SecondaryButton>}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Perfil do bot"
        description="Avatar, banner, Sobre mim e status da Lunna. Salvou aqui, a Lunna aplica sozinha em até 20 segundos."
        action={pending ? <Pill tone="accent">Aplicando…</Pill> : profile.applied ? <Pill tone="success">Aplicado</Pill> : undefined} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Section title="Imagens" description="São enviadas na hora; não dependem do botão Salvar.">
            <div className="grid gap-3 sm:grid-cols-2">
              {imageBlock("avatar")}
              {imageBlock("banner")}
            </div>
          </Section>

          <Section title="Sobre mim" description="O texto do perfil da Lunna (é a descrição do aplicativo no Discord). Aceita markdown do Discord.">
            <Field label={`Bio · ${bio.length}/${BIO_MAX}`} hint={errors.bio && !pending ? <span className="text-amber-500">{errors.bio}</span> : undefined}>
              <textarea className={`${inputCls} h-32 resize-y py-2`} maxLength={BIO_MAX} value={bio} onChange={(e) => { setBio(e.target.value); setDirty(true) }}
                placeholder="🌙 Lunna — economia, RPG, níveis e moderação. Painel: lunnabot.fun" />
            </Field>
          </Section>

          <Section title="Status" description="Um ou vários: com mais de um, a Lunna alterna entre eles. Use {servidores}, {membros} ou {versao} para números ao vivo.">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Disponibilidade">
                  <select className={inputCls} value={presence.status} onChange={(e) => edit((p) => ({ ...p, status: e.target.value as Presence["status"] }))}>
                    {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Trocar a cada (segundos)" hint="Mínimo 30 (limite do Discord).">
                  <input type="number" min={30} max={3600} disabled={presence.items.length < 2} className={inputCls} value={presence.interval_sec}
                    onChange={(e) => edit((p) => ({ ...p, interval_sec: Number(e.target.value) }))} onBlur={() => edit((p) => ({ ...p, interval_sec: Math.min(3600, Math.max(30, p.interval_sec || 60)) }))} />
                </Field>
              </div>

              {presence.items.map((it, i) => (
                <div key={i} className={`flex flex-col gap-2 rounded-[10px] border p-3 ${problems[i] && it.text ? "border-amber-500/40" : "border-border"}`}>
                  <div className="flex gap-2">
                    <select className={`${inputCls} !w-40 shrink-0 sm:!w-48`} value={it.type} onChange={(e) => setItem(i, { type: e.target.value as ActivityType })}>
                      {Object.entries(TYPES).map(([v, t]) => <option key={v} value={v}>{t.label}</option>)}
                    </select>
                    <input className={`${inputCls} min-w-0 flex-1`} maxLength={128} value={it.text} placeholder={it.type === "custom" ? "💸 Jogue /mines!" : "em {servidores} servidores"} onChange={(e) => setItem(i, { text: e.target.value })} />
                    <button type="button" aria-label="Remover status" className="shrink-0 rounded-[10px] px-2 text-muted-foreground hover:text-red-500"
                      onClick={() => edit((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {it.type === "streaming" && (
                    <input className={inputCls} maxLength={200} value={it.url || ""} placeholder="https://twitch.tv/seu-canal" onChange={(e) => setItem(i, { url: e.target.value })} />
                  )}
                  {problems[i] && it.text && <p className="text-[12px] text-amber-500">{problems[i]}</p>}
                </div>
              ))}
              {presence.items.length === 0 && <p className="text-[13px] text-muted-foreground">Sem status: a Lunna mostra só a disponibilidade.</p>}
              <div>
                <SecondaryButton disabled={presence.items.length >= MAX_ITEMS} onClick={() => edit((p) => ({ ...p, items: [...p.items, { type: "custom", text: "" }] }))}>
                  <Plus className="h-4 w-4" /> Adicionar status
                </SecondaryButton>
              </div>
            </div>
          </Section>

          <div className="flex items-center gap-3">
            <PrimaryButton loading={saving} disabled={!dirty} onClick={save}>Salvar bio e status</PrimaryButton>
            {dirty && <span className="text-[13px] text-muted-foreground">Alterações não salvas</span>}
          </div>
        </div>

        {/* Preview, Discord-like */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Prévia</p>
          <div className="overflow-hidden rounded-[16px] border border-border bg-[#111214] text-[#dbdee1]">
            <div className="relative h-[120px] bg-[#7c3aed]" style={bannerSrc ? { backgroundImage: `url(${bannerSrc})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
              <div className="absolute -bottom-10 left-4 h-[84px] w-[84px] rounded-full border-[6px] border-[#111214] bg-[#2b2d31]">
                {avatarSrc ? <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover" /> : <div className="h-full w-full rounded-full bg-[#5865f2]" />}
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-[5px] border-[#111214]" style={{ background: st.color }} title={st.label} />
              </div>
            </div>
            <div className="px-4 pb-4 pt-12">
              <p className="text-[20px] font-bold text-white">{cur?.username || "Lunna"} <span className="ml-1 rounded bg-[#5865f2] px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">APP</span></p>
              <p className="min-h-[20px] text-[14px] text-[#dbdee1]">{shown ? line(shown) : ""}</p>
              {presence.items.length > 1 && <p className="text-[11px] text-[#949ba4]">{(tick % presence.items.length) + 1} de {presence.items.length} · troca a cada {presence.interval_sec}s</p>}
              <div className="mt-3 rounded-[8px] bg-[#1e1f22] p-3">
                <p className="mb-1 text-[12px] font-bold uppercase text-[#b5bac1]">Sobre mim</p>
                <p className="whitespace-pre-wrap break-words text-[13px]">{bio || <span className="text-[#949ba4]">Sem bio</span>}</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {pending ? "Esperando a Lunna aplicar a última alteração…" : cur?.at ? `Discord atualizado em ${new Date(cur.at).toLocaleString("pt-BR")}.` : "A Lunna ainda não publicou o perfil atual (ela faz isso ao ligar)."}
          </p>
        </div>
      </div>
    </div>
  )
}
