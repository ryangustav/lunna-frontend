"use client"

import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, SecondaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Command = { name: string; category: string; description: string }
type Config = {
  maintenance: { enabled: boolean; message: string; until: string | null }
  disabled_commands: string[]; command_messages: Record<string, string>
  disabled_features: string[]; feature_messages: Record<string, string>
  bypass_guild_ids: string[]; updated_at?: string | null; updated_by?: string | null
}

type FeatureInfo = { label: string; hint: string; speaks: boolean; placeholder?: string; maintenance?: boolean }
// Mirrors Lunna_Bot/src/services/AdminControlService.js FEATURES (maintenance = also paused by maintenance mode)
const FEATURE_GROUPS: { title: string; hint: string; items: Record<string, FeatureInfo> }[] = [
  {
    title: "Interação", hint: "Também param durante a manutenção.",
    items: {
      ai_chat: { label: "Chat com a IA (Cérebro da Lunna)", hint: "Respostas quando alguém menciona a Lunna.", speaks: true, maintenance: true, placeholder: "O chat com a Lunna está pausado no momento. Volto a conversar em breve!" },
      ai_agent: { label: "Lunna IA (agente de administração)", hint: "Admins pedindo para criar canais, cargos, automações…", speaks: true, maintenance: true, placeholder: "A Lunna IA está pausada no momento. Tente de novo mais tarde." },
      tickets: { label: "Abrir tickets", hint: "Bloqueia novos tickets; os abertos continuam podendo ser fechados.", speaks: true, maintenance: true, placeholder: "Os tickets estão temporariamente indisponíveis. Tente de novo em instantes." },
      role_panels: { label: "Cargos por botão", hint: "Os painéis param de dar e tirar cargos.", speaks: true, maintenance: true, placeholder: "Os cargos por botão estão temporariamente indisponíveis." },
      giveaways: { label: "Participar de sorteios", hint: "Os botões de entrar e sair param; quem já participa continua.", speaks: true, maintenance: true, placeholder: "Os sorteios estão temporariamente indisponíveis. Sua participação não foi perdida." },
      chat_events: { label: "Eventos no chat", hint: "Baús e chefões que aparecem sozinhos nos canais.", speaks: false, maintenance: true },
    },
  },
  {
    title: "Comunidade", hint: "Continuam funcionando durante a manutenção.",
    items: {
      welcome: { label: "Boas-vindas e saída", hint: "Mensagens e banner de entrada e de saída.", speaks: false },
      autorole: { label: "Autorole", hint: "Cargo automático para quem entra.", speaks: false },
      member_counters: { label: "Contadores de membros", hint: "Canais com o número de membros param de atualizar.", speaks: false },
      leveling: { label: "Ganho de XP (níveis)", hint: "Mensagens e voz deixam de dar XP. Ninguém é avisado.", speaks: false },
      automations: { label: "Automações", hint: "Reação → cargo, cargo de entrada e mensagens agendadas.", speaks: false },
      auto_dms: { label: "Mensagens automáticas por DM", hint: "Pausa o envio de todas as campanhas.", speaks: false },
      social_alerts: { label: "Alertas de YouTube, Twitch e RSS", hint: "Para de checar e postar. Ao religar, cada fonte posta no máximo os 3 itens mais recentes dos últimos 3 dias.", speaks: false },
    },
  },
  {
    title: "Logs de eventos", hint: "Continuam durante a manutenção. Desligar aqui para os logs em todos os servidores.",
    items: {
      log_message_delete: { label: "Mensagens apagadas", hint: "Inclui as limpezas em massa.", speaks: false },
      log_message_edit: { label: "Mensagens editadas", hint: "", speaks: false },
      log_voice: { label: "Entradas e saídas de voz", hint: "", speaks: false },
      log_member: { label: "Membros (apelido e avatar)", hint: "", speaks: false },
      log_moderation: { label: "Moderação", hint: "Banimentos, expulsões, silenciamentos e avisos.", speaks: false },
      log_server: { label: "Servidor (canais e cargos)", hint: "Criação e exclusão de canais e cargos.", speaks: false },
    },
  },
  {
    title: "Proteção", hint: "Nunca param por causa da manutenção — só por este interruptor. Desligue apenas se uma delas estiver com problema.",
    items: {
      anti_spam: { label: "Anti-spam", hint: "", speaks: false },
      anti_invite: { label: "Bloqueio de convites", hint: "A regra do AutoMod é removida dos servidores e recriada ao religar (até 10 min).", speaks: false },
      anti_link: { label: "Bloqueio de links", hint: "A regra do AutoMod é removida dos servidores e recriada ao religar (até 10 min).", speaks: false },
      word_filter: { label: "Filtro de palavras", hint: "A regra do AutoMod é removida dos servidores e recriada ao religar (até 10 min).", speaks: false },
      trap_channel: { label: "Canal armadilha", hint: "Quem escrever no canal armadilha deixa de ser punido.", speaks: false },
    },
  },
]
const FEATURE_INFO: Record<string, FeatureInfo> = Object.assign({}, ...FEATURE_GROUPS.map((g) => g.items))
const CATEGORY_LABEL: Record<string, string> = {
  bot: "Bot", economy: "Economia", fun: "Diversão", giveaway: "Sorteios", infos: "Informações",
  jogos_economy: "Jogos de aposta", levels: "Níveis", moderator: "Moderação", rpg: "RPG", outros: "Outros",
}
const EMPTY: Config = { maintenance: { enabled: false, message: "", until: null }, disabled_commands: [], command_messages: {}, disabled_features: [], feature_messages: {}, bypass_guild_ids: [] }
const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const smallInput = "h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-[#7c3aed]/60"
const toLocal = (iso?: string | null) => { if (!iso) return ""; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }

