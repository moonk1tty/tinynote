import React from 'react';
import { GratitudeEntry } from '../types';

interface StatsBarProps {
  entries: Record<number, GratitudeEntry>;
  streakDays: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ entries, streakDays }) => {
  const filledCount = Object.keys(entries).length;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const percentage = Math.round((filledCount / daysInMonth) * 100);

  // Find latest entry text for quote preview
  const entryList = (Object.values(entries) as GratitudeEntry[]).filter((e) => e && e.text);
  const latestEntry = entryList.length > 0 ? entryList[entryList.length - 1] : null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-3 flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[0.6rem] sm:text-xs tracking-[0.2em] uppercase text-[#6366f1] font-bold">
            Prism Insights
          </span>
          <span className="font-mono text-[0.6rem] sm:text-xs tracking-[0.15em] uppercase text-[#1a1a1a]/60">
            {streakDays}d Streak
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl leading-tight text-[#1a1a1a] font-normal">
          {filledCount} Days of Smiles ({percentage}% Refracted)
        </h3>

        {/* Quote Block */}
        <div className="font-serif text-lg sm:text-xl italic p-4 sm:p-5 bg-white border-l-3 border-[#6366f1] shadow-xs text-[#1a1a1a]">
          {latestEntry ? (
            <span>“{latestEntry.text}”</span>
          ) : (
            <span className="text-[#1a1a1a]/50">
              “Your month is a blank canvas. Tap any tile below to refract your first gratitude.”
            </span>
          )}
        </div>
      </section>
    </div>
  );
};


