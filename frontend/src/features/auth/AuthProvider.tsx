import { useEffect } from 'react';
import { getAuthMe } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/auth';
import { getRawInitData, telegramExpand, telegramReady } from '../../shared/telegram';
import { Loading, ErrorMessage } from '../../shared/components';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, setUser, setError, setLoading } = useAuthStore();

  useEffect(() => {
    // Wait for Telegram WebApp SDK to load
    const checkTelegramSDK = () => {
      const telegram = (window as any).Telegram?.WebApp;

      if (!telegram) {
        console.log('[Auth] Telegram SDK not ready, waiting...');
        return false;
      }

      console.log('[Auth] Telegram SDK loaded:', {
        platform: telegram.platform,
        version: telegram.version,
        initData: telegram.initData ? 'present' : 'missing',
        initDataLength: telegram.initData?.length || 0
      });

      return true;
    };

    // Try multiple times with delays
    let attempts = 0;
    const maxAttempts = 10;

    const attemptAuth = () => {
      attempts++;
      console.log(`[Auth] Attempt ${attempts}/${maxAttempts}`);

      if (!checkTelegramSDK()) {
        if (attempts < maxAttempts) {
          setTimeout(attemptAuth, 300);
          return;
        }
        // SDK not loaded after all attempts
        setError('❌ This app must be opened from Telegram bot.\n\n1. Open Telegram\n2. Go to @td_ls_bot\n3. Send /start\n4. Click "Open Mini App"');
        return;
      }

      // SDK is ready
      telegramReady();
      telegramExpand();

      const initData = getRawInitData();
      console.log('[Auth] initData:', initData ? `${initData.substring(0, 50)}...` : 'null');

      if (!initData) {
        console.error('[Auth] No initData after SDK loaded!');
        setError('❌ This app must be opened from Telegram bot.\n\n1. Open Telegram\n2. Go to @td_ls_bot\n3. Send /start\n4. Click "Open Mini App"');
        return;
      }

      const authHeader = `tma ${initData}`;

      getAuthMe(authHeader)
        .then((userData) => {
          console.log('[Auth] Success:', userData.first_name);
          setUser(userData, authHeader);
        })
        .catch((err) => {
          console.error('[Auth] Failed:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
        });
    };

    attemptAuth();
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
