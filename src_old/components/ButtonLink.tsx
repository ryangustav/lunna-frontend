'use client';
import { FC } from 'react';

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
}

const ButtonLink: FC<ButtonLinkProps> = ({ href, children }) => {
  const handleClick = () => window.open(href, '_blank');
  
  return (
    <button className="button-secondary" onClick={handleClick}>
      {children}
    </button>
  );
};

export default ButtonLink;