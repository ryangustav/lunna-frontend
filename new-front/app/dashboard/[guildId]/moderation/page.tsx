import React from "react"
import { ShieldAlert, ShieldCheck, Zap } from "lucide-react"

export default function ModerationPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <div>
        <h1 className="flex items-center text-3xl font-black tracking-tight text-foreground">
          <ShieldAlert className="mr-3 h-8 w-8 text-red-500" />
          Moderação & Anti-Raid
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure defesas agressivas para proteger o seu reino de invasores e links maliciosos.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              Filtro de Links <Zap className="ml-2 h-4 w-4 text-yellow-500" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              Deleta automaticamente mensagens que contenham links HTTP/HTTPS de domínios perigosos enviados por usuários sem cargos altos.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center justify-center rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-muted-foreground transition cursor-not-allowed">
              Sem Endpoints Conectados
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              Defesa Anti-Raid <ShieldCheck className="ml-2 h-4 w-4 text-green-500" />
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              Entra em modo de defesa total: silencia bots recém-adicionados e trava novos membros com verificação extra por CAPTCHA da Lunna.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center justify-center rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-muted-foreground transition cursor-not-allowed">
              Em breve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
