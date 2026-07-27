import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trash2, Heart, Check, CloudRain } from 'lucide-react';
import { GratitudeEntry, GradientId } from '../types';
import { GRADIENT_OPTIONS, INSPIRATION_PROMPTS } from '../constants/gradients';
import { triggerHaptic } from '../utils/telegram';

interface EntryModalProps {
  dayNumber: number;
  existingEntry?: GratitudeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dayNumber: number, text: string, gradientId: GradientId) => void;
  onDelete?: (dayNumber: number) => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  dayNumber,
  existingEntry,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [text, setText] = useState('');
  const [gradientId, setGradientId] = useState<GradientId>('prism');
  useEffect(() => {
    if (existingEntry) {
      setText(existingEntry.text || '');
      setGradientId(existingEntry.gradientId || 'prism');
    } else {
      setText('');
      setGradientId('prism');
    }
  }, [existingEntry, isOpen, dayNumber]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    triggerHaptic('success');
    onSave(dayNumber, text.trim(), gradientId);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      triggerHaptic('warning');
      onDelete(dayNumber);
      onClose();
    }
  };

  // Deterministic daily prompt based on day number
  const promptIndex = (dayNumber - 1) % INSPIRATION_PROMPTS.length;
  const currentPrompt = INSPIRATION_PROMPTS[promptIndex];
  const selectedOption = GRADIENT_OPTIONS.find((g) => g.id === gradientId) || GRADIENT_OPTIONS[0];
  const isGentleSpace = gradientId === 'gentle';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-[#f8f7f4] text-[#1a1a1a] border-1.5 border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b-1.5 border-[#1a1a1a] pb-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold leading-tight text-[#1a1a1a]">
              Day {dayNumber} Reflection
            </h2>
            <p className="font-mono text-[0.65rem] font-bold text-[#6366f1] uppercase tracking-widest mt-0.5">
              {existingEntry ? 'Edit Reflection' : 'Illuminate Tile'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 border border-[#1a1a1a]/20 flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a]/10 transition-colors cursor-pointer rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Card */}
        <div className="p-4 bg-white border border-[#1a1a1a]/15 flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-[0.6rem] font-bold tracking-widest uppercase text-[#6366f1]">
            <span>Daily Spark</span>
            <span className="text-[#1a1a1a]/50">Day {dayNumber} Prompt</span>
          </div>
          <p className="text-sm text-[#1a1a1a] italic font-serif leading-relaxed">
            “{currentPrompt}”
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Main Text Area */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[0.65rem] font-bold uppercase tracking-wider text-[#1a1a1a]/80 flex justify-between">
              <span>{isGentleSpace ? "Write a gentle thought for yourself:" : "Share your thoughts on this question:"}</span>
              <span className="text-[#1a1a1a]/40">{text.length}/180</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 180))}
              placeholder={
                isGentleSpace
                  ? "It's okay to not be okay. A gentle sentence is enough..."
                  : "Type a few words..."
              }
              rows={3}
              required
              className="w-full bg-white border border-[#1a1a1a]/20 p-3.5 text-base text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#1a1a1a] transition-colors italic font-serif rounded-none"
            />
          </div>

          {/* Vibe Spectrum Selection */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-[#1a1a1a]/80">
              <label className="font-bold">Color Vibe Spectrum</label>
              <span className="text-[#1a1a1a]/50">Select Vibe</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {GRADIENT_OPTIONS.map((grad) => {
                const isSelected = gradientId === grad.id;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setGradientId(grad.id);
                    }}
                    className={`
                      relative aspect-square ${grad.tailwindBg}
                      flex flex-col items-center justify-center text-white transition-all duration-200
                      hover:scale-105 active:scale-95 border border-[#1a1a1a]/30 cursor-pointer rounded-none
                      ${isSelected ? 'ring-2 ring-[#1a1a1a] ring-offset-2 ring-offset-[#f8f7f4] z-10' : 'opacity-80 hover:opacity-100'}
                    `}
                    title={`${grad.name} - ${grad.mood}`}
                  >
                    <span className="text-base">{grad.emoji}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Vibe Banner */}
            <div className={`p-3 border flex items-center justify-between gap-2 transition-all ${
              isGentleSpace
                ? 'bg-zinc-900 border-zinc-900 text-white'
                : 'bg-white border-[#1a1a1a]/20 text-[#1a1a1a]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedOption.emoji}</span>
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider">
                    {selectedOption.mood}
                  </p>
                  <p className="font-mono text-[0.6rem] text-[#1a1a1a]/60">
                    {isGentleSpace
                      ? "Gentle space for quiet self-care"
                      : `${selectedOption.name} Color Reflection`}
                  </p>
                </div>
              </div>
              {isGentleSpace && (
                <div className="p-1 text-slate-300">
                  <CloudRain className="w-4 h-4 text-indigo-300" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1a1a1a]/15">
            {existingEntry && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 border border-rose-600 text-rose-600 hover:bg-rose-50 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1a1a1a] text-[#f8f7f4] font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#1a1a1a]/90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer rounded-none"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

