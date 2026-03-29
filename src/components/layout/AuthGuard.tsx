import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, isSessionExpired, logout } from '../../lib/firebase';
import { Login } from '../../pages/Login';

export function AuthGuard({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  // Skip auth entirely in local dev
  if (import.meta.env.DEV) return <>{children}</>;

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (u && isSessionExpired()) {
        await logout();
        setUser(null);
      } else {
        setUser(u);
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  return <>{children}</>;
}
