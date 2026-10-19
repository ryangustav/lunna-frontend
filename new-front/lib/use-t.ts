"use client"

import { useCallback } from "react"
import { useLocale } from "next-intl"

/** t("Salvar", "Save") → the one for the site's current language (same idea as the bot's tr()). */
export type T = (pt: string, en: string) => string

/** Inline translations for the dashboard, following the site's language (/en/... or /pt/...). */
export function useT(): T {
  const locale = useLocale()
  return useCallback((pt: string, en: string) => (locale === "en" ? en : pt), [locale])
}

/** Locale for dates and numbers: "en-US" or "pt-BR". */
export function useNumberLocale() {
  return useLocale() === "en" ? "en-US" : "pt-BR"
}
