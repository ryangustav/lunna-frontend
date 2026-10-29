"use client"

import { ArrowLeft, Coins, FlaskConical, Sparkles, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/src/i18n/routing"
import { Navbar } from "@/components/lunna/navbar"
import { useT } from "@/lib/use-t"
import LabEditor from "@/components/alchemy/lab-editor"

export default function AlchemyPage() {
  const L = useT()
  const steps = [
    { icon: FlaskConical, title: L("Prepare", "Brew"), text: L("No /alquimia, misture colheitas do jardim para descobrir receitas e deixe os caldeirões trabalharem.", "In /alquimia, mix garden harvests to discover recipes and let the cauldrons work.") },
    { icon: Sparkles, title: L("Decore", "Decorate"), text: L("Aqui você compra móveis e escolhe onde ficam. Alambiques aceleram, livros dão XP, balanças rendem poções extras.", "Here you buy furniture and choose where it goes. Alembics speed up, books give XP, scales yield extra potions.") },
    { icon: Coins, title: L("Venda", "Sell"), text: L("A Madame Verbena compra suas poções todo dia; na Feira, outros jogadores pagam mais para usar no RPG.", "Madame Verbena buys your potions every day; on the Fair, other players pay more to use them in the RPG.") },
  ]
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-[-15%] top-[-20%] h-[600px] w-[600px] rounded-full bg-[#7c3aed]/10 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-15%] h-[600px] w-[600px] rounded-full bg-[#f59e0b]/5 blur-[160px]" />
      <Navbar />

      <main className="z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Link href="/" className="group flex w-fit items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {L("Voltar ao início", "Back home")}
          </Link>
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            <Store className="mr-2 h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{L("RPG · Alquimia", "RPG · Alchemy")}</span>
          </Badge>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">
            {L("Seu porão de", "Your")} <span className="text-primary">{L("alquimia", "alchemy cellar")}</span>
          </h1>
          <p className="max-w-2xl font-medium text-muted-foreground">
            {L("Arraste os móveis pelo porão, empilhe frascos nas mesas e pendure prateleiras. O que está no laboratório dá bônus às suas poções.", "Drag furniture around the cellar, stack jars on tables and hang shelves. What's in the lab gives bonuses to your potions.")}
          </p>
        </div>

        <LabEditor />

        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-purple-500/15 bg-card/50 p-4">
              <s.icon className="h-5 w-5 text-purple-400" />
              <div className="mt-2 text-sm font-black uppercase tracking-wide">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
