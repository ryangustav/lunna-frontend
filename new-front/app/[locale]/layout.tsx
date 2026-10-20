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
import { SITE_URL, DESCRIPTION, pageMetadata, siteJsonLd } from "@/lib/site"

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
  const title = en ? "Lunna — Discord bot with RPG, economy and moderation" : "Lunna — Bot de Discord com RPG, economia e moderação"
  return {
    ...pageMetadata({ locale, path: "/", title, description: DESCRIPTION[en ? "en" : "pt"] }),
    metadataBase: new URL(SITE_URL),
    // pages set their own title: "<page> · Lunna"
    title: { default: title, template: "%s · Lunna" },
    applicationName: "Lunna",
    authors: [{ name: "Lunna", url: SITE_URL }],
    creator: "Lunna",
    publisher: "Lunna",
    category: "technology",
    // Search Console / Bing Webmaster ownership (values from their "HTML tag" verification)
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
    },
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
        {/* who the official Lunna is, for search engines (schema.org) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd(locale === "en" ? "en" : "pt")).replace(/</g, "\\u003c") }} />
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
