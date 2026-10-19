"use client"

import React, { use } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import {
  ShieldAlert,
  LayoutDashboard,
  ArrowLeft,
  MessageSquare,
  UserCheck,
  Users,
  Key,
  Ban,
  Skull,
  FileText,
  Activity,
  Crown,
  Brain,
  Star,
  Filter,
  MousePointerClick,
  Ticket,
  BellRing,
  Bot,
} from "lucide-react"
import { useT } from "@/lib/use-t"

type NavItem = { name: string; href: string; icon: React.ReactNode; badge?: string }

export default function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}) {
  const t = useT()
  const pathname = usePathname()
  const { guildId } = use(params)
  const base = `/dashboard/${guildId}`

  const categories: { title: string; items: NavItem[] }[] = [
    {
      title: t("Geral", "General"),
      items: [
        { name: t("Visão geral", "Overview"), href: base, icon: <LayoutDashboard /> },
        { name: "Premium", href: `${base}/premium`, icon: <Crown /> },
        { name: t("Lunna IA", "Lunna AI"), href: `${base}/ia`, icon: <Bot />, badge: t("Novo", "New") },
      ],
    },
    {
      title: t("Comunidade", "Community"),
      items: [
        { name: t("Entrada e saída", "Join and leave"), href: `${base}/welcome`, icon: <MessageSquare /> },
        { name: "Autorole", href: `${base}/autorole`, icon: <UserCheck /> },
        { name: t("Cargos por botão", "Button roles"), href: `${base}/role-panels`, icon: <MousePointerClick />, badge: t("Novo", "New") },
        { name: "Tickets", href: `${base}/tickets`, icon: <Ticket />, badge: t("Novo", "New") },
        { name: t("Alertas de redes", "Social alerts"), href: `${base}/alertas`, icon: <BellRing />, badge: t("Novo", "New") },
        { name: t("Níveis", "Levels"), href: `${base}/levels`, icon: <Star />, badge: t("Novo", "New") },
        { name: t("Contador de membros", "Member counter"), href: `${base}/member-counter`, icon: <Users /> },
        { name: t("Permissões", "Permissions"), href: `${base}/permissions`, icon: <Key /> },
        { name: t("Cérebro da Lunna", "Lunna's Brain"), href: `${base}/brain`, icon: <Brain /> },
      ],
    },
    {
      title: t("Moderação", "Moderation"),
      items: [
        { name: t("Moderação e anti-raid", "Moderation and anti-raid"), href: `${base}/moderation`, icon: <ShieldAlert /> },
        { name: t("Bloqueio de convites", "Invite blocking"), href: `${base}/anti-invite`, icon: <Ban /> },
        { name: t("Filtro de palavras", "Word filter"), href: `${base}/word-filter`, icon: <Filter />, badge: t("Novo", "New") },
        { name: t("Canal armadilha", "Trap channel"), href: `${base}/trap-channel`, icon: <Skull />, badge: t("Novo", "New") },
        { name: t("Punições", "Punishments"), href: `${base}/punishments`, icon: <FileText /> },
        { name: t("Logs de eventos", "Event logs"), href: `${base}/logs`, icon: <Activity /> },
      ],
    },
  ]

  // pathname includes the locale prefix (/pt/dashboard/...)
  const isActive = (href: string) => pathname === href || pathname.endsWith(href)
  const allItems = categories.flatMap((c) => c.items)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1180px] flex-1">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-border py-8 pr-4 pl-6 md:flex">
          <Link
            href="/dashboard"
            className="mb-8 flex w-max items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Seus servidores", "Your servers")}
          </Link>

          <nav className="flex flex-col gap-7">
            {categories.map((cat) => (
              <div key={cat.title} className="flex flex-col gap-1">
                <span className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground/70">
                  {cat.title}
                </span>
                {cat.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors [&_svg]:h-4 [&_svg]:w-4 ${
                        active
                          ? "bg-secondary text-foreground [&_svg]:text-[#7c3aed]"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-full bg-[#7c3aed]/15 px-2 py-0.5 text-[10px] font-semibold text-[#a78bfa]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-7 md:px-10 md:py-10">
          {/* Navigation (mobile) */}
          <div className="mb-6 md:hidden">
            <Link href="/dashboard" className="mb-3 flex w-max items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t("Seus servidores", "Your servers")}
            </Link>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {allItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium ${
                    isActive(item.href)
                      ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[860px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
