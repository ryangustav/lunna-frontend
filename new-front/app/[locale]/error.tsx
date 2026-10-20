"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"
import { Navbar } from "@/components/lunna/navbar"
import { ErrorScreen, type ErrorKind } from "@/components/lunna/error-screen"

// A page crashed while rendering: show the error screen (with retry) instead of a blank page.
// API errors keep their HTTP status (lib/api ApiError), so 401/403/429/503 get their own text.
export default function PageError({ error, reset }: { error: Error & { digest?: string; status?: number }; reset: () => void }) {
  const locale = useLocale()
  useEffect(() => {
    console.error(error)
  }, [error])

  const status = String(error?.status || "")
  const kind: ErrorKind = (["401", "403", "429", "503"] as const).includes(status as any) ? (status as ErrorKind) : "500"
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ErrorScreen kind={kind} lang={locale === "en" ? "en" : "pt"} onRetry={reset} digest={error?.digest} />
    </div>
  )
}
