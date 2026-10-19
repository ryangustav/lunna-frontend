"use client"

import React, { use, useEffect, useState } from "react"
import { Check } from "lucide-react"
import { useRouter } from "@/src/i18n/routing"
import { api } from "@/lib/api"
import { GUILD_PLANS, formatBRL, guildPlan, planText } from "@/lib/guild-premium"
import { useLocale } from "next-intl"
import { PageHeader, PrimaryButton, SecondaryButton, Pill, LoadingState } from "@/components/dashboard/primitives"
import { useT } from "@/lib/use-t"

const RANK: Record<string, number> = { free: 0, basico: 1, completo: 2 }

export default function GuildPremiumPage({ params }: { params: Promise<{ guildId: string }> }) {
  const t = useT()
  const { guildId } = use(params)
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState<string>("free")
  const [expiresAt, setExpiresAt] = useState<number>(0)

  useEffect(() => {
    api
      .getGuildSettings(guildId)
      .then((res) => {
        setCurrent(res?.premium_type || "free")
        setExpiresAt(res?.premium_expires_at || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [guildId])

  if (loading) return <LoadingState />

  const currentPlan = guildPlan(current) || guildPlan("free")!
  const expiry = expiresAt ? new Date(expiresAt * 1000).toLocaleDateString(t("pt-BR", "en-US")) : null

  return (
    <div>
      <PageHeader
        eyebrow="Premium"
        title={t("Planos para o servidor", "Plans for the server")}
        description={t("Pagamento único por 30 dias, sem renovação automática. Ao renovar o mesmo plano, os dias se somam.", "One-time payment for 30 days, no automatic renewal. Renewing the same plan adds the days up.")}
      />

      {current !== "free" && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-[14px] border border-border bg-card px-5 py-4 text-[14px]">
          <Pill tone="accent">{planText(currentPlan, locale).name}</Pill>
          <span className="text-muted-foreground">{t("ativo", "active")}{expiry ? t(` até ${expiry}`, ` until ${expiry}`) : ""}.</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {GUILD_PLANS.map((plan) => {
          const isCurrent = plan.key === current
          const isLower = RANK[plan.key] < RANK[current]
          const highlighted = plan.key === "completo"
          const text = planText(plan, locale)
          return (
            <div
              key={plan.key}
              className={`flex flex-col rounded-[14px] border bg-card p-6 ${highlighted ? "border-[#7c3aed]/60" : "border-border"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[15px] font-semibold text-foreground">{text.name}</h2>
                {isCurrent && <Pill tone="success">{t("Atual", "Current")}</Pill>}
              </div>
              <p className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">{text.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[26px] font-bold tracking-[-0.5px] text-foreground">
                  {plan.price ? formatBRL(plan.price) : t("Grátis", "Free")}
                </span>
                {plan.days && <span className="text-[13px] text-muted-foreground">/ {plan.days} {t("dias", "days")}</span>}
              </div>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {text.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-[13px] leading-[1.5] text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.key === "free" ? (
                  <SecondaryButton disabled className="w-full">
                    {isCurrent ? t("Plano atual", "Current plan") : t("Incluído", "Included")}
                  </SecondaryButton>
                ) : isLower ? (
                  <SecondaryButton disabled className="w-full">
                    {t("Plano superior ativo", "Higher plan active")}
                  </SecondaryButton>
                ) : (
                  <PrimaryButton
                    className="w-full"
                    onClick={() => router.push(`/checkout?type=GUILD_VIP&id=${plan.key}&guild=${guildId}`)}
                  >
                    {isCurrent ? t("Renovar por 30 dias", "Renew for 30 days") : t(`Assinar ${text.name}`, `Get ${text.name}`)}
                  </PrimaryButton>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-[12px] leading-[1.6] text-muted-foreground">
        {t("O multiplicador de daily vale para quem é membro de um servidor premium. Ao trocar do Básico para o Completo, os dias restantes do Básico são convertidos proporcionalmente ao preço. Compras de bens virtuais seguem a nossa",
          "The daily multiplier applies to members of a premium server. When you switch from Basic to Complete, the days left on Basic are converted in proportion to the price. Purchases of virtual goods follow our")}{" "}
        <a href={t("/privacy", "/en/privacy")} className="underline underline-offset-2 hover:text-foreground">{t("Política de Privacidade", "Privacy Policy")}</a>.
      </p>
    </div>
  )
}
