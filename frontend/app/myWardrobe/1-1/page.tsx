"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAppStore } from "@/store/store";
import { getUserRooms } from "@/lib/api/clothing";

type RoomInfo = {
  name: string;
  itemCount: number;
  totalCapacity: number;
};

export default function MyWardrobePage() {
  const router = useRouter();

  // 用useEdffect
  const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
  const [rooms, setRooms_local] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        if (!userId) {
          setRooms_local([]);
          return;
        }
        const roomList = await getUserRooms(userId);
        // TODO: 後端返回房間時應包含 itemCount 和 totalCapacity，暫時用假資料
        const roomsWithInfo = roomList.map((name: string) => ({
          name,
          itemCount: 5,
          totalCapacity: 30,
        }));
        setRooms_local(roomsWithInfo);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setRooms_local([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchRooms();
  }, [userId]); // 移除 setRooms 依賴

  function handleRoomClick(roomName: string) {
    // 若要記錄當前房間可用 localStorage.setItem("currentRoom", roomName)
    router.push("/myWardrobe/1-2");
  }

  return (
    <div className="flex h-[90%] flex-col items-center bg-base-100 px-5 pb-6 text-black">
      <div className="text-7xl font-bold tracking-tight mt-28">衣櫃列表</div>

      <div className="mt-10 w-full h-full rounded-2xl bg-base-300 px-4 py-6 space-y-3 overflow-scroll scrollbar-hide">
        {loading ? (
          <div className="flex h-44 items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : rooms.length > 0 ? (
          <>
            {rooms.map((room) => (
              <button
                key={room.name}
                type="button"
                onClick={() => handleRoomClick(room.name)}
                className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200 transition-colors"
              >
                <div className="text-center text-3xl">{room.name}</div>
                <div className="absolute bottom-3 right-4 text-2xl">{room.itemCount}/{room.totalCapacity}</div>
              </button>
            ))}
          </>
        ) : null}

        <button
          type="button"
          className="btn btn-neutral btn-outline btn-xs h-25 w-full rounded-2xl text-5xl font-semibold"
        >
          +
        </button>
      </div>
    </div>
  );
}
