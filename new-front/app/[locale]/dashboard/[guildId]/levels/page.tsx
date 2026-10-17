"use client"

import React, { use, useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, LoadingState, ErrorState } from "@/components/dashboard/primitives"

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
      setError(err.message || "Não foi possível carregar as configurações.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [guildId])

  const set = <K extends keyof Leveling>(key: K, value: Leveling[K]) => setCfg((c) => ({ ...c, [key]: value }))
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || "cargo removido"
  const channelName = (id: string) => channels.find((c) => c.id === id)?.name || "canal removido"
  const rewards = useMemo(() => [...cfg.role_rewards].sort((a, b) => a.level - b.level), [cfg.role_rewards])

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.updateGuildSettings(guildId, { leveling: cfg })
      if (res?.leveling) setCfg({ ...DEFAULTS, ...res.leveling })
      toast({ title: "Níveis salvos", description: cfg.enabled ? "Os membros já começam a ganhar XP." : "Sistema de níveis desativado." })
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" })
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
        eyebrow="Comunidade"
        title="Níveis"
        description="Membros ganham XP conversando e sobem de nível. Use /rank para ver o cartão e /levels para o ranking."
        action={<PrimaryButton onClick={save} loading={saving}>Salvar</PrimaryButton>}
      />

      <Section
        title="Sistema de níveis"
        description="Liga ou desliga o ganho de XP neste servidor."
        action={<Switch checked={cfg.enabled} onCheckedChange={(v) => set("enabled", v)} />}
      />

      <Section title="Ganho de XP" description="XP sorteado por mensagem, no máximo uma vez a cada intervalo, para premiar conversa e não spam.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="XP mínimo">
            <input type="number" min={1} max={100} className={inputCls} value={cfg.xp_min}
              onChange={(e) => set("xp_min", Number(e.target.value))} />
          </Field>
          <Field label="XP máximo">
            <input type="number" min={1} max={200} className={inputCls} value={cfg.xp_max}
              onChange={(e) => set("xp_max", Number(e.target.value))} />
          </Field>
          <Field label="Intervalo (segundos)" hint="Mínimo 10s.">
            <input type="number" min={10} max={3600} className={inputCls} value={cfg.cooldown_seconds}
              onChange={(e) => set("cooldown_seconds", Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section
        title="XP por voz"
        description="Membros ganham XP a cada minuto em canal de voz. Soma no mesmo nível do chat. O canal AFK e quem está ensurdecido não contam."
        action={<Switch checked={cfg.voice_enabled} onCheckedChange={(v) => set("voice_enabled", v)} />}
      >
        {cfg.voice_enabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="XP por minuto" hint={`Cerca de ${(cfg.voice_xp_per_minute * 60).toLocaleString("pt-BR")} XP por hora em call.`}>
                <input type="number" min={1} max={100} className={inputCls} value={cfg.voice_xp_per_minute}
                  onChange={(e) => set("voice_xp_per_minute", Number(e.target.value))} />
              </Field>
              <Field label="Mínimo de pessoas no canal" hint="Contando o próprio membro. Com 2, ninguém ganha XP sozinho na call.">
                <input type="number" min={1} max={10} className={inputCls} value={cfg.voice_min_members}
                  onChange={(e) => set("voice_min_members", Number(e.target.value))} />
              </Field>
            </div>
            <label className="mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
              <span>
                <span className="block text-[14px] text-foreground">Ignorar quem está mutado</span>
                <span className="block text-[12px] text-muted-foreground">Microfone desligado não ganha XP.</span>
              </span>
              <Switch checked={cfg.voice_ignore_muted} onCheckedChange={(v) => set("voice_ignore_muted", v)} />
            </label>
          </>
        )}
      </Section>

      <Section title="Anúncio de level up">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Onde anunciar">
            <select className={inputCls} value={cfg.announce} onChange={(e) => set("announce", e.target.value as Leveling["announce"])}>
              <option value="same">No canal da mensagem</option>
              <option value="channel">Em um canal fixo</option>
              <option value="dm">Na DM do membro</option>
              <option value="off">Não anunciar</option>
            </select>
          </Field>
          {cfg.announce === "channel" && (
            <Field label="Canal">
              <select className={inputCls} value={cfg.announce_channel || ""} onChange={(e) => set("announce_channel", e.target.value || null)}>
                <option value="">Selecione um canal</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </Field>
          )}
        </div>
        {cfg.announce !== "off" && (
          <Field className="mt-4" label="Mensagem" hint="Variáveis: {user_mention}, {username}, {level}, {xp}, {server_name}. A mensagem nunca menciona @everyone nem cargos.">
            <textarea rows={2} maxLength={500} className={`${inputCls} h-auto py-2`} value={cfg.announce_message}
              onChange={(e) => set("announce_message", e.target.value)} />
          </Field>
        )}
      </Section>

      <Section
        title="Cargos por nível"
        description="O cargo é entregue quando o membro alcança o nível. O cargo da Lunna precisa estar acima desses cargos."
      >
        {rewards.length > 0 && (
          <ul className="-mx-2 mb-4 divide-y divide-border">
            {rewards.map((r) => (
              <li key={r.role_id} className="flex items-center justify-between gap-3 px-2 py-2.5 text-[14px]">
                <span>
                  <span className="text-muted-foreground">Nível {r.level}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">@{roleName(r.role_id)}</span>
                  <span className="ml-2 text-[12px] text-muted-foreground">({totalXpFor(r.level).toLocaleString("pt-BR")} XP)</span>
                </span>
                <button aria-label="Remover" className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => set("role_rewards", cfg.role_rewards.filter((x) => x.role_id !== r.role_id))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Nível" className="sm:w-28">
            <input type="number" min={1} max={500} className={inputCls} value={newReward.level}
              onChange={(e) => setNewReward((n) => ({ ...n, level: Number(e.target.value) }))} />
          </Field>
          <Field label="Cargo" className="flex-1">
            <select className={inputCls} value={newReward.role_id} onChange={(e) => setNewReward((n) => ({ ...n, role_id: e.target.value }))}>
              <option value="">Selecione um cargo</option>
              {roles.map((r) => <option key={r.id} value={r.id}>@{r.name}</option>)}
            </select>
          </Field>
          <SecondaryButton onClick={addReward} disabled={!newReward.role_id}>
            <Plus className="h-4 w-4" /> Adicionar
          </SecondaryButton>
        </div>
        <label className="mt-5 flex items-center justify-between gap-4 rounded-[10px] border border-border px-4 py-3">
          <span>
            <span className="block text-[14px] text-foreground">Acumular cargos</span>
            <span className="block text-[12px] text-muted-foreground">Desligado: o membro fica só com o cargo do maior nível alcançado.</span>
          </span>
          <Switch checked={cfg.stack_roles} onCheckedChange={(v) => set("stack_roles", v)} />
        </label>
      </Section>

      <Section title="Sem XP" description="Mensagens nesses canais, ou de membros com esses cargos, não dão XP.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Canais">
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("no_xp_channels", [...new Set([...cfg.no_xp_channels, e.target.value])])}>
              <option value="">Adicionar canal</option>
              {channels.filter((c) => !cfg.no_xp_channels.includes(c.id)).map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
          </Field>
          <Field label="Cargos">
            <select className={inputCls} value="" onChange={(e) => e.target.value && set("no_xp_roles", [...new Set([...cfg.no_xp_roles, e.target.value])])}>
              <option value="">Adicionar cargo</option>
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
