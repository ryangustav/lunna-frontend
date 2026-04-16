"use client"

import { Link } from "@/src/i18n/routing"
import { Shield, BookOpen, Bot } from "lucide-react"
import { useLocale } from "next-intl"

export function Footer() {
  const locale = useLocale()
  
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Lunna &copy; {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link 
            href="/privacy" 
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
            {locale === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
          </Link>
          
          <Link 
            href="/guidelines" 
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <BookOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
            {locale === 'pt' ? 'Diretrizes da Comunidade' : 'Community Guidelines'}
          </Link>

          <a 
            href="https://discord.gg/DaUhFcjJfH" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {locale === 'pt' ? 'Suporte' : 'Support'}
          </a>
        </div>
      </div>
    </footer>
  )
}
