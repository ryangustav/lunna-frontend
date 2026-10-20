import type { Metadata } from "next"

/**
 * Lunna's official identity for search engines and AI crawlers: one place for the site URL, the
 * official links and the per-page metadata (canonical URL, PT/EN alternates, Open Graph, Twitter).
 * Pages in Portuguese live at /path, English at /en/path (next-intl "as-needed").
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://lunnabot.fun").replace(/\/$/, "")
export const BOT_ID = "1222333304028659792"
export const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_ID}&permissions=8&scope=bot%20applications.commands`
export const SUPPORT_URL = "https://discord.gg/DaUhFcjJfH"
export const TOPGG_URL = `https://top.gg/bot/${BOT_ID}`
export const APP_DIRECTORY_URL = `https://discord.com/application-directory/${BOT_ID}`
export const API_PUBLIC = (process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1").replace(/\/$/, "")

/** Every official profile of the bot (schema.org sameAs). Extra ones can come from the env. */
export const OFFICIAL_LINKS = [
  TOPGG_URL,
  SUPPORT_URL,
  // e.g. the Discord App Directory page, X/Instagram/YouTube profiles (comma-separated)
  ...String(process.env.NEXT_PUBLIC_SOCIAL_LINKS || "").split(",").map((s) => s.trim()).filter(Boolean),
]

export type Locale = "pt" | "en"

/** Absolute URL of a page in a language ("/commands" → /commands or /en/commands). */
export const pageUrl = (locale: Locale, path = "/") => {
  const p = path === "/" ? "" : path
  return `${SITE_URL}${locale === "en" ? "/en" : ""}${p}` || SITE_URL
}

export const KEYWORDS: Record<Locale, string[]> = {
  pt: [
    "Lunna", "Lunna bot", "Lunna Discord", "bot Lunna", "lunnabot", "Lunna bot Discord oficial",
    "bot de Discord", "bot para Discord", "bot brasileiro de Discord", "bot de Discord em português",
    "bot de RPG Discord", "RPG no Discord", "bot de economia Discord", "bot de moderação Discord",
    "bot de níveis Discord", "bot de XP Discord", "bot de tickets Discord", "bot de sorteios Discord",
    "bot de boas-vindas Discord", "autorole Discord", "cargos por botão", "anti-spam Discord", "anti-raid",
    "alertas YouTube Twitch Discord", "bot com IA Discord", "bot de minigames Discord", "daily Discord",
    "comandos da Lunna", "dashboard bot Discord",
  ],
  en: [
    "Lunna", "Lunna bot", "Lunna Discord bot", "lunnabot", "official Lunna bot",
    "Discord bot", "Discord RPG bot", "Discord economy bot", "Discord moderation bot", "Discord leveling bot",
    "Discord XP bot", "Discord ticket bot", "Discord giveaway bot", "Discord welcome bot", "Discord autorole",
    "Discord reaction roles", "button roles", "anti-spam Discord", "anti-raid bot", "YouTube Twitch alerts Discord",
    "AI Discord bot", "Discord minigames bot", "Lunna commands", "Discord bot dashboard",
  ],
}

export const DESCRIPTION: Record<Locale, string> = {
  pt: "Lunna é o bot de Discord brasileiro com RPG, economia, moderação com IA, níveis, tickets, sorteios, alertas do YouTube e Twitch e um dashboard completo. Adicione a Lunna oficial ao seu servidor.",
  en: "Lunna is a Discord bot with an RPG, economy, AI moderation, levels, tickets, giveaways, YouTube and Twitch alerts and a full dashboard. Add the official Lunna to your server.",
}

/**
 * Metadata for a public page: title, description, canonical, the other language, social previews.
 * `index: false` for private areas (dashboard, admin, checkout).
 */
export function pageMetadata(opts: { locale: string; path: string; title: string; description: string; index?: boolean; keywords?: string[] }): Metadata {
  const locale: Locale = opts.locale === "en" ? "en" : "pt"
  const url = pageUrl(locale, opts.path)
  return {
    // titles already carry the brand ("… — Lunna")
    title: { absolute: opts.title },
    description: opts.description,
    keywords: [...(opts.keywords || []), ...KEYWORDS[locale]],
    alternates: {
      canonical: url,
      languages: { "pt-BR": pageUrl("pt", opts.path), en: pageUrl("en", opts.path), "x-default": pageUrl("pt", opts.path) },
    },
    openGraph: {
      type: "website",
      siteName: "Lunna",
      url,
      title: opts.title,
      description: opts.description,
      locale: locale === "en" ? "en_US" : "pt_BR",
      alternateLocale: locale === "en" ? ["pt_BR"] : ["en_US"],
      images: [{ url: `${SITE_URL}/lunna-banner.jpg`, alt: "Lunna — Discord bot" }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [`${SITE_URL}/lunna-banner.jpg`] },
    robots: opts.index === false ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  }
}

/** schema.org data that tells search engines which site is the official Lunna and what she is. */
export function siteJsonLd(locale: Locale) {
  const en = locale === "en"
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Lunna",
      alternateName: ["Lunna Bot", "Lunna Discord Bot", "lunnabot", "Lunna bot oficial"],
      inLanguage: ["pt-BR", "en"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Lunna",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: OFFICIAL_LINKS,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#bot`,
      name: "Lunna",
      alternateName: ["Lunna Bot", "Lunna Discord Bot"],
      url: SITE_URL,
      image: `${SITE_URL}/lunna-banner.jpg`,
      applicationCategory: "CommunicationApplication",
      applicationSubCategory: en ? "Discord bot" : "Bot de Discord",
      operatingSystem: "Discord",
      description: DESCRIPTION[locale],
      inLanguage: ["pt-BR", "en"],
      installUrl: INVITE_URL,
      identifier: BOT_ID,
      featureList: en
        ? ["RPG with dungeons, PvP, guilds and market", "Economy with daily rewards and minigames", "AI moderation, anti-spam and anti-raid", "Levels and XP with role rewards", "Tickets", "Giveaways", "Button roles", "YouTube, Twitch and RSS alerts", "Welcome messages and banners", "Web dashboard"]
        : ["RPG com masmorras, PvP, guildas e mercado", "Economia com daily e minigames", "Moderação com IA, anti-spam e anti-raid", "Níveis e XP com cargos por nível", "Tickets", "Sorteios", "Cargos por botão", "Alertas do YouTube, Twitch e RSS", "Boas-vindas com banner", "Dashboard web"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      publisher: { "@id": `${SITE_URL}/#organization` },
      sameAs: OFFICIAL_LINKS,
    },
  ]
}
