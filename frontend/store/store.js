import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      token: null,
      
      // 更新使用者資訊，包含 JWT token
      setUserInfo: (id, name, token = null) => set({ userId: id, userName: name, token }),
      
      // 登出並清空登入資料
      logout: () => set({ userId: null, userName: null, token: null }),
    }),
    {
      name: 'user-storage', // 儲存在 LocalStorage 的 key 名稱
    }
  )
)


// 建立衣物流程暫存資料
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
