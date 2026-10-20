"use client"

import { useLocale } from "next-intl"
import { Navbar } from "@/components/lunna/navbar"
import { ErrorScreen } from "@/components/lunna/error-screen"

// Any unknown page (and every notFound() call) inside /pt or /en
export default function NotFound() {
  const locale = useLocale()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ErrorScreen kind="404" lang={locale === "en" ? "en" : "pt"} />
    </div>
  )
}
