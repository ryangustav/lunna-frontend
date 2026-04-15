"use client"

import { useTranslations } from "next-intl"
import { Crown, Check, ArrowLeft, Sparkles, Shield, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useState } from "react"

export default function VipPage() {
  const t = useTranslations("VIP")
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      key: "vip",
      icon: Star,
      priceMonthly: 9.90,
      popular: false,
    },
    {
      key: "premium",
      icon: Zap,
      priceMonthly: 19.90,
      popular: true,
    },
    {
      key: "gods",
      icon: Crown,
      priceMonthly: 39.90,
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backHome")}
          </Link>
          
          <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
          </Badge>
          
          <h1 className="mb-6 max-w-4xl text-balance text-4xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl">
            {t("title")}
          </h1>
          <p className="mb-10 max-w-2xl text-lg font-medium text-muted-foreground">
            {t("subtitle")}
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 p-1 backdrop-blur-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                billing === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("monthlyLabel")}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${
                billing === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("yearlyLabel")}
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">
                {t("yearlySave")}
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const price = billing === "yearly"
              ? (plan.priceMonthly * 12 * 0.8).toFixed(0)
              : plan.priceMonthly.toFixed(2).replace(".", ",")
            
            const planT = t.raw(`plans.${plan.key}`) as { name: string, description: string, features: string[] }

            return (
              <Card 
                key={plan.key}
                className={`relative flex flex-col border-border transition-all duration-300 hover:border-primary/30 hover:shadow-2xl ${
                  plan.popular ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                      {t("mostPopular")}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary border border-border">
                    <plan.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">{planT.name}</CardTitle>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{planT.description}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-8 flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">R$</span>
                    <span className="text-5xl font-black tracking-tighter">{price}</span>
                    <span className="text-sm font-medium text-muted-foreground">/ {billing === "yearly" ? t("perYear") : t("perMonth")}</span>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("featuresTitle")}
                    </span>
                    <ul className="space-y-3">
                      {planT.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-primary/10 p-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium leading-tight text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-8">
                  <Button variant={plan.popular ? "default" : "outline"} className="h-12 w-full rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t("getStarted")}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
