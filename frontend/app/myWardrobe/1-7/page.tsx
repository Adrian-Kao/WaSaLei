"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/store";
import { createSpace } from "@/lib/api/clothing";

export default function MyWardrobePage() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);
  
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // 驗證輸入
    if (!name.trim()) {
      setError("請輸入衣櫃名稱");
      return;
    }
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError("請輸入有效的容量（正整數）");
      return;
    }
    if (!userId) {
      setError("無法取得用戶資訊，請重新登入");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await createSpace(userId, name, Number(capacity));

      if (!data.success) {
        setError(data.message || "建立衣櫃失敗，請稍後重試");
        return;
      }

      // 建立成功，顯示提示訊息
      setSuccess(true);
      setName("");
      setCapacity("");

      // 1-2 秒後跳轉到新衣櫃的編輯頁面
      setTimeout(() => {
        router.push(`/myWardrobe/1-2?roomId=${data.spaceId}`);
      }, 1500);
    } catch (err) {
      setError("網路錯誤，請檢查連線後重試");
      console.error("API 呼叫失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-[90%] flex-col items-center bg-base-100 px-6 pt-16 text-black">
      <h1 className="text-center text-4xl font-medium">建立新衣櫃</h1>

      <div className="mt-28 w-full max-w-md space-y-16">
        {/* 成功提示 */}
        {success && (
          <div className="rounded-xl bg-green-100 p-4 text-center text-lg text-black">
            衣櫃建立成功！正在導向編輯頁面...
          </div>
        )}

        {/* 錯誤提示 */}
        {error && !success && (
          <div className="rounded-2xl bg-red-100 p-4 text-center text-lg text-red-700">
            ❌ {error}
          </div>
        )}

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-2xl">名稱</legend>
          <input
            type="text"
            className="input w-full bg-base-200"
            placeholder="例如：夏季衣櫃"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading || success}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-2xl">容量</legend>
          <input
            type="number"
            className="input w-full bg-base-200"
            placeholder="例如：50"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            disabled={loading || success}
            min="1"
          />
        </fieldset>

        <div className="pt-15 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || success}
            className="btn btn-neutral btn-outline mt-20 h-13 w-40 text-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                建立中...
              </>
            ) : success ? (
              "已建立"
            ) : (
              "確定"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
