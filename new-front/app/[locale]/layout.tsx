import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import { routing } from "@/src/i18n/routing"
import { notFound } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/lunna/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Lunna — O coração que seu servidor precisava",
  description: "Bot de Discord com RPG, economia, moderação com IA e dashboard completo para sua comunidade.",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <div className="relative flex min-h-screen flex-col">
              {children}
              <Footer />
            </div>
            {process.env.NODE_ENV === "production" && <Analytics />}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
