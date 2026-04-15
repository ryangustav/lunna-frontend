"use client"

import { useTranslations } from "next-intl"
import { Shield, Database, Eye, Lock, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"

export default function PrivacyPage() {
  const t = useTranslations("Privacy")

  const sections = [
    {
      title: "Informações que Coletamos",
      icon: Database,
      content: [
        "ID e Nome de Usuário do Discord",
        "Email e Avatar",
        "Endereço IP",
        "Servidores que você gerencia",
        "Mensagens e Mídia enviadas ao bot",
        "Informações de Transação",
      ],
    },
    {
      title: "Como Usamos",
      icon: Eye,
      content: [
        "Fornecer e manter as funcionalidades de economia e RPG.",
        "Processar transações e garantir a entrega de itens VIP.",
        "Melhorar a experiência do usuário e corrigir bugs.",
        "Garantir a segurança contra abusos e cheats.",
      ],
    },
    {
      title: "Proteção de Dados",
      icon: Lock,
      text: "A segurança dos seus dados é nossa prioridade. Todos os dados são armazenados de forma segura e o acesso é restrito apenas à equipe administrativa da Lunna. Nós nunca vendemos ou compartilhamos seus dados com terceiros para fins de marketing.",
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

            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <Shield className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Legal</span>
            </Badge>

            <h1 className="mb-4 text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl">
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

                    {section.content && (
                      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.content.map((item, j) => (
                          <li key={j} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.text && (
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {section.text}
                      </p>
                    )}

                    {i < sections.length - 1 && <div className="h-px bg-border/50" />}
                  </section>
                ))}

                {/* Support Section */}
                <section className="rounded-3xl bg-secondary/50 p-8 text-center text-muted-foreground md:p-12">
                  <h3 className="mb-4 text-xl font-bold text-foreground">Dúvidas sobre seus dados?</h3>
                  <p className="mb-8">Se você tiver qualquer dúvida sobre nossa política, entre em contato através do nosso servidor oficial.</p>
                  <a href="https://discord.gg/DaUhFcjJfH" target="_blank" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95">
                    Servidor de Suporte
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
