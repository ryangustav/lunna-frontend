"use client"

import React, { use } from "react"
import { usePathname } from "next/navigation"
import { Link } from "@/src/i18n/routing"
import { 
  ShieldAlert, 
  Settings, 
  LayoutDashboard, 
  ChevronLeft,
  MessageSquare,
  UserCheck,
  Users,
  Key,
  Ban,
  Skull,
  FileText,
  AlertTriangle,
  HelpCircle,
  Activity,
  Shield,
  Lock
} from "lucide-react"

export default function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}) {
  const pathname = usePathname()
  const { guildId } = use(params)

  const categories = [
    {
      title: "GERAL",
      items: [
        {
          name: "Visão Geral",
          href: `/dashboard/${guildId}`,
          icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
        }
      ]
    },
    {
      title: "COMUNIDADE",
      items: [
        {
          name: "Mensagens de Entrada/Saída",
          href: `/dashboard/${guildId}/welcome`,
          icon: <MessageSquare className="mr-3 h-5 w-5" />,
        },
        {
          name: "Autorole",
          href: `/dashboard/${guildId}/autorole`,
          icon: <UserCheck className="mr-3 h-5 w-5" />,
        },
        {
          name: "Contador de Membros",
          href: "#",
          icon: <Users className="mr-3 h-5 w-5" />,
          disabled: true,
        },
        {
          name: "Permissões",
          href: `/dashboard/${guildId}/permissions`,
          icon: <Key className="mr-3 h-5 w-5" />,
        }
      ]
    },
    {
      title: "MODERAÇÃO",
      items: [
        {
          name: "Moderação & Anti-Raid",
          href: `/dashboard/${guildId}/moderation`,
          icon: <ShieldAlert className="mr-3 h-5 w-5" />,
        },
        {
          name: "Bloqueador de Convites",
          href: "#",
          icon: <Ban className="mr-3 h-5 w-5" />,
          disabled: true,
        },
        {
          name: "Canais de Armadilha",
          href: "#",
          icon: <Skull className="mr-3 h-5 w-5" />,
          disabled: true,
          badge: "NOVO!"
        },
        {
          name: "Registro de Punições",
          href: "#",
          icon: <FileText className="mr-3 h-5 w-5" />,
          disabled: true,
        },
        {
          name: "Punições de Avisos",
          href: "#",
          icon: <AlertTriangle className="mr-3 h-5 w-5" />,
          disabled: true,
        },
        {
          name: "Motivos de Punição...",
          href: "#",
          icon: <HelpCircle className="mr-3 h-5 w-5" />,
          disabled: true,
          badge: "NOVO!"
        },
        {
          name: "Registro de Eventos",
          href: `/dashboard/${guildId}/logs`,
          icon: <Activity className="mr-3 h-5 w-5" />,
        }
      ]
    }
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar Desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-col overflow-y-auto border-r border-border bg-card/30 backdrop-blur-3xl md:flex">
        <div className="flex flex-col gap-8 p-6">
          <Link
            href="/dashboard"
            className="group flex w-max items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar aos Servidores
          </Link>

          <div className="flex flex-col space-y-6">
            {categories.map((cat) => (
              <div key={cat.title} className="flex flex-col space-y-2">
                <span className="px-4 text-xs font-black tracking-wider text-sky-400 uppercase select-none">
                  {cat.title}
                </span>
                
                <div className="flex flex-col space-y-1">
                  {cat.items.map((item) => {
                    const isActive = pathname === item.href
                    
                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground/45 cursor-not-allowed select-none"
                        >
                          <div className="flex items-center">
                            {item.icon}
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                                {item.badge}
                              </span>
                            )}
                            <Lock className="h-3.5 w-3.5 opacity-40" />
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-[0_4px_15px_-5px] shadow-primary/40"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
        {/* Glow de fundo da main area */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

        <div className="mx-auto w-full max-w-5xl rounded-[2.5rem] border border-border bg-card/20 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
