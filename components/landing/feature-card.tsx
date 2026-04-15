import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export function FeatureCard({ icon: Icon, title, description, gradient = 'from-primary to-primary/50' }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl glass p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] hover:glow-primary">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
      
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      
      {/* Content */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
