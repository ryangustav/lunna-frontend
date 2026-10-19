import type { T } from "@/lib/use-t"
import { serverText } from "@/lib/server-text"

/** A status/error the bot saved in Portuguese (publish_error, post_error…), in the page's language. */
export function publishErrorText(text: string | null | undefined, t: T): string {
  return serverText(text, t("pt", "en"))
}
