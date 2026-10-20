import { notFound } from "next/navigation"

// Paths that match no page end here, so they get the [locale] 404 (with the site layout and language)
export default function CatchAll() {
  notFound()
}
