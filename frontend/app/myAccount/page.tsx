"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/store";

type UserInfo = {
    User_ID: number;
    User_Name: string;
    User_Account: string;
    Password: string;
};

type UserDataType = {
    success: boolean;
    status: string;
    data: UserInfo;
};

export default function MyAccountPage() {
    const userId = useUserStore((state) => state.userId);
    const [UserData, setUserData] = useState<UserDataType | null>(null);
    useEffect(() => {
        if (!userId) return;
        async function fetchUser() {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/user/${userId}`);

                const data = await response.json();

                console.log("完整data:", data);

                setUserData(data);
            } catch (error) {
                console.error("取得使用者資料失敗", error);
            }
        }

        fetchUser();
    }, [userId]);
    return (
        <main className="flex h-[90%] flex-col items-center bg-base-100 px-6 pb-32 pt-10 text-black">
            <div className="avatar mt-4">
                <div className="w-50 rounded-full bg-base-300">
                    <img
                        src="https://img.daisyui.com/images/profile/demo/batperson@192.webp"
                        alt="profile avatar"
                    />
                </div>
            </div>

            <h1 className="mt-5 text-3xl font-medium">
                {UserData?.data.User_Name || "載入中"}
            </h1>

            <section className="mt-28 w-full max-w-xs space-y-8 text-2xl">
                <p>帳號：{UserData?.data.User_Account}</p>
                <p>密碼：{UserData?.data.Password}</p>
            </section>

            <button className="btn btn-neutral btn-outline mt-24 h-15 w-40 text-2xl font-medium">
                修改密碼
            </button>
        </main>
    );
}

