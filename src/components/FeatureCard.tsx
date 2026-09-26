import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, className = '', action, onAction, children }) => {
  return (
    <article className={`group relative flex flex-col rounded-2xl border border-[#2b2e2c] bg-[#1d1f1e] p-7 transition-all duration-200 hover:border-[#3a3f3b] hover:bg-[#202321] ${className}`}>
      <div className="mb-7 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2b2e2c] text-[#3ecf8e]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-medium tracking-tight text-[#f1f3f2]">{title}</h3>
      <p className="max-w-md text-sm leading-6 text-[#9a9e9b]">{description}</p>
      {children}
      {action && onAction && <button onClick={onAction} className="mt-auto inline-flex items-center gap-1.5 self-start pt-7 text-sm font-medium text-[#f1f3f2] transition-colors hover:text-[#3ecf8e]">{action}<ArrowUpRight className="h-4 w-4" /></button>}
    </article>
  );
};
