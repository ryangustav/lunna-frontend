"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/routing"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun, LayoutDashboard, User as UserIcon, Backpack, LogOut, ChevronDown, Crown, Coins } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  username: string
  avatar?: string
}

export function Navbar() {
  const t = useTranslations("Navigation")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const loginUrl =
    "https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Fapi.lunnabot.fun%2Fv1%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"

  useEffect(() => {
    let active = true

    // Retrieve Token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get("token")

    if (tokenFromUrl) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 7)
      document.cookie = `token=${tokenFromUrl}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }

    async function checkAuth() {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] ?? null

      if (!token) {
        if (active) {
          setIsAuthenticated(false)
          setUser(null)
        }
        return
      }

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1"
        const response = await fetch(`${apiBase}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          if (active) {
            setIsAuthenticated(true)
            setUser(data.data) // Assuming user object is inside data.data
          }
        } else {
          if (active) {
            setIsAuthenticated(false)
            setUser(null)
          }
        }
      } catch {
        if (active) {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/"
  }

  const navLinks = useMemo(
    () => [
      { label: t("features"), href: "/#features" },
      { label: t("commands"), href: "/commands" },
      { label: t("vip"), href: "/vip", icon: Crown },
      { label: t("coins"), href: "/coins", icon: Coins },
      { label: t("support"), href: "https://discord.gg/DaUhFcjJfH", isExternal: true },
    ],
    [t]
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-primary shadow-sm">
            <Image
              src="/lunna-banner.jpg"
              alt="Lunna Avatar"
              fill
              className="object-cover object-top"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Lu<span className="text-primary/80">nna</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Alternar tema"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1 pl-3 pr-2 transition-colors hover:bg-secondary">
                    <span className="text-sm font-medium text-foreground">{user.username}</span>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                      <Image
                        src={user.avatar || "/placeholder-user.jpg"}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg p-2.5">
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg p-2.5">
                    <Link href="/profile">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg p-2.5">
                    <Link href="/inventory">
                      <Backpack className="h-4 w-4" />
                      <span className="font-medium">Inventário</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 rounded-lg p-2.5 text-red-500 focus:bg-red-500/10 focus:text-red-500">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="rounded-full font-semibold">
                <a href={loginUrl}>{t("login")}</a>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated && user ? (
                  <div className="mt-4 flex flex-col gap-4 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                        <Image src={user.avatar || "/placeholder-user.jpg"} alt={user.username} fill className="object-cover" />
                      </div>
                      <span className="text-lg font-bold text-foreground">{user.username}</span>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground">
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground">
                      <UserIcon className="h-5 w-5" /> Perfil
                    </Link>
                    <Link href="/inventory" className="flex items-center gap-3 text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground">
                      <Backpack className="h-5 w-5" /> Inventário
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-lg font-semibold text-red-500 transition-colors hover:opacity-80">
                      <LogOut className="h-5 w-5" /> Sair
                    </button>
                  </div>
                ) : (
                  <Button asChild className="mt-4 rounded-xl font-bold">
                    <a href={loginUrl}>{t("login")}</a>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
