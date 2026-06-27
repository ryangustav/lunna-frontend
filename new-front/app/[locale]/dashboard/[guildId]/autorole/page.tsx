"use client"

import React, { use, useEffect, useState } from "react"
import { Save, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Role {
  id: string
  name: string
  color: number
}

export default function AutorolePage({
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

  // Autorole state
  const [autoroleRole, setAutoroleRole] = useState<string>("")

  // Fetch all required data on load
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
          setAutoroleRole(settingsRes.autorole_role || "")
        }

        if (rolesRes.success) setRoles(rolesRes.data)

      } catch (err: any) {
        console.error("Failed to load autorole settings:", err)
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
        autorole_role: autoroleRole || null
      }

      await api.updateGuildSettings(guildId, payload)

      toast({
        title: "Sucesso!",
        description: "Cargo de autorole salvo e aplicado com sucesso.",
      })
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
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

  return (
    <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
            <UserCheck className="mr-3 h-8 w-8 text-primary" />
            Cargo de Entrada (Autorole)
          </h1>
          <p className="mt-2 text-muted-foreground">
            Define o cargo automático que será atribuído aos membros que entrarem no seu servidor.
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
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              Atribuir Cargo Automaticamente
            </h2>
            <p className="text-sm text-muted-foreground">
              A Lunna concederá esse cargo instantaneamente a qualquer novo usuário que ingressar no servidor.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <label className="text-sm font-bold text-foreground">Cargo Autorole</label>
            <select
              value={autoroleRole}
              onChange={(e) => setAutoroleRole(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-secondary/30 px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary/50"
            >
              <option value="" className="bg-card text-muted-foreground">Desativado (Nenhum cargo atribuído)</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id} className="bg-card text-foreground">
                  {role.name}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 rounded-xl bg-secondary/20 p-4 border border-border/50 mt-2">
              <ShieldCheck className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Certifique-se de posicionar o cargo da <strong>Lunna</strong> acima do cargo selecionado nas configurações de cargos do Discord, caso contrário, o bot não terá permissão hierárquica suficiente para atribuí-lo aos membros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
