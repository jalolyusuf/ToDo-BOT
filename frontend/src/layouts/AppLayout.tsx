import { useState } from 'react';
import { Sidebar, MobileMenuButton } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900 px-4 lg:hidden">
          <MobileMenuButton onClick={() => setSidebarOpen(true)} />
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <h1 className="text-lg font-semibold">Task Platform</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
