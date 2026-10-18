export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.lunnabot.fun/v1"

/** Error from the Lunna API, with the HTTP status (401 = not logged in / session expired). */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = "ApiError"
  }
}

export const UNAUTHORIZED_MESSAGE = "Você não está conectado. Entre com sua conta do Discord para continuar."

export const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401

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
    const body = await response.json().catch(() => ({}))
    if (response.status === 401) {
      // expired/invalid session: drop the token so the site shows the logged-out state
      if (typeof window !== "undefined") document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      throw new ApiError(UNAUTHORIZED_MESSAGE, 401)
    }
    // 403 bodies are technical English ("Forbidden - No manage guild permission")
    if (response.status === 403) throw new ApiError(body.message || "Você não tem permissão para fazer isso.", 403)
    // the backend answers { message } or { error } (validation errors are written for the user)
    throw new ApiError(body.message || body.error || "Falha na requisição", response.status)
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
  // Public notices (banner + /avisos/<slug>)
  getPublicNotices: () => apiFetch("/public/notices"),
  getPublicNotice: (slug: string) => apiFetch(`/public/notices/${encodeURIComponent(slug)}`),
  // Admin panel (the backend checks ADMIN_USER_IDS on every call)
  getAdminMe: () => apiFetch("/admin/me"),
  getAdminOverview: () => apiFetch("/admin/overview"),
  getAdminCampaigns: () => apiFetch("/admin/campaigns"),
  getAdminCampaign: (id: string) => apiFetch(`/admin/campaigns/${id}`),
  createAdminCampaign: (data: any) => apiFetch("/admin/campaigns", { method: "POST", body: JSON.stringify(data) }),
  getAdminCodes: () => apiFetch("/admin/codes"),
  createAdminCodes: (data: { type: "coins" | "vip"; value?: number; period?: string; quantity: number }) =>
    apiFetch("/admin/codes", { method: "POST", body: JSON.stringify(data) }),
  adminCampaignAction: (id: string, action: "preview" | "sample" | "send" | "pause") => apiFetch(`/admin/campaigns/${id}/${action}`, { method: "POST", body: "{}" }),
  getAdminNotices: () => apiFetch("/admin/notices"),
  createAdminNotice: (data: any) => apiFetch("/admin/notices", { method: "POST", body: JSON.stringify(data) }),
  updateAdminNotice: (id: string, data: any) => apiFetch(`/admin/notices/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  endAdminNotice: (id: string) => apiFetch(`/admin/notices/${id}/end`, { method: "POST", body: "{}" }),
  getBotConfig: () => apiFetch("/admin/bot-config"),
  updateBotConfig: (data: any) => apiFetch("/admin/bot-config", { method: "PUT", body: JSON.stringify(data) }),
  getAdminAudit: () => apiFetch("/admin/audit"),
  getAdminUser: (id: string) => apiFetch(`/admin/users/${encodeURIComponent(id)}`),
  adminUserAction: (id: string, action: "ban" | "unban" | "flag" | "unflag", reason: string) =>
    apiFetch(`/admin/users/${encodeURIComponent(id)}/action`, { method: "POST", body: JSON.stringify({ action, reason }) }),
  getAgent: (guildId: string) => apiFetch(`/guilds/${guildId}/ai-agent`),
  updateAutomation: (guildId: string, id: string, enabled: boolean) => apiFetch(`/guilds/${guildId}/automations/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  deleteAutomation: (guildId: string, id: string) => apiFetch(`/guilds/${guildId}/automations/${id}`, { method: "DELETE" }),
  getTickets: (guildId: string) => apiFetch(`/guilds/${guildId}/tickets`),
  updateTickets: (guildId: string, data: any) => apiFetch(`/guilds/${guildId}/tickets`, { method: "PUT", body: JSON.stringify(data) }),
}
