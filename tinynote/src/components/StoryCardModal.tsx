import React, { useState } from 'react';
import { X, Download, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface StoryCardModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  quoteText?: string;
  onClose: () => void;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  imageUrl,
  quoteText,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    triggerHaptic('success');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `tinynote-story-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQuote = () => {
    if (quoteText) {
      triggerHaptic('light');
      navigator.clipboard.writeText(`“${quoteText}” - tinynote`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'tinynote-story.png', { type: 'image/png' });

        await navigator.share({
          title: 'My tinynote',
          text: quoteText ? `“${quoteText}” - My tinynote reflection` : 'Check out my tinynote story!',
          files: [file]
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#f8f7f4] text-[#1a1a1a] border-1.5 border-[#1a1a1a] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-1.5 border-[#1a1a1a] pb-3">
          <div>
            <h3 className="font-serif text-2xl font-semibold leading-tight text-[#1a1a1a]">
              Story Canvas Card
            </h3>
            <p className="font-mono text-[0.65rem] font-bold text-[#6366f1] uppercase tracking-widest mt-0.5">
              9:16 Vertical Export
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-[#1a1a1a]/20 flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a]/10 transition-colors cursor-pointer rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Canvas Image Preview Box */}
        <div className="relative w-full flex-1 min-h-0 bg-white border border-[#1a1a1a]/20 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt="tinynote Story Card"
            className="max-h-[55vh] w-auto object-contain border border-[#1a1a1a]/10 shadow-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="py-3 px-4 bg-[#1a1a1a] text-[#f8f7f4] font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#1a1a1a]/90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 border border-[#1a1a1a] text-[#1a1a1a] bg-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#1a1a1a]/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none"
            >
              <Share2 className="w-3.5 h-3.5 text-[#6366f1]" />
              <span>Share</span>
            </button>
          </div>

          {quoteText && (
            <button
              onClick={handleCopyQuote}
              className="w-full py-2.5 px-3 bg-white border border-[#1a1a1a]/20 text-[#1a1a1a] font-mono text-[0.65rem] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1a1a1a]/5 transition-colors cursor-pointer rounded-none"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Quote Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span>Copy Featured Quote</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

