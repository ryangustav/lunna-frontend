'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { Server, Settings, PlusCircle, Sparkles, LayoutDashboard, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  isBotIn: boolean;
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        setLoading(true);
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        
        if (!token) {
          window.location.href = '/';
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lunnabot.fun/v1';
        const response = await fetch(`${API_URL}/auth/guilds`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar servidores');
        }

        const result = await response.json();
        if (result.success) {
          setGuilds(result.data);
        }
      } catch (err) {
        console.error('Erro ao buscar servidores:', err);
        setError(t('noServers'));
      } finally {
        setLoading(false);
      }
    };

    fetchGuilds();
  }, [t]);

  return (
    <div className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] -z-10" />

      <div className="mx-auto max-w-7xl">
        <div className="space-y-4 mb-16 animate-in fade-in slide-in-from-left-10 duration-1000">
          <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[10px] font-bold">Dashboard</span>
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none uppercase italic">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {error && (
          <Card className="bg-red-500/5 border-red-500/20 mb-12">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <p className="text-red-400 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-[2rem] glass-strong" />
            ))
          ) : (
            <>
              {guilds.map((guild) => (
                <Card 
                  key={guild.id}
                  className="group relative overflow-hidden glass-strong border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(var(--primary),0.1)] p-6"
                >
                  <CardHeader className="flex flex-col items-center gap-4 pb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Avatar className="h-24 w-24 border-4 border-background group-hover:rotate-6 transition-transform">
                        <AvatarImage src={guild.icon || ''} alt={guild.name} />
                        <AvatarFallback className="bg-secondary">
                          <Server className="h-10 w-10 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl font-bold text-center group-hover:text-primary transition-colors line-clamp-1">
                      {guild.name}
                    </CardTitle>
                  </CardHeader>

                  <CardFooter className="pt-2">
                    {guild.isBotIn ? (
                      <Button asChild className="w-full h-12 rounded-xl glass hover:bg-primary transition-all gap-2 group/btn">
                        <Link href={`/dashboard/${guild.id}` as any}>
                          <Settings className="h-4 w-4 group-hover/btn:rotate-90 transition-transform duration-500" />
                          {t('manage')}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full h-12 rounded-xl bg-primary text-primary-foreground glow-primary transition-all gap-2">
                        <a 
                          href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PlusCircle className="h-4 w-4" />
                          {t('guest')}
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}

              {/* Add New Section */}
              <Card className="border-2 border-dashed border-white/5 bg-transparent p-10 flex flex-col items-center justify-center text-center space-y-4 opacity-50 hover:opacity-100 transition-all hover:bg-white/5 cursor-pointer rounded-[2rem]">
                <PlusCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary" />
                <div className="space-y-1">
                  <p className="font-bold">Add to server</p>
                  <p className="text-xs text-muted-foreground">Looking for another kingdom?</p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
