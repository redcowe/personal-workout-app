import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, ClipboardList, History, TrendingUp, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exercises', label: 'Exercises', icon: BookOpen },
  { to: '/templates', label: 'Templates', icon: ClipboardList },
  { to: '/log', label: 'Log Workout', icon: Dumbbell },
  { to: '/history', label: 'History', icon: History },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-slate-900 border-r border-slate-700 fixed left-0 top-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
          <Dumbbell className="text-violet-400" size={24} />
          <span className="font-bold text-white text-lg">WorkoutLog</span>
        </div>
        <ul className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
        <ul className="flex justify-around">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs transition-colors ${
                    active ? 'text-violet-400' : 'text-slate-500'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
