"use client"

import "./globals.css"
import { useEffect, useState } from "react"
import { ErrorScreen, langFromPath } from "@/components/lunna/error-screen"

// 404 for paths outside /pt and /en (the middleware sends almost everything there; this is the fallback)
export default function RootNotFound() {
  const [lang, setLang] = useState<"pt" | "en">("pt")
  useEffect(() => setLang(langFromPath(window.location.pathname)), [])
  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col bg-[#0c0816] font-sans antialiased">
        <ErrorScreen kind="404" lang={lang} />
      </body>
    </html>
  )
}
