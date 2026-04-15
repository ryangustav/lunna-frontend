'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, Eye, Database, Clock, UserCheck, HelpCircle, Coins, Scale, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');
  
  // NOTE: In a real app, these sections should be in messages/*.json
  // For this migration, I will preserve the content structure but adapt to the new theme.
  
  return (
    <div className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
          <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary gap-2">
            <Shield className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">Legal</span>
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
              
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-foreground mb-6">
                  <Database className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Informações que Coletamos</h2>
                </div>
                <p>Coletamos as seguintes informações quando você usa a Lunna:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                  {[
                    "ID e Nome de Usuário do Discord",
                    "Email e Avatar",
                    "Endereço IP",
                    "Servidores que você gerencia",
                    "Mensagens e Mídia enviadas ao bot",
                    "Informações de Transação"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-foreground mb-6">
                  <Eye className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Como Usamos</h2>
                </div>
                <p>Usamos as informações coletadas para:</p>
                <div className="grid gap-4">
                   {[
                     "Fornecer e manter as funcionalidades de economia e RPG.",
                     "Processar transações e garantir a entrega de itens VIP.",
                     "Melhorar a experiência do usuário e corrigir bugs.",
                     "Garantir a segurança contra abusos e cheats."
                   ].map((text, i) => (
                     <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-primary font-bold">0{i+1}</div>
                        <div>{text}</div>
                     </div>
                   ))}
                </div>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-foreground mb-6">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold italic uppercase tracking-tight">Proteção de Dados</h2>
                </div>
                <p>
                  A segurança dos seus dados é nossa prioridade. Todos os dados são armazenados de forma segura e o acesso é restrito apenas à equipe administrativa da Lunna. Nós **nunca** vendemos ou compartilhamos seus dados com terceiros para fins de marketing.
                </p>
              </section>

              <div className="h-px bg-white/5" />

              <section className="space-y-4 text-center py-8">
                <h3 className="text-xl font-bold text-foreground italic uppercase">Dúvidas?</h3>
                <p>Se você tiver qualquer dúvida sobre nossa política, entre em contato através do nosso servidor oficial.</p>
                <div className="pt-4">
                   <a href="https://discord.gg/DaUhFcjJfH" target="_blank" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground glow-primary transition-all hover:scale-105">
                     Servidor de Suporte
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
