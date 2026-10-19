"use client"

import React, { use, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, type T } from "@/lib/use-t"

type WordFilter = {
  enabled: boolean
  words: string[]
  presets: { profanity: boolean; sexual_content: boolean; slurs: boolean }
  action: "none" | "warn" | "mute" | "kick" | "ban"
  message: string
  exempt_channels: string[]
  exempt_roles: string[]
}

const DEFAULTS: WordFilter = {
  enabled: false, words: [], presets: { profanity: false, sexual_content: false, slurs: false },
  action: "none", message: "", exempt_channels: [], exempt_roles: [],
}

const PRESETS = (t: T): { key: keyof WordFilter["presets"]; label: string; hint: string }[] => [
  { key: "profanity", label: t("Palavrões", "Profanity"), hint: t("Lista mantida pelo próprio Discord.", "A list kept by Discord itself.") },
  { key: "sexual_content", label: t("Conteúdo sexual", "Sexual content"), hint: t("Termos sexuais explícitos.", "Explicit sexual terms.") },
  { key: "slurs", label: t("Ofensas e insultos", "Slurs and insults"), hint: t("Termos discriminatórios e ofensivos.", "Discriminatory and offensive terms.") },
]

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"

export default function WordFilterPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cfg, setCfg] = useState<WordFilter>(DEFAULTS)
  const [wordsText, setWordsText] = useState("")
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c, r] = await Promise.all([api.getGuildSettings(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      const wf = { ...DEFAULTS, ...(s?.word_filter || {}), presets: { ...DEFAULTS.presets, ...(s?.word_filter?.presets || {}) } }
      setCfg(wf)
      setWordsText(wf.words.join("\n"))
      setChannels((c?.data || []).filter((ch: any) => ch.type === 0 || ch.type === 5))
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || t("Não foi possível carregar as configurações.", "Couldn't load the settings."))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  const set = <K extends keyof WordFilter>(key: K, value: WordFilter[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const words = [...new Set(wordsText.split(/[\n,]+/).map((w) => w.trim().toLowerCase()).filter(Boolean))]
  const tooLong = words.filter((w) => w.length > 60)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateGuildSettings(guildId, { word_filter: { ...cfg, words } })
      toast({ title: t("Filtro salvo", "Filter saved"), description: t("As regras chegam ao AutoMod do Discord em até 10 minutos.", "The rules reach Discord's AutoMod within 10 minutes.") })
    } catch (err: any) {
      toast({ title: t("Erro ao salvar", "Couldn't save"), description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const chip = "rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-foreground hover:border-foreground/30"
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Moderação", "Moderation")}
        title={t("Filtro de palavras", "Word filter")}
        description={t("Mensagens com palavras proibidas são bloqueadas pelo AutoMod do próprio Discord, antes de aparecerem no chat. A Lunna precisa da permissão Gerenciar Servidor.", "Messages with banned words are blocked by Discord's own AutoMod before they show up in chat. Lunna needs the Manage Server permission.")}
        action={<PrimaryButton onClick={save} loading={saving}>{t("Salvar", "Save")}</PrimaryButton>}
      />

      <Section
        title={t("Filtro de palavras", "Word filter")}
        description={t("Liga ou desliga o filtro neste servidor.", "Turns the filter on or off in this server.")}
        action={<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} />}
      />

      <Section title={t("Listas prontas do Discord", "Discord's ready-made lists")} description={t("Listas mantidas e atualizadas pelo Discord. Podem ser usadas junto com as suas palavras.", "Lists kept up to date by Discord. You can use them together with your own words.")}>
        <div className="flex flex-col gap-3">
          {PRESETS(t).map((p) => (
            <label key={p.key} className="flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">{p.label}</span>
                <span className="block text-[12px] text-muted-foreground">{p.hint}</span>
              </span>
              <Switch checked={cfg.presets[p.key]} onCheckedChange={(v) => set("presets", { ...cfg.presets, [p.key]: v })} />
            </label>
          ))}
        </div>
      </Section>

      <Section
        title={t("Suas palavras", "Your words")}
        description={t("Uma por linha (ou separadas por vírgula). Use * como curinga: palavra* bloqueia tudo que começa com “palavra”, *palavra* bloqueia em qualquer parte.", "One per line (or separated by commas). Use * as a wildcard: word* blocks anything starting with “word”, *word* blocks it anywhere.")}
      >
        <textarea rows={8} className={`${inputCls} h-auto py-2 font-mono text-[13px]`} value={wordsText}
          onChange={(e) => setWordsText(e.target.value)} placeholder={t("exemplo\ngolpe*\n*spam*", "example\nscam*\n*spam*")} />
        <p className="mt-2 text-[12px] text-muted-foreground">
          {words.length} / 1000 {t("palavras", "words")}
          {tooLong.length > 0 && <span className="text-destructive"> · {t(`${tooLong.length} com mais de 60 caracteres serão ignoradas`, `${tooLong.length} longer than 60 characters will be ignored`)}</span>}
        </p>
      </Section>

      <Section title={t("O que acontece", "What happens")} description={t("A mensagem é sempre bloqueada. Você pode também punir o autor.", "The message is always blocked. You can also punish the author.")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Punição", "Punishment")}>
            <select className={inputCls} value={cfg.action} onChange={(e) => set("action", e.target.value as WordFilter["action"])}>
              <option value="none">{t("Só bloquear a mensagem", "Only block the message")}</option>
              <option value="warn">{t("Bloquear e avisar (warn)", "Block and warn")}</option>
              <option value="mute">{t("Bloquear e silenciar por 1 hora", "Block and time out for 1 hour")}</option>
              <option value="kick">{t("Bloquear e expulsar", "Block and kick")}</option>
              <option value="ban">{t("Bloquear e banir", "Block and ban")}</option>
            </select>
          </Field>
          <Field label={t("Aviso para o autor", "Notice for the author")} hint={t("Mostrado só para quem enviou. Máx. 150 caracteres.", "Shown only to the sender. Max 150 characters.")}>
            <input maxLength={150} className={inputCls} value={cfg.message} placeholder={t("Sua mensagem contém uma palavra proibida neste servidor.", "Your message contains a word that is not allowed here.")}
              onChange={(e) => set("message", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title={t("Exceções", "Exceptions")} description={t("Canais onde o filtro não vale e cargos que podem usar as palavras. Administradores já são isentos pelo Discord.", "Channels where the filter doesn't apply and roles that may use the words. Discord already exempts administrators.")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Canais", "Channels")}>
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("exempt_channels", [...new Set([...cfg.exempt_channels, e.target.value])])}>
              <option value="">{t("Adicionar canal", "Add channel")}</option>
              {channels.filter((c) => !cfg.exempt_channels.includes(c.id)).map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
          <Field label={t("Cargos", "Roles")}>
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("exempt_roles", [...new Set([...cfg.exempt_roles, e.target.value])])}>
              <option value="">{t("Adicionar cargo", "Add role")}</option>
              {roles.filter((r) => !cfg.exempt_roles.includes(r.id)).map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
          </Field>
        </div>
        {(cfg.exempt_channels.length > 0 || cfg.exempt_roles.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cfg.exempt_channels.map((id) => (
              <button key={id} className={chip} onClick={() => set("exempt_channels", cfg.exempt_channels.filter((x) => x !== id))}>
                #{channels.find((c) => c.id === id)?.name || t("canal removido", "deleted channel")} ✕
              </button>
            ))}
            {cfg.exempt_roles.map((id) => (
              <button key={id} className={chip} onClick={() => set("exempt_roles", cfg.exempt_roles.filter((x) => x !== id))}>
                @{roles.find((r) => r.id === id)?.name || t("cargo removido", "deleted role")} ✕
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
