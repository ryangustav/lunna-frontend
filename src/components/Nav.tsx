'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronUp, User as UserIcon, LayoutDashboard, Backpack, LogOut } from "lucide-react";
import '@/src/styles/Nav.css';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Translation {
  home: string;
  vip: string;
  coins: string;
  privacy: string;
  support: string;
  guidelines: string;
  pleaseLogIn: string;
}

const translations: Record<string, Translation> = {
  en: {
    home: "Home",
    vip: "Vip",
    coins: "Coins",
    privacy: "Privacy",
    support: "Support",
    guidelines: "Guidelines",
    pleaseLogIn: "Please log in",
  },
  pt: {
    home: "Início",
    vip: "Vip",
    coins: "Coins",
    privacy: "Privacidade",
    support: "Suporte",
    guidelines: "Regras",
    pleaseLogIn: "Fazer login",
  }
};

const Nav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
   
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

   
    const handleClickOutside = (event: MouseEvent) => {
      const languageSelector = document.querySelector('.language-selector');
      const userSelector = document.querySelector('.nav-user-container');
      
      if (languageSelector && !languageSelector.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      
      if (userSelector && !userSelector.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const fetchUserData = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (!token) {
        console.log("No token found");
        setUser(null);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
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

          if (data.admin) {
            navLinks.push({ href: "/admin", label: "Admin" });
          }
        } else {
          console.log("User not authenticated");
          setUser(null);
        }
      } catch (error) {
        console.log("Error fetching user data", error);
        setUser(null);
      }
    };

    fetchUserData();

    // Remove listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLanguageMenu(false);
  };

  const handleLogout = () => {
    // Limpar cookie de token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const navLinks = [
    { href: "/", label: translations[language].home },
    { href: "/vip", label: translations[language].vip },
    { href: "/coins", label: translations[language].coins },
    { href: "/privacy", label: translations[language].privacy },
    { href: "/guidelines", label: translations[language].guidelines },
  ];

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link href="/" className="nav-brand">
          Lunna
        </Link>

        <button 
          className="mobile-menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          <a
            href="https://discord.gg/DaUhFcjJfH"
            className="nav-link"
            onClick={() => setIsOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {translations[language].support}
          </a>

          <div className="mobile">
            {user ? (
              <>
                <img 
                  src={user.avatar}
                  alt={user.username} 
                  className="mobile-user-avatar"  
                />
                <span className="nav-link username">{user.username}</span>
              </>
            ) : (
              <a
                href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Fapi.lunnabot.fun%2Fv1%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                {translations[language].pleaseLogIn}
              </a>
            )}
          </div>

          <div className="language-selector">
            <button 
              className="language-button" 
              onClick={toggleLanguageMenu}
            >
              <Globe size={20} />
              <span>{language.toUpperCase()}</span>
              <ChevronUp 
                size={16} 
                className={`language-chevron ${showLanguageMenu ? 'open' : ''}`} 
              />
            </button>

            {showLanguageMenu && (
              <div className="language-menu">
                <button onClick={() => changeLanguage("en")}>English</button>
                <button onClick={() => changeLanguage("pt")}>Português</button>
              </div>
            )}
          </div>
          
        </div>

        <div className="nav-user">
          {user ? (
            <div className="nav-user-container relative">
              <button 
                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-all"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="username font-medium text-gray-200">{user.username}</span>
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="user-avatar w-10 h-10 rounded-full border-2 border-purple-500/50"  
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-brand-card/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-3 w-full p-3 text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 w-full p-3 text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon size={18} />
                    <span className="font-medium">Perfil</span>
                  </Link>
                  <Link 
                    href="/inventory" 
                    className="flex items-center gap-3 w-full p-3 text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Backpack size={18} />
                    <span className="font-medium">Inventário</span>
                  </Link>
                  <div className="h-px bg-white/5 my-2 mx-1" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-left"
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Fapi.lunnabot.fun%2Fv1%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              {translations[language].pleaseLogIn}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;