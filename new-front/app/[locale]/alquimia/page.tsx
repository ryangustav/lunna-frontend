"use client"

import { Coins, FlaskConical, Sofa } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/lunna/navbar"
import { useT } from "@/lib/use-t"
import LabEditor from "@/components/alchemy/lab-editor"

export default function AlchemyPage() {
  const L = useT()
  const steps = [
    { icon: FlaskConical, title: L("Prepare", "Brew"), text: L("No /alquimia, misture colheitas do jardim para descobrir receitas e deixe os caldeirões trabalharem.", "In /alquimia, mix garden harvests to discover recipes and let the cauldrons work.") },
    { icon: Sofa, title: L("Decore", "Decorate"), text: L("Aqui você compra móveis e escolhe onde ficam. Alambiques aceleram, livros dão XP e balanças rendem poções extras.", "Here you buy furniture and choose where it goes. Alembics speed up, books give XP and scales yield extra potions.") },
    { icon: Coins, title: L("Venda", "Sell"), text: L("A Madame Verbena compra suas poções todo dia. Na feira, outros jogadores pagam mais para usá-las no RPG.", "Madame Verbena buys your potions every day. On the fair, other players pay more to use them in the RPG.") },
  ]
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <header className="space-y-4 text-center">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-4 py-1.5 text-primary">
              <FlaskConical className="mr-2 h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{L("RPG · Alquimia", "RPG · Alchemy")}</span>
            </Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{L("Laboratório de alquimia", "Alchemy lab")}</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {L("Arrume seu porão: arraste os móveis, coloque frascos nas mesas e pendure prateleiras. O que está no laboratório dá bônus às suas poções.", "Arrange your cellar: drag furniture around, put jars on tables and hang shelves. What's in the lab gives bonuses to your potions.")}
            </p>
          </header>

          <LabEditor />

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <section key={s.title} className="rounded-[14px] border border-border bg-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-secondary text-foreground">
                  <s.icon className="h-[18px] w-[18px]" />
                </div>
                <h2 className="mt-4 text-[15px] font-semibold text-foreground">{s.title}</h2>
                <p className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">{s.text}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
