"use client"

import React, { use, useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT } from "@/lib/use-t"

type Leveling = {
  enabled: boolean
  xp_min: number
  xp_max: number
  cooldown_seconds: number
  announce: "off" | "same" | "channel" | "dm"
  announce_channel: string | null
  announce_message: string
  role_rewards: { level: number; role_id: string }[]
  stack_roles: boolean
  no_xp_channels: string[]
  no_xp_roles: string[]
  voice_enabled: boolean
  voice_xp_per_minute: number
  voice_min_members: number
  voice_ignore_muted: boolean
}

const DEFAULTS: Leveling = {
  enabled: false, xp_min: 15, xp_max: 25, cooldown_seconds: 60, announce: "same", announce_channel: null,
  announce_message: "{user_mention} subiu para o nível **{level}**! 🎉", role_rewards: [], stack_roles: true,
  no_xp_channels: [], no_xp_roles: [],
  voice_enabled: false, voice_xp_per_minute: 10, voice_min_members: 2, voice_ignore_muted: true,
}

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"

// Same curve as the bot (MEE6): level n → n+1 costs 5n² + 50n + 100 XP
const totalXpFor = (level: number) => { let t = 0; for (let l = 0; l < level; l++) t += 5 * l * l + 50 * l + 100; return t }

export default function LevelsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cfg, setCfg] = useState<Leveling>(DEFAULTS)
  const [channels, setChannels] = useState<{ id: string; name: string; type: number }[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [newReward, setNewReward] = useState({ level: 5, role_id: "" })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c, r] = await Promise.all([api.getGuildSettings(guildId), api.getGuildChannels(guildId), api.getGuildRoles(guildId)])
      setCfg({ ...DEFAULTS, ...(s?.leveling || {}) })
      setChannels((c?.data || []).filter((ch: any) => ch.type === 0 || ch.type === 5))
      setRoles((r?.data || []).filter((role: any) => role.name !== "@everyone"))
    } catch (err: any) {
      setError(err.message || t("Não foi possível carregar as configurações.", "Couldn't load the settings."))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  const set = <K extends keyof Leveling>(key: K, value: Leveling[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || t("cargo removido", "deleted role")
  const channelName = (id: string) => channels.find((c) => c.id === id)?.name || t("canal removido", "deleted channel")
  const rewards = useMemo(() => [...cfg.role_rewards].sort((a, b) => a.level - b.level), [cfg.role_rewards])

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.updateGuildSettings(guildId, { leveling: cfg })
      if (res?.leveling) setCfg({ ...DEFAULTS, ...res.leveling })
      toast({ title: t("Níveis salvos", "Levels saved"), description: cfg.enabled ? t("Os membros já começam a ganhar XP.", "Members start earning XP right away.") : t("Sistema de níveis desativado.", "Level system turned off.") })
    } catch (err: any) {
      toast({ title: t("Erro ao salvar", "Couldn't save"), description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const addReward = () => {
    if (!newReward.role_id) return
    set("role_rewards", [...cfg.role_rewards.filter((r) => r.role_id !== newReward.role_id), { ...newReward }])
    setNewReward({ level: newReward.level + 5, role_id: "" })
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Comunidade", "Community")}
        title={t("Níveis", "Levels")}
        description={t("Membros ganham XP conversando e sobem de nível. Use /rank xp para ver o top 10 e o cartão de um membro, e /rank nivel para a lista completa.", "Members earn XP by chatting and level up. Use /rank xp to see the top 10 and a member's card, and /rank levels for the full list.")}
        action={<PrimaryButton onClick={save} loading={saving}>{t("Salvar", "Save")}</PrimaryButton>}
      />

      <Section
        title={t("Sistema de níveis", "Level system")}
        description={t("Liga ou desliga o ganho de XP neste servidor.", "Turns XP gain on or off in this server.")}
        action={<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} />}
      />

      <Section title={t("Ganho de XP", "XP gain")} description={t("XP sorteado por mensagem, no máximo uma vez a cada intervalo, para premiar conversa e não spam.", "Random XP per message, at most once per interval, so it rewards chatting, not spam.")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("XP mínimo", "Minimum XP")}>
            <input type="number" min={1} max={100} className={inputCls} value={cfg.xp_min}
              onChange={(e) => set("xp_min", Number(e.target.value))} />
          </Field>
          <Field label={t("XP máximo", "Maximum XP")}>
            <input type="number" min={1} max={200} className={inputCls} value={cfg.xp_max}
              onChange={(e) => set("xp_max", Number(e.target.value))} />
          </Field>
          <Field label={t("Intervalo (segundos)", "Interval (seconds)")} hint={t("Mínimo 10s.", "Minimum 10s.")}>
            <input type="number" min={10} max={3600} className={inputCls} value={cfg.cooldown_seconds}
              onChange={(e) => set("cooldown_seconds", Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section
        title={t("XP por voz", "Voice XP")}
        description={t("Membros ganham XP a cada minuto em canal de voz. Soma no mesmo nível do chat. O canal AFK e quem está ensurdecido não contam.", "Members earn XP every minute in a voice channel. It adds to the same level as chat. The AFK channel and deafened members don't count.")}
        action={<Switch checked={cfg.voice_enabled} onCheckedChange={(v) => set("voice_enabled", v)} />}
      >
        {cfg.voice_enabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("XP por minuto", "XP per minute")} hint={t(`Cerca de ${(cfg.voice_xp_per_minute * 60).toLocaleString("pt-BR")} XP por hora em call.`, `About ${(cfg.voice_xp_per_minute * 60).toLocaleString("en-US")} XP per hour in a call.`)}>
                <input type="number" min={1} max={100} className={inputCls} value={cfg.voice_xp_per_minute}
                  onChange={(e) => set("voice_xp_per_minute", Number(e.target.value))} />
              </Field>
              <Field label={t("Mínimo de pessoas no canal", "Minimum people in the channel")} hint={t("Contando o próprio membro. Com 2, ninguém ganha XP sozinho na call.", "Including the member. With 2, nobody earns XP alone in a call.")}>
                <input type="number" min={1} max={10} className={inputCls} value={cfg.voice_min_members}
                  onChange={(e) => set("voice_min_members", Number(e.target.value))} />
              </Field>
            </div>
            <label className="mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">{t("Ignorar quem está mutado", "Ignore muted members")}</span>
                <span className="block text-[12px] text-muted-foreground">{t("Microfone desligado não ganha XP.", "A muted mic earns no XP.")}</span>
              </span>
              <Switch checked={cfg.voice_ignore_muted} onCheckedChange={(v) => set("voice_ignore_muted", v)} />
            </label>
          </>
        )}
      </Section>

      <Section title={t("Anúncio de level up", "Level-up announcement")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Onde anunciar", "Where to announce")}>
            <select className={inputCls} value={cfg.announce} onChange={(e) => set("announce", e.target.value as Leveling["announce"])}>
              <option value="same">{t("No canal da mensagem", "In the message's channel")}</option>
              <option value="channel">{t("Em um canal fixo", "In a fixed channel")}</option>
              <option value="dm">{t("Na DM do membro", "In the member's DMs")}</option>
              <option value="off">{t("Não anunciar", "Don't announce")}</option>
            </select>
          </Field>
          {cfg.announce === "channel" && (
            <Field label={t("Canal", "Channel")}>
              <select className={inputCls} value={cfg.announce_channel || ""} onChange={(e) => set("announce_channel", e.target.value || null)}>
                <option value="">{t("Selecione um canal", "Select a channel")}</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </Field>
          )}
        </div>
        {cfg.announce !== "off" && (
          <Field className="mt-4" label={t("Mensagem", "Message")} hint={t("Variáveis: {user_mention}, {username}, {level}, {xp}, {server_name}. A mensagem nunca menciona @everyone nem cargos.", "Variables: {user_mention}, {username}, {level}, {xp}, {server_name}. The message never pings @everyone or roles. If you keep the default text, it's posted in the server's language.")}>
            <textarea rows={2} maxLength={500} className={`${inputCls} h-auto py-2`} value={cfg.announce_message}
              onChange={(e) => set("announce_message", e.target.value)} />
          </Field>
        )}
      </Section>

      <Section
        title={t("Cargos por nível", "Level roles")}
        description={t("O cargo é entregue quando o membro alcança o nível. O cargo da Lunna precisa estar acima desses cargos.", "The role is given when the member reaches the level. Lunna's role must be above these roles.")}
      >
        {rewards.length > 0 && (
          <ul className="-mx-2 mb-4 divide-y divide-border">
            {rewards.map((r) => (
              <li key={r.role_id} className="flex items-center justify-between gap-3 px-2 py-2.5 text-[14px]">
                <span>
                  <span className="text-muted-foreground">{t("Nível", "Level")} {r.level}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">@{roleName(r.role_id)}</span>
                  <span className="ml-2 text-[12px] text-muted-foreground">({totalXpFor(r.level).toLocaleString(t("pt-BR", "en-US"))} XP)</span>
                </span>
                <button aria-label={t("Remover", "Remove")} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => set("role_rewards", cfg.role_rewards.filter((x) => x.role_id !== r.role_id))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label={t("Nível", "Level")} className="sm:w-28">
            <input type="number" min={1} max={500} className={inputCls} value={newReward.level}
              onChange={(e) => setNewReward((n) => ({ ...n, level: Number(e.target.value) }))} />
          </Field>
          <Field label={t("Cargo", "Role")} className="flex-1">
            <select className={inputCls} value={newReward.role_id} onChange={(e) => setNewReward((n) => ({ ...n, role_id: e.target.value }))}>
              <option value="">{t("Selecione um cargo", "Select a role")}</option>
              {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
          </Field>
          <SecondaryButton onClick={addReward} disabled={!newReward.role_id}>
            <Plus className="h-4 w-4" /> {t("Adicionar", "Add")}
          </SecondaryButton>
        </div>
        <label className="mt-5 flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
          <span>
            <span className="block text-[14px] text-foreground">{t("Acumular cargos", "Stack roles")}</span>
            <span className="block text-[12px] text-muted-foreground">{t("Desligado: o membro fica só com o cargo do maior nível alcançado.", "Off: the member keeps only the role of the highest level reached.")}</span>
          </span>
          <Switch checked={cfg.stack_roles} onCheckedChange={(v) => set("stack_roles", v)} />
        </label>
      </Section>

      <Section title={t("Sem XP", "No XP")} description={t("Mensagens nesses canais, ou de membros com esses cargos, não dão XP.", "Messages in these channels, or from members with these roles, give no XP.")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Canais", "Channels")}>
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("no_xp_channels", [...new Set([...cfg.no_xp_channels, e.target.value])])}>
              <option value="">{t("Adicionar canal", "Add channel")}</option>
              {channels.filter((c) => !cfg.no_xp_channels.includes(c.id)).map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
          <Field label={t("Cargos", "Roles")}>
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("no_xp_roles", [...new Set([...cfg.no_xp_roles, e.target.value])])}>
              <option value="">{t("Adicionar cargo", "Add role")}</option>
              {roles.filter((r) => !cfg.no_xp_roles.includes(r.id)).map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
          </Field>
        </div>
        {(cfg.no_xp_channels.length > 0 || cfg.no_xp_roles.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cfg.no_xp_channels.map((id) => (
              <button key={id} onClick={() => set("no_xp_channels", cfg.no_xp_channels.filter((x) => x !== id))}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-foreground hover:border-foreground/30">
                #{channelName(id)} ✕
              </button>
            ))}
            {cfg.no_xp_roles.map((id) => (
              <button key={id} onClick={() => set("no_xp_roles", cfg.no_xp_roles.filter((x) => x !== id))}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-foreground hover:border-foreground/30">
                @{roleName(id)} ✕
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
