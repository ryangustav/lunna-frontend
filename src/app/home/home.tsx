'use client';

import { Coins, Brain, Dices } from 'lucide-react';
import ButtonLink from '@/src/components/ButtonLink';
import FeatureCard from '@/src/components/FeaturedCard';
import '@/src/styles/globals.css'

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Lunna Discord Bot</h1>
          <p className="hero-description">
            Enhance your Discord server with powerful multipourpouse bot.
          </p>
          <div className="button-group">
            <ButtonLink 
              href="https://discord.com/oauth2/authorize?client_id=1222333304028659792&scope=bot&permissions=1099511627775"
            >
              Add to Discord
            </ButtonLink>
            <ButtonLink 
              href="https://top.gg/bot/1222333304028659792"
            >
              Vote
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="features-title">Key Features</h2>
          <div className="features-grid">
            <FeatureCard
              icon={<Coins size={32} />}
              title="Economy"
              description="Rich and easy to play economy."
            />
            <FeatureCard
              icon={<Brain size={32} />}
              title="Artificial intelligence"
              description="Fast and easy to use artificial intelligence"
            />
            <FeatureCard
              icon={<Dices size={32} />}
              title="Casino"
              description="Multiple commands to create a super easy to play casino with the ability to play against your friends."
            />
          </div>
        </div>
      </section>
    </main>
  );
}
