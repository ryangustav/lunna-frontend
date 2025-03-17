// components/Nav.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import '@/src/styles/Nav.css';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

const Nav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
          console.log(data.data.avatar)
          setUser(data.data);
        } else {
          console.log("User not authenticated");
          setUser(null);
        }
      } catch (error) {
        console.log("Error fetching user data", error);
        setUser(null);
      } finally {
        
      }
    };

    fetchUserData();
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/vip", label: "Vip" },
    { href: "/coins", label: "Coins" },
    { href: "/privacy", label: "Privacy" },
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
            Support
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
                Please log in
              </a>
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
              Please log in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;