export default function AdminSwitchesPage() {
  const { toast } = useToast()
  const [cfg, setCfg] = useState<Config | null>(null)
  const [commands, setCommands] = useState<Command[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [guildInput, setGuildInput] = useState("")

  const load = async () => {
    try {
      setError(null)
      const r = await api.getBotConfig()
      const c = r.data?.config || {}
      setCfg({ ...EMPTY, ...c, maintenance: { ...EMPTY.maintenance, ...(c.maintenance || {}) }, command_messages: c.command_messages || {}, feature_messages: c.feature_messages || {} })
      setCommands(r.data?.commands || [])
      setDirty(false); setSelected(new Set())
    } catch (e: any) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const update = (fn: (c: Config) => Config) => { setCfg((c) => (c ? fn(c) : c)); setDirty(true) }
  const disabled = useMemo(() => new Set(cfg?.disabled_commands || []), [cfg])
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\//, "")
    const map = new Map<string, Command[]>()
    for (const c of commands) {
      if (q && !c.name.includes(q) && !c.description.toLowerCase().includes(q)) continue
      if (!map.has(c.category)) map.set(c.category, [])
      map.get(c.category)!.push(c)
    }
    return [...map.entries()]
  }, [commands, query])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!cfg) return <LoadingState />

  const isOff = (c: Command) => disabled.has(c.name) || disabled.has(`cat:${c.category}`)
  const setDisabled = (keys: string[], off: boolean) => update((c) => {
    const set = new Set(c.disabled_commands)
    keys.forEach((k) => (off ? set.add(k) : set.delete(k)))
    return { ...c, disabled_commands: [...set] }
  })
  const setMessage = (field: "command_messages" | "feature_messages", key: string, value: string) =>
    update((c) => ({ ...c, [field]: { ...c[field], [key]: value } }))
  const categories = [...new Set(commands.map((c) => c.category))]
  const offCount = commands.filter(isOff).length

  const save = async () => {
    if (cfg.maintenance.enabled && !window.confirm("Ligar o modo manutenção? Todos os comandos e recursos param para todo mundo (menos para você e os servidores isentos).")) return
    setSaving(true)
    try {
      await api.updateBotConfig(cfg)
      toast({ title: "Salvo", description: "O bot aplica em até 15 segundos." })
      await load()
    } catch (e: any) { toast({ title: "Não foi possível salvar", description: e.message, variant: "destructive" }) } finally { setSaving(false) }
  }

  const toggleSelect = (name: string) => setSelected((s) => { const n = new Set(s); if (n.has(name)) n.delete(name); else n.add(name); return n })

  return (
    <div className="flex flex-col gap-5 pb-20">
      <PageHeader eyebrow="Administração" title="Interruptores"
        description="Desligue comandos, categorias ou recursos inteiros, com mensagens personalizadas. Valem para todos os servidores (menos os isentos) e o bot aplica em até 15 segundos."
        action={<PrimaryButton onClick={save} loading={saving} disabled={!dirty}>Salvar</PrimaryButton>} />

      <div className="flex flex-wrap gap-2">
        {cfg.maintenance.enabled && <Pill tone="accent">Manutenção ligada</Pill>}
        <Pill tone={offCount ? "accent" : "neutral"}>{offCount} de {commands.length} comandos desligados</Pill>
        <Pill tone={cfg.disabled_features.length ? "accent" : "neutral"}>{cfg.disabled_features.length} recursos pausados</Pill>
        {cfg.bypass_guild_ids.length > 0 && <Pill>{cfg.bypass_guild_ids.length} servidor(es) isento(s)</Pill>}
      </div>

      <Section title="Modo manutenção" description="Tudo para, menos para você e os servidores isentos. Com horário de término, a manutenção se desliga sozinha."
        action={<Switch checked={cfg.maintenance.enabled} onCheckedChange={(v) => update((c) => ({ ...c, maintenance: { ...c.maintenance, enabled: v } }))} />}>
        <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
          <Field label="Mensagem" hint="Vazio = mensagem padrão.">
            <input className={inputCls} maxLength={300} value={cfg.maintenance.message} placeholder="A Lunna está em manutenção agora. Volto logo!"
              onChange={(e) => update((c) => ({ ...c, maintenance: { ...c.maintenance, message: e.target.value } }))} />
          </Field>
          <Field label="Termina em (opcional)" hint="Mostra a previsão de volta.">
            <input type="datetime-local" className={inputCls} value={toLocal(cfg.maintenance.until)}
              onChange={(e) => update((c) => ({ ...c, maintenance: { ...c.maintenance, until: e.target.value ? new Date(e.target.value).toISOString() : null } }))} />
          </Field>
        </div>
      </Section>

      <Section title="Recursos" description="O que os servidores ativam no dashboard e o que não é um comando só. Desligado = pausado em todos os servidores (menos os isentos).">
        <div className="flex flex-col gap-6">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-wider text-foreground">{group.title}</p>
                <p className="text-[12px] text-muted-foreground">{group.hint}</p>
              </div>
              {Object.entries(group.items).map(([key, info]) => {
                const off = cfg.disabled_features.includes(key)
                return (
                  <div key={key} className={`rounded-[10px] border px-4 py-3 ${off ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`}>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-foreground">{info.label}</p>
                        {info.hint && <p className="text-[12px] text-muted-foreground">{info.hint}</p>}
                      </div>
                      <span className="text-[12px] text-muted-foreground">{off ? "Pausado" : "Funcionando"}</span>
                      <Switch checked={!off} onCheckedChange={(on) => update((c) => ({ ...c, disabled_features: on ? c.disabled_features.filter((x) => x !== key) : [...new Set([...c.disabled_features, key])] }))} />
                    </div>
                    {off && info.speaks && (
                      <input className={`${smallInput} mt-3`} maxLength={300} value={cfg.feature_messages[key] || ""} placeholder={`Mensagem para quem tentar usar (vazio = "${info.placeholder}")`}
                        onChange={(e) => setMessage("feature_messages", key, e.target.value)} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Comandos" description="Desligue um, vários (marque e use a barra abaixo), uma categoria inteira ou todos. Cada um pode ter a sua mensagem.">
        {commands.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">A lista aparece depois que o bot reiniciar com esta versão (ele publica os comandos ao iniciar).</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <input className={`${inputCls} max-w-[320px]`} value={query} placeholder="Buscar comando…" onChange={(e) => setQuery(e.target.value)} />
              <SecondaryButton onClick={() => { if (window.confirm("Desligar TODOS os comandos? (O chat e a Lunna IA continuam; use Recursos ou Manutenção para eles.)")) setDisabled(categories.map((c) => `cat:${c}`), true) }}>Desligar todos</SecondaryButton>
              <SecondaryButton onClick={() => update((c) => ({ ...c, disabled_commands: [] }))}>Ligar todos</SecondaryButton>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {grouped.map(([category, list]) => {
                const catKey = `cat:${category}`
                const catOff = disabled.has(catKey)
                const allSelected = list.every((c) => selected.has(c.name))
                return (
                  <div key={category} className="overflow-hidden rounded-[12px] border border-border">
                    <div className={`flex flex-wrap items-center gap-3 px-4 py-2.5 ${catOff ? "bg-amber-500/10" : "bg-secondary/50"}`}>
                      <input type="checkbox" className="h-4 w-4 accent-[#7c3aed]" checked={allSelected} aria-label="Selecionar categoria"
                        onChange={() => setSelected((s) => { const n = new Set(s); list.forEach((c) => (allSelected ? n.delete(c.name) : n.add(c.name))); return n })} />
                      <p className="flex-1 text-[13px] font-bold uppercase tracking-wider text-foreground">{CATEGORY_LABEL[category] || category} <span className="font-medium normal-case tracking-normal text-muted-foreground">· {list.length}</span></p>
                      <span className="text-[12px] text-muted-foreground">Categoria inteira</span>
                      <Switch checked={!catOff} onCheckedChange={(on) => setDisabled([catKey], !on)} />
                    </div>
                    {catOff && (
                      <div className="border-t border-border px-4 py-2.5">
                        <input className={smallInput} maxLength={300} value={cfg.command_messages[catKey] || ""} placeholder="Mensagem para toda a categoria (opcional)"
                          onChange={(e) => setMessage("command_messages", catKey, e.target.value)} />
                      </div>
                    )}
                    {list.map((c) => {
                      const off = isOff(c)
                      const ownOff = disabled.has(c.name)
                      return (
                        <div key={c.name} className={`border-t border-border px-4 py-2.5 ${off ? "bg-amber-500/5" : ""}`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4 accent-[#7c3aed]" checked={selected.has(c.name)} onChange={() => toggleSelect(c.name)} aria-label={`Selecionar /${c.name}`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-[13px] text-foreground">/{c.name}</p>
                              <p className="truncate text-[12px] text-muted-foreground">{c.description}</p>
                            </div>
                            {off && !ownOff && <span className="text-[11px] text-amber-500">pela categoria</span>}
                            <Switch checked={!off} disabled={catOff} onCheckedChange={(on) => setDisabled([c.name], !on)} />
                          </div>
                          {ownOff && (
                            <input className={`${smallInput} mt-2`} maxLength={300} value={cfg.command_messages[c.name] || ""} placeholder={`Mensagem personalizada (vazio = "O comando /${c.name} está temporariamente desativado…")`}
                              onChange={(e) => setMessage("command_messages", c.name, e.target.value)} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Section>

      <Section title="Servidores isentos" description="Nada desta página vale nesses servidores (útil para testar no servidor de suporte enquanto o resto está desligado).">
        <div className="flex gap-2">
          <input className={`${inputCls} font-mono`} inputMode="numeric" value={guildInput} placeholder="ID do servidor" onChange={(e) => setGuildInput(e.target.value.replace(/\D/g, ""))} />
          <SecondaryButton onClick={() => { if (/^\d{17,20}$/.test(guildInput)) { update((c) => ({ ...c, bypass_guild_ids: [...new Set([...c.bypass_guild_ids, guildInput])] })); setGuildInput("") } }}>Adicionar</SecondaryButton>
        </div>
        {cfg.bypass_guild_ids.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cfg.bypass_guild_ids.map((id) => (
              <button key={id} className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-[12px] text-foreground hover:border-red-500/50"
                onClick={() => update((c) => ({ ...c, bypass_guild_ids: c.bypass_guild_ids.filter((x) => x !== id) }))}>{id} ✕</button>
            ))}
          </div>
        )}
      </Section>

      {cfg.updated_at && <p className="text-[12px] text-muted-foreground">Última alteração em {new Date(cfg.updated_at).toLocaleString("pt-BR")} por {cfg.updated_by}. Para avisos no site e no bot, use a página Avisos.</p>}

      {(selected.size > 0 || dirty) && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(720px,calc(100%-2rem))] flex-wrap items-center gap-2 rounded-[14px] border border-border bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
          {selected.size > 0 && (
            <>
              <span className="text-[13px] font-medium text-foreground">{selected.size} selecionado(s)</span>
              <SecondaryButton onClick={() => { setDisabled([...selected], true); setSelected(new Set()) }}>Desligar</SecondaryButton>
              <SecondaryButton onClick={() => { setDisabled([...selected], false); setSelected(new Set()) }}>Ligar</SecondaryButton>
              <button className="text-[12px] text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>Limpar seleção</button>
            </>
          )}
          <div className="flex-1" />
          {dirty && <span className="text-[12px] text-amber-500">Alterações não salvas</span>}
          {dirty && <PrimaryButton onClick={save} loading={saving}>Salvar</PrimaryButton>}
        </div>
      )}
    </div>
  )
}
