import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/store/auth';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Tasks', icon: '✓' },
  { to: '/groups', label: 'Groups', icon: '👥' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <h1 className="text-lg font-semibold">Task Platform</h1>
          </div>
          {user && (
            <div className="text-sm text-slate-400">
              {user.first_name}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-slate-800 bg-slate-900">
        <div className="container mx-auto flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 py-3 text-center transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="mt-1 text-xs font-medium">{item.label}</div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
