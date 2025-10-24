import { writable } from 'svelte/store';
import type { ViewType } from '@/shared/types';

function createAppStore() {
  const { subscribe, set } = writable<ViewType>('lobby');

  return {
    subscribe,
    setView: (view: ViewType) => set(view),
    reset: () => set('lobby'),
  };
}

export const appStore = createAppStore();
