"use client"

import React, { use, useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { guildPlan } from "@/lib/guild-premium"
import { PageHeader, Section, PrimaryButton, Pill, LoadingState, ErrorState } from "@/components/dashboard/primitives"
import { useT, type T } from "@/lib/use-t"

type Settings = Record<string, any>

// Each module's on/off state, derived only from saved settings (no invented numbers)
function modules(s: Settings, base: string, t: T) {
  const counters = Object.values(s.member_counters || {}).filter((c: any) => c?.enabled).length
  return [
    { name: t("Mensagem de boas-vindas", "Welcome message"), on: !!s.welcome_channel, href: `${base}/welcome` },
    { name: t("Banner de boas-vindas", "Welcome banner"), on: !!s.welcome_banner_enabled, href: `${base}/welcome` },
    { name: "Autorole", on: !!s.autorole_role, href: `${base}/autorole` },
    { name: t("Contador de membros", "Member counter"), on: counters > 0, detail: counters ? t(`${counters} ativo(s)`, `${counters} active`) : undefined, href: `${base}/member-counter` },
    { name: "Anti-spam", on: !!s.anti_spam?.enabled, href: `${base}/moderation` },
    { name: t("Bloqueio de convites", "Invite blocking"), on: !!s.anti_invite?.enabled, href: `${base}/anti-invite` },
    { name: t("Bloqueio de links", "Link blocking"), on: !!s.anti_link?.enabled, href: `${base}/anti-invite` },
    { name: t("Canal armadilha", "Trap channel"), on: !!s.trap_channel?.enabled, href: `${base}/trap-channel` },
    { name: t("Logs de eventos", "Event logs"), on: !!(s.mod_log_channel || s.log_msg_delete_channel || s.log_msg_edit_channel), href: `${base}/logs` },
  ]
}

export default function GuildOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const { toast } = useToast()
  const base = `/dashboard/${guildId}`

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({})
  // "auto" = nothing saved: Lunna follows the server's Discord language
  const [language, setLanguage] = useState<string>("auto")

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getGuildSettings(guildId)
      if (res) {
        setSettings(res)
        setLanguage(res.language === "pt" || res.language === "en" ? res.language : "auto")
      }
    } catch (err: any) {
      setError(err.message || t("Erro ao carregar as configurações do servidor.", "Couldn't load the server settings."))
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
      await api.updateGuildSettings(guildId, { language: language === "auto" ? null : language })
      toast({ title: t("Idioma salvo", "Language saved"), description: t("A Lunna vai usar este idioma no servidor.", "Lunna will use this language in the server.") })
    } catch (err: any) {
      toast({ title: t("Erro ao salvar", "Couldn't save"), description: err.message || t("Não foi possível salvar o idioma.", "Couldn't save the language."), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const plan = guildPlan(settings.premium_type) || guildPlan("free")!
  const mods = modules(settings, base, t)
  const active = mods.filter((m) => m.on).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={t("Visão geral", "Overview")}
        title={t("Configurações do servidor", "Server settings")}
        description={t(`${active} de ${mods.length} módulos ativos. Escolha um módulo para configurar.`, `${active} of ${mods.length} modules on. Pick a module to set it up.`)}
      />

      <Section
        title={t("Plano do servidor", "Server plan")}
        description={
          plan.key === "free"
            ? t("Este servidor está no plano gratuito.", "This server is on the free plan.")
            : t(`${plan.name} ativo${settings.premium_expires_at ? ` até ${new Date(settings.premium_expires_at * 1000).toLocaleDateString("pt-BR")}` : ""}.`, `${plan.name} active${settings.premium_expires_at ? ` until ${new Date(settings.premium_expires_at * 1000).toLocaleDateString("en-US")}` : ""}.`)
        }
        action={
          <Link
            href={`${base}/premium`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {plan.key === "free" ? t("Ver planos", "See plans") : t("Renovar", "Renew")}
          </Link>
        }
      />

      <Section title={t("Módulos", "Modules")}>
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
                  <Pill tone={m.on ? "success" : "neutral"}>{m.on ? t("Ativo", "On") : t("Desativado", "Off")}</Pill>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title={t("Idioma da Lunna", "Lunna's language")}
        description={t("Idioma das mensagens que a Lunna posta neste servidor, como logs, tickets e boas-vindas. As respostas a cada membro seguem o idioma pessoal de cada um.", "Language of the messages Lunna posts in this server, like logs, tickets and welcomes. Each member's own replies follow their personal language.")}
        action={
          <PrimaryButton onClick={saveLanguage} loading={saving}>
            {t("Salvar", "Save")}
          </PrimaryButton>
        }
      >
        <div className="grid max-w-[720px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { value: "auto", label: t("Automático", "Automatic"), hint: t("Idioma do servidor no Discord", "The server's Discord language") },
            { value: "pt", label: "Português (Brasil)" },
            { value: "en", label: "English" },
          ].map((opt: { value: string; label: string; hint?: string }) => (
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
              <span className="flex flex-col">
                {opt.label}
                {opt.hint && <span className="text-[12px] text-muted-foreground">{opt.hint}</span>}
              </span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}
