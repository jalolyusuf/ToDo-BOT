import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../shared/store/auth';
import clsx from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: typeof HomeIcon;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/tasks', label: 'Tasks', icon: CheckCircleIcon },
  { to: '/groups', label: 'Groups', icon: UserGroupIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <h1 className="text-lg font-bold text-slate-50">Task Platform</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="border-b border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">
                {user.first_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-50 truncate">
                  {user.first_name} {user.last_name || ''}
                </p>
                {user.username && (
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-500 text-center">
            ToDo Bot v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}
