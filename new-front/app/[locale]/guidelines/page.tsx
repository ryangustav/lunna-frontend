"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, Ban, Shield, DollarSign, Users, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"

export default function GuidelinesPage() {
  const t = useTranslations("Guidelines")

  const sections = [
    {
      title: "Restrições de Conteúdo",
      icon: Ban,
      rules: [
        "O uso de conteúdo NSFW (sexual, violento ou perturbador) é estritamente proibido.",
        "A troca de moedas virtuais por bens reais ou serviços externos é proibida.",
        "Discurso de ódio, assédio ou bullying contra outros usuários resultará em banimento imediato.",
      ],
    },
    {
      title: "Integridade do Sistema",
      icon: Shield,
      rules: [
        "Não tente abusar de bugs para ganhar moedas ou itens. Reporte-os à nossa equipe.",
        "O uso de bots, scripts ou automações para 'farmar' no RPG é proibido.",
        "A criação de múltiplas contas (alts) para burlar limites diários é passível de punição.",
      ],
    },
    {
      title: "Atividades Comerciais",
      icon: DollarSign,
      text: "A Lunna não permite a venda de moedas virtuais por dinheiro real fora dos canais oficiais. Qualquer transação P2P envolvendo dinheiro real é de inteira responsabilidade dos usuários e pode resultar em suspensão se envolver fraude.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-20 flex flex-col items-center text-center">
            <Link href="/" className="group mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("backHome")}
            </Link>

            <Badge variant="outline" className="mb-6 border-red-500/20 bg-red-500/5 px-4 py-1.5 text-red-600">
              <AlertTriangle className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Diretrizes</span>
            </Badge>

            <h1 className="mb-4 text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl text-foreground">
              {t("title")}
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              {t("lastUpdated")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="space-y-16 p-8 md:p-12">
                {sections.map((section, i) => (
                  <section key={i} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                    </div>

                    {section.rules && (
                      <div className="grid gap-4">
                        {section.rules.map((rule, j) => (
                          <div key={j} className="flex gap-4 rounded-2xl border border-border bg-secondary/30 p-6 text-sm font-bold leading-relaxed text-muted-foreground transition-colors hover:border-red-500/20 hover:text-foreground">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-black text-red-600">!</span>
                            {rule}
                          </div>
                        ))}
                      </div>
                    )}

                    {section.text && (
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {section.text}
                      </p>
                    )}

                    {i < sections.length - 1 && <div className="h-px bg-border/50" />}
                  </section>
                ))}

                {/* Community Section */}
                <section className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-12">
                  <div className="mb-6 flex justify-center">
                     <Users className="h-12 w-12 opacity-50" />
                  </div>
                  <h3 className="mb-4 text-2xl font-black italic uppercase tracking-tighter">Comunidade em Primeiro Lugar</h3>
                  <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">Nosso objetivo é criar um ecossistema divertido e justo. Ao usar a Lunna, você concorda em respeitar estas regras e a plataforma Discord.</p>
                  <a href="https://discord.gg/DaUhFcjJfH" target="_blank" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-primary shadow-lg transition-all hover:scale-105 active:scale-95">
                    Reportar Violação
                  </a>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
