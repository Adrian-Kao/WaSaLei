import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // 狀態 (State)先預設
  currentRoom: 1,
  userId: 1,
  rooms: [],

  // 方法 (Actions)
  setCurrentRoom: (room) => set({ currentRoom: room }),
  clearCurrentRoom: () => set({ currentRoom: null }),

  setUserId: (id) => set({ userId: id }),
  clearUserId: () => set({ userId: null }),

  setRooms: (rooms) => set({ rooms }),
  clearRooms: () => set({ rooms: [] }),
}));