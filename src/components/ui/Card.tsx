import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
