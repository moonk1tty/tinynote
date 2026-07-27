export type GradientId = 'prism' | 'sunset' | 'emerald' | 'oceanic' | 'cosmic' | 'cherry' | 'solar' | 'gentle';

export interface GratitudeEntry {
  id: string; // e.g. "day-1" or "2026-07-01"
  dayNumber: number; // 1 - 31
  text: string;
  gradientId: GradientId;
  moodTag?: string; // Legacy fallback
  createdAt: number;
  dateString?: string;
}

export interface GradientOption {
  id: GradientId;
  name: string;
  tailwindBg: string;
  tailwindRing: string;
  canvasColors: [string, string, string];
  mood: string;
  emoji: string;
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface StoryCardOptions {
  monthName: string;
  year: number;
  daysInMonth: number;
  firstDayOfWeek: number;
  todayDayNumber: number;
  entries: Record<number, GratitudeEntry>;
  summaryQuote?: string;
  userName?: string;
  themeBgColor?: string;
}
