"use client"

import "./globals.css"
import { useEffect, useState } from "react"
import { ErrorScreen, langFromPath } from "@/components/lunna/error-screen"

// Last resort: the root layout itself failed, so this renders its own <html>
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState<"pt" | "en">("pt")
  useEffect(() => {
    setLang(langFromPath(window.location.pathname))
    console.error(error)
  }, [error])
  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col bg-[#0c0816] font-sans antialiased">
        <ErrorScreen kind="500" lang={lang} onRetry={reset} digest={error?.digest} />
      </body>
    </html>
  )
}
