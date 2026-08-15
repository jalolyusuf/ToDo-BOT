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
    if (!initData) {
      setError('Telegram WebApp data not found');
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
