import React, { useState, useEffect, useMemo } from 'react';
import { GratitudeEntry, GradientId, TelegramUser } from './types';
import { initTelegramWebApp, getTelegramUser, triggerHaptic } from './utils/telegram';
import { renderStoryCardCanvas } from './utils/canvasExport';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TileGrid } from './components/TileGrid';
import { EntryModal } from './components/EntryModal';
import { StoryCardModal } from './components/StoryCardModal';
import { InspirationModal } from './components/InspirationModal';
import { Sparkles, Heart, RefreshCw, Layers } from 'lucide-react';

const STORAGE_KEY = 'gratitude_prism_entries_v1';

export default function App() {
  const [entries, setEntries] = useState<Record<number, GratitudeEntry>>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  const [storyImageUrl, setStoryImageUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  const currentDate = useMemo(() => new Date(), []);
  const monthName = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long' });
  }, [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  // Calendar calculations for current month
  const daysInMonth = useMemo(() => {
    return new Date(year, currentDate.getMonth() + 1, 0).getDate();
  }, [year, currentDate]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(year, currentDate.getMonth(), 1).getDay(); // 0 = Sun
  }, [year, currentDate]);

  const todayDayNumber = useMemo(() => {
    return currentDate.getDate();
  }, [currentDate]);

  // Load initial data & Telegram SDK
  useEffect(() => {
    initTelegramWebApp();
    const user = getTelegramUser();
    if (user) {
      setTelegramUser(user);
    }

    // Load local storage data
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          setEntries(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse saved entries:', err);
    }
  }, []);

  // Save to localStorage whenever entries change
  const saveToStorage = (updatedEntries: Record<number, GratitudeEntry>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  // Calculate streak up to today
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let day = 1; day <= todayDayNumber; day++) {
      if (entries[day]) {
        streak++;
      } else {
        streak = 0; // reset streak if a day is missed
      }
    }
    return streak;
  }, [entries, todayDayNumber]);

  // Handlers
  const handleTileClick = (dayNumber: number) => {
    if (dayNumber > todayDayNumber) {
      triggerHaptic('warning');
      return;
    }
    setSelectedDay(dayNumber);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = (dayNumber: number, text: string, gradientId: GradientId) => {
    const newEntry: GratitudeEntry = {
      id: `day-${dayNumber}`,
      dayNumber,
      text,
      gradientId,
      createdAt: Date.now(),
      dateString: `${monthName} ${dayNumber}, ${year}`
    };

    const updated = { ...entries, [dayNumber]: newEntry };
    setEntries(updated);
    saveToStorage(updated);
  };

  const handleDeleteEntry = (dayNumber: number) => {
    const updated = { ...entries };
    delete updated[dayNumber];
    setEntries(updated);
    saveToStorage(updated);
  };

  const handleGenerateStoryCard = async () => {
    triggerHaptic('medium');
    setIsGeneratingCard(true);
    try {
      const url = await renderStoryCardCanvas({
        monthName,
        year,
        daysInMonth,
        firstDayOfWeek,
        todayDayNumber,
        entries,
        userName: telegramUser?.first_name || telegramUser?.username || undefined
      });
      setStoryImageUrl(url);
      setIsStoryModalOpen(true);
    } catch (err) {
      console.error('Failed to generate story card:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // Populate Demo Month Grid for past & today dates only
  const handleLoadSampleData = () => {
    triggerHaptic('success');
    const allPossibleSamples: Record<number, GratitudeEntry> = {
      1: { id: 'day-1', dayNumber: 1, text: 'A calm morning espresso with quiet golden sunlight.', gradientId: 'sunset', createdAt: Date.now() },
      2: { id: 'day-2', dayNumber: 2, text: 'Reconnecting with an old friend over coffee.', gradientId: 'prism', createdAt: Date.now() },
      3: { id: 'day-3', dayNumber: 3, text: 'Finishing a long project ahead of schedule!', gradientId: 'solar', createdAt: Date.now() },
      4: { id: 'day-4', dayNumber: 4, text: 'A soothing evening walk under cool starlight.', gradientId: 'cosmic', createdAt: Date.now() },
      5: { id: 'day-5', dayNumber: 5, text: 'Receiving an unexpected compliment from my client.', gradientId: 'cherry', createdAt: Date.now() },
      6: { id: 'day-6', dayNumber: 6, text: 'Fresh rain scent on blooming garden flowers.', gradientId: 'emerald', createdAt: Date.now() },
      7: { id: 'day-7', dayNumber: 7, text: 'A deep, restful 8 hours of uninterrupted sleep.', gradientId: 'oceanic', createdAt: Date.now() },
      8: { id: 'day-8', dayNumber: 8, text: 'Listening to my favorite nostalgic album.', gradientId: 'cosmic', createdAt: Date.now() },
      9: { id: 'day-9', dayNumber: 9, text: 'A delicious homemade pasta dinner with family.', gradientId: 'sunset', createdAt: Date.now() },
      10: { id: 'day-10', dayNumber: 10, text: 'Finding a lost book I had been searching for.', gradientId: 'prism', createdAt: Date.now() },
      12: { id: 'day-12', dayNumber: 12, text: 'A heavy, draining day. Drank warm chamomile tea and held quiet space for rest.', gradientId: 'gentle', createdAt: Date.now() },
      14: { id: 'day-14', dayNumber: 14, text: 'Solving a tough technical bug with ease.', gradientId: 'solar', createdAt: Date.now() },
      15: { id: 'day-15', dayNumber: 15, text: 'A quiet afternoon reading by the window.', gradientId: 'emerald', createdAt: Date.now() },
      18: { id: 'day-18', dayNumber: 18, text: 'Laughing heartily with good companions.', gradientId: 'cherry', createdAt: Date.now() },
      20: { id: 'day-20', dayNumber: 20, text: 'A gentle breeze during morning meditation.', gradientId: 'oceanic', createdAt: Date.now() },
      22: { id: 'day-22', dayNumber: 22, text: 'Tasting crisp organic apples from the market.', gradientId: 'emerald', createdAt: Date.now() },
      25: { id: 'day-25', dayNumber: 25, text: 'Learning something new that sparked my imagination.', gradientId: 'prism', createdAt: Date.now() },
      27: { id: 'day-27', dayNumber: 27, text: 'Feeling grateful for another day filled with color.', gradientId: 'solar', createdAt: Date.now() },
    };

    // Filter samples to only include dates up to todayDayNumber
    const filteredSamples: Record<number, GratitudeEntry> = {};
    Object.keys(allPossibleSamples).forEach((dayStr) => {
      const dNum = Number(dayStr);
      if (dNum <= todayDayNumber) {
        filteredSamples[dNum] = allPossibleSamples[dNum];
      }
    });

    setEntries(filteredSamples);
    saveToStorage(filteredSamples);
  };

  const handleResetMonth = () => {
    if (window.confirm('Are you sure you want to clear this month\'s entries?')) {
      triggerHaptic('warning');
      setEntries({});
      saveToStorage({});
    }
  };

  const currentSelectedEntry = selectedDay ? entries[selectedDay] : null;

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] flex flex-col pb-12 selection:bg-[#6366f1] selection:text-white">
      {/* Top Header */}
      <Header
        monthName={monthName}
        year={year}
        telegramUser={telegramUser}
        onGenerateStoryCard={handleGenerateStoryCard}
        onOpenInspiration={() => setIsInspirationOpen(true)}
        onLoadSampleData={Object.keys(entries).length === 0 ? handleLoadSampleData : undefined}
        onResetMonth={Object.keys(entries).length > 0 ? handleResetMonth : undefined}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center gap-2">
        {/* Stats Summary Bar */}
        <StatsBar entries={entries} streakDays={streakDays} />

        {/* Interactive Monthly Calendar Grid */}
        <TileGrid
          entries={entries}
          daysInMonth={daysInMonth}
          firstDayOfWeek={firstDayOfWeek}
          todayDayNumber={todayDayNumber}
          selectedDayNumber={selectedDay}
          onTileClick={handleTileClick}
        />
      </main>

      {/* Bottom Footer Info */}
      <footer className="w-full max-w-2xl mx-auto px-4 mt-10 pt-4 border-t border-[#1a1a1a]/10 flex justify-between items-center font-mono text-[0.55rem] sm:text-xs text-[#1a1a1a]/60 uppercase tracking-widest">
        <span>Telegram Mini App // tinynote</span>
        <span>Saved Locally</span>
      </footer>


      {/* Entry Input / View Modal */}
      {selectedDay && (
        <EntryModal
          dayNumber={selectedDay}
          existingEntry={currentSelectedEntry}
          isOpen={isEntryModalOpen}
          onClose={() => {
            setIsEntryModalOpen(false);
            setSelectedDay(null);
          }}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* 9:16 Canvas Story Card Modal */}
      <StoryCardModal
        isOpen={isStoryModalOpen}
        imageUrl={storyImageUrl}
        quoteText={
          (Object.values(entries) as GratitudeEntry[]).filter((e) => e && e.text).length > 0
            ? (Object.values(entries) as GratitudeEntry[]).filter((e) => e && e.text)[0].text
            : undefined
        }
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* Inspiration Prompt Modal */}
      <InspirationModal
        isOpen={isInspirationOpen}
        onClose={() => setIsInspirationOpen(false)}
        onSelectPrompt={(promptText) => {
          // If no tile selected yet, open day 1 or next empty day
          let targetDay = 1;
          for (let d = 1; d <= 30; d++) {
            if (!entries[d]) {
              targetDay = d;
              break;
            }
          }
          setSelectedDay(targetDay);
          setIsEntryModalOpen(true);
        }}
      />

      {/* Loading Overlay when generating story card */}
      {isGeneratingCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-bold text-slate-200">Generating 9:16 Story Card...</p>
        </div>
      )}
    </div>
  );
}
