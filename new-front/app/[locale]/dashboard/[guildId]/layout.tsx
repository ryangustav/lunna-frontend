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
} from "lucide-react"

type NavItem = { name: string; href: string; icon: React.ReactNode; badge?: string }

export default function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}) {
  const pathname = usePathname()
  const { guildId } = use(params)
  const base = `/dashboard/${guildId}`

  const categories: { title: string; items: NavItem[] }[] = [
    {
      title: "Geral",
      items: [
        { name: "Visão geral", href: base, icon: <LayoutDashboard /> },
        { name: "Premium", href: `${base}/premium`, icon: <Crown /> },
      ],
    },
    {
      title: "Comunidade",
      items: [
        { name: "Entrada e saída", href: `${base}/welcome`, icon: <MessageSquare /> },
        { name: "Autorole", href: `${base}/autorole`, icon: <UserCheck /> },
        { name: "Contador de membros", href: `${base}/member-counter`, icon: <Users /> },
        { name: "Permissões", href: `${base}/permissions`, icon: <Key /> },
        { name: "Cérebro da Lunna", href: `${base}/brain`, icon: <Brain /> },
      ],
    },
    {
      title: "Moderação",
      items: [
        { name: "Moderação e anti-raid", href: `${base}/moderation`, icon: <ShieldAlert /> },
        { name: "Bloqueio de convites", href: `${base}/anti-invite`, icon: <Ban /> },
        { name: "Canal armadilha", href: `${base}/trap-channel`, icon: <Skull />, badge: "Novo" },
        { name: "Punições", href: `${base}/punishments`, icon: <FileText /> },
        { name: "Logs de eventos", href: `${base}/logs`, icon: <Activity /> },
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
            Seus servidores
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
              Seus servidores
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
