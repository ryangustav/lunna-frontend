"use client"

import { useEffect, useState } from "react"
import { api, apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { PageHeader, Section, Field, PrimaryButton, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type BotConfig = { maintenance: { enabled: boolean; message: string }; disabled_commands: string[]; updated_at?: string | null; updated_by?: string | null }

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#7c3aed]/60"
const chip = "rounded-full border border-border bg-secondary px-3 py-1 text-[12px] text-foreground hover:border-red-500/50"

export default function AdminSwitchesPage() {
  const { toast } = useToast()
  const [cfg, setCfg] = useState<BotConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [commands, setCommands] = useState<string[]>([])
  const [pick, setPick] = useState("")

  const load = async () => {
    try {
      setError(null)
      const r = await api.getBotConfig()
      setCfg({ maintenance: { enabled: false, message: "", ...(r.data?.maintenance || {}) }, disabled_commands: r.data?.disabled_commands || [], updated_at: r.data?.updated_at, updated_by: r.data?.updated_by })
    } catch (e: any) { setError(e.message) }
  }
  useEffect(() => {
    load()
    apiFetch("/commands/public").then((r) => setCommands([...new Set<string>((r?.data || []).map((c: any) => String(c.name || "").split(" ")[0]).filter(Boolean))].sort())).catch(() => {})
  }, [])

  const save = async () => {
    if (!cfg) return
    if (cfg.maintenance.enabled && !window.confirm("Ligar o modo manutenção? Todos os comandos param para todo mundo (menos para o dono do bot).")) return
    setSaving(true)
    try {
      await api.updateBotConfig(cfg)
      toast({ title: "Salvo", description: "O bot aplica em até 15 segundos." })
      await load()
    } catch (e: any) { toast({ title: "Não foi possível salvar", description: e.message, variant: "destructive" }) } finally { setSaving(false) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!cfg) return <LoadingState />
  const addCommand = (name: string) => {
    const c = name.trim().replace(/^\//, "").toLowerCase()
    if (!c) return
    setCfg({ ...cfg, disabled_commands: [...new Set([...cfg.disabled_commands, c])] })
    setPick("")
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Interruptores"
        description="Controles de emergência do bot. Valem para todos os servidores e o bot aplica em até 15 segundos."
        action={<PrimaryButton onClick={save} loading={saving}>Salvar</PrimaryButton>} />

      <Section title="Modo manutenção" description="Todos os comandos respondem com a mensagem abaixo. O dono do bot continua usando normalmente para testar."
        action={<Switch checked={cfg.maintenance.enabled} onCheckedChange={(v) => setCfg({ ...cfg, maintenance: { ...cfg.maintenance, enabled: v } })} />}>
        <Field label="Mensagem" hint="Vazio = mensagem padrão de manutenção.">
          <input className={inputCls} maxLength={300} value={cfg.maintenance.message} placeholder="A Lunna está em manutenção agora. Volto logo!"
            onChange={(e) => setCfg({ ...cfg, maintenance: { ...cfg.maintenance, message: e.target.value } })} />
        </Field>
        {cfg.maintenance.enabled && <p className="mt-3 text-[13px] font-medium text-amber-500">Ligado: ao salvar, os comandos param para todos.</p>}
      </Section>

      <Section title="Comandos desligados" description="Para quando um comando estiver com bug ou sendo explorado. Quem usar recebe “temporariamente desativado”.">
        <div className="flex gap-2">
          <input className={inputCls} list="lunna-commands" value={pick} placeholder="Nome do comando, ex.: gacha"
            onChange={(e) => setPick(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCommand(pick) } }} />
          <datalist id="lunna-commands">{commands.filter((c) => !cfg.disabled_commands.includes(c)).map((c) => <option key={c} value={c} />)}</datalist>
          <PrimaryButton type="button" onClick={() => addCommand(pick)}>Desligar</PrimaryButton>
        </div>
        {cfg.disabled_commands.length > 0
          ? <div className="mt-4 flex flex-wrap gap-2">{cfg.disabled_commands.map((c) => (
              <button key={c} className={chip} onClick={() => setCfg({ ...cfg, disabled_commands: cfg.disabled_commands.filter((x) => x !== c) })}>/{c} ✕</button>
            ))}</div>
          : <p className="mt-3 text-[13px] text-muted-foreground">Nenhum comando desligado.</p>}
        <p className="mt-3 text-[12px] text-muted-foreground">Lembre de salvar depois de adicionar ou remover.</p>
      </Section>

      {cfg.updated_at && <p className="text-[12px] text-muted-foreground">Última alteração em {new Date(cfg.updated_at).toLocaleString("pt-BR")} por {cfg.updated_by}.</p>}
    </div>
  )
}
