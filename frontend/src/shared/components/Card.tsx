import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-slate-800 bg-slate-900',
        paddingClasses[padding],
        hover && 'transition-colors hover:border-slate-700',
        className
      )}
    >
      {children}
    </div>
  );
}
