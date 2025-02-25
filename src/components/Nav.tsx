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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Pegar o token do cookie ao invés do localStorage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (!token) {
        console.log("No token found");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/auth/me", {
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
        setLoading(false);
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
                href="https://discord.com/oauth2/authorize?client_id=1240128600439521292&response_type=code&redirect_uri=http%3A%2F%2F%5B%3A%3A1%5D%3A8080%2Fauth%2Fdiscord%2Fcallback&scope=identify+email"
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
              href="https://discord.com/oauth2/authorize?client_id=1240128600439521292&response_type=code&redirect_uri=http%3A%2F%2F%5B%3A%3A1%5D%3A8080%2Fauth%2Fdiscord%2Fcallback&scope=identify+email"
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