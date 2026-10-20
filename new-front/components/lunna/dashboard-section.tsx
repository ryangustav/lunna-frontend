"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  ArrowLeft, LayoutDashboard, Crown, Bot, MessageSquare, UserCheck, MousePointerClick, Ticket, BellRing, Star,
  ShieldAlert, Ban, Filter, Skull, ChevronRight, Lock,
} from "lucide-react"
import { Link } from "@/src/i18n/routing"
import { Pill } from "@/components/dashboard/primitives"
import { useT } from "@/lib/use-t"

/**
 * Home page preview of the real dashboard (app/[locale]/dashboard/[guildId]): same sidebar,
 * header and module list as the server overview, scaled down and not interactive.
 */
export function DashboardSection() {
  const t = useTranslations("Dashboard")
  const L = useT()

  const categories = [
    {
      title: L("Geral", "General"),
      items: [
        { name: L("Visão geral", "Overview"), icon: LayoutDashboard, active: true },
        { name: "Premium", icon: Crown },
        { name: L("Lunna IA", "Lunna AI"), icon: Bot, badge: L("Novo", "New") },
      ],
    },
    {
      title: L("Comunidade", "Community"),
      items: [
        { name: L("Entrada e saída", "Join and leave"), icon: MessageSquare },
        { name: "Autorole", icon: UserCheck },
        { name: L("Cargos por botão", "Button roles"), icon: MousePointerClick },
        { name: "Tickets", icon: Ticket },
        { name: L("Alertas de redes", "Social alerts"), icon: BellRing },
        { name: L("Níveis", "Levels"), icon: Star },
      ],
    },
    {
      title: L("Moderação", "Moderation"),
      items: [
        { name: L("Moderação e anti-raid", "Moderation and anti-raid"), icon: ShieldAlert },
        { name: L("Bloqueio de convites", "Invite blocking"), icon: Ban },
        { name: L("Filtro de palavras", "Word filter"), icon: Filter },
        { name: L("Canal armadilha", "Trap channel"), icon: Skull },
      ],
    },
  ]

  const modules = [
    { name: L("Mensagem de boas-vindas", "Welcome message"), on: true },
    { name: L("Banner de boas-vindas", "Welcome banner"), on: true },
    { name: "Autorole", on: true },
    { name: L("Contador de membros", "Member counter"), on: true, detail: L("2 ativo(s)", "2 active") },
    { name: "Anti-spam", on: true },
    { name: L("Bloqueio de convites", "Invite blocking"), on: false },
    { name: L("Canal armadilha", "Trap channel"), on: false },
  ]
  const active = modules.filter((m) => m.on).length

  return (
    <section id="dashboard" className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Eyebrow + heading */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[2px] text-primary">
            {t("title")}
          </span>
          <h2 className="mb-6 text-balance text-3xl font-black tracking-tighter text-foreground sm:text-5xl">
            {t("sectionTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Browser mockup of the real dashboard */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl" aria-hidden>
          {/* Browser bar */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-background px-4 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border sm:max-w-[320px]">
              <Lock className="h-3 w-3 shrink-0" />
              <span className="truncate">lunnabot.fun/dashboard</span>
            </div>
          </div>

          <div className="relative flex h-[440px] select-none overflow-hidden">
            {/* the window continues below: fade the cut */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />
            {/* Sidebar (same as the real one) */}
            <aside className="hidden w-[200px] shrink-0 flex-col gap-5 overflow-hidden border-r border-border py-5 pl-4 pr-3 md:flex">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> {L("Seus servidores", "Your servers")}
              </span>
              {categories.map((cat) => (
                <div key={cat.title} className="flex flex-col gap-0.5">
                  <span className="mb-1 px-2 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground/70">{cat.title}</span>
                  {cat.items.map((item) => (
                    <span
                      key={item.name}
                      className={`flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[11px] font-medium ${
                        item.active ? "bg-secondary text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.active ? "text-[#7c3aed]" : ""}`} />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-full bg-[#7c3aed]/15 px-1.5 py-px text-[8px] font-semibold text-[#a78bfa]">{item.badge}</span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </aside>

            {/* Server overview (same as the real one) */}
            <main className="min-w-0 flex-1 overflow-hidden px-5 py-6 sm:px-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#7c3aed]/20">
                  <Image src="/lunna-banner.jpg" alt="" fill className="object-cover object-top" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-[2px] text-[#7c3aed]">{L("Visão geral", "Overview")}</span>
                  <span className="block truncate text-[17px] font-bold leading-tight text-foreground">{L("Configurações do servidor", "Server settings")}</span>
                </div>
              </div>
              <p className="mb-4 text-[11px] text-muted-foreground">
                {L(`${active} de ${modules.length} módulos ativos. Escolha um módulo para configurar.`, `${active} of ${modules.length} modules on. Pick a module to set it up.`)}
              </p>

              <div className="mb-3 flex items-center justify-between gap-3 rounded-[12px] border border-border bg-card px-4 py-3">
                <div className="min-w-0">
                  <span className="block text-[12px] font-semibold text-foreground">{L("Plano do servidor", "Server plan")}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{L("Premium Completo ativo.", "Premium Complete active.")}</span>
                </div>
                <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-foreground">{L("Renovar", "Renew")}</span>
              </div>

              <div className="rounded-[12px] border border-border bg-card px-4 py-3">
                <span className="mb-1 block text-[12px] font-semibold text-foreground">{L("Módulos", "Modules")}</span>
                <ul className="divide-y divide-border">
                  {modules.map((m) => (
                    <li key={m.name} className="flex items-center justify-between gap-2 py-[7px]">
                      <span className="truncate text-[11px] text-foreground">{m.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {m.detail && <span className="hidden text-[10px] text-muted-foreground sm:inline">{m.detail}</span>}
                        <span className="origin-right scale-90"><Pill tone={m.on ? "success" : "neutral"}>{m.on ? L("Ativo", "On") : L("Desativado", "Off")}</Pill></span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </main>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
            <LayoutDashboard className="h-4 w-4" /> {L("Abrir o dashboard", "Open the dashboard")}
          </Link>
        </div>
      </div>
    </section>
  )
}
