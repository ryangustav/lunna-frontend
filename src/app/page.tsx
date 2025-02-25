'use client';
import { useEffect } from 'react';
import Home from './home/home';

export default function HomePage() {
  useEffect(() => {

    const getTokenFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      return token;
    };

    const saveTokenAsCookie = (token?: string) => {
      if (token) {
    
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        
        document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
        
 
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        console.log('Token salvo como cookie com sucesso');
      }
    };

    const token = getTokenFromUrl();
    if (token) {
      saveTokenAsCookie(token);
    }
  }, []); 

  return <Home />;
}