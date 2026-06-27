"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, Key, Shield, ChevronLeft, ToggleLeft, ToggleRight, Check } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Role {
  id: string
  name: string
  color: number
}

interface RolePermDetails {
  allow_invites: boolean
  allow_commands: boolean
  allow_commands_any_channel: boolean
}

export default function PermissionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>
}) {
  const { guildId } = use(params)
  const { toast } = useToast()

  // Loading / Saving states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discord lists
  const [roles, setRoles] = useState<Role[]>([])

  // Permissions state
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermDetails>>({})
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [settingsRes, rolesRes] = await Promise.all([
          api.getGuildSettings(guildId),
          api.getGuildRoles(guildId)
        ])

        if (settingsRes) {
          setRolePermissions(settingsRes.role_permissions || {})
        }

        if (rolesRes.success) {
          // Filter out @everyone role or sort
          setRoles(rolesRes.data || [])
        }

      } catch (err: any) {
        console.error("Failed to load permission settings:", err)
        setError(err.message || "Não foi possível carregar as configurações do servidor.")
        toast({
          title: "Erro ao carregar dados",
          description: err.message || "Por favor, verifique se o bot está no servidor.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [guildId])

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        role_permissions: rolePermissions
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Sucesso!",
        description: "Permissões de cargos salvas com sucesso.",
      })
    } catch (err: any) {
      console.error("Failed to save permissions:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Get current permissions for a role, with default fallbacks
  const getRolePerms = (roleId: string): RolePermDetails => {
    const defaultPerms = {
      allow_invites: false, // by default invites are blocked if anti-invite is enabled
      allow_commands: true, // by default everyone can use commands
      allow_commands_any_channel: false // by default commands must respect ignored channels
    }
    return rolePermissions[roleId] || defaultPerms
  }

  // Update a single permission value for a role
  const updateRolePerm = (roleId: string, key: keyof RolePermDetails, value: boolean) => {
    const current = getRolePerms(roleId)
    setRolePermissions({
      ...rolePermissions,
      [roleId]: {
        ...current,
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/40" />
        </div>
        <div className="h-48 w-full rounded-3xl bg-muted/20 border border-border/50" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Falha de Comunicação</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const selectedRole = roles.find(r => r.id === selectedRoleId)
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
            <Key className="mr-3 h-8 w-8 text-primary" />
            Permissões de Cargos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Defina permissões personalizadas para o bot de todos os cargos do seu servidor.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {!selectedRoleId ? (
          /* Role Selector List */
          <div className="rounded-[2.0rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-colors" />

            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground">Lista de Cargos</h2>
              <p className="text-sm text-muted-foreground">
                Selecione um cargo para configurar as permissões especiais no bot.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <input
                type="text"
                placeholder="Pesquisar cargos do servidor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-semibold outline-none transition focus:border-primary/50"
              />

              <div className="rounded-2xl border border-border bg-secondary/15 p-4 max-h-80 overflow-y-auto space-y-2">
                {filteredRoles.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum cargo encontrado.</p>
                ) : (
                  filteredRoles.map((role) => {
                    const customPerms = rolePermissions[role.id];
                    const hasOverrides = customPerms && (
                      customPerms.allow_invites === true || 
                      customPerms.allow_commands === false || 
                      customPerms.allow_commands_any_channel === true
                    );
                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="text-sm font-bold text-foreground">{role.name}</span>
                        </div>
                        {hasOverrides && (
                          <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary flex items-center gap-1">
                            <Check className="h-3 w-3" /> Customizado
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Role Permission Configuration Details */
          <div className="rounded-[2.0rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group animate-in fade-in duration-300">
            <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors" />

            <div>
              <button
                type="button"
                onClick={() => setSelectedRoleId(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/40 text-xs font-bold text-foreground hover:bg-secondary/70 transition mb-6"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Voltar para a lista de cargos
              </button>

              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-black text-foreground">{selectedRole?.name}</h2>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl pt-4 border-t border-border/50">
              
              {/* Toggle 1: Permitir enviar convites */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/10">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Permitir enviar convites</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getRolePerms(selectedRoleId).allow_invites}
                    onChange={(e) => updateRolePerm(selectedRoleId, "allow_invites", e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                  />
                </div>
              </div>

              {/* Toggle 2: Permitir usar comandos */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/10">
                <div className="space-y-1 pr-4">
                  <span className="text-sm font-bold text-foreground">Permitir usar comandos</span>
                  <p className="text-xs text-muted-foreground">
                    Caso esteja ativado, eu irei processar comandos enviados por este usuário.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getRolePerms(selectedRoleId).allow_commands}
                    onChange={(e) => updateRolePerm(selectedRoleId, "allow_commands", e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                  />
                </div>
              </div>

              {/* Toggle 3: Permitir usar comandos em qualquer canal */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/10">
                <div className="space-y-1 pr-4">
                  <span className="text-sm font-bold text-foreground">Permitir usar comandos em qualquer canal</span>
                  <p className="text-xs text-muted-foreground">
                    Caso esteja ativado, eu irei permitir usar comandos em canais que foram adicionados para eu ignorar.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getRolePerms(selectedRoleId).allow_commands_any_channel}
                    onChange={(e) => updateRolePerm(selectedRoleId, "allow_commands_any_channel", e.target.checked)}
                    className="h-6 w-11 rounded-full appearance-none bg-muted checked:bg-primary transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-background before:top-1 before:left-1 checked:before:translate-x-5 before:transition-all"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </form>
  )
}
