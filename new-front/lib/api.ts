export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1"

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" 
    ? document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1]
    : null

  const headers = new Headers(options.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  // Only when there is a body: Fastify rejects an empty body declared as JSON (e.g. DELETE)
  if (options.body !== undefined) headers.set("Content-Type", "application/json")

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
  getDailyStatus: () => apiFetch("/daily/status"),
  getCurrentUser: () => apiFetch("/auth/me"),
  collectDaily: (token: string) => apiFetch("/daily/collect", {
    method: "POST",
    body: JSON.stringify({ token })
  }),
  redeemCode: (code: string) => apiFetch("/code/redeem", {
    method: "POST",
    body: JSON.stringify({ code })
  }),
  getGuildSettings: (guildId: string) => apiFetch(`/guilds/${guildId}/settings`),
  updateGuildSettings: (guildId: string, data: any) => apiFetch(`/guilds/${guildId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }),
  getGuildChannels: (guildId: string) => apiFetch(`/guilds/${guildId}/channels`),
  getGuildRoles: (guildId: string) => apiFetch(`/guilds/${guildId}/roles`),
  getRolePanels: (guildId: string) => apiFetch(`/guilds/${guildId}/role-panels`),
  createRolePanel: (guildId: string, data: any) => apiFetch(`/guilds/${guildId}/role-panels`, { method: "POST", body: JSON.stringify(data) }),
  updateRolePanel: (guildId: string, id: string, data: any) => apiFetch(`/guilds/${guildId}/role-panels/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRolePanel: (guildId: string, id: string) => apiFetch(`/guilds/${guildId}/role-panels/${id}`, { method: "DELETE" }),
  getTickets: (guildId: string) => apiFetch(`/guilds/${guildId}/tickets`),
  updateTickets: (guildId: string, data: any) => apiFetch(`/guilds/${guildId}/tickets`, { method: "PUT", body: JSON.stringify(data) }),
}
