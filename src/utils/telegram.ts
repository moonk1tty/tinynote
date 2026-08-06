import { TelegramUser, TelegramThemeParams } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData?: string;
        initDataUnsafe?: {
          user?: TelegramUser;
        };
        colorScheme?: 'light' | 'dark';
        themeParams?: TelegramThemeParams;
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openLink?: (url: string) => void;
        shareToStory?: (mediaUrl: string, params?: { text?: string }) => void;
      };
    };
  }
}

export function initTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand?.();
    return tg;
  }
  return null;
}

export function getTelegramUser(): TelegramUser | null {
  if (typeof window !== 'undefined') {
    // 1. Try Telegram WebApp SDK context
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const u = window.Telegram.WebApp.initDataUnsafe.user;
      try {
        localStorage.setItem('tinynote_tg_user', JSON.stringify(u));
      } catch (e) {}
      return u;
    }

    // 2. Try URL search parameters (e.g. ?userId=8839781890 or ?user_id=8839781890 or ?tgWebAppStartParam=8839781890)
    const urlParams = new URLSearchParams(window.location.search);
    const rawUrlUserId = urlParams.get('userId') || urlParams.get('user_id') || urlParams.get('tgWebAppStartParam');
    if (rawUrlUserId) {
      const cleanId = rawUrlUserId.replace(/\D/g, ''); // Extract numbers
      if (cleanId) {
        const urlUser: TelegramUser = {
          id: Number(cleanId),
          first_name: urlParams.get('first_name') || 'Telegram User',
          username: urlParams.get('username') || undefined,
        };
        try {
          localStorage.setItem('tinynote_tg_user', JSON.stringify(urlUser));
        } catch (e) {}
        return urlUser;
      }
    }

    // 3. Fallback to cached Telegram user in localStorage
    try {
      const savedTg = localStorage.getItem('tinynote_tg_user');
      if (savedTg) {
        return JSON.parse(savedTg);
      }
    } catch (e) {}
  }
  return null;
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
    const haptic = window.Telegram.WebApp.HapticFeedback;
    if (type === 'success' || type === 'warning') {
      haptic.notificationOccurred(type);
    } else {
      haptic.impactOccurred(type);
    }
  }
}
