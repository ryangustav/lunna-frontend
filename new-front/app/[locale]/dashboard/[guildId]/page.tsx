"use client"

import React, { use, useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { guildPlan } from "@/lib/guild-premium"
import { PageHeader, Section, PrimaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"

type Settings = Record<string, any>

// Each module's on/off state, derived only from saved settings (no invented numbers)
function modules(s: Settings, base: string) {
  const counters = Object.values(s.member_counters || {}).filter((c: any) => c?.enabled).length
  return [
    { name: "Mensagem de boas-vindas", on: !!s.welcome_channel, href: `${base}/welcome` },
    { name: "Banner de boas-vindas", on: !!s.welcome_banner_enabled, href: `${base}/welcome` },
    { name: "Autorole", on: !!s.autorole_role, href: `${base}/autorole` },
    { name: "Contador de membros", on: counters > 0, detail: counters ? `${counters} ativo(s)` : undefined, href: `${base}/member-counter` },
    { name: "Anti-spam", on: !!s.anti_spam?.enabled, href: `${base}/moderation` },
    { name: "Bloqueio de convites", on: !!s.anti_invite?.enabled, href: `${base}/anti-invite` },
    { name: "Bloqueio de links", on: !!s.anti_link?.enabled, href: `${base}/anti-invite` },
    { name: "Canal armadilha", on: !!s.trap_channel?.enabled, href: `${base}/trap-channel` },
    { name: "Logs de eventos", on: !!(s.mod_log_channel || s.log_msg_delete_channel || s.log_msg_edit_channel), href: `${base}/logs` },
  ]
}

export default function GuildOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params)
  const { toast } = useToast()
  const base = `/dashboard/${guildId}`

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({})
  const [language, setLanguage] = useState("en")

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getGuildSettings(guildId)
      if (res) {
        setSettings(res)
        setLanguage(res.language || "en")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar as configurações do servidor.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId])

  const saveLanguage = async () => {
    setSaving(true)
    try {
      await api.updateGuildSettings(guildId, { language })
      toast({ title: "Idioma salvo", description: "A Lunna vai responder neste idioma no servidor." })
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message || "Não foi possível salvar o idioma.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const plan = guildPlan(settings.premium_type) || guildPlan("free")!
  const mods = modules(settings, base)
  const active = mods.filter((m) => m.on).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Visão geral"
        title="Configurações do servidor"
        description={`${active} de ${mods.length} módulos ativos. Escolha um módulo para configurar.`}
      />

      <Section
        title="Plano do servidor"
        description={
          plan.key === "free"
            ? "Este servidor está no plano gratuito."
            : `${plan.name} ativo${settings.premium_expires_at ? ` até ${new Date(settings.premium_expires_at * 1000).toLocaleDateString("pt-BR")}` : ""}.`
        }
        action={
          <Link
            href={`${base}/premium`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {plan.key === "free" ? "Ver planos" : "Renovar"}
          </Link>
        }
      />

      <Section title="Módulos">
        <ul className="-mx-2 divide-y divide-border">
          {mods.map((m) => (
            <li key={m.name}>
              <Link
                href={m.href}
                className="flex items-center justify-between gap-3 rounded-[10px] px-2 py-3 transition-colors hover:bg-secondary/60"
              >
                <span className="text-[14px] text-foreground">{m.name}</span>
                <span className="flex items-center gap-2">
                  {m.detail && <span className="text-[12px] text-muted-foreground">{m.detail}</span>}
                  <Pill tone={m.on ? "success" : "neutral"}>{m.on ? "Ativo" : "Desativado"}</Pill>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Idioma da Lunna"
        description="Idioma das respostas e mensagens automáticas neste servidor."
        action={
          <PrimaryButton onClick={saveLanguage} loading={saving}>
            Salvar
          </PrimaryButton>
        }
      >
        <div className="grid max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { value: "pt", label: "Português (Brasil)" },
            { value: "en", label: "English" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[14px] transition-colors ${
                language === opt.value ? "border-[#7c3aed] bg-[#7c3aed]/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              <input
                type="radio"
                name="bot-language"
                value={opt.value}
                checked={language === opt.value}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-4 w-4 accent-[#7c3aed]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}
