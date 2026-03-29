interface BadgeProps {
  children: React.ReactNode;
  color?: 'violet' | 'green' | 'blue' | 'amber' | 'slate';
}

const colorClasses = {
  violet: 'bg-violet-900 text-violet-300 border border-violet-700',
  green: 'bg-green-900 text-green-300 border border-green-700',
  blue: 'bg-blue-900 text-blue-300 border border-blue-700',
  amber: 'bg-amber-900 text-amber-300 border border-amber-700',
  slate: 'bg-slate-700 text-slate-300 border border-slate-600',
};

export function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
}
