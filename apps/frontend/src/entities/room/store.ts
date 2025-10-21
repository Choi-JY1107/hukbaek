import { create } from 'zustand';
import { RoomState } from '@/shared/types';

type RoomStore = {
  room: RoomState | null;
  setRoom: (room: RoomState | null) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}));
