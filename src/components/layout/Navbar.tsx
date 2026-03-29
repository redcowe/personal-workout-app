import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, ClipboardList, History, TrendingUp, BookOpen, LogOut } from 'lucide-react';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { logout } from '../../lib/firebase';

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
  const { active } = useActiveWorkoutStore();

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
            const active2 = pathname === to || (to !== '/' && pathname.startsWith(to));
            const hasActiveWorkout = active && to === '/log';
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active2
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {hasActiveWorkout && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
        <ul className="flex justify-around">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active2 = pathname === to || (to !== '/' && pathname.startsWith(to));
            const hasActiveWorkout = active && to === '/log';
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 transition-colors ${
                    active2 ? 'text-violet-400' : 'text-slate-500'
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {hasActiveWorkout && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => logout()}
              className="flex flex-col items-center gap-0.5 px-1 py-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-[10px] leading-none">Sign out</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
