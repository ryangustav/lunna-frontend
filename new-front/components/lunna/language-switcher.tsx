"use client"

import { useLocale } from "next-intl"
import { useTransition } from "react"
import { Globe, Check } from "lucide-react"
import { usePathname, useRouter } from "@/src/i18n/routing"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Names stay in their own language so anyone can find theirs
const LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
] as const
type Code = (typeof LANGUAGES)[number]["code"]

function useSwitchLocale() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  // keeps the page and its query string; next-intl also updates the NEXT_LOCALE cookie
  const change = (code: Code) => {
    if (code === locale) return
    const query = typeof window !== "undefined" ? window.location.search : ""
    startTransition(() => router.replace(`${pathname}${query}`, { locale: code }))
  }
  return { locale, change, pending }
}

export function LanguageSwitcher() {
  const { locale, change, pending } = useSwitchLocale()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 rounded-full" aria-label={locale === "pt" ? "Idioma" : "Language"} disabled={pending}>
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => change(l.code)} className="gap-2">
            <span className="flex-1">{l.label}</span>
            {locale === l.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Inline version for the mobile menu. */
export function LanguageButtons() {
  const { locale, change, pending } = useSwitchLocale()
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-foreground/70" />
      {LANGUAGES.map((l) => (
        <button key={l.code} type="button" disabled={pending} onClick={() => change(l.code)}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${locale === l.code ? "bg-secondary text-foreground" : "text-foreground/60 hover:text-foreground"}`}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
