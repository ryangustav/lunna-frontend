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
import { NoticeBanner } from "@/components/lunna/notice-banner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const en = locale === "en"
  return {
    title: en ? "Lunna — The heart your server needed" : "Lunna — O coração que seu servidor precisava",
    description: en
      ? "Discord bot with RPG, economy, AI moderation and a full dashboard for your community."
      : "Bot de Discord com RPG, economia, moderação com IA e dashboard completo para sua comunidade.",
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-icon.png",
    },
  }
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
              <NoticeBanner />
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
