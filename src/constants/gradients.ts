import { GradientOption, GradientId } from '../types';

export const GRADIENT_OPTIONS: GradientOption[] = [
  {
    id: 'prism',
    name: 'Joy & Sunshine',
    tailwindBg: 'bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500',
    tailwindRing: 'ring-amber-300',
    canvasColors: ['#fde047', '#fb923c', '#f59e0b'],
    mood: 'Joy & Sunshine ✨',
    emoji: '✨',
  },
  {
    id: 'sunset',
    name: 'Warmth & Love',
    tailwindBg: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600',
    tailwindRing: 'ring-pink-400',
    canvasColors: ['#f472b6', '#f43f5e', '#dc2626'],
    mood: 'Warmth & Love 🌅',
    emoji: '🌅',
  },
  {
    id: 'emerald',
    name: 'Peace & Calm',
    tailwindBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
    tailwindRing: 'ring-emerald-300',
    canvasColors: ['#34d399', '#14b8a6', '#0891b2'],
    mood: 'Peace & Calm 🌿',
    emoji: '🌿',
  },
  {
    id: 'oceanic',
    name: 'Clarity & Freshness',
    tailwindBg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600',
    tailwindRing: 'ring-cyan-300',
    canvasColors: ['#22d3ee', '#0ea5e9', '#2563eb'],
    mood: 'Clarity & Freshness 🌊',
    emoji: '🌊',
  },
  {
    id: 'cosmic',
    name: 'Deep Wonder',
    tailwindBg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-800',
    tailwindRing: 'ring-indigo-400',
    canvasColors: ['#6366f1', '#9333ea', '#5b21b6'],
    mood: 'Deep Wonder 🌌',
    emoji: '🌌',
  },
  {
    id: 'cherry',
    name: 'Passion & Vitality',
    tailwindBg: 'bg-gradient-to-br from-violet-400 via-fuchsia-500 to-pink-600',
    tailwindRing: 'ring-violet-300',
    canvasColors: ['#a78bfa', '#d946ef', '#db2777'],
    mood: 'Passion & Vitality 🌺',
    emoji: '🌺',
  },
  {
    id: 'solar',
    name: 'Energy & Fire',
    tailwindBg: 'bg-gradient-to-br from-red-400 via-orange-500 to-amber-500',
    tailwindRing: 'ring-orange-400',
    canvasColors: ['#f87171', '#f97316', '#f59e0b'],
    mood: 'Energy & Fire ⚡',
    emoji: '⚡',
  },
  {
    id: 'gentle',
    name: "I don't feel good today",
    tailwindBg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-indigo-950',
    tailwindRing: 'ring-slate-400',
    canvasColors: ['#475569', '#3f3f46', '#1e1b4b'],
    mood: "I don't feel good today 🌧️",
    emoji: '🌧️',
  }
];

export const INSPIRATION_PROMPTS = [
  "What made you smile today?",
  "A quiet moment of relief or contentment you enjoyed...",
  "A song, sound, or aroma that lifted your spirits...",
  "An unexpected kindness from a friend or stranger...",
  "Something comforting you ate or drank today...",
  "Even on a tough day: one small thing that gave you shelter or comfort...",
  "A beautiful sight in nature or your surrounding space..."
];

export function getGradientById(id?: GradientId): GradientOption {
  return GRADIENT_OPTIONS.find((g) => g.id === id) || GRADIENT_OPTIONS[0];
}

