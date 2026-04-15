"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/routing"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const t = useTranslations("Navigation")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const loginUrl =
    "https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Fapi.lunnabot.fun%2Fv1%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"

  useEffect(() => {
    let active = true

    async function checkAuth() {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] ?? null

      if (!token) {
        if (active) setIsAuthenticated(false)
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

        if (active) setIsAuthenticated(response.ok)
      } catch {
        if (active) setIsAuthenticated(false)
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

  const navLinks = useMemo(
    () => [
      { label: t("features"), href: "/#features" },
      { label: t("commands"), href: "/commands" },
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
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://discord.gg/DaUhFcjJfH"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            {t("support")}
          </a>
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

          <Button asChild className="hidden rounded-full font-semibold md:flex">
            {isAuthenticated ? (
              <Link href="/dashboard">{t("dashboard")}</Link>
            ) : (
              <a href={loginUrl}>{t("login")}</a>
            )}
          </Button>

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
                    className="text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://discord.gg/DaUhFcjJfH"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground"
                >
                  {t("support")}
                </a>
                <Button asChild className="mt-4 rounded-xl font-bold">
                  {isAuthenticated ? (
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  ) : (
                    <a href={loginUrl}>{t("login")}</a>
                  )}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

