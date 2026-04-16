import React from "react"
import { Globe, Settings, BellRing } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div>
        <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
          <Settings className="mr-3 h-8 w-8 text-primary" />
          Preferências Locais
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ajustes gerais do bot focados unicamente nas nuances deste seu servidor.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              Idioma Primário <Globe className="ml-2 h-4 w-4 text-purple-400" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              Qual idioma a Lunna deve utilizar por padrão ao responder os seus membros.
            </p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <input 
              type="text" 
              disabled 
              placeholder="Português do Brasil"
              className="w-full md:w-56 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" 
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              Canal de Notificações <BellRing className="ml-2 h-4 w-4 text-blue-400" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              Canal central que o bot irá mandar os avisos gerais caso precise de suporte humano, como punições pendentes.
            </p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <select 
              disabled 
              className="w-full md:w-56 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
            >
              <option>Selecione um canal...</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
