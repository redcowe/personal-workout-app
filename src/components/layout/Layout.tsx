import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
