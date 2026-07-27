import React from 'react';
import { GratitudeEntry } from '../types';
import { getGradientById } from '../constants/gradients';
import { triggerHaptic } from '../utils/telegram';

interface TileGridProps {
  entries: Record<number, GratitudeEntry>;
  daysInMonth: number;
  firstDayOfWeek: number; // 0 = Sun, 1 = Mon, ... 6 = Sat
  todayDayNumber: number;
  selectedDayNumber?: number | null;
  onTileClick: (dayNumber: number) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const TileGrid: React.FC<TileGridProps> = ({
  entries,
  daysInMonth,
  firstDayOfWeek,
  todayDayNumber,
  selectedDayNumber,
  onTileClick
}) => {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyOffset = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleTileTap = (day: number, isFuture: boolean) => {
    if (isFuture) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('light');
    onTileClick(day);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-2 flex flex-col gap-2.5">
      {/* Meta strip above grid */}
      <div className="flex justify-between items-center font-mono text-[0.6rem] uppercase tracking-wider text-[#1a1a1a]/70">
        <span>tinynote Calendar</span>
        <span className="opacity-50">Tap tile to refract</span>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-7 gap-[1px] bg-[#1a1a1a]/15 border border-[#1a1a1a]/15 shadow-2xs">
        {/* Weekday Header */}
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="bg-[#f8f7f4] py-2.5 font-mono text-[0.55rem] text-[#1a1a1a]/60 text-center tracking-widest font-bold"
          >
            {wd}
          </div>
        ))}

        {/* Start Day Empty Pads */}
        {emptyOffset.map((offset) => (
          <div key={`offset-${offset}`} className="aspect-square bg-[#f8f7f4]" />
        ))}

        {/* Month Day Tiles */}
        {days.map((day) => {
          const entry = entries[day];
          const isSelected = selectedDayNumber === day;
          const isFuture = day > todayDayNumber;
          const isToday = day === todayDayNumber;
          const formattedNum = day.toString().padStart(2, '0');

          if (entry) {
            const grad = getGradientById(entry.gradientId);
            return (
              <button
                key={day}
                onClick={() => handleTileTap(day, false)}
                className={`
                  aspect-square relative flex flex-col items-center justify-center p-1
                  cursor-pointer transition-all ${grad.tailwindBg} text-white
                  ${isToday ? 'outline-2 outline-[#6366f1] -outline-offset-2 z-10' : ''}
                  ${isSelected ? 'ring-2 ring-[#1a1a1a] z-20 scale-102' : ''}
                `}
                title={`Day ${day}: ${entry.text}`}
              >
                <span className="font-mono text-[0.65rem] font-bold absolute top-1 left-1.5 drop-shadow-xs">
                  {formattedNum}
                </span>
                <span className="text-base sm:text-xl my-auto">{grad.emoji}</span>
                <span className="font-mono text-[0.4rem] uppercase tracking-widest mt-auto font-bold truncate max-w-full px-0.5 opacity-90">
                  {entry.text ? entry.text.slice(0, 8) : 'NOTED'}
                </span>
              </button>
            );
          }

          if (isFuture) {
            return (
              <div
                key={day}
                onClick={() => handleTileTap(day, true)}
                className="aspect-square bg-[#f8f7f4] relative flex flex-col items-center justify-center p-1 opacity-25 cursor-not-allowed text-[#1a1a1a]"
              >
                <span className="font-mono text-[0.65rem] font-medium absolute top-1 left-1.5">
                  {formattedNum}
                </span>
              </div>
            );
          }

          // Active loggable empty tile
          return (
            <button
              key={day}
              onClick={() => handleTileTap(day, false)}
              className={`
                aspect-square bg-[#f8f7f4] relative flex flex-col items-center justify-center p-1
                cursor-pointer text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors
                ${isToday ? 'outline-2 outline-[#6366f1] -outline-offset-2 z-10' : ''}
                ${isSelected ? 'ring-2 ring-[#6366f1] z-20' : ''}
              `}
              title={isToday ? "Today! Tap to log" : `Day ${day}: Tap to add`}
            >
              <span className="font-mono text-[0.65rem] font-bold absolute top-1 left-1.5 text-[#1a1a1a]/80">
                {formattedNum}
              </span>
              <span className="font-mono text-[0.45rem] uppercase tracking-widest mt-auto text-[#1a1a1a]/50 font-bold mb-0.5">
                {isToday ? 'Today' : '+ Add'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


