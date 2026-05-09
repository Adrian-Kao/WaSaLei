import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      
      // 更新使用者資訊：會同時更新記憶體與 LocalStorage
      setUserInfo: (id, name) => set({ userId: id, userName: name }),
      
      // 登出：清空資料
      logout: () => set({ userId: null, userName: null }),
    }),
    {
      name: 'user-storage', // 儲存在 LocalStorage 裡的 key 名稱
    }
  )
)

export const useCreateItemStore = create((set) => ({
  imageUrl: '',
  inputPath: '',
  detectedColors: [],

  setPipelineResult: ({ imageUrl, inputPath = '', detectedColors = [] }) =>
    set({
      imageUrl,
      inputPath,
      detectedColors,
    }),

  clearPipelineResult: () =>
    set({
      imageUrl: '',
      inputPath: '',
      detectedColors: [],
    }),
}))