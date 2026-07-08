export type TelegramInitData = string;

export interface TelegramWebApp {
  initData: string | null;
  ready: () => void;
  expand: () => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  const telegram = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram;
  return telegram?.WebApp ?? null;
}

export function getRawInitData(): string | null {
  return getTelegramWebApp()?.initData ?? null;
}

export function telegramReady(): void {
  getTelegramWebApp()?.ready();
}

export function telegramExpand(): void {
  getTelegramWebApp()?.expand();
}
