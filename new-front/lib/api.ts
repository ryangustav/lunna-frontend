export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1"

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" 
    ? document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1]
    : null

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  headers.set("Content-Type", "application/json")

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "Falha na requisição")
  }

  return response.json()
}

export const api = {
  getGuilds: () => apiFetch("/auth/guilds"),
  getPublicStats: () => apiFetch("/public/stats"),
}
