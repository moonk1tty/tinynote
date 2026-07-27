import React from 'react';
import { X, Sparkles, HeartHandshake, Compass } from 'lucide-react';
import { INSPIRATION_PROMPTS } from '../constants/gradients';
import { triggerHaptic } from '../utils/telegram';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (promptText: string) => void;
}

export const InspirationModal: React.FC<InspirationModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-[#f8f7f4] text-[#1a1a1a] border-1.5 border-[#1a1a1a] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-1.5 border-[#1a1a1a] pb-3">
          <div>
            <h3 className="font-serif text-2xl font-semibold leading-tight text-[#1a1a1a]">
              Gratitude Spark Guide
            </h3>
            <p className="font-mono text-[0.65rem] font-bold text-[#6366f1] uppercase tracking-widest mt-0.5">
              Daily Reflection Prompts
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 border border-[#1a1a1a]/20 flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a]/10 transition-colors cursor-pointer rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories / Prompts List */}
        <div className="flex flex-col gap-2">
          {INSPIRATION_PROMPTS.map((prompt, idx) => (
            <div
              key={idx}
              onClick={() => {
                triggerHaptic('light');
                if (onSelectPrompt) onSelectPrompt(prompt);
                onClose();
              }}
              className="p-3.5 bg-white border border-[#1a1a1a]/15 hover:border-[#1a1a1a] cursor-pointer transition-all flex items-center justify-between gap-3 group rounded-none"
            >
              <p className="text-sm sm:text-base text-[#1a1a1a] font-serif italic leading-relaxed">
                “{prompt}”
              </p>
              <Sparkles className="w-3.5 h-3.5 text-[#6366f1] shrink-0 opacity-60 group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Tip Box */}
        <div className="p-3.5 bg-white border-l-3 border-[#6366f1] border-y border-r border-y-[#1a1a1a]/10 border-r-[#1a1a1a]/10 flex items-center gap-3 text-xs text-[#1a1a1a]/80 font-serif italic">
          <HeartHandshake className="w-4 h-4 text-[#6366f1] shrink-0 not-italic" />
          <span>
            Small moments matter most: a warm cup of coffee, clean morning air, or quiet comfort.
          </span>
        </div>

      </div>
    </div>
  );
};

