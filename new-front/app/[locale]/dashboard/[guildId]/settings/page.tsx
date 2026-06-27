"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"

export default function SettingsRedirectPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/${guildId}/welcome`)
  }, [guildId, router])

  return null
}
