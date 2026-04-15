'use client';

import { useTranslations } from 'next-intl';
import { Shield, AlertTriangle, Ban, DollarSign, FileWarning, Users, MessageCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function GuidelinesPage() {
  const t = useTranslations('Guidelines');
  
  return (
    <div className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">Diretrizes</span>
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase italic tracking-tighter">
            {t('title')}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t('lastUpdated')}
          </p>
        </div>

        <div className="space-y-12">
          <Card className="glass-strong border-white/5 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-12 text-muted-foreground leading-relaxed">
              
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-foreground">
                  <Ban className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Restrições de Conteúdo</h2>
                </div>
                <p>Para manter um ambiente seguro para todos, as seguintes regras são aplicadas:</p>
                <div className="grid gap-4">
                  {[
                    "O uso de conteúdo NSFW (sexual, violento ou perturbador) é estritamente proibido.",
                    "A troca de moedas virtuais por bens reais ou serviços externos é proibida.",
                    "Discurso de ódio, assédio ou bullying contra outros usuários resultará em banimento imediato."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-red-500 font-bold">!</div>
                      <div>{text}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-foreground">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Integridade do Sistema</h2>
                </div>
                <p>Respeite as mecânicas do bot e a justiça entre os jogadores:</p>
                <ul className="space-y-4 pl-4">
                  {[
                    "Não tente abusar de bugs para ganhar moedas ou itens. Reporte-os à nossa equipe.",
                    "O uso de bots, scripts ou automações para 'farmar' no RPG é proibido.",
                    "A criação de múltiplas contas (alts) para burlar limites diários é passível de punição."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-foreground">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Atividades Comerciais</h2>
                </div>
                <p>
                  A Lunna não permite a venda de moedas virtuais por dinheiro real fora dos canais oficiais. Qualquer transação P2P envolvendo dinheiro real é de inteira responsabilidade dos usuários e pode resultar em suspensão se envolver fraude.
                </p>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-4 text-center py-8">
                <div className="flex justify-center mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground italic uppercase">Comunidade em Primeiro Lugar</h3>
                <p>Nosso objetivo é criar um ecossistema divertido e justo. Ao usar a Lunna, você concorda em respeitar estas regras e a plataforma Discord.</p>
                <div className="pt-6">
                   <a href="https://discord.gg/DaUhFcjJfH" target="_blank" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground glow-primary transition-all hover:scale-105">
                     Reportar Violação
                   </a>
                </div>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
