import { create } from 'zustand';
import type { Player } from '@/lib/bzzoiro/types';

const MAX_SLOTS = 2;

interface CompareState {
  slots: Player[];
  addToCompare: (player: Player) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  slots: [],

  addToCompare: (player) => {
    const { slots } = get();
    if (slots.length >= MAX_SLOTS) return;
    if (slots.some((p) => p.id === player.id)) return;
    set({ slots: [...slots, player] });
  },

  removeFromCompare: (id) => {
    set((state) => ({ slots: state.slots.filter((p) => p.id !== id) }));
  },

  clearCompare: () => set({ slots: [] }),

  isInCompare: (id) => get().slots.some((p) => p.id === id),
}));
