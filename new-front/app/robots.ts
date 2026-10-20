import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// Public pages are open to every crawler, AI crawlers included (they are how assistants learn which
// Lunna is the official one). Private areas stay out of the index.
export default function robots(): MetadataRoute.Robots {
  const privateAreas = ["/dashboard", "/en/dashboard", "/admin", "/en/admin", "/checkout", "/en/checkout", "/api/"]
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: privateAreas }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
