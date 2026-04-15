"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot } from "lucide-react"

export function CtaSection() {
  const t = useTranslations("CTA")

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-20 text-center shadow-2xl">
          {/* Decorative gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent)]" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="max-w-3xl text-balance text-3xl font-black tracking-tighter text-primary-foreground sm:text-5xl md:text-6xl">
              {t("title")}
            </h2>
            <p className="max-w-xl text-lg font-medium text-primary-foreground/80">
              {t("subtitle")}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="h-14 rounded-full px-10 text-base font-black transition-all hover:scale-105">
                <a href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands" className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {t("primaryCta")}
                </a>
              </Button>
              <Button size="lg" variant="ghost" className="h-14 rounded-full px-10 text-base font-bold text-primary-foreground hover:bg-white/10">
                <a href="https://discord.gg/DaUhFcjJfH" className="flex items-center gap-2">
                  {t("secondaryCta")}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
