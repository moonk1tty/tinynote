import React from 'react';
import { HelpCircle, Image, RefreshCw } from 'lucide-react';
import { TelegramUser } from '../types';

interface HeaderProps {
  monthName: string;
  year: number;
  userName?: string;
  telegramUser?: TelegramUser | null;
  onGenerateStoryCard: () => void;
  onOpenInspiration: () => void;
  onLoadSampleData?: () => void;
  onResetMonth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  monthName,
  year,
  telegramUser,
  onGenerateStoryCard,
  onOpenInspiration,
  onLoadSampleData,
  onResetMonth
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 pt-6 pb-2 flex flex-col gap-5 border-b-1.5 border-[#1a1a1a]">
      {/* Header Top: Title & Actions */}
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold leading-[0.85] tracking-tight lowercase text-[#1a1a1a]">
            tinynote
          </h1>
          <p className="font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] text-[#1a1a1a]/60 mt-2 font-medium">
            Refract your daily notes & gratitude
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenInspiration}
            className="w-10 h-10 border border-[#1a1a1a]/15 bg-transparent flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer rounded-none"
            title="Inspiration Prompt"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.75]" />
          </button>

          <button
            onClick={onGenerateStoryCard}
            className="bg-[#1a1a1a] text-[#f8f7f4] border-none px-4 sm:px-5 h-10 font-mono text-[0.7rem] uppercase tracking-widest cursor-pointer hover:bg-[#1a1a1a]/90 active:scale-95 transition-all flex items-center gap-2"
          >
            <Image className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
        </div>
      </div>

      {/* Meta Strip */}
      <div className="flex justify-between items-center font-mono text-[0.65rem] sm:text-xs uppercase tracking-wider text-[#1a1a1a]/80 pt-1 pb-1">
        <div className="flex items-center gap-2 font-bold text-[#1a1a1a]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
          <span>{monthName} {year}</span>
          {telegramUser?.first_name && (
            <span className="text-[#1a1a1a]/50 font-normal">
              // {telegramUser.first_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onLoadSampleData && (
            <button
              onClick={onLoadSampleData}
              className="underline text-[#6366f1] hover:text-[#4f46e5] cursor-pointer font-mono text-[0.65rem]"
            >
              Fill Demo
            </button>
          )}
          {onResetMonth && (
            <button
              onClick={onResetMonth}
              className="underline text-[#1a1a1a]/60 hover:text-rose-600 cursor-pointer font-mono text-[0.65rem] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 inline" />
              Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


