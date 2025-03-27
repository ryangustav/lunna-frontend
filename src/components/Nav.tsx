'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronUp } from "lucide-react";
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

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Function to close language menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const languageSelector = document.querySelector('.language-selector');
      if (languageSelector && !languageSelector.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    // Add global click listener
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
        const response = await fetch("https://lunna-api.discloud.app/auth/me", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
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
                href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Flunna-api.discloud.app%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"
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
            <>
              <span className="nav-link username">{user.username}</span>
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="user-avatar"  
              />
            </>
          ) : (
            <a
              href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&response_type=code&redirect_uri=https%3A%2F%2Flunna-api.discloud.app%2Fauth%2Fdiscord%2Fcallback&scope=guilds+email+identify"
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