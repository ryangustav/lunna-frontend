"use client"

import { useLocale } from "next-intl"
import { useEffect, useTransition } from "react"
import { Globe, Check } from "lucide-react"
import { usePathname, useRouter } from "@/src/i18n/routing"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"

// Names stay in their own language so anyone can find theirs
const LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
] as const
type Code = (typeof LANGUAGES)[number]["code"]

const SYNC_KEY = "lunna-lang-synced"
const loggedIn = () => typeof document !== "undefined" && /(^|;\s*)token=/.test(document.cookie)
const markSynced = () => { try { sessionStorage.setItem(SYNC_KEY, "1") } catch { /* private mode */ } }

function useSwitchLocale() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  // keeps the page and its query string; next-intl also updates the NEXT_LOCALE cookie
  const change = async (code: Code) => {
    if (code === locale) return
    // logged in: the account language changes too (the bot answers in it). Saved BEFORE leaving the
    // page — otherwise the next page could still read the old language and switch back. Never more
    // than 2.5 s: a slow backend doesn't block the switch.
    if (loggedIn()) {
      await Promise.race([api.setMyLanguage(code).catch(() => {}), new Promise((r) => setTimeout(r, 2500))])
      markSynced()
    }
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

/**
 * The site follows the account's language: logged in, the language chosen on the site or with
 * /linguagem in the bot wins over the browser's. Checked once per session (and skipped right after
 * the person switched on the site).
 */
export function AccountLanguageSync() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (!loggedIn()) return
    try { if (sessionStorage.getItem(SYNC_KEY)) return } catch { /* private mode: check every time */ }
    let alive = true
    api.getMyLanguage().then((r: any) => {
      markSynced()
      const lang = r?.data?.language
      if (!alive || !lang || lang === locale || !LANGUAGES.some((l) => l.code === lang)) return
      router.replace(`${pathname}${window.location.search}`, { locale: lang })
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  return null
}
