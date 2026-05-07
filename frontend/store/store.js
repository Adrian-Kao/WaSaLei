// 已棄用 zustand，請直接用 localStorage 管理全域狀態。
// 本檔案保留空白以避免 import 錯誤。
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