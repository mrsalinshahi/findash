import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <main className="pb-24 md:pb-10 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
