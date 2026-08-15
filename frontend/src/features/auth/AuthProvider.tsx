import { useEffect } from 'react';
import { getAuthMe } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/auth';
import { getRawInitData, telegramExpand, telegramReady } from '../../shared/telegram';
import { Loading, ErrorMessage } from '../../shared/components';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, setUser, setError, setLoading } = useAuthStore();

  useEffect(() => {
    telegramReady();
    telegramExpand();

    const initData = getRawInitData();

    // For development/testing in browser
    if (!initData) {
      const isDev = import.meta.env.DEV;
      const isLocalhost = window.location.hostname === 'localhost';

      if (isDev || isLocalhost) {
        // Show warning but allow access for development
        setError('⚠️ Development Mode: Telegram WebApp not detected. This only works in Telegram Mini App.');
        return;
      }

      setError('❌ This app must be opened from Telegram bot.\n\n1. Open Telegram\n2. Go to @td_ls_bot\n3. Send /start\n4. Click "Open Mini App"');
      return;
    }

    const authHeader = `tma ${initData}`;

    getAuthMe(authHeader)
      .then((userData) => {
        setUser(userData, authHeader);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      });
  }, [setUser, setError, setLoading]);

  if (isLoading) {
    return <Loading message="Authenticating..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md">
          <ErrorMessage message={error} title="Authentication Error" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <ErrorMessage message="User not loaded" />
      </div>
    );
  }

  return <>{children}</>;
}
