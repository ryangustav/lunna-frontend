"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Server, Settings, PlusCircle, LayoutDashboard, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { api } from "@/lib/api"

interface Guild {
  id: string
  name: string
  icon: string | null
  isBotIn: boolean
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard")
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        setLoading(true)
        const result = await api.getGuilds()
        if (result.success) {
          setGuilds(result.data)
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setError(t("noServers"))
      } finally {
        setLoading(false)
      }
    }
    fetchGuilds()
  }, [t])

  const filteredGuilds = guilds.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-start gap-4">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backHome")}
          </Link>
          
          <div className="flex w-full flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
              </Badge>
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl uppercase italic">
                {t("title")}
              </h1>
              <p className="max-w-xl text-lg font-medium text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Buscar seu servidor..."
                  className="h-12 w-full rounded-2xl border border-border bg-secondary/30 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-12 border-destructive/20 bg-destructive/5 p-6">
            <p className="font-bold text-destructive">{error}</p>
          </Card>
        )}

        {/* Guilds Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))
          ) : (
            <>
              {filteredGuilds.map((guild) => (
                <Card 
                  key={guild.id}
                  className="group relative flex flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-2xl"
                >
                  <CardHeader className="flex flex-col items-center gap-6 pt-10 pb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Avatar className="h-28 w-28 border-4 border-background transition-transform group-hover:scale-110">
                        <AvatarImage src={guild.icon || ""} alt={guild.name} className="object-cover" />
                        <AvatarFallback className="bg-secondary text-2xl font-black">
                          {guild.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-center line-clamp-1 group-hover:text-primary transition-colors">
                      {guild.name}
                    </CardTitle>
                  </CardHeader>

                  <CardFooter className="mt-auto p-6 pt-0">
                    {guild.isBotIn ? (
                      <Button asChild className="h-12 w-full rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02]">
                        <Link href={`/dashboard/${guild.id}` as any} className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {t("manage")}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="secondary" className="h-12 w-full rounded-xl border border-primary/20 bg-primary/5 font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                        <a 
                          href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          {t("guest")}
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}

              {/* Add New Mockup */}
              <a 
                href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands"
                target="_blank"
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border p-10 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <PlusCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Adicionar a outro servidor</p>
                  <p className="text-sm text-muted-foreground">Não encontrou o que procurava?</p>
                </div>
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
