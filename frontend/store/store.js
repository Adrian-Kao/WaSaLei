import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // 狀態 (State)
  currentRoom: null,
  userId: null,

  // 方法 (Actions)
  setCurrentRoom: (room) => set({ currentRoom: room }),
  clearCurrentRoom: () => set({ currentRoom: null }),

  setUserId: (id) => set({ userId: id }),
  clearUserId: () => set({ userId: null }),
}));