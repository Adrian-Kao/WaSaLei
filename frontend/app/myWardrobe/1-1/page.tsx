"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore} from "@/store/store";
import { getUserRooms } from "@/lib/api/clothing";

type RoomInfo = {
  roomId: number;
  name: string;
  itemCount: number;
  totalCapacity: number;
};

export default function MyWardrobePage() {
  const router = useRouter();

  // 用use
  const userId = useUserStore((state) => state.userId);
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
        // roomList 應為 [{ Space_ID, Space_Type, Capacity, ... }]
        const roomsWithInfo = roomList.map((room: any) => ({
          roomId: room.Space_ID,
          name: room.Space_Type + (room.Space_ID ? `#${room.Space_ID}` : ""),
          itemCount: room.Item_Count ?? 0, // 若後端有回傳 Item_Count
          totalCapacity: room.Capacity ?? 0,
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

  function handleRoomClick(roomId: number) {
    router.push(`/myWardrobe/1-2?roomId=${roomId}`);
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
                key={room.roomId}
                type="button"
                onClick={() => handleRoomClick(room.roomId)}
                className="btn relative h-25 w-full rounded-2xl border-0 bg-base-100 text-black hover:bg-base-200 transition-colors"
              >
                <div className="text-center text-3xl">Room ID: {room.roomId}</div>
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
