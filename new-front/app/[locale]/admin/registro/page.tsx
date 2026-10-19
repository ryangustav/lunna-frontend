"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { PageHeader, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Entry = { id: string; admin_id: string; action: string; target: string | null; details: any; at: string }

const ACTION: Record<string, string> = {
  "campaign.create": "Criou a campanha", "campaign.send": "Iniciou o envio da campanha", "campaign.pause": "Pausou a campanha",
  "notice.create": "Criou o aviso", "notice.update": "Editou o aviso", "notice.end": "Encerrou o aviso",
  "bot_config.update": "Alterou os interruptores", "codes.create": "Gerou códigos de resgate",
  "guild.view": "Consultou o servidor", "guild.leave": "Tirou a Lunna do servidor", "guild.block": "Bloqueou o servidor", "guild.unblock": "Desbloqueou o servidor",
  "user.view": "Consultou o usuário", "user.ban": "Baniu", "user.unban": "Desbaniu", "user.flag": "Sinalizou", "user.unflag": "Tirou a sinalização de",
}

function detailText(e: Entry) {
  const d = e.details || {}
  if (e.action === "bot_config.update") return `manutenção ${d.maintenance ? "ligada" : "desligada"}${d.disabled_commands?.length ? ` · desligados: ${d.disabled_commands.map((c: string) => (c.startsWith("cat:") ? `categoria ${c.slice(4)}` : `/${c}`)).join(", ")}` : ""}${d.disabled_features?.length ? ` · recursos pausados: ${d.disabled_features.join(", ")}` : ""}${d.bypass_guild_ids?.length ? ` · ${d.bypass_guild_ids.length} servidor(es) isento(s)` : ""}`
  if (e.action.startsWith("notice.") && d.severity) return `${d.severity}${d.published ? " · publicado" : " · rascunho"}${d.show_bot ? " · bot" : ""}`
  if (e.action.startsWith("user.") && d.reason) return `motivo: ${d.reason}`
  if ((e.action === "guild.leave" || e.action === "guild.block") && d.reason) return `${d.name ? `${d.name} · ` : ""}motivo: ${d.reason}`
  if (e.action === "codes.create") return `${d.quantity} × ${d.type === "vip" ? `VIP ${d.vip}` : `${d.value} moedas`}`
  if (e.action === "campaign.create" && d.vip) return `${d.vip.tier} ${d.vip.days}d${d.guild?.tier ? ` · servidor ${d.guild.tier} ${d.guild.days}d` : ""}`
  return ""
}

export default function AdminAuditPage() {
  const [list, setList] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = () => { setError(null); api.getAdminAudit().then((r) => setList(r.data)).catch((e) => setError(e.message)) }
  useEffect(load, [])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!list) return <LoadingState />
  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Administração" title="Registro de ações" description="Tudo que foi alterado pelo painel, com quem fez e quando (últimas 200 ações)." />
      {list.length === 0 ? <p className="text-[14px] text-muted-foreground">Nada registrado ainda.</p> : (
        <div className="overflow-hidden rounded-[14px] border border-border">
          {list.map((e, i) => (
            <div key={e.id} className={`flex flex-col gap-0.5 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:gap-4 ${i % 2 ? "bg-card" : "bg-background"}`}>
              <span className="w-40 shrink-0 text-muted-foreground">{new Date(e.at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
              <span className="min-w-0 flex-1 text-foreground">
                {ACTION[e.action] || e.action} {e.target && <strong className="font-semibold">{e.target}</strong>}
                {detailText(e) && <span className="text-muted-foreground"> · {detailText(e)}</span>}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{e.admin_id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
