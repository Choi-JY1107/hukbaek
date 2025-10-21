import { create } from 'zustand';
import { ViewType } from '@/shared/types';

type AppStore = {
  view: ViewType;
  setView: (view: ViewType) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  view: 'lobby',
  setView: (view) => set({ view }),
}));
