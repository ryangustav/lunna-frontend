'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { 
  Menu, X, Zap, LayoutDashboard, User as UserIcon, 
  Backpack, LogOut, Shield 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  avatar?: string;
  admin?: boolean;
}

export function Header() {
  const t = useTranslations('Header');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lunnabot.fun/v1';
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
          setIsAdmin(!!data.admin);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        setUser(null);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '#features', label: t('features') },
    { href: '/vip', label: t('vip') },
    { href: '/coins', label: t('coins') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary transition-transform group-hover:scale-110">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Lunna</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass mt-2" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.id}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="hover:bg-primary/20">
                  <Link href="/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-primary/20">
                  <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                    <UserIcon className="h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-primary/20">
                  <Link href="/inventory" className="flex items-center gap-2 w-full cursor-pointer">
                    <Backpack className="h-4 w-4" />
                    <span>Inventário</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="hover:bg-primary/20 text-amber-400">
                    <Link href="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">{t('dashboard')}</Link>
              </Button>
              <Button className="glow-primary" asChild>
                <a
                  href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=${encodeURIComponent('https://api.lunnabot.fun/v1/auth/discord/callback')}&scope=guilds+email+identify`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('addBot')}
                </a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass animate-slide-down">
          <div className="flex flex-col gap-4 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Idioma</span>
              <LanguageSwitcher />
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-4 border-b border-white/5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{user.username}</span>
                      <span className="text-xs text-muted-foreground">Logado</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full justify-start gap-2">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>{t('dashboard')}</Link>
                  </Button>
                  <Button className="w-full glow-primary" asChild>
                    <a
                      href={`https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=${encodeURIComponent('https://api.lunnabot.fun/v1/auth/discord/callback')}&scope=guilds+email+identify`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('addBot')}
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